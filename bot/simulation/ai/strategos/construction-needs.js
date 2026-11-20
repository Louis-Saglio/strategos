import { TERRITORY_PATH } from "simulation/ai/strategos/catalog.js";
import { centroid, distanceBetween, squareDistance } from "simulation/ai/strategos/geometry.js";
import { HERO_EDGE, POPULATION_PRICE, TECH_HORIZON_S, auraBenefit, effectBenefit, groupOutput, heroWorth, enemyProfile, exchangeOutlook, populationPressure, pricedSum, productionFlow, resourcePrices, techBenefit, unitStrength } from "simulation/ai/strategos/valuation.js";

export const SETTLEMENT_MAX_DISTANCE = 360;
export const SHORT_URGENCY = 5;

export function buildingNeed(purpose, shape)
{
	return Object.freeze(Object.assign({}, shape, { "purpose": purpose }));
}

function bound(context, fits)
{
	return name => fits(context, name);
}

function ordered(world, fits)
{
	return world.pendingConstructions.some(pending => fits(pending.template));
}

function rising(world, fits)
{
	return world.foundations.some(foundation => fits(foundation.template));
}

export function coming(world, fits)
{
	return ordered(world, fits) || rising(world, fits);
}

function owned(world, fits)
{
	let total = 0;
	for (const name in world.structureCounts)
		if (fits(name))
			total += world.structureCounts[name];
	for (const foundation of world.foundations)
		if (fits(foundation.template))
			total += 1;
	for (const pending of world.pendingConstructions)
		if (fits(pending.template))
			total += 1;
	return total;
}

export function landCheapest(context, fits)
{
	return context.catalog.cheapest(context.world.offered, name => context.catalog.isPlaceableOnLand(name) && fits(name));
}

function ring(context, template)
{
	return context.siting.ring(context.world, context.placement, template);
}

function production()
{
	return "production";
}

function pressed(context)
{
	return context.assessments.short.length > 0 ? SHORT_URGENCY : 1;
}

function pressedTier(context)
{
	return context.assessments.short.length > 0 ? "production" : null;
}

export function isSettlement(context, name)
{
	return context.catalog.isSettlement(name);
}

function cheapestSettlement(context)
{
	return context.catalog.cheapest(context.world.offered, bound(context, isSettlement));
}

export function obtainable(context, template)
{
	const { world, catalog } = context;
	const cost = catalog.cost(template);
	return world.barter.open || world.codes.every(code => cost[code] <= world.resources[code] || world.gatherers[code] > 0);
}

export function landed(world, region)
{
	return world.settlers.filter(settler => settler.region === region && !settler.state.repairing);
}

function bestHouse(context)
{
	const { world, catalog } = context;
	let best = null;
	let bestRate = 0;
	for (const name of world.offered)
	{
		const bonus = catalog.populationBonus(name);
		if (bonus <= 0 || !catalog.isPlaceableOnLand(name))
			continue;
		const rate = bonus / Math.max(1, catalog.costSum(name));
		if (rate > bestRate || (rate === bestRate && name < best))
		{
			best = name;
			bestRate = rate;
		}
	}
	return best;
}

function isMarket(context, name)
{
	return context.catalog.isBarterMarket(name);
}

function isDock(context, name)
{
	return context.catalog.isShoreStructure(name) && context.catalog.trainsTransports(name);
}

function docking(context)
{
	const { world, siting } = context;
	const placed = ordered(world, bound(context, isDock));
	const begun = rising(world, bound(context, isDock));
	siting.follow(world, placed, begun);
	return placed || begun;
}

function dockTemplate(context)
{
	return context.catalog.cheapest(context.world.offered, bound(context, isDock));
}

function ports(world)
{
	return world.docks.filter(dock => dock.region === world.homeRegion && !dock.blocked);
}

function harbourSea(context)
{
	const { world, plan, assessments } = context;
	const colony = assessments.colony;
	const sea = colony ? colony.sea : world.crossing ? world.crossing.sea : fishingSea(world, plan);
	return sea === null ? undefined : sea;
}

function fishingSea(world, plan)
{
	const fishing = plan.docks.fishing;
	const home = world.home.position;
	const counts = new Map();
	for (const school of world.schools)
	{
		if (squareDistance(school, home) > fishing.reach * fishing.reach)
			continue;
		const sea = world.seaOf(school);
		if (world.seas.includes(sea))
			counts.set(sea, (counts.get(sea) || 0) + 1);
	}
	const best = [...counts].sort((a, b) => b[1] - a[1] || a[0] - b[0])[0];
	return best && best[1] >= fishing.schools ? best[0] : undefined;
}

