import { productionFlow, exchangeOutlook } from "simulation/ai/strategos/valuation.js";
import { squareDistance } from "simulation/ai/strategos/world.js";

const OPENING = {
	"gatherShares": { "food": 0.5, "wood": 0.35, "stone": 0.05, "metal": 0.1 },
	"values": { "shelter": 70, "founding": 65, "defend": 60, "relic": 35, "ferry": 45, "offense": 30, "wonder": 26, "build": 25, "treasure": 22, "assignIdleWorker": 20, "house": 15, "farm": 14, "fishing": 14, "phase": 16, "research": 13, "dropsite": 12, "laboratory": 12, "expansion": 12, "dock": 12, "transport": 12, "production": 11, "siege": 11, "market": 11, "trainWorker": 10, "barter": 9, "rebalance": 5 },
	"housing": { "base": 3, "perTrainer": 4 },
	"military": { "firstTrainerPopulation": 20, "populationPerTrainer": 25, "civilianTarget": 80, "civilianShare": 0.4, "civilianFloor": 15,
		"plenty": { "enter": 8000, "exit": 3000 }, "raid": { "hostiles": 2, "share": 0.5, "memoryMs": 60000 } },
	"phaseUpPopulation": { "2": 120, "3": 150 },
	"surplusPhaseFrom": 3,
	"blockedGrowth": { "room": 1, "afterMs": 60000 },
	"offense": { "minArmy": 25, "superiority": 1.5, "breakers": { "perSoldiers": 25, "max": 5, "launch": 2 }, "capture": { "enter": 1.2, "exit": 0.8 } },
	"expansion": { "firstPopulation": 100, "populationPerSettlement": 70, "max": 4 },
	"naval": { "dockPopulation": 40, "maxCapacity": 200, "superiority": 1, "carried": 0.8, "seaSuperiority": 1.5, "settlers": 6, "founders": 10,
		"fishing": { "maxBoats": 12, "perFish": 2 } },
	"colony": { "dockPopulation": 20, "maxHomeArea": 150000, "minArea": 6000, "centreArea": 14000, "enemyClearance": 220, "max": 5, "wealthCap": 6000,
		"distanceScale": 400, "retryMs": 30000, "starvedWeight": 4, "phasePopulation": 50 },
	"labour": { "smoothing": 0.1, "starvedMin": 4, "starvedShare": 0.12, "wealthPerWorker": 150, "minWealth": 600, "minParty": 3, "maxParty": 10,
		"scarceWealth": 3000, "scarceCodes": ["wood", "stone", "metal"] }
};

