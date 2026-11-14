import { productionFlow, exchangeOutlook } from "simulation/ai/strategos/valuation.js";
import { squareDistance } from "simulation/ai/strategos/world.js";

const OPENING = {
	"gatherShares": { "food": 0.5, "wood": 0.35, "stone": 0.05, "metal": 0.1 },
	"values": { "shelter": 70, "founding": 65, "defend": 60, "relic": 35, "offense": 30, "build": 25, "treasure": 22, "assignIdleWorker": 20, "house": 15, "farm": 14, "phase": 16, "research": 13, "dropsite": 12, "laboratory": 12, "expansion": 12, "dock": 12, "transport": 12, "production": 11, "siege": 11, "market": 11, "trainWorker": 10, "barter": 9, "rebalance": 5 },
	"housing": { "base": 3, "perTrainer": 4 },
	"military": { "firstTrainerPopulation": 20, "populationPerTrainer": 25, "civilianTarget": 80, "civilianShare": 0.4, "civilianFloor": 15,
		"plenty": { "enter": 8000, "exit": 3000 } },
	"phaseUpPopulation": { "2": 120, "3": 150 },
	"surplusPhaseFrom": 3,
	"offense": { "minArmy": 25, "superiority": 1.5, "breakers": { "perSoldiers": 25, "max": 5, "launch": 2 }, "capture": { "enter": 1.2, "exit": 0.8 } },
	"expansion": { "firstPopulation": 100, "populationPerSettlement": 70, "max": 4 },
	"naval": { "dockPopulation": 40, "maxCapacity": 200, "superiority": 1, "carried": 0.8, "seaSuperiority": 1.5, "settlers": 6 },
	"colony": { "dockPopulation": 20, "maxHomeArea": 150000, "minArea": 6000, "enemyClearance": 220, "max": 3, "wealthCap": 6000,
		"distanceScale": 400, "retryMs": 30000 }
};

const PLANS = {
	"regicide": world => world.victory.includes("regicide"),
	"relics": world => world.victory.includes("capture_the_relic")
};

const DEMAND_HORIZON_S = 60;
const STOCK_BUFFER = 100;
const SHORTFALL_WEIGHT = 3;
const SHARE_FLOOR = 0.03;
const SHARE_SMOOTHING = 0.1;
const SHARE_REPORT_STEP = 0.05;

export class Strategy
{
	constructor(codes, catalog)
	{
		this.codes = codes;
		this.catalog = catalog;
		this.shares = {};
		for (const code of codes)
			this.shares[code] = OPENING.gatherShares[code] || 0;
		this.reported = Object.assign({}, this.shares);
		this.started = false;
		this.phaseWanted = 0;
	}

	wantsPhase(world)
	{
		const next = world.phase + 1;
		if (this.phaseWanted === next)
			return true;
		const byPopulation = world.population >= (OPENING.phaseUpPopulation[next] || Infinity);
		const { surplus } = exchangeOutlook(world);
		const bySurplus = next >= OPENING.surplusPhaseFrom && !!world.nextPhaseTech &&
			world.codes.every(code => surplus[code] >= world.nextPhaseCost[code]);
		if (bySurplus)
			this.phaseWanted = next;
		return byPopulation || bySurplus;
	}

	colony(world)
	{
		const plan = OPENING.colony;
		if (!world.centres.length || !world.seas.length || world.regionArea(world.homeRegion) > plan.maxHomeArea ||
		    world.docks.filter(dock => dock.region !== world.homeRegion).length >= plan.max)
			return null;
		if (this.colonySite && this.colonyOpen(world, this.colonySite.position, this.colonySite.region))
			return this.colonySite;
		if (this.colonySearched !== undefined && world.time - this.colonySearched < plan.retryMs)
			return null;
		this.colonySearched = world.time;
		this.colonySite = this.findColony(world);
		this.changed = this.changed || !!this.colonySite;
		return this.colonySite;
	}

	colonyOpen(world, position, region)
	{
		const plan = OPENING.colony;
		return !world.docks.some(dock => dock.region === region) &&
			!world.enemyStructures.some(structure => squareDistance(structure.position, position) < plan.enemyClearance * plan.enemyClearance);
	}

	findColony(world)
	{
		const plan = OPENING.colony;
		const grid = world.wealth;
		if (!world.codes.every(code => grid.totals[code]))
			return null;
		const home = world.centres[0].position;
		let best = null;
		for (let j = 0; j < grid.height; ++j)
			for (let i = 0; i < grid.width; ++i)
			{
				const position = [(i + 0.5) * grid.cellSize, (j + 0.5) * grid.cellSize];
				const region = world.regionOf(position);
				if (region < 2 || region === world.homeRegion || world.regionArea(region) < plan.minArea)
					continue;
				const sea = world.seas.find(candidate => (world.regionLinks[candidate] || []).includes(region));
				if (sea === undefined || !this.colonyOpen(world, position, region))
					continue;
				let wealth = 0;
				for (const code of world.codes)
				{
					let total = 0;
					for (let dj = -1; dj <= 1; ++dj)
						for (let di = -1; di <= 1; ++di)
						{
							const ii = i + di;
							const jj = j + dj;
							if (ii >= 0 && jj >= 0 && ii < grid.width && jj < grid.height)
								total += grid.totals[code][ii + jj * grid.width];
						}
					wealth += Math.min(total, plan.wealthCap);
				}
				const score = wealth / (1 + Math.sqrt(squareDistance(position, home)) / plan.distanceScale);
				if (score > 0 && (!best || score > best.score))
					best = { "position": position, "region": region, "sea": sea, "score": score };
			}
		return best ? Object.freeze({ "position": Object.freeze(best.position), "region": best.region, "sea": best.sea }) : null;
	}

	military(world)
	{
		const plan = OPENING.military;
		const level = this.plenty ? plan.plenty.exit : plan.plenty.enter;
		this.plenty = world.codes.every(code => world.resources[code] >= level);
		const target = this.plenty ? plan.civilianFloor : Math.min(plan.civilianTarget, Math.round(plan.civilianShare * world.populationMax));
		if (!this.militaryPlan || this.militaryPlan.civilianTarget !== target)
			this.militaryPlan = Object.freeze(Object.assign({}, plan, { "civilianTarget": target }));
		return this.militaryPlan;
	}

	plans(world)
	{
		return Object.keys(PLANS).filter(name => PLANS[name](world));
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
			"military": this.military(world),
			"offense": OPENING.offense,
			"expansion": OPENING.expansion,
			"naval": OPENING.naval,
			"protectHero": this.plans(world).includes("regicide"),
			"seekRelics": this.plans(world).includes("relics"),
			"colony": this.colony(world),
			"colonyPlan": OPENING.colony,
			"advancePhase": this.wantsPhase(world)
		});
		return this.priorities;
	}

	adaptShares(world)
	{
		const weights = {};
		let total = 0;
		const planned = productionFlow(world, this.catalog, this.military(world).civilianTarget);
		for (const code of this.codes)
		{
			const flow = Math.max(world.demand.spendRate[code], planned[code]) * DEMAND_HORIZON_S;
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