const HOUSE = buildingNeed("house", { "wanted": housingShort, "template": bestHouse, "site": ring, "value": "house",
	"urgency": housingUrgency, "tier": production, "returns": housingReturn });

function housingReturn(context, template)
{
	const { world, catalog } = context;
	const prices = resourcePrices(world);
	const output = groupOutput(world, prices, CIVILIAN_GROUP);
	return output === undefined ? undefined :
		TECH_HORIZON_S * output * catalog.populationBonus(template) / Math.max(1, pricedSum(world, prices, catalog.cost(template)));
}

function housingShort(context)
{
	const { capacity, headroom, need } = housing(context);
	return !(headroom >= need || capacity >= context.world.populationMax);
}

function housingUrgency(context)
{
	const { headroom, need } = housing(context);
	return 1 + Math.max(0, need - headroom) / need;
}

function housing(context)
{
	const { world, plan, catalog, builders } = context;
	let incoming = 0;
	for (const foundation of world.foundations)
		if (builders.underWay(world, foundation))
			incoming += foundation.populationBonus;
	for (const pending of world.pendingConstructions)
		incoming += catalog.populationBonus(pending.template);
	return {
		"capacity": world.populationLimit + incoming,
		"headroom": world.populationLimit + incoming - world.population - world.queuedPopulation,
		"need": plan.housing.base + plan.housing.perTrainer * world.trainers.length
	};
}

const CIVILIAN_GROUP = "civilian";

const BARRACKS = buildingNeed("barracks", { "fits": trainsWorkers, "template": barracksTemplate, "ready": recruitsFlow, "site": ring,
	"value": "support" });

function trainsWorkers(context, name)
{
	return context.catalog.populationBonus(name) <= 0 && context.catalog.trainsWorkers(name);
}

function barracksTemplate(context)
{
	return landCheapest(context, name => trainsWorkers(context, name) && context.catalog.trainsOnlySoldierWorkers(name)) ||
		landCheapest(context, bound(context, trainsWorkers));
}

function recruitsFlow(context, template)
{
	const { world, assessments, catalog } = context;
	const recruit = catalog.cheapest(catalog.trainsFrom(template), unit => catalog.isWorker(unit));
	if (!recruit)
		return false;
	const cost = catalog.cost(recruit);
	const busy = productionFlow(world, catalog, assessments.posture.drafted);
	return !world.codes.some(code => cost[code] > 0 && world.demand.income[code] <= busy[code]);
}

const WORKS = buildingNeed("works", { "template": bestWorks, "report": worksReport, "site": ring, "value": "investment",
	"returns": worksReturn });

function worksReturn(context, template)
{
	return worksRates(context)(template);
}

const WORKER_RATE = 0.5;
const TERRITORY_VALUE = 5000;

function bestWorks(context)
{
	const rate = worksRates(context);
	let best = null;
	for (const name of context.world.offered)
	{
		const ratio = rate(name);
		if (ratio > 1 && (!best || ratio > best.ratio || (ratio === best.ratio && name < best.name)))
			best = { name, ratio };
	}
	return best && best.name;
}

