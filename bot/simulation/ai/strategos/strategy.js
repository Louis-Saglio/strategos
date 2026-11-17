import { PATIENCE_MS, RETRY_MS } from "simulation/ai/strategos/cadence.js";
import { productionFlow, exchangeOutlook } from "simulation/ai/strategos/valuation.js";
import { squareDistance, territoryAt } from "simulation/ai/strategos/world.js";
import { arriving, atWork, centroid, covering, engagement, forecast, within } from "simulation/ai/strategos/forecast.js";

const BASE = {
	"gatherShares": { "food": 0.5, "wood": 0.35, "stone": 0.05, "metal": 0.1 },
	"values": { "shelter": 70, "founding": 65, "defend": 60, "relic": 35, "ferry": 45, "offense": 30, "wonder": 26, "build": 25, "treasure": 22, "assignIdleWorker": 20, "house": 15, "farm": 14, "fishing": 14, "phase": 16, "research": 13, "dropsite": 12, "laboratory": 12, "expansion": 12, "dock": 12, "transport": 12, "production": 11, "siege": 11, "market": 11, "medic": 11, "caravan": 11, "upgrade": 12, "trainWorker": 10, "barter": 9, "rebalance": 5 },
	"housing": { "base": 3, "perTrainer": 4 },
	"military": { "firstTrainerPopulation": 20, "populationPerTrainer": 25, "civilianTarget": 80, "civilianShare": 0.4, "civilianFloor": 15,
		"plenty": { "enter": 8000, "exit": 3000 }, "raid": { "hostiles": 2, "share": 0.5, "memoryMs": 60000 },
		"threat": { "minEnemy": 15, "enter": 0.7, "exit": 1, "horizonS": 90 } },
	"phaseUpPopulation": { "2": 120, "3": 150 },
	"surplusPhaseFrom": 3,
	"blockedGrowth": { "room": 1 },
	"offense": { "minArmy": 25, "breakers": { "perSoldiers": 25, "max": 5, "launch": 2 }, 		"exchange": { "maxCost": 0.3, "minCost": 0.1, "response": 1, "reaction": 0, "handicap": 0.8,
			"dominance": { "horizonS": 120 }, "attrition": { "min": 0.6, "max": 1.6 }, "reach": { "launch": 300, "fight": 150 } },
		"targetsTried": 6, "recall": 0.1, "reinforce": { "min": 20 },
		"beachhead": { "superiority": 1, "reserve": 10 } },
	"guard": { "enter": 3, "exit": 1, "engage": { "enter": 3, "exit": 2 }, "horizonS": 90, "near": 80, "reach": 150 },
	"expansion": { "firstPopulation": 100, "populationPerSettlement": 70, "max": 4 },
	"medics": { "soldiersPerHealer": 12, "woundsPerHealer": 300, "max": 8 },
	"trade": { "minRate": 0.3, "richRate": 0.5, "minDistance": 400, "max": 10, "populationPerTrader": 20, "scarceWealth": 3000, "scarceCodes": ["stone", "metal"] },
	"naval": { "dockPopulation": 40, "fishDock": { "population": 20, "schools": 4, "reach": 300 }, "maxCapacity": 200, "superiority": 1, "carried": 0.8, "seaSuperiority": 1.5, "settlers": 6, "founders": 10, "yardFishers": 18, "yardSpacing": 110, "yardCrowd": 70, "reinforcement": 10, "massShare": 0.5, "edge": 1.3, "huntSuperiority": 1.2, "fleetMax": 24, "fightersPerShip": 8,
		"raid": { "minShips": 4, "reach": 50, "clearance": 12, "minPrey": 3, "hull": 0.35, "preyPerValue": 0.01 },
		"fishClearance": { "battery": 15, "structure": 70, "soldier": 65, "berth": 12, "flight": 90 },
		"bombard": { "ships": 6, "margin": 6, "clearance": 10, "bearings": 18, "searoom": 12, "tried": 40, "arrive": 20 },
		"fishing": { "maxBoats": 12, "perFish": 2 } },
	"colony": { "dockPopulation": 20, "maxHomeArea": 150000, "minArea": 6000, "centreArea": 14000, "enemyClearance": 220, "max": 5, "wealthCap": 6000,
		"distanceScale": 400, "starvedWeight": 4, "phasePopulation": 50 },
	"forward": { "settlers": 15, "builders": 20, "reach": 120, "clearance": 250, "shore": 120 },
	"labour": { "smoothing": 0.1, "starvedMin": 4, "starvedShare": 0.12, "wealthPerWorker": 150, "minWealth": 600, "minParty": 3, "maxParty": 10,
		"scarceWealth": 3000, "scarceCodes": ["wood", "stone", "metal"] },
	"margin": 1.25,
	"protectHero": false,
	"seekRelics": false,
	"raiseWonder": false
};

