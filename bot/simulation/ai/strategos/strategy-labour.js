import { productionFlow } from "simulation/ai/strategos/valuation.js";

const DEMAND_HORIZON_S = 60;
const STOCK_BUFFER = 100;
const SHORTFALL_WEIGHT = 3;
const SHARE_FLOOR = 0.03;
const SHARE_SMOOTHING = 0.1;
const SHARE_REPORT_STEP = 0.05;

export class Labour
{
	constructor(codes, catalog)
	{
		this.codes = codes;
		this.catalog = catalog;
		this.gap = {};
		for (const code of codes)
			this.gap[code] = 0;
	}

	assess(world, plan, civilianTarget)
	{
		const labour = plan.labour;
		if (!this.seeded || this.codes.some(code => (plan.gatherShares[code] || 0) !== this.seeded[code]))
			this.seed(plan.gatherShares);
		let changed = false;
		if (world.demand.observed)
			changed = this.adaptShares(world, civilianTarget);
		const total = world.labour;
		for (const code of this.codes)
			this.gap[code] += labour.smoothing * (this.shares[code] * total - world.gatherers[code] - this.gap[code]);
		const level = Math.max(labour.starvedMin, labour.starvedShare * total);
		const starved = this.codes.filter(code => this.gap[code] >= level)
			.sort((a, b) => this.gap[b] - this.gap[a] || this.codes.indexOf(a) - this.codes.indexOf(b));
		const excess = this.codes.slice().sort((a, b) => this.gap[a] - this.gap[b] || this.codes.indexOf(a) - this.codes.indexOf(b));
		const surveyed = world.centres.length && world.codes.every(code => world.wealth.regions[code]);
		const scarce = surveyed && world.seas.length ? this.scarce(world, labour.scarceCodes, labour.scarceWealth) : [];
		const short = starved.concat(scarce.filter(code => !starved.includes(code)));
		if ((this.shortCode || null) !== (short[0] || null))
			changed = true;
		this.shortCode = short[0] || null;
		const traded = surveyed ? this.scarce(world, labour.tradeScarceCodes, labour.tradeScarceWealth) : [];
		const key = traded.join(",");
		if (key !== this.tradedKey)
		{
			this.tradedKey = key;
			this.traded = Object.freeze(traded);
			changed = true;
		}
		return {
			"gatherShares": Object.freeze(Object.assign({}, this.shares)),
			"gaps": Object.freeze(Object.assign({}, this.gap)),
			"starved": Object.freeze(starved),
			"excess": Object.freeze(excess),
			"short": Object.freeze(short),
			"scarce": this.traded,
			"changed": changed
		};
	}

	seed(shares)
	{
		this.shares = {};
		for (const code of this.codes)
			this.shares[code] = shares[code] || 0;
		this.seeded = Object.assign({}, this.shares);
		this.reported = Object.assign({}, this.shares);
	}

	scarce(world, codes, wealth)
	{
		return codes.filter(code => this.codes.includes(code) && world.regionWealth(world.homeRegion, code) + world.resources[code] < wealth);
	}

	adaptShares(world, civilianTarget)
	{
		const weights = {};
		let total = 0;
		const planned = productionFlow(world, this.catalog, civilianTarget);
		for (const code of this.codes)
		{
			const flow = Math.max(world.demand.spendRate[code], planned[code]) * DEMAND_HORIZON_S;
			const shortfall = Math.max(0, world.demand.unmet[code] + STOCK_BUFFER - world.resources[code]);
			weights[code] = flow + SHORTFALL_WEIGHT * shortfall;
			total += weights[code];
		}
		if (total <= 0)
			return false;
		const free = 1 - SHARE_FLOOR * this.codes.length;
		let sum = 0;
		for (const code of this.codes)
		{
			const target = SHARE_FLOOR + free * weights[code] / total;
			this.shares[code] += SHARE_SMOOTHING * (target - this.shares[code]);
			sum += this.shares[code];
		}
		for (const code of this.codes)
			this.shares[code] /= sum;
		if (!this.codes.some(code => Math.abs(this.shares[code] - this.reported[code]) >= SHARE_REPORT_STEP))
			return false;
		this.reported = Object.assign({}, this.shares);
		return true;
	}
}