function worksRates(context)
{
	const { world, catalog } = context;
	const prices = resourcePrices(world);
	const priced = cost => world.codes.reduce((sum, code) => sum + prices[code] * cost[code], 0);
	const cramped = context.siting.cramped(world);
	const pressure = populationPressure(world);
	const house = bestHouse(context);
	const housePrice = house ? priced(catalog.cost(house)) / catalog.populationBonus(house) : 0;
	const heroic = world.heroes.length > 0 || world.trainers.some(trainer => trainer.trainable.some(unit => catalog.isHero(unit)));
	return name => {
		if (!catalog.isPlaceableSpaced(name) || name === house || catalog.isSettlement(name))
			return null;
		const held = owned(world, other => other === name);
		const repeatable = isFinite(catalog.limitRoom(name)) && catalog.limitRoom(name) > 0 &&
			held === (world.structureCounts[name] || 0);
		if (held > 0 && !repeatable)
			return null;
		const template = catalog.template(name);
		const auras = catalog.auras(name);
		let benefit = 0;
		if (template.get("Researcher"))
			for (const tech of catalog.researchable(template))
			{
				let gain = techBenefit(world, catalog, tech);
				for (const aura of auras)
					if (catalog.aura(aura).requiredTechnology === tech)
						gain += catalog.aura(aura).coverage * effectBenefit(world, catalog, catalog.aura(aura));
				benefit += Math.max(0, gain - priced(catalog.techCost(tech, name)));
			}
		for (const aura of auras)
		{
			benefit += auraBenefit(world, catalog, aura, false);
			if (cramped)
				for (const modification of catalog.aura(aura).modifications)
					if (modification.value === TERRITORY_PATH && modification.multiply > 1)
						benefit += (modification.multiply - 1) * TERRITORY_VALUE;
		}
		const trickle = catalog.trickle(name);
		for (const code of world.codes)
			benefit += trickle[code] * (TECH_HORIZON_S + POPULATION_PRICE * pressure / WORKER_RATE);
		let potential = 0;
		for (const option of catalog.upgrades(name))
		{
			const better = catalog.trickle(option.template);
			const gain = world.codes.reduce((sum, code) => sum + Math.max(0, better[code] - trickle[code]), 0) *
				(TECH_HORIZON_S + POPULATION_PRICE * pressure / WORKER_RATE);
			potential = Math.max(potential, gain - priced(option.cost));
		}
		benefit += potential;
		if (!held && catalog.populationBonus(name) > 0 && housePrice > 0)
			benefit += Math.min(catalog.populationBonus(name), Math.max(0, world.populationMax - world.populationLimit)) * housePrice;
		if (!heroic)
		{
			const heroes = catalog.trainsFrom(name).filter(unit => catalog.isHero(unit));
			let worth = 0;
			for (const unit of heroes)
				worth = Math.max(worth, heroWorth(world, catalog, unit) - HERO_EDGE * priced(catalog.cost(unit)));
			benefit += worth;
		}
		return benefit / Math.max(1, priced(catalog.cost(name)));
	};
}

function worksReport(context, template)
{
	return { "works": template, "ratio": Math.round(worksRates(context)(template) * 100) / 100 };
}

const PHASE_BUILDING = buildingNeed("phase-building", { "wanted": phaseWanted, "template": phaseBuilding, "site": ring,
	"value": "phase" });

function phaseWanted(context)
{
	return context.assessments.advancePhase;
}

function phaseBuilding(context)
{
	const { world, catalog } = context;
	for (const need of world.phaseNeeds)
	{
		const hasClass = name => catalog.template(name).hasClass(need.class);
		const underWay = world.pendingConstructions.filter(pending => hasClass(pending.template)).length +
			world.foundations.filter(foundation => hasClass(foundation.template)).length;
		if (underWay >= need.missing)
			continue;
		const eligible = name => hasClass(name) && catalog.populationBonus(name) <= 0 && !catalog.isFarm(name);
		const template = landCheapest(context, name => eligible(name) && owned(world, other => other === name) === 0) ||
			(need.check === "variants" ? null : landCheapest(context, eligible));
		if (template)
			return template;
	}
	return null;
}

const SIEGE_WORKSHOP = buildingNeed("siege-workshop", { "wanted": siegeWanted, "fits": trainsBreakers, "site": ring, "value": "support" });

function siegeWanted(context)
{
	const { world, plan, catalog } = context;
	return !(world.fighters.length < plan.minArmy || world.trainers.some(trainer => trainer.trainable.some(name => catalog.isBreaker(name))));
}

function trainsBreakers(context, name)
{
	return context.catalog.populationBonus(name) <= 0 && context.catalog.trainsBreakers(name);
}

const MARKET = buildingNeed("market", { "wanted": marketWanted, "template": marketTemplate, "site": ring, "value": "support" });

const MARKET_SURPLUS = 500;

function marketWanted(context)
{
	const world = context.world;
	if (world.barter.open || owned(world, bound(context, isMarket)) > 0)
		return false;
	const { surplus, shortfall } = exchangeOutlook(world);
	return world.codes.some(code => shortfall[code] > 0) && world.codes.some(code => surplus[code] >= MARKET_SURPLUS);
}

function marketTemplate(context)
{
	return landCheapest(context, bound(context, isMarket));
}

const EXPANSION = buildingNeed("expansion", { "wanted": settlementsWanted, "fits": isSettlement, "template": cheapestSettlement,
	"site": expansionSite, "value": "investment" });

function settlementsWanted(context)
{
	const { world, plan } = context;
	const settlements = owned(world, bound(context, isSettlement));
	const cramped = context.siting.cramped(world);
	const wanted = Math.min(plan.settlements.max, Math.max(cramped ? settlements + 1 : 0,
		1 + Math.floor(Math.max(0, world.population - plan.settlements.firstPopulation) / plan.settlements.populationPerSettlement)));
	return !(settlements >= wanted);
}

