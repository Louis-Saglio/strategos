import { squareDistance } from "simulation/ai/strategos/world.js";

const ENGAGE_RADIUS = 160;
const DANGER_RADIUS = 30;
const SHELTER_RADIUS = 90;
const RELEASE_DELAY_MS = 8000;
const COVER_RADIUS = 55;
const LOCAL_THREAT_RADIUS = 30;
const LOCAL_FORCE_RADIUS = 50;
const LOCAL_PARITY = 1;
const REPORT_PERIOD_MS = 10000;

export class Defense
{
	constructor(telemetry)
	{
		this.telemetry = telemetry;
		this.lastThreatTime = -Infinity;
		this.lastReport = -Infinity;
	}

	requests(world, priorities)
	{
		if (world.threats.length)
			this.lastThreatTime = world.time;
		if (!world.threats.length)
			return world.time - this.lastThreatTime >= RELEASE_DELAY_MS ? this.releaseRequests(world, priorities) : [];
		const requests = this.engageRequests(world, priorities).concat(this.shelterRequests(world, priorities));
		if (world.time - this.lastReport >= REPORT_PERIOD_MS)
		{
			this.lastReport = world.time;
			this.telemetry.line("DEF", world.time, {
				"threats": world.threats.length,
				"fighters": world.fighters.length,
				"engage": requests.filter(request => request.action.type === "attack").length,
				"shelter": requests.filter(request => request.action.type === "garrison").length
			});
		}
		return requests;
	}

	nearestThreat(world, position)
	{
		let best = null;
		let bestDistance = Infinity;
		for (const threat of world.threats)
		{
			const distance = squareDistance(threat.position, position);
			if (distance < bestDistance || (distance === bestDistance && threat.id < best.id))
			{
				best = threat;
				bestDistance = distance;
			}
		}
		return { "threat": best, "distance": Math.sqrt(bestDistance) };
	}

	engageRequests(world, priorities)
	{
		const requests = [];
		for (const fighter of world.fighters)
		{
			if (fighter.state.includes("COMBAT"))
				continue;
			const { threat, distance } = this.nearestThreat(world, fighter.position);
			if (!threat || distance > ENGAGE_RADIUS)
				continue;
			if (!this.covered(world, threat.position) && !this.locallyMatched(world, threat.position))
			{
				const cover = this.nearestCover(world, fighter.position);
				if (!cover)
					continue;
				const sheltered = squareDistance(cover.position, fighter.position) <= COVER_RADIUS * COVER_RADIUS / 4;
				requests.push({
					"source": "defense",
					"action": sheltered ? { "type": "hold", "unit": fighter.id } :
						{ "type": "walk", "unit": fighter.id, "x": cover.position[0], "z": cover.position[1] },
					"claims": { "workers": [fighter.id] },
					"value": priorities.values.defend,
					"urgency": 1
				});
				continue;
			}
			requests.push({
				"source": "defense",
				"action": { "type": "attack", "unit": fighter.id, "target": threat.id },
				"claims": { "workers": [fighter.id] },
				"value": priorities.values.defend,
				"urgency": 1 + Math.max(0, ENGAGE_RADIUS - distance) / ENGAGE_RADIUS
			});
		}
		return requests;
	}

	nearestCover(world, position)
	{
		let best = null;
		let bestDistance = Infinity;
		for (const holder of world.holders)
		{
			if (!holder.arrows)
				continue;
			const distance = squareDistance(holder.position, position);
			if (distance < bestDistance || (distance === bestDistance && holder.id < best.id))
			{
				best = holder;
				bestDistance = distance;
			}
		}
		return best;
	}

	covered(world, position)
	{
		const cover = this.nearestCover(world, position);
		return !!cover && squareDistance(cover.position, position) <= COVER_RADIUS * COVER_RADIUS;
	}

	locallyMatched(world, position)
	{
		const threatLimit = LOCAL_THREAT_RADIUS * LOCAL_THREAT_RADIUS;
		const forceLimit = LOCAL_FORCE_RADIUS * LOCAL_FORCE_RADIUS;
		const threats = world.threats.filter(threat => squareDistance(threat.position, position) <= threatLimit).length;
		const force = world.fighters.filter(fighter => squareDistance(fighter.position, position) <= forceLimit).length;
		return force >= LOCAL_PARITY * threats;
	}

	shelterRequests(world, priorities)
	{
		const requests = [];
		const free = new Map(world.holders.map(holder => [holder.id, holder.free]));
		for (const worker of world.workers)
		{
			if (worker.soldier || worker.state.includes("GARRISON"))
				continue;
			const { distance } = this.nearestThreat(world, worker.position);
			if (distance > DANGER_RADIUS)
				continue;
			let best = null;
			let bestDistance = SHELTER_RADIUS * SHELTER_RADIUS;
			for (const holder of world.holders)
			{
				if (free.get(holder.id) <= 0 || !MatchesClassList(worker.classes, holder.classes))
					continue;
				const d = squareDistance(holder.position, worker.position);
				if (d < bestDistance)
				{
					best = holder;
					bestDistance = d;
				}
			}
			if (!best)
				continue;
			free.set(best.id, free.get(best.id) - 1);
			requests.push({
				"source": "defense",
				"action": { "type": "garrison", "unit": worker.id, "target": best.id },
				"claims": { "workers": [worker.id] },
				"value": priorities.values.shelter,
				"urgency": 1 + (DANGER_RADIUS - distance) / DANGER_RADIUS
			});
		}
		return requests;
	}

	releaseRequests(world, priorities)
	{
		return world.holders
			.filter(holder => holder.garrisoned > 0)
			.map(holder => ({
				"source": "defense",
				"action": { "type": "unload-all", "holder": holder.id },
				"claims": { "slots": ["garrison-" + holder.id] },
				"value": priorities.values.shelter,
				"urgency": 1
			}));
	}
}
