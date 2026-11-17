import { PATIENCE_MS } from "simulation/ai/strategos/cadence.js";
import { distanceBetween, firstListed, nearest, squareDistance } from "simulation/ai/strategos/geometry.js";
import { LANDING_RADIUS, shorePoints } from "simulation/ai/strategos/naval-shores.js";
import { garrisonIn, hold, memberRequest, unloadAllRequest, walkTo } from "simulation/ai/strategos/requests.js";

const BERTH_REACH = 35;
const BERTH_TIMEOUT_MS = 45000;
const BERTH_SPEED = 8;
const MUSTER_RADIUS = 30;
const QUAY_CLEARANCE = 55;
const BERTH_PATIENCE_MS = 30000;
const BERTH_READY_SHARE = 0.85;
const EMBARK_QUORUM = 0.85;
const EMBARK_PATIENT_SHARE = 0.7;
const EMBARK_TIMEOUT_MS = 120000;
const SAIL_TIMEOUT_MS = 300000;
const SAIL_SETTLE_MS = 6000;
const UNLOAD_NUDGE_MS = 12000;

export const EMBARK_MIN_SHARE = 0.6;
export const MIN_SETTLERS = 3;

export class Convoys
{
	constructor(operations)
	{
		this.operations = operations;
	}

	requests(world, priorities)
	{
		const units = this.unitIndex(world);
		const requests = [];
		for (const convoy of this.operations.list)
		{
			requests.push(...this.advance(world, priorities, convoy, units));
			this.enrol(convoy);
		}
		for (const convoy of this.operations.list.filter(other => other.state === "done"))
			this.operations.close(convoy);
		return requests;
	}

	unitIndex(world)
	{
		const units = new Map();
		for (const list of [world.fighters, world.workers, world.settlers])
			for (const unit of list)
				if (!units.has(unit.id))
					units.set(unit.id, unit);
		return units;
	}

	enrol(convoy)
	{
		convoy.members = convoy.ships.concat([...convoy.party]);
	}

	launch(world, kind, ships, party, from, to, quorum, details)
	{
		const clear = shore => world.docks.every(dock => squareDistance(dock.position, shore.water) >= QUAY_CLEARANCE * QUAY_CLEARANCE);
		const apart = shorePoints(world, from.region, from.sea, from.position, ships.length, clear);
		const quays = apart.length ? apart : shorePoints(world, from.region, from.sea, from.position, ships.length);
		const beaches = shorePoints(world, to.region, from.sea, to.position, ships.length, to.accept);
		if (!quays.length || !beaches.length)
			return null;
		const quay = new Map(ships.map((ship, index) => [ship.id, quays[index % quays.length]]));
		const beach = new Map(ships.map((ship, index) => [ship.id, beaches[index % beaches.length]]));
		const room = new Map(ships.map(ship => [ship.id, ship.capacity]));
		const berths = new Map();
		for (const unit of party)
		{
			const best = nearest(ships, unit.position, firstListed, ship => room.get(ship.id) > 0, ship => quay.get(ship.id).land).item;
			if (!best)
				break;
			room.set(best.id, room.get(best.id) - 1);
			berths.set(unit.id, best.id);
		}
		const voyage = Math.max(...ships.map(ship => distanceBetween(ship.position, quay.get(ship.id).water)));
		const convoy = Object.assign(this.operations.open(kind), {
			"objective": to.region, "ships": ships.map(ship => ship.id), "party": new Set(berths.keys()), "berths": berths,
			"quay": quay, "beach": beach, "quorum": quorum, "sailed": null, "nudged": 0, "called": null, "summoned": null,
			"berthBy": world.time + BERTH_TIMEOUT_MS + 1000 * voyage / BERTH_SPEED
		});
		this.enrol(convoy);
		this.operations.enter(convoy, world.time, "berth", Object.assign({
			"convoy": convoy.id, "kind": kind, "state": "berth", "ships": ships.length, "party": convoy.party.size,
			"to": to.region, "landing": beaches[0].land.map(Math.round)
		}, details || {}));
		return convoy;
	}