function expansionSite(context, template)
{
	const { world, plan, siting } = context;
	return siting.settlement(world, plan, template, world.home.position, SETTLEMENT_MAX_DISTANCE, world.homeRegion);
}

const OUTPOST = buildingNeed("outpost", { "fits": isSettlement, "template": cheapestSettlement, "ready": obtainable,
	"places": outpostRegions, "site": outpostSite, "value": "investment", "urgency": pressed, "tier": pressedTier });

const OUTPOST_MIN_BUILDERS = 3;

function outpostRegions(context, template)
{
	const { world, plan } = context;
	const places = [];
	for (const region of world.regions)
	{
		if (region.id === world.homeRegion || region.centres > 0 || region.enemyStructures > 0 || region.workers < OUTPOST_MIN_BUILDERS ||
		    world.regionArea(region.id) < plan.centreArea)
			continue;
		const dock = world.docks.find(candidate => candidate.region === region.id);
		if (dock)
			places.push({ "key": template + "@" + region.id, "region": region.id, "origin": dock.position });
	}
	return places;
}

function outpostSite(context, template, place)
{
	return context.siting.settlement(context.world, context.plan, template, place.origin, SETTLEMENT_MAX_DISTANCE, place.region);
}

const DOCK = buildingNeed("dock", { "wanted": dockWanted, "coming": docking, "template": dockTemplate, "site": dockSite,
	"value": "investment", "urgency": pressed, "tier": pressedTier });

function dockWanted(context)
{
	return !ports(context.world).length && harbourSea(context) !== undefined;
}

function dockSite(context, template)
{
	const { world, siting } = context;
	return siting.shore(world, template, world.homeRegion, harbourSea(context), world.home.position, 0);
}

const SHIPYARD = buildingNeed("shipyard", { "wanted": shipyardWanted, "coming": docking, "template": dockTemplate, "site": shipyardSite,
	"value": "investment", "urgency": pressed, "tier": pressedTier });

function shipyardWanted(context)
{
	return yardWanted(context) && harbourSea(context) !== undefined;
}

function yardWanted(context)
{
	const { world, plan } = context;
	return ports(world).length === 1 && !!world.crossing && world.fishers >= plan.docks.yardFishers;
}

function shipyardSite(context, template)
{
	const { world, plan, siting } = context;
	return siting.shore(world, template, world.homeRegion, world.crossing.sea, world.home.position, plan.docks.yardSpacing);
}

export const WONDER = buildingNeed("wonder", { "wanted": wonderWanted, "template": wonderTemplate, "ready": wonderReady, "site": ring,
	"value": "wonder" });

const WONDER_STOCK = 2;

function wonderWanted(context)
{
	return !(owned(context.world, bound(context, isWonder)) > 0);
}

function isWonder(context, name)
{
	return context.catalog.isWonder(name);
}

function wonderTemplate(context)
{
	return landCheapest(context, bound(context, isWonder));
}

function wonderReady(context, template)
{
	const cost = context.catalog.cost(template);
	return !context.world.codes.some(code => context.world.resources[code] < WONDER_STOCK * cost[code]);
}

const ELITE = buildingNeed("elite", { "template": eliteBuilding, "ready": eliteReady, "site": ring, "value": "support" });

const ELITE_EDGE = 1.2;
const ELITE_STOCK = 2;

function eliteBuilding(context)
{
	const { world, catalog } = context;
	const enemy = enemyProfile(world, catalog);
	const perSlot = name => unitStrength(world, catalog, name, enemy) / Math.max(1, catalog.population(name));
	const known = new Set();
	let current = 0;
	let hero = world.heroes.length > 0;
	for (const trainer of world.trainers)
		for (const name of trainer.trainable)
		{
			known.add(name);
			hero = hero || catalog.isHero(name);
			if (catalog.isFighter(name))
				current = Math.max(current, perSlot(name));
		}
	return catalog.cheapest(world.offered, name => {
		if (!catalog.isPlaceableSpaced(name) || catalog.isSettlement(name) || owned(world, candidate => candidate === name) > 0)
			return false;
		const units = catalog.trainsFrom(name).filter(unit => !known.has(unit));
		return units.some(unit => catalog.isFighter(unit) && perSlot(unit) >= ELITE_EDGE * current) ||
			!hero && units.some(unit => catalog.isHero(unit));
	});
}

function eliteReady(context, template)
{
	const world = context.world;
	const cost = context.catalog.cost(template);
	return !(world.codes.some(code => world.resources[code] < ELITE_STOCK * (cost[code] || 0)) || world.pendingConstructions.length > 0);
}