const PLANS = {
	"regicide": world => world.victory.includes("regicide"),
	"relics": world => world.victory.includes("capture_the_relic"),
	"wonder": world => world.victory.includes("wonder")
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
		this.gap = {};
		for (const code of codes)
			this.gap[code] = 0;
	}

	labour(world)
	{
		const plan = OPENING.labour;
		const total = world.labour;
		for (const code of this.codes)
			this.gap[code] += plan.smoothing * (this.shares[code] * total - world.gatherers[code] - this.gap[code]);
		const level = Math.max(plan.starvedMin, plan.starvedShare * total);
		const starved = this.codes.filter(code => this.gap[code] >= level)
			.sort((a, b) => this.gap[b] - this.gap[a] || this.codes.indexOf(a) - this.codes.indexOf(b));
		const excess = this.codes.slice().sort((a, b) => this.gap[a] - this.gap[b] || this.codes.indexOf(a) - this.codes.indexOf(b));
		const surveyed = world.centres.length && world.seas.length && world.codes.every(code => world.wealth.regions[code]);
		const scarce = surveyed ? plan.scarceCodes.filter(code => this.codes.includes(code) &&
			world.regionWealth(world.homeRegion, code) + world.resources[code] < plan.scarceWealth) : [];
		return { starved, excess, "short": starved.concat(scarce.filter(code => !starved.includes(code))) };
	}

	link(world, from, to)
	{
		return (world.regionLinks[from] || []).find(sea => (world.regionLinks[sea] || []).includes(to));
	}

	ferry(world, labour)
	{
		const plan = OPENING.labour;
		if (!world.centres.length || !labour.starved.length)
			return null;
		const from = world.regions.filter(region => region.anchors > 0 && region.docks > 0)
			.sort((a, b) => b.workers - a.workers || a.id - b.id)[0];
		if (!from)
			return null;
		for (const code of labour.starved)
		{
			let best = null;
			for (const region of world.regions)
			{
				if (region.id === from.id || !region.anchors || region.enemyStructures)
					continue;
				const sea = this.link(world, from.id, region.id);
				const wealth = world.regionWealth(region.id, code);
				const room = Math.floor(wealth / plan.wealthPerWorker) - region.workers;
				if (sea === undefined || wealth < plan.minWealth || room < plan.minParty)
					continue;
				if (!best || wealth > best.wealth)
					best = { "to": region.id, "sea": sea, "wealth": wealth, "room": room };
			}
			if (best)
				return Object.freeze({
					"from": from.id, "to": best.to, "sea": best.sea, "code": code,
					"count": Math.max(plan.minParty, Math.min(plan.maxParty, best.room, Math.round(this.gap[code]))),
					"excess": Object.freeze(labour.excess.filter(other => other !== code))
				});
		}
		return null;
	}

	wantsPhase(world)
	{
		const next = world.phase + 1;
		if (this.phaseWanted === next || this.plenty && !!world.nextPhaseTech)
			return true;
		if (world.phase === 1 && world.population >= OPENING.colony.phasePopulation && world.regions.some(region =>
			region.id !== world.homeRegion && region.docks > 0 && !region.centres && world.regionArea(region.id) >= OPENING.colony.centreArea))
		{
			this.phaseWanted = next;
			return true;
		}
		const housed = world.population + world.queuedPopulation >= world.populationLimit - OPENING.blockedGrowth.room &&
			world.populationLimit < world.populationMax && !world.foundations.some(foundation => foundation.populationBonus > 0) &&
			!world.pendingConstructions.some(pending => this.catalog.populationBonus(pending.template) > 0);
		if (!housed)
			this.blockedSince = undefined;
		else if (this.blockedSince === undefined)
			this.blockedSince = world.time;
		const byBlockedGrowth = housed && world.time - this.blockedSince >= OPENING.blockedGrowth.afterMs && !!world.nextPhaseTech &&
			world.codes.every(code => world.resources[code] >= world.nextPhaseCost[code]);
		if (byBlockedGrowth)
			this.phaseWanted = next;
		const byPopulation = byBlockedGrowth || world.population >= (OPENING.phaseUpPopulation[next] || Infinity);
		const { surplus } = exchangeOutlook(world);
		const bySurplus = next >= OPENING.surplusPhaseFrom && !!world.nextPhaseTech &&
			world.codes.every(code => surplus[code] >= world.nextPhaseCost[code]);
		if (bySurplus)
			this.phaseWanted = next;
		return byPopulation || bySurplus;
	}

	colony(world, labour, ferry)
	{
		const plan = OPENING.colony;
		const starved = ferry ? null : labour.short[0] || null;
		const outposts = world.regions.filter(region => region.id !== world.homeRegion && (region.docks > 0 || region.centres > 0)).length;
		if (!world.centres.length || !world.seas.length || outposts >= plan.max ||
		    world.regionArea(world.homeRegion) > plan.maxHomeArea && !starved)
			return null;
		const settlement = !starved && world.offered.some(name => this.catalog.isSettlement(name));
		if (this.colonySite && this.colonyOpen(world, this.colonySite.position, this.colonySite.region) &&
		    (!starved || world.regionWealth(this.colonySite.region, starved) > 0 ||
		     world.regions.some(region => region.id === this.colonySite.region && region.settlers > 0)))
		{
			const kind = settlement && world.regionArea(this.colonySite.region) >= plan.centreArea ? "centre" : "dock";
			if (kind !== this.colonySite.kind)
			{
				this.colonySite = Object.freeze(Object.assign({}, this.colonySite, { "kind": kind }));
				this.changed = true;
			}
			return this.colonySite;
		}
		if (this.colonySearched !== undefined && world.time - this.colonySearched < plan.retryMs)
			return null;
		this.colonySearched = world.time;
		const found = this.findColony(world, starved);
		this.colonySite = found && Object.freeze(Object.assign({}, found, {
			"starved": starved, "kind": settlement && world.regionArea(found.region) >= plan.centreArea ? "centre" : "dock"
		}));
		this.changed = this.changed || !!this.colonySite;
		return this.colonySite;
	}

	colonyOpen(world, position, region)
	{
		const plan = OPENING.colony;
		return !world.regions.some(entry => entry.id === region && (entry.docks > 0 || entry.centres > 0 || entry.enemyStructures > 0)) &&
			!world.enemyStructures.some(structure => squareDistance(structure.position, position) < plan.enemyClearance * plan.enemyClearance);
	}

	findColony(world, starved)
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
					wealth += Math.min(total, plan.wealthCap) * (code === starved ? plan.starvedWeight : 1);
					if (code === starved && !total)
						wealth = -Infinity;
				}
				const score = wealth / (1 + Math.sqrt(squareDistance(position, home)) / plan.distanceScale);
				if (score > 0 && (!best || score > best.score))
					best = { "position": position, "region": region, "sea": sea, "score": score };
			}
		return best ? { "position": Object.freeze(best.position), "region": best.region, "sea": best.sea } : null;
	}

	military(world)
	{
		const plan = OPENING.military;
		const level = this.plenty ? plan.plenty.exit : plan.plenty.enter;
		this.plenty = world.codes.every(code => world.resources[code] >= level);
		const target = this.plenty ? plan.civilianFloor : Math.min(plan.civilianTarget, Math.round(plan.civilianShare * world.populationMax));
		const hostiles = world.threats.length + world.wild.length;
		if (hostiles >= plan.raid.hostiles && hostiles >= plan.raid.share * (world.fighters.length + world.garrisonedSoldiers))
			this.raidedAt = world.time;
		const raided = this.raidedAt !== undefined && world.time - this.raidedAt < plan.raid.memoryMs;
		if (!this.militaryPlan || this.militaryPlan.civilianTarget !== target || this.militaryPlan.plentiful !== this.plenty ||
		    this.militaryPlan.raided !== raided)
		{
			this.militaryPlan = Object.freeze(Object.assign({}, plan, { "civilianTarget": target, "plentiful": this.plenty, "raided": raided }));
			this.changed = true;
		}
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
		const labour = this.labour(world);
		const ferry = this.ferry(world, labour);
		if ((this.ferried && this.ferried.to) !== (ferry && ferry.to) || (this.shortCode || null) !== (labour.short[0] || null))
			this.changed = true;
		this.ferried = ferry;
		this.shortCode = labour.short[0] || null;
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
			"raiseWonder": this.plans(world).includes("wonder"),
			"colony": this.colony(world, labour, ferry),
			"colonyPlan": OPENING.colony,
			"ferry": ferry,
			"starved": Object.freeze(labour.starved),
			"short": Object.freeze(labour.short),
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
