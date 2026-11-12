const PAYBACK_LIMIT_S = 180;
const PHASE_QUEUE_LIMIT = 1;
const GATHER_EFFICIENCY = 0.6;
const WALK_SHARE = 0.35;
const RATE_PREFIX = "ResourceGatherer/Rates/";
const CAPACITY_PREFIX = "ResourceGatherer/Capacities/";
const SPEED_KEY = "ResourceGatherer/BaseSpeed";

export class Research
{
	constructor(catalog)
	{
		this.catalog = catalog;
	}

	requests(world, priorities)
	{
		const requests = [];
		const chosen = new Set();
		const gains = new Map();
		const gainOf = tech => {
			if (!gains.has(tech))
				gains.set(tech, this.gatherGain(world, tech));
			return gains.get(tech);
		};
		const phase = this.phaseRequest(world, priorities);
		if (phase)
		{
			requests.push(phase);
			chosen.add(phase.action.tech);
		}
		for (const researcher of world.researchers)
		{
			if (researcher.queueLength > 0)
				continue;
			let best = null;
			for (const tech of researcher.techs)
			{
				if (chosen.has(tech))
					continue;
				const gain = gainOf(tech);
				if (gain <= 0)
					continue;
				const cost = this.catalog.techCost(tech, researcher.template);
				const payback = world.codes.reduce((sum, code) => sum + cost[code], 0) / gain;
				if (payback < PAYBACK_LIMIT_S && (!best || payback < best.payback || (payback === best.payback && tech < best.tech)))
					best = { tech, cost, payback };
			}
			if (!best)
				continue;
			chosen.add(best.tech);
			requests.push({
				"source": "research",
				"action": { "type": "research", "researcher": researcher.id, "tech": best.tech, "payback": Math.round(best.payback) },
				"claims": { "resources": best.cost, "slots": [researcher.id] },
				"value": priorities.values.research,
				"urgency": 1 + (PAYBACK_LIMIT_S - best.payback) / PAYBACK_LIMIT_S
			});
		}
		return requests;
	}

	phaseRequest(world, priorities)
	{
		const tech = world.nextPhaseTech;
		if (!tech || !priorities.advancePhase)
			return null;
		const researcher = world.researchers
			.filter(candidate => candidate.techs.includes(tech) && candidate.queueLength <= PHASE_QUEUE_LIMIT)
			.sort((a, b) => a.queueLength - b.queueLength || a.id - b.id)[0];
		if (!researcher)
			return null;
		return {
			"source": "research",
			"action": { "type": "research", "researcher": researcher.id, "tech": tech, "payback": 0 },
			"claims": { "resources": this.catalog.techCost(tech, researcher.template), "slots": [researcher.id] },
			"value": priorities.values.phase,
			"urgency": 1,
			"reserve": true
		};
	}

	gatherGain(world, tech)
	{
		const info = this.catalog.technology(tech);
		if (!info.modifications.some(modification => modification.value.startsWith("ResourceGatherer/")))
			return 0;
		let gain = 0;
		for (const worker of world.workers)
		{
			if (!worker.kind)
				continue;
			const rate = worker.profile.rates[worker.kind] || 0;
			if (!rate)
				continue;
			const capacity = worker.profile.capacities[worker.gathering] || 0;
			for (const modification of info.modifications)
			{
				if (!this.catalog.modificationApplies(info, modification, worker.classes))
					continue;
				if (modification.value === RATE_PREFIX + worker.kind || modification.value === SPEED_KEY)
					gain += rate * ((modification.multiply || 1) - 1);
				else if (modification.value === CAPACITY_PREFIX + worker.gathering && modification.add && capacity > 0)
					gain += rate * WALK_SHARE * modification.add / (capacity + modification.add);
			}
		}
		return gain * GATHER_EFFICIENCY;
	}
}