const TRADE_POST = buildingNeed("trade-post", { "wanted": tradePostWanted, "fits": isMarket, "ready": tradePostReady,
	"site": tradePostSite, "value": "support" });

const TRADE_POST_CLEARANCE = 150;

function tradePostWanted(context)
{
	const { world, assessments } = context;
	return !(!assessments.scarce.length || !world.markets.some(market => market.own) || world.centres.length < 2);
}

function tradePostReady(context)
{
	return !!farCentre(context);
}

function farCentre(context)
{
	const { world, plan } = context;
	let far = null;
	let reach = 0;
	for (const centre of world.centres)
	{
		if (world.regionOf(centre.position) !== world.homeRegion)
			continue;
		const nearest = Math.min(...world.markets.map(market => distanceBetween(market.position, centre.position)));
		const longest = Math.max(...world.markets.map(market => distanceBetween(market.position, centre.position)));
		if (nearest >= TRADE_POST_CLEARANCE && longest > reach)
		{
			far = centre;
			reach = longest;
		}
	}
	return far && !(reach < plan.tradePost.minDistance) ? far : null;
}

function tradePostSite(context, template)
{
	return context.siting.beside(context.world, context.placement, farCentre(context), template);
}

export const COLONY = Object.freeze({ "decision": "colony" });

export const COLONY_DOCK = buildingNeed("colony-dock", { "coming": docking, "template": colonyDockTemplate, "site": colonyDockSite,
	"builders": colonyDockBuilders, "value": "investment", "urgency": pressed, "tier": pressedTier });

function colonyDockTemplate(context)
{
	return context.catalog.cheapest(landed(context.world, context.assessments.colony.region)[0].buildable, bound(context, isDock));
}

function colonyDockSite(context, template)
{
	const { world, assessments, siting } = context;
	const colony = assessments.colony;
	return siting.shore(world, template, colony.region, colony.sea, centroid(landed(world, colony.region)), 0);
}

function colonyDockBuilders(context)
{
	return landed(context.world, context.assessments.colony.region).map(settler => settler.id);
}

const FORWARD_BASE = buildingNeed("forward-base", { "wanted": forwardWanted, "fits": isSettlement, "template": forwardTemplate,
	"ready": obtainable, "places": forwardPlaces, "site": forwardSite, "builders": forwardBuilders, "value": "investment",
	"urgency": shortUrgency, "tier": production });

function forwardWanted(context)
{
	return !!context.assessments.forward;
}

function forwardTemplate(context)
{
	const party = vanguard(context);
	return party && context.catalog.cheapest(party[0].buildable, bound(context, isSettlement));
}

function vanguard(context)
{
	const { world, plan, assessments } = context;
	const front = assessments.forward;
	const ashore = landed(world, front.region);
	if (!ashore.length || ashore.length < plan.forwardBase.settlers)
		return null;
	return ashore
		.map(settler => ({ settler, "distance": squareDistance(settler.position, front.position) }))
		.sort((a, b) => a.distance - b.distance || a.settler.id - b.settler.id)
		.slice(0, plan.forwardBase.builders)
		.map(entry => entry.settler);
}

function forwardPlaces(context, template)
{
	return [{ "key": template + "@" + context.assessments.forward.region }];
}

function forwardSite(context, template)
{
	return context.siting.forward(context.world, context.plan, template, context.assessments.forward);
}

function forwardBuilders(context)
{
	return vanguard(context).map(settler => settler.id);
}

function shortUrgency()
{
	return SHORT_URGENCY;
}

export const FOUNDING = buildingNeed("founding", { "wanted": foundingWanted, "fits": isSettlement, "template": cheapestSettlement,
	"site": foundingSite, "value": "founding" });

const FOUNDING_MAX_DISTANCE = 200;

function foundingWanted(context)
{
	const world = context.world;
	return world.workers.length && world.codes.every(code => world.wealth.totals[code]);
}

function foundingSite(context, template)
{
	const { world, plan, siting } = context;
	return siting.settlement(world, plan, template, centroid(world.workers), FOUNDING_MAX_DISTANCE, undefined);
}

export const PLAN_NEEDS = Object.freeze({ "slot": "plans" });

export const NEEDS = Object.freeze([HOUSE, BARRACKS, WORKS, PHASE_BUILDING, SIEGE_WORKSHOP, MARKET, EXPANSION, OUTPOST, DOCK,
	SHIPYARD, PLAN_NEEDS, ELITE, TRADE_POST, COLONY, FORWARD_BASE]);
