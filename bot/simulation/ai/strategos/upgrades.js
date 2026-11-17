import { RETRY_MS } from "simulation/ai/strategos/cadence.js";
import { TECH_HORIZON_S, auraBenefit, resourcePrices } from "simulation/ai/strategos/valuation.js";

const SWITCH_EDGE = 2;
const MIN_BENEFIT = 50;

export class Upgrades
{
	constructor(catalog, telemetry)
	{
		this.catalog = catalog;
		this.telemetry = telemetry;
		this.ordered = new Map();
		this.last = -Infinity;
	}

	requests(world, priorities)
	{
		if (!world.upgradable.length || world.time - this.last < RETRY_MS)
			return [];
		const prices = resourcePrices(world);
		const priced = amounts => world.codes.reduce((sum, code) => sum + prices[code] * (amounts[code] || 0), 0);
		const unmet = world.codes.reduce((sum, code) => sum + world.demand.unmet[code], 0);
		const weights = {};
		for (const code of world.codes)
			weights[code] = prices[code] * (1 + world.demand.unmet[code] / (1 + unmet));
		const owned = new Map(world.roster.concat(world.estate).map(group => [group.template, group.count]));
		let best = null;
		for (const entity of world.upgradable)
		{
			const since = this.ordered.get(entity.id);
			if (since !== undefined && world.time - since < RETRY_MS)
				continue;
			const held = this.worth(world, entity.template, weights, entity.unit);
			for (const option of entity.options)
			{
				const gain = (this.worth(world, option.template, weights, entity.unit) - held) / (1 + (owned.get(option.template) || 0));
				const cost = priced(option.cost);
				if (gain < MIN_BENEFIT || gain <= cost || held > 0 && gain < (SWITCH_EDGE - 1) * held)
					continue;
				const ratio = gain / Math.max(1, cost);
				if (!best || ratio > best.ratio || ratio === best.ratio && entity.id < best.entity.id)
					best = { entity, option, ratio, gain };
			}
		}
		if (!best)
			return [];
		const affordable = world.codes.every(code => world.resources[code] >= (best.option.cost[code] || 0));
		if (affordable)
		{
			this.ordered.set(best.entity.id, world.time);
			this.last = world.time;
			this.telemetry.line("UPGRADE", world.time, { "from": best.entity.template, "to": best.option.template, "gain": Math.round(best.gain) });
		}
		return [{
			"source": "upgrades",
			"action": { "type": "upgrade", "entity": best.entity.id, "template": best.option.template },
			"claims": { "resources": best.option.cost, "slots": ["upgrade-" + best.entity.id] },
			"value": priorities.values.investment,
			"urgency": 1
		}];
	}

	worth(world, name, weights, mobile)
	{
		const trickle = this.catalog.trickle(name);
		let worth = 0;
		for (const code of world.codes)
			worth += trickle[code] * weights[code] * TECH_HORIZON_S;
		for (const aura of this.catalog.auras(name))
			worth += auraBenefit(world, this.catalog, aura, mobile);
		return worth;
	}
}
