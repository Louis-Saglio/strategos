const OPENING = {
	"gatherShares": { "food": 0.5, "wood": 0.35, "stone": 0.05, "metal": 0.1 },
	"values": { "shelter": 70, "defend": 60, "offense": 30, "build": 25, "assignIdleWorker": 20, "house": 15, "farm": 14, "phase": 16, "research": 13, "dropsite": 12, "laboratory": 12, "production": 11, "trainWorker": 10, "rebalance": 5 },
	"housing": { "base": 3, "perTrainer": 4 },
	"military": { "firstTrainerPopulation": 20, "populationPerTrainer": 25 },
	"phaseUpPopulation": { "2": 120 },
	"offense": { "minArmy": 25, "superiority": 1.5 }
};

const DEMAND_HORIZON_S = 60;
const STOCK_BUFFER = 100;
const SHORTFALL_WEIGHT = 3;
const SHARE_FLOOR = 0.03;
const SHARE_SMOOTHING = 0.1;
const SHARE_REPORT_STEP = 0.05;

export class Strategy
{
	constructor(codes)
	{
		this.codes = codes;
		this.shares = {};
		for (const code of codes)
			this.shares[code] = OPENING.gatherShares[code] || 0;
		this.reported = Object.assign({}, this.shares);
		this.started = false;
	}

	update(world)
	{
		this.changed = !this.started;
		this.started = true;
		if (world.demand.observed)
			this.adaptShares(world);
		this.priorities = Object.freeze({
			"phase": "opening",
			"gatherShares": Object.freeze(Object.assign({}, this.shares)),
			"values": OPENING.values,
			"housing": OPENING.housing,
			"military": OPENING.military,
			"offense": OPENING.offense,
			"advancePhase": world.population >= (OPENING.phaseUpPopulation[world.phase + 1] || Infinity)
		});
		return this.priorities;
	}

	adaptShares(world)
	{
		const weights = {};
		let total = 0;
		for (const code of this.codes)
		{
			const flow = world.demand.spendRate[code] * DEMAND_HORIZON_S;
			const shortfall = Math.max(0, world.demand.unmet[code] + STOCK_BUFFER - world.resources[code]);
			weights[code] = flow + SHORTFALL_WEIGHT * shortfall;
			total += weights[code];
		}
		if (total <= 0)
			return;
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
		if (this.codes.some(code => Math.abs(this.shares[code] - this.reported[code]) >= SHARE_REPORT_STEP))
		{
			this.reported = Object.assign({}, this.shares);
			this.changed = true;
		}
	}
}