	move(world, convoy, state, details)
	{
		this.operations.enter(convoy, world.time, state,
			Object.assign({ "convoy": convoy.id, "kind": convoy.kind, "state": state, "party": convoy.party.size }, details || {}));
	}

	advance(world, priorities, convoy, units)
	{
		const afloat = new Map(world.fleet.map(ship => [ship.id, ship]));
		const ships = convoy.ships.map(id => afloat.get(id)).filter(ship => !!ship);
		convoy.ships = ships.map(ship => ship.id);
		if (!ships.length)
		{
			this.move(world, convoy, "done", { "reason": "sunk" });
			return [];
		}
		if (convoy.state === "berth")
			return this.berthRequests(world, priorities, convoy, ships, units);
		if (convoy.state === "embark")
			return this.embarkRequests(world, priorities, convoy, ships, units);
		if (convoy.state === "sail")
			return this.sailRequests(world, priorities, convoy, ships);
		return this.landRequests(world, priorities, convoy, ships);
	}

	berthRequests(world, priorities, convoy, ships, units)
	{
		const limit = BERTH_REACH * BERTH_REACH;
		const settled = convoy.called !== null && world.time - convoy.called >= SAIL_SETTLE_MS;
		const away = ships.filter(ship => squareDistance(ship.position, convoy.quay.get(ship.id).water) > limit && !(settled && ship.idle));
		if (convoy.called === null)
			convoy.called = world.time;
		const late = world.time >= convoy.berthBy;
		const patient = world.time - convoy.since >= BERTH_PATIENCE_MS && ships.length - away.length >= BERTH_READY_SHARE * ships.length;
		if (!away.length || (late || patient) && away.length < ships.length)
		{
			const kept = new Set(ships.filter(ship => !away.includes(ship)).map(ship => ship.id));
			convoy.ships = convoy.ships.filter(id => kept.has(id));
			for (const [unit, ship] of convoy.berths)
				if (!kept.has(ship))
				{
					convoy.berths.delete(unit);
					convoy.party.delete(unit);
				}
			convoy.quorum = Math.min(convoy.quorum, Math.max(MIN_SETTLERS, EMBARK_MIN_SHARE * convoy.party.size));
			this.move(world, convoy, "embark", { "ships": convoy.ships.length });
			return this.embarkRequests(world, priorities, convoy, ships.filter(ship => kept.has(ship.id)), units);
		}
		if (late)
		{
			this.move(world, convoy, "done", { "reason": "berth" });
			return [];
		}
		const summoned = convoy.summoned || new Set();
		convoy.summoned = new Set(ships.map(ship => ship.id));
		const requests = ships.map(ship => this.member(convoy, "berth", ship.id,
			!away.includes(ship) || !ship.idle && summoned.has(ship.id),
			walkTo(convoy.quay.get(ship.id).land[0], convoy.quay.get(ship.id).land[1]), priorities));
		for (const [id, ship] of convoy.berths)
		{
			const unit = units.get(id);
			const quay = convoy.quay.get(ship);
			if (!unit || !quay)
				continue;
			requests.push(this.member(convoy, "muster", id,
				squareDistance(unit.position, quay.land) <= MUSTER_RADIUS * MUSTER_RADIUS || unit.state.walking,
				walkTo(quay.land[0], quay.land[1]), priorities));
		}
		return requests;
	}

	aboard(convoy, ships)
	{
		const aboard = new Set();
		for (const ship of ships)
			for (const id of ship.cargo)
				if (convoy.party.has(id))
					aboard.add(id);
		return aboard;
	}

