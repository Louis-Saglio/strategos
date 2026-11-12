const PAYBACK_LIMIT_S = 180;
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
		for (const researcher of world.researchers)
		{
			if (researcher.queueLength > 0)
				continue;
			let best = null;
			for (const tech of researcher.techs)
			{
				if (chosen.has(tech))
					continue;
				const gain = this.gatherGain(world, tech);
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

	gatherGain(world, tech)
	{
		const info = this.catalog.technology(tech);
		if (!info.modifications.length)
			return 0;
		let gain = 0;
		for (const worker of world.workers)
		{
			if (!worker.kind || (info.affects && !info.affects.some(affect => MatchesClassList(worker.classes, affect))))
				continue;
			const rate = worker.profile.rates[worker.kind] || 0;
			if (!rate)
				continue;
			const capacity = worker.profile.capacities[worker.gathering] || 0;
			for (const modification of info.modifications)
			{
				if (modification.value === RATE_PREFIX + worker.kind || modification.value === SPEED_KEY)
					gain += rate * ((modification.multiply || 1) - 1);
				else if (modification.value === CAPACITY_PREFIX + worker.gathering && modification.add && capacity > 0)
					gain += rate * WALK_SHARE * modification.add / (capacity + modification.add);
			}
		}
		return gain * GATHER_EFFICIENCY;
	}
}
