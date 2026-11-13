import { squareDistance } from "simulation/ai/strategos/world.js";

const ENGAGE_RADIUS = 160;
const DANGER_RADIUS = 30;
const SHELTER_RADIUS = 90;
const RELEASE_DELAY_MS = 8000;
const COVER_RADIUS = 55;
const LOCAL_THREAT_RADIUS = 30;
const LOCAL_FORCE_RADIUS = 50;
const LOCAL_PARITY = 1;
const OUTNUMBERED_ENTER = 1;
const OUTNUMBERED_EXIT = 0.6;
const SAFE_RADIUS = 70;
const REPORT_PERIOD_MS = 10000;

export class Defense
{
	constructor(telemetry)
	{
		this.telemetry = telemetry;
		this.lastThreatTime = -Infinity;
		this.lastReport = -Infinity;
		this.outnumbered = false;
	}

	requests(world, priorities)
	{
		if (world.threats.length)
			this.lastThreatTime = world.time;
		if (!world.threats.length)
		{
			this.outnumbered = false;
			return world.time - this.lastThreatTime >= RELEASE_DELAY_MS ? this.releaseRequests(world, priorities) : [];
		}
		const force = world.fighters.length + world.garrisonedSoldiers;
		const ratio = world.threats.length / Math.max(1, force);
		this.outnumbered = this.outnumbered ? ratio >= OUTNUMBERED_EXIT : ratio >= OUTNUMBERED_ENTER;
		const free = new Map(world.holders.map(holder => [holder.id, holder.free]));
		const requests = this.engageRequests(world, priorities, free)
			.concat(this.shelterRequests(world, priorities, free))
			.concat(this.unloadRequests(world, priorities));
		if (world.time - this.lastReport >= REPORT_PERIOD_MS)
		{
			this.lastReport = world.time;
			this.telemetry.line("DEF", world.time, {
				"threats": world.threats.length,
				"fighters": world.fighters.length,
				"garrisonedSoldiers": world.garrisonedSoldiers,
				"outnumbered": this.outnumbered,
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

	nearestHolder(world, unit, free, accept, radius)
	{
		let best = null;
		let bestDistance = radius * radius;
		for (const holder of world.holders)
		{
			if (free.get(holder.id) <= 0 || !accept(holder) || !MatchesClassList(unit.classes, holder.classes))
				continue;
			const distance = squareDistance(holder.position, unit.position);
			if (distance < bestDistance || (distance === bestDistance && best && holder.id < best.id))
			{
				best = holder;
				bestDistance = distance;
			}
		}
		return best;
	}

	garrison(unit, holder, free, value, urgency)
	{
		free.set(holder.id, free.get(holder.id) - 1);
		return {
			"source": "defense",
			"action": { "type": "garrison", "unit": unit.id, "target": holder.id },
			"claims": { "workers": [unit.id] },
			"value": value,
			"urgency": urgency
		};
	}

	engageRequests(world, priorities, free)
	{
		const requests = [];
		for (const fighter of world.fighters)
		{
			if (fighter.state.includes("COMBAT"))
				continue;
			const { threat, distance } = this.nearestThreat(world, fighter.position);
			if (!threat || distance > ENGAGE_RADIUS)
				continue;
			if (this.outnumbered)
			{
				const holder = this.nearestHolder(world, fighter, free,
					candidate => candidate.arrows && this.nearestThreat(world, candidate.position).distance <= COVER_RADIUS, ENGAGE_RADIUS);
				if (holder)
				{
					requests.push(this.garrison(fighter, holder, free, priorities.values.defend, 1));
					continue;
				}
			}
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

	shelterRequests(world, priorities, free)
	{
		const requests = [];
		const unarmed = holder => !holder.arrows;
		const any = () => true;
		for (const worker of world.workers)
		{
			if (worker.soldier || worker.state.includes("GARRISON"))
				continue;
			const { distance } = this.nearestThreat(world, worker.position);
			if (distance > DANGER_RADIUS)
				continue;
			const holder = this.outnumbered && this.nearestHolder(world, worker, free, unarmed, SHELTER_RADIUS) ||
				this.nearestHolder(world, worker, free, any, SHELTER_RADIUS);
			if (holder)
				requests.push(this.garrison(worker, holder, free, priorities.values.shelter, 1 + (DANGER_RADIUS - distance) / DANGER_RADIUS));
		}
		return requests;
	}

	unloadRequests(world, priorities)
	{
		const requests = [];
		for (const holder of world.holders)
		{
			if (!holder.garrisoned || holder.forward)
				continue;
			const safe = this.nearestThreat(world, holder.position).distance > SAFE_RADIUS;
			const units = holder.units.filter(id => safe || !this.outnumbered && holder.soldiers.includes(id));
			if (units.length)
				requests.push({
					"source": "defense",
					"action": { "type": "unload", "holder": holder.id, "units": units },
					"claims": { "slots": ["garrison-" + holder.id] },
					"value": priorities.values.defend,
					"urgency": 1
				});
		}
		return requests;
	}

	releaseRequests(world, priorities)
	{
		return world.holders
			.filter(holder => holder.garrisoned > 0 && !holder.forward)
			.map(holder => ({
				"source": "defense",
				"action": { "type": "unload-all", "holder": holder.id },
				"claims": { "slots": ["garrison-" + holder.id] },
				"value": priorities.values.shelter,
				"urgency": 1
			}));
	}
}