	embarkRequests(world, priorities, convoy, ships, units)
	{
		const aboard = this.aboard(convoy, ships);
		const ashore = [...convoy.party].filter(id => units.has(id)).map(id => units.get(id));
		convoy.party = new Set([...aboard, ...ashore.map(unit => unit.id)]);
		const late = world.time - convoy.since >= EMBARK_TIMEOUT_MS;
		const patient = world.time - convoy.since >= PATIENCE_MS && aboard.size >= EMBARK_PATIENT_SHARE * convoy.party.size;
		if (convoy.party.size && aboard.size >= Math.floor(EMBARK_QUORUM * convoy.party.size) || patient && aboard.size >= convoy.quorum ||
		    late && aboard.size >= convoy.quorum)
		{
			convoy.party = aboard;
			convoy.sailed = null;
			this.move(world, convoy, "sail", { "aboard": aboard.size });
			return this.sailRequests(world, priorities, convoy, ships);
		}
		if (late || !convoy.party.size)
		{
			this.move(world, convoy, "done", { "reason": "embark", "aboard": aboard.size });
			return this.unload(convoy, "disembark", ships.filter(ship => ship.cargo.length), priorities);
		}
		const present = new Set(ships.map(ship => ship.id));
		const requests = ships.map(ship => this.member(convoy, "embark", ship.id, true, hold(), priorities));
		for (const unit of ashore)
		{
			const ship = convoy.berths.get(unit.id);
			if (!present.has(ship))
				continue;
			requests.push(this.member(convoy, "board", unit.id, unit.state.garrisoning && unit.target === ship, garrisonIn(ship), priorities));
		}
		return requests;
	}

	sailRequests(world, priorities, convoy, ships)
	{
		const loaded = ships.filter(ship => ship.cargo.some(id => convoy.party.has(id)));
		const limit = LANDING_RADIUS * LANDING_RADIUS;
		const waiting = loaded.filter(ship => squareDistance(ship.position, convoy.beach.get(ship.id).water) > limit);
		const settled = convoy.sailed !== null && world.time - convoy.sailed >= SAIL_SETTLE_MS && waiting.every(ship => ship.idle);
		if (!waiting.length || settled || world.time - convoy.since >= SAIL_TIMEOUT_MS)
		{
			this.move(world, convoy, "land", { "ships": loaded.length, "short": waiting.length });
			convoy.nudged = world.time;
			return this.landRequests(world, priorities, convoy, ships);
		}
		const underway = convoy.sailed !== null;
		if (!underway)
			convoy.sailed = world.time;
		return loaded.map(ship => this.member(convoy, "sail", ship.id, underway,
			walkTo(convoy.beach.get(ship.id).land[0], convoy.beach.get(ship.id).land[1]), priorities));
	}

	landRequests(world, priorities, convoy, ships)
	{
		const loaded = ships.filter(ship => ship.cargo.some(id => convoy.party.has(id)));
		if (!loaded.length || world.time - convoy.since >= PATIENCE_MS)
		{
			this.move(world, convoy, "done", {
				"reason": loaded.length ? "stuck" : "landed", "left": loaded.reduce((sum, ship) => sum + ship.cargo.length, 0)
			});
			return this.unload(convoy, "land", loaded, priorities);
		}
		const requests = this.unload(convoy, "land", loaded, priorities);
		const nudge = world.time - convoy.nudged >= UNLOAD_NUDGE_MS;
		if (nudge)
			convoy.nudged = world.time;
		for (const ship of loaded)
			requests.push(this.member(convoy, "land", ship.id, !nudge,
				walkTo(convoy.beach.get(ship.id).land[0], convoy.beach.get(ship.id).land[1]), priorities));
		return requests;
	}

	member(convoy, purpose, unit, engaged, order, priorities)
	{
		return this.operations.serving(memberRequest("naval", purpose, unit, engaged, order, priorities.values.ferry, 1), convoy);
	}

	unload(convoy, purpose, ships, priorities)
	{
		return ships.map(ship => this.operations.serving(unloadAllRequest("naval", purpose, ship.id, priorities.values.ferry, 1), convoy));
	}
}
