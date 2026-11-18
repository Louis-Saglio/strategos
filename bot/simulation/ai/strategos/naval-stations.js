import { squareDistance } from "simulation/ai/strategos/geometry.js";
import { orderRequest, walkTo } from "simulation/ai/strategos/requests.js";
import { Retry } from "simulation/ai/strategos/switches.js";

const ANCHOR_RINGS = [80, 110, 140, 170, 200];
const ANCHOR_SPACING = 30;
const ANCHOR_CLEARANCE = 16;
const ANCHOR_TOLERANCE = 15;
const ANCHOR_RETRY_MS = 12000;

export class Stations
{
	constructor(commitments)
	{
		this.commitments = commitments;
		this.anchorages = new Map();
		this.stations = new Map();
	}

	anchorage(world, dock)
	{
		if (!this.anchorages.has(dock.id))
		{
			const points = [];
			for (const radius of ANCHOR_RINGS)
			{
				const count = Math.floor(2 * Math.PI * radius / ANCHOR_SPACING);
				for (let k = 0; k < count; ++k)
				{
					const angle = 2 * Math.PI * k / count;
					const point = [dock.position[0] + radius * Math.cos(angle), dock.position[1] + radius * Math.sin(angle)];
					if (world.openWater(point, dock.sea, ANCHOR_CLEARANCE))
						points.push(Object.freeze(point));
				}
			}
			this.anchorages.set(dock.id, points);
		}
		return this.anchorages.get(dock.id);
	}

	requests(world, plan, issued)
	{
		const busy = new Set();
		for (const request of issued)
			for (const id of request.claims.units || [])
				busy.add(id);
		const docks = new Map(world.docks.map(dock => [dock.id, dock]));
		const afloat = new Set(world.fleet.map(ship => ship.id));
		const taken = new Set();
		for (const [id, station] of this.stations)
			if (!afloat.has(id) || !docks.has(station.dock))
				this.stations.delete(id);
			else
				taken.add(station.dock + ":" + station.slot);
		const requests = [];
		for (const ship of world.fleet)
		{
			if (this.commitments.holds(ship.id) || busy.has(ship.id) || ship.cargo.length)
				continue;
			let station = this.stations.get(ship.id);
			if (!station)
			{
				const dock = world.docks
					.filter(candidate => candidate.sea === ship.sea)
					.map(candidate => ({ "dock": candidate, "home": candidate.region === world.homeRegion ? 0 : 1,
						"distance": squareDistance(candidate.position, ship.position) }))
					.sort((a, b) => a.home - b.home || a.distance - b.distance || a.dock.id - b.dock.id)
					.map(entry => entry.dock)[0];
				if (!dock)
					continue;
				const points = this.anchorage(world, dock);
				let slot = 0;
				while (slot < points.length && taken.has(dock.id + ":" + slot))
					slot += 1;
				if (slot >= points.length)
					continue;
				station = { "dock": dock.id, "slot": slot, "ordered": new Retry() };
				this.stations.set(ship.id, station);
				taken.add(dock.id + ":" + slot);
			}
			const point = this.anchorage(world, docks.get(station.dock))[station.slot];
			if (!ship.idle || !station.ordered.due(world.time, ANCHOR_RETRY_MS) ||
			    squareDistance(ship.position, point) <= ANCHOR_TOLERANCE * ANCHOR_TOLERANCE)
				continue;
			requests.push(orderRequest("naval", "station", ship.id, walkTo(point[0], point[1]), plan.values.ferry, 1));
		}
		return requests;
	}

	settle(world, outcomes)
	{
		for (const { request, issued } of outcomes)
			if (issued && request.purpose === "station")
				this.stations.get(request.action.unit).ordered.record(world.time);
	}
}