const PLANS = [
	{ "name": "regicide", "applies": context => context.victory.includes("regicide"), "set": { "protectHero": true } },
	{ "name": "relics", "applies": context => context.victory.includes("capture_the_relic"), "set": { "seekRelics": true } },
	{ "name": "wonder", "applies": context => context.victory.includes("wonder"), "set": { "raiseWonder": true } }
];

function overlay(base, set)
{
	const result = Object.assign({}, base);
	for (const key in set)
		result[key] = set[key] !== null && typeof set[key] === "object" && !Array.isArray(set[key]) && base[key] !== undefined ?
			overlay(base[key], set[key]) : set[key];
	return Object.freeze(result);
}

const NO_GUARD = Object.freeze({ "group": Object.freeze([]), "needed": Object.freeze([]), "ids": new Set(), "ratio": Infinity, "holds": true, "value": 0 });
const FAR = 1e6;

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
		this.table = BASE;
		this.plans = Object.freeze([]);
		this.shares = {};
		for (const code of codes)
			this.shares[code] = BASE.gatherShares[code] || 0;
		this.reported = Object.assign({}, this.shares);
		this.started = false;
		this.phaseWanted = 0;
		this.gap = {};
		for (const code of codes)
			this.gap[code] = 0;
	}

	labour(world)
	{
		const plan = this.table.labour;
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
		const plan = this.table.labour;
		if (!world.centres.length || !labour.starved.length)
			return null;
		const ports = world.regions.filter(region => region.anchors > 0 && region.docks > 0);
		const from = ports.filter(region => region.idle >= plan.minParty).sort((a, b) => b.idle - a.idle || a.id - b.id)[0] ||
			ports.sort((a, b) => b.workers - a.workers || a.id - b.id)[0];
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
		if (world.phase === 1 && world.population >= this.table.colony.phasePopulation && world.regions.some(region =>
			region.id !== world.homeRegion && region.docks > 0 && !region.centres && world.regionArea(region.id) >= this.table.colony.centreArea))
		{
			this.phaseWanted = next;
			return true;
		}
		const housed = world.population + world.queuedPopulation >= world.populationLimit - this.table.blockedGrowth.room &&
			world.populationLimit < world.populationMax && !world.foundations.some(foundation => foundation.populationBonus > 0) &&
			!world.pendingConstructions.some(pending => this.catalog.populationBonus(pending.template) > 0);
		if (!housed)
			this.blockedSince = undefined;
		else if (this.blockedSince === undefined)
			this.blockedSince = world.time;
		const byBlockedGrowth = housed && world.time - this.blockedSince >= PATIENCE_MS && !!world.nextPhaseTech &&
			world.codes.every(code => world.resources[code] >= world.nextPhaseCost[code]);
		if (byBlockedGrowth)
			this.phaseWanted = next;
		const byPopulation = byBlockedGrowth || world.population >= (this.table.phaseUpPopulation[next] || Infinity);
		const { surplus } = exchangeOutlook(world);
		const bySurplus = next >= this.table.surplusPhaseFrom && !!world.nextPhaseTech &&
			world.codes.every(code => surplus[code] >= world.nextPhaseCost[code]);
		if (bySurplus)
			this.phaseWanted = next;
		return byPopulation || bySurplus;
	}

	colony(world, labour, ferry)
	{
		const plan = this.table.colony;
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
		if (this.colonySearched !== undefined && world.time - this.colonySearched < RETRY_MS)
			return null;
		this.colonySearched = world.time;
		const found = this.findColony(world, starved);
		this.colonySite = found && Object.freeze(Object.assign({}, found, {
			"starved": starved, "kind": settlement && world.regionArea(found.region) >= plan.centreArea ? "centre" : "dock"
		}));
		this.changed = this.changed || !!this.colonySite;
		return this.colonySite;
	}

	forward(world)
	{
		const plan = this.table.forward;
		const crossing = world.crossing;
		if (!crossing || !world.offered.some(name => this.catalog.isSettlement(name)) ||
		    world.regions.some(region => region.id === crossing.region && region.centres > 0))
			return null;
		const clear = position => territoryAt(world.grids.territory, position[0], position[1]).owner === 0 &&
			!world.enemyStructures.some(structure => squareDistance(structure.position, position) < plan.clearance * plan.clearance);
		if (this.front && this.front.region === crossing.region && clear(this.front.position))
			return this.front;
		if (this.frontSearched !== undefined && world.time - this.frontSearched < RETRY_MS)
			return null;
		this.frontSearched = world.time;
		const grid = world.wealth;
		let best = null;
		for (let j = 0; j < grid.height; ++j)
			for (let i = 0; i < grid.width; ++i)
			{
				const position = [(i + 0.5) * grid.cellSize, (j + 0.5) * grid.cellSize];
				if (world.regionOf(position) !== crossing.region || !world.codes.some(code => grid.totals[code] && grid.totals[code][i + j * grid.width] > 0) ||
				    !clear(position))
					continue;
				const landing = Math.min(...world.shores.filter(shore => shore.region === crossing.region && shore.sea === crossing.sea)
					.map(shore => squareDistance(shore.land, position)));
				if (landing > plan.shore * plan.shore)
					continue;
				const distance = squareDistance(position, crossing.position);
				if (!best || distance < best.distance)
					best = { "position": position, "distance": distance };
			}
		this.front = best && Object.freeze({ "region": crossing.region, "sea": crossing.sea, "position": Object.freeze(best.position) });
		this.changed = this.changed || !!this.front;
		return this.front;
	}

	colonyOpen(world, position, region)
	{
		const plan = this.table.colony;
		return !world.regions.some(entry => entry.id === region && (entry.docks > 0 || entry.centres > 0 || entry.enemyStructures > 0)) &&
			!world.enemyStructures.some(structure => squareDistance(structure.position, position) < plan.enemyClearance * plan.enemyClearance);
	}

	findColony(world, starved)
	{
		const plan = this.table.colony;
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

	threatened(world)
	{
		const plan = this.table.military.threat;
		const home = world.centres[0];
		const ready = world.enemyFighters.filter(unit => !atWork(unit));
		if (!home || ready.length < plan.minEnemy)
		{
			this.underThreat = false;
			return false;
		}
		const ours = world.fighters.filter(fighter => fighter.region === world.homeRegion);
		const cover = covering(world.holders, home.position, []);
		const outlook = forecast(engagement(this.catalog, ours, ready, cover, [], [], [], true),
			{ "horizonS": plan.horizonS, "joinScale": 0 });
		const ratio = outlook.theirs.value / Math.max(1, outlook.ours.value);
		this.underThreat = this.underThreat ? ratio < plan.exit : ratio < plan.enter;
		return this.underThreat;
	}

	military(world)
	{
		const plan = this.table.military;
		const level = this.plenty ? plan.plenty.exit : plan.plenty.enter;
		this.plenty = world.codes.every(code => world.resources[code] >= level);
		const target = this.plenty ? plan.civilianFloor : Math.min(plan.civilianTarget, Math.round(plan.civilianShare * world.populationMax));
		const hostiles = world.threats.length + world.wild.length;
		if (hostiles >= plan.raid.hostiles && hostiles >= plan.raid.share * (world.fighters.length + world.garrisonedSoldiers))
			this.raidedAt = world.time;
		const raided = this.raidedAt !== undefined && world.time - this.raidedAt < plan.raid.memoryMs || this.threatened(world);
		if (!this.militaryPlan || this.militaryPlan.civilianTarget !== target || this.militaryPlan.plentiful !== this.plenty ||
		    this.militaryPlan.raided !== raided)
		{
			this.militaryPlan = Object.freeze(Object.assign({}, plan, { "civilianTarget": target, "plentiful": this.plenty, "raided": raided }));
			this.changed = true;
		}
		return this.militaryPlan;
	}

	guard(world)
	{
		const plan = this.table.guard;
		const inside = new Set(world.threats.filter(threat => world.ownSide(threat.position)).map(threat => threat.id));
		for (const unit of world.wild)
			inside.add(unit.id);
		const foes = world.wild.length ? world.enemyFighters.concat(world.wild) : world.enemyFighters;
		const seeds = foes.filter(unit => inside.has(unit.id));
		if (!seeds.length)
		{
			this.guards = new Set();
			this.held = true;
			return NO_GUARD;
		}
		const near = plan.near * plan.near;
		const group = foes.filter(unit => inside.has(unit.id) || seeds.some(seed => squareDistance(seed.position, unit.position) <= near));
		const centre = centroid(group);
		const present = new Set(group.map(unit => unit.id));
		const opposing = arriving(this.catalog, world.enemyFighters, centre, present, true, plan.reach, true);
		const cover = covering(world.holders, centre, []);
		const opposingCover = covering(world.enemyStructures, centre, []);
		const territory = world.grids.territory;
		const reach = plan.reach * plan.reach;
		const kept = this.guards || new Set();
		let candidates = world.fighters
			.map(fighter => ({ "fighter": fighter, "distance": squareDistance(fighter.position, centre) }))
			.filter(entry => entry.distance <= reach ||
				territoryAt(territory, entry.fighter.position[0], entry.fighter.position[1]).owner === world.player);
		candidates.sort((a, b) => a.distance - b.distance || a.fighter.id - b.fighter.id);
		if (candidates.length)
			candidates = candidates.filter(entry => entry.fighter.region === candidates[0].fighter.region);
		candidates.sort((a, b) => kept.has(b.fighter.id) - kept.has(a.fighter.id) || a.distance - b.distance || a.fighter.id - b.fighter.id);
		const fighters = candidates.map(entry => entry.fighter);
		const ratio = count => {
			const chosen = fighters.slice(0, count);
			const close = within(chosen, centre);
			const closeIds = new Set(close.map(unit => unit.id));
			const coming = arriving(this.catalog, chosen, centre, closeIds, false, FAR, true);
			const outlook = forecast(engagement(this.catalog, close, group, cover, opposingCover, coming, opposing, true),
				{ "horizonS": plan.horizonS, "arrivals": 1, "joinScale": 0 });
			return outlook.theirs.value / Math.max(1, outlook.ours.value);
		};
		const whole = fighters.length ? ratio(fighters.length) : 0;
		let enough = fighters.length;
		if (whole >= plan.enter)
		{
			let short = 0;
			while (enough - short > 1)
			{
				const middle = Math.floor((short + enough) / 2);
				if (ratio(middle) >= plan.enter)
					enough = middle;
				else
					short = middle;
			}
		}
		const needed = fighters.slice(0, enough);
		let value = 0;
		for (const unit of group)
			value += this.catalog.costSum(unit.template);
		for (const entry of opposing)
			value += this.catalog.costSum(entry.unit.template);
		this.guards = new Set(needed.map(fighter => fighter.id));
		this.held = this.held === false ? whole >= plan.enter : whole >= plan.exit;
		return Object.freeze({ "group": Object.freeze(group), "centre": Object.freeze(centre), "needed": Object.freeze(needed), "ids": this.guards,
			"ratio": whole, "holds": this.held, "value": value });
	}

	scarce(world)
	{
		const plan = this.table.trade;
		const codes = world.centres.length && world.codes.every(code => world.wealth.regions[code]) ?
			plan.scarceCodes.filter(code => this.codes.includes(code) &&
				world.regionWealth(world.homeRegion, code) + world.resources[code] < plan.scarceWealth) : [];
		const key = codes.join(",");
		if (key !== this.scarceKey)
		{
			this.scarceKey = key;
			this.scarceCodes = Object.freeze(codes);
			this.changed = true;
		}
		return this.scarceCodes;
	}

	select(world)
	{
		const plans = PLANS.filter(plan => plan.applies(world.context));
		if (plans.length === this.plans.length && plans.every((plan, index) => plan.name === this.plans[index]))
			return;
		this.plans = Object.freeze(plans.map(plan => plan.name));
		this.table = plans.reduce((table, plan) => overlay(table, plan.set), BASE);
		this.changed = true;
	}

	update(world)
	{
		this.changed = !this.started;
		this.started = true;
		this.select(world);
		if (world.demand.observed)
			this.adaptShares(world);
		const labour = this.labour(world);
		const ferry = this.ferry(world, labour);
		if ((this.ferried && this.ferried.to) !== (ferry && ferry.to) || (this.shortCode || null) !== (labour.short[0] || null))
			this.changed = true;
		this.ferried = ferry;
		this.shortCode = labour.short[0] || null;
		this.priorities = Object.freeze({
			"plans": this.plans,
			"margin": this.table.margin,
			"gatherShares": Object.freeze(Object.assign({}, this.shares)),
			"values": this.table.values,
			"housing": this.table.housing,
			"military": this.military(world),
			"offense": this.table.offense,
			"guard": this.guard(world),
			"guardPlan": this.table.guard,
			"expansion": this.table.expansion,
			"medics": this.table.medics,
			"trade": this.table.trade,
			"scarce": this.scarce(world),
			"naval": this.table.naval,
			"protectHero": this.table.protectHero,
			"seekRelics": this.table.seekRelics,
			"raiseWonder": this.table.raiseWonder,
			"colony": this.colony(world, labour, ferry),
			"colonyPlan": this.table.colony,
			"ferry": ferry,
			"forward": this.forward(world),
			"forwardPlan": this.table.forward,
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
