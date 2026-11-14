import { TECH_HORIZON_S, enemyProfile, resourcePrices, techBenefit, unitStrength } from "simulation/ai/strategos/valuation.js";

const PAYBACK_LIMIT_S = 180;
const PHASE_QUEUE_LIMIT = 1;
const PRODUCTION_PAYBACK_S = 90;
const UNLOCK_EDGE = 1.2;
const UNLOCK_STOCK = 2;

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
		const prices = resourcePrices(world);
		const phase = this.phaseRequest(world, priorities);
		if (phase)
		{
			requests.push(phase);
			chosen.add(phase.action.tech);
		}
		const unlock = this.unlockRequest(world, priorities, chosen);
		if (unlock)
		{
			requests.push(unlock);
			chosen.add(unlock.action.tech);
		}
		for (const researcher of world.researchers)
		{
			if (researcher.queueLength > 0 || unlock && unlock.action.researcher === researcher.id)
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
				const payback = TECH_HORIZON_S * world.codes.reduce((sum, code) => sum + prices[code] * cost[code], 0) / benefit;
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
				"urgency": 1 + (PAYBACK_LIMIT_S - best.payback) / PAYBACK_LIMIT_S,
				"tier": best.payback <= PRODUCTION_PAYBACK_S ? "production" : "investment"
			});
		}
		return requests;
	}

	unlockRequest(world, priorities, chosen)
	{
		if (!world.locked.length)
			return null;
		const enemy = enemyProfile(world, this.catalog);
		const perSlot = name => unitStrength(world, this.catalog, name, enemy) / Math.max(1, this.catalog.population(name));
		let current = 0;
		for (const trainer of world.trainers)
			for (const name of trainer.trainable)
				if (this.catalog.isFighter(name))
					current = Math.max(current, perSlot(name));
		let best = null;
		for (const researcher of world.researchers)
		{
			if (researcher.queueLength > 0)
				continue;
			for (const tech of researcher.techs)
			{
				if (chosen.has(tech))
					continue;
				let gain = 0;
				for (const entry of world.locked)
					if (entry.missing.length === 1 && entry.missing[0] === tech && this.catalog.isFighter(entry.name))
						gain = Math.max(gain, perSlot(entry.name));
				if (gain < UNLOCK_EDGE * current || best && (gain < best.gain || gain === best.gain && tech >= best.tech))
					continue;
				best = { tech, gain, "researcher": researcher, "cost": this.catalog.techCost(tech, researcher.template) };
			}
		}
		if (!best || world.codes.some(code => world.resources[code] < UNLOCK_STOCK * best.cost[code]))
			return null;
		return {
			"source": "research",
			"action": { "type": "research", "researcher": best.researcher.id, "tech": best.tech, "payback": 0 },
			"claims": { "resources": best.cost, "slots": [best.researcher.id] },
			"value": priorities.values.research,
			"urgency": 1,
			"tier": "investment"
		};
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
			"reserve": true,
			"tier": "production"
		};
	}
}
