import { TECH_HORIZON_S, techBenefit } from "simulation/ai/strategos/valuation.js";

const PAYBACK_LIMIT_S = 180;
const PHASE_QUEUE_LIMIT = 1;

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
		const benefits = new Map();
		const benefitOf = tech => {
			if (!benefits.has(tech))
				benefits.set(tech, techBenefit(world, this.catalog, tech));
			return benefits.get(tech);
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
				const benefit = benefitOf(tech);
				if (benefit <= 0)
					continue;
				const cost = this.catalog.techCost(tech, researcher.template);
				const payback = TECH_HORIZON_S * world.codes.reduce((sum, code) => sum + cost[code], 0) / benefit;
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
}
