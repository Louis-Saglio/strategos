import { isTreasure } from "simulation/ai/common-api/filters.js";
import { distanceBetween, squareDistance } from "simulation/ai/strategos/geometry.js";
import { TRADE_GAIN_DAMPING, TRADE_GAIN_DISTANCE, TRADE_GAIN_MAP } from "simulation/ai/strategos/rules.js";
import { landRegionNear, landRegionsOf, territoryAt } from "simulation/ai/strategos/terrain.js";
import { stateOf } from "simulation/ai/strategos/unitstate.js";

const TREASURE_RADIUS = 120;

export function dropsites(gameState, catalog)
{
	const anchors = [];
	for (const ent of gameState.getOwnDropsites().values())
	{
		if (ent.foundationProgress() !== undefined || !ent.position())
			continue;
		const footprint = catalog.footprint(ent.templateName());
		anchors.push(Object.freeze({
			"id": ent.id(),
			"template": ent.templateName(),
			"position": ent.position(),
			"radius": Math.max(footprint.width, footprint.depth) / 2,
			"shore": catalog.isShoreStructure(ent.templateName()),
			"types": ent.resourceDropsiteTypes()
		}));
	}
	return anchors;
}

function anchorDistance(anchors, code, position)
{
	let best = Infinity;
	for (const anchor of anchors)
		if (anchor.types.includes(code))
			best = Math.min(best, Math.max(0, distanceBetween(anchor.position, position) - anchor.radius));
	return best;
}

function workforce(gameState, catalog, anchors)
{
	const accessibility = gameState.sharedScript.accessibility;
	const workers = [];
	const settlers = [];
	const traders = [];
	const anchorRegions = landRegionsOf(accessibility, anchors);
	for (const ent of gameState.getOwnUnits().values())
	{
		const position = ent.position();
		if (!position)
			continue;
		const state = stateOf(ent);
		if (catalog.isTrader(ent.templateName()))
			traders.push(Object.freeze({
				"id": ent.id(),
				"position": position,
				"region": accessibility.getAccessValue(position),
				"state": state,
				"idle": ent.isIdle()
			}));
		if (!ent.isGatherer() || ent.hasClass("Ship"))
			continue;
		const region = accessibility.getAccessValue(position);
		if (anchorRegions.size && !anchorRegions.has(region))
		{
			settlers.push(Object.freeze({
				"id": ent.id(),
				"position": position,
				"region": region,
				"state": state,
				"buildable": Object.freeze(catalog.buildable(ent))
			}));
			continue;
		}
		const orders = ent.unitAIOrderData() || [];
		const soldier = ent.hasClass("Soldier");
		let gathering = null;
		let kind = null;
		let haul = null;
		let targetPosition = null;
		if (state.returning)
		{
			const carried = ent.resourceCarrying();
			gathering = carried && carried.length ? carried[0].type : null;
		}
		else if (state.gathering && orders.length && orders[0] && orders[0].target !== undefined)
		{
			const target = gameState.getEntityById(orders[0].target);
			const type = target && target.resourceSupplyType();
			gathering = type ? type.generic : null;
			kind = type ? type.generic + "." + type.specific : null;
			if (type && target.position() && isFinite(target.resourceSupplyAmount()))
			{
				targetPosition = target.position();
				haul = anchorDistance(anchors, type.generic, targetPosition);
			}
		}
		const load = ent.resourceCarrying() || [];
		workers.push(Object.freeze({
			"id": ent.id(),
			"template": ent.templateName(),
			"carried": load.reduce((sum, item) => sum + item.amount, 0),
			"carriedType": load.length ? load[0].type : null,
			"hitpoints": ent.hitpoints(),
			"position": position,
			"region": region,
			"idle": ent.isIdle(),
			"collector": ent.isTreasureCollector(),
			"state": state,
			"soldier": soldier,
			"classes": ent.classes(),
			"gathering": gathering,
			"kind": kind,
			"haul": haul,
			"targetPosition": targetPosition,
			"profile": catalog.gathering(ent),
			"meanRates": Object.freeze(catalog.meanRates(ent)),
			"target": orders.length && orders[0] ? orders[0].target : undefined,
			"gatherTypes": Object.freeze(catalog.gatherTypes(ent)),
			"buildable": Object.freeze(catalog.buildable(ent))
		}));
	}
	return { workers, settlers, traders };
}

function occupation(codes, workers, fishers)
{
	const gatherers = {};
	const hauls = {};
	const hauled = {};
	for (const code of codes)
	{
		gatherers[code] = 0;
		hauls[code] = 0;
		hauled[code] = 0;
	}
	for (const worker of workers)
	{
		if (worker.gathering && gatherers[worker.gathering] !== undefined)
			gatherers[worker.gathering] += 1;
		if (worker.haul !== null && isFinite(worker.haul) && hauls[worker.gathering] !== undefined)
		{
			hauls[worker.gathering] += worker.haul;
			hauled[worker.gathering] += 1;
		}
	}
	for (const code of codes)
		hauls[code] = hauled[code] ? hauls[code] / hauled[code] : 0;
	if (gatherers.food !== undefined)
		gatherers.food += fishers;
	return { gatherers, hauls };
}

function buildableBy(workers)
{
	const offered = new Set();
	for (const worker of workers)
		for (const name of worker.buildable)
			offered.add(name);
	return [...offered].sort();
}

function tradingPosts(gameState)
{
	const accessibility = gameState.sharedScript.accessibility;
	const player = gameState.getPlayerID();
	const partners = new Set(gameState.getMutualAllies());
	const markets = [];
	for (const ent of gameState.updatingGlobalCollection("strategos-markets",
		{ "func": candidate => (candidate.get("Market/TradeType") || "").split(/\s+/).includes("land"), "dynamicProperties": [] },
		gameState.getEntities()).values())
		if (ent.position() && ent.foundationProgress() === undefined && (ent.owner() === player || partners.has(ent.owner())))
			markets.push(Object.freeze({ "id": ent.id(), "position": ent.position(),
				"region": landRegionNear(accessibility, ent.position()), "own": ent.owner() === player,
				"bonus": +ent.get("Market/InternationalBonus") || 0 }));
	return markets.sort((a, b) => a.id - b.id);
}

function routeGain(distance, mapSize, multiplier)
{
	const gain = length => length * length / (1 + TRADE_GAIN_DAMPING * length / mapSize);
	return multiplier * Math.sqrt(TRADE_GAIN_MAP / mapSize) * gain(distance) / gain(TRADE_GAIN_DISTANCE);
}

function bestRoute(markets, mapSize, caravan)
{
	let best = null;
	if (!caravan)
		return best;
	for (let i = 0; i < markets.length; ++i)
		for (let j = i + 1; j < markets.length; ++j)
		{
			const a = markets[i];
			const b = markets[j];
			if (a.region !== b.region)
				continue;
			if (!a.own && !b.own)
				continue;
			const distance = distanceBetween(a.position, b.position);
			const gain = routeGain(distance, mapSize, caravan.gain) * (a.own && b.own ? 1 : 1 + Math.max(a.bonus, b.bonus));
			const rate = gain / Math.max(1, distance / Math.max(1, caravan.speed));
			if (!best || rate > best.rate || rate === best.rate && a.id + b.id < best.from.id + best.to.id)
				best = { "from": a, "to": b, "distance": distance, "gain": gain, "rate": rate };
		}
	return best;
}

function treasuresWithin(gameState, anchors, workers)
{
	const player = gameState.getPlayerID();
	const origins = anchors.map(anchor => anchor.position);
	if (!origins.length && workers.length)
		origins.push([
			workers.reduce((sum, worker) => sum + worker.position[0], 0) / workers.length,
			workers.reduce((sum, worker) => sum + worker.position[1], 0) / workers.length
		]);
	const treasures = [];
	if (!origins.length)
		return treasures;
	const accessibility = gameState.sharedScript.accessibility;
	const territory = gameState.sharedScript.territoryMap;
	const regions = new Set(origins.map(origin => accessibility.getAccessValue(origin)));
	const limit = TREASURE_RADIUS * TREASURE_RADIUS;
	for (const ent of gameState.updatingGlobalCollection("strategos-treasures", isTreasure()).values())
	{
		const position = ent.position();
		if (!position || !origins.some(origin => squareDistance(origin, position) <= limit))
			continue;
		const owner = territoryAt(territory, position[0], position[1]).owner;
		if ((owner !== 0 && owner !== player) || !regions.has(accessibility.getAccessValue(position)))
			continue;
		treasures.push(Object.freeze({ "id": ent.id(), "position": position, "resources": Object.freeze(ent.treasureResources()) }));
	}
	return treasures.sort((a, b) => a.id - b.id);
}

export function economySection(gameState, catalog, resourceIndex, anchors, batteries, fishers)
{
	const playerData = gameState.playerData;
	const codes = catalog.codes;
	const resources = {};
	for (const code of codes)
		resources[code] = playerData.resourceCounts[code] || 0;
	const staff = workforce(gameState, catalog, anchors);
	const busy = occupation(codes, staff.workers, fishers);
	const sites = {};
	for (const code of codes)
		sites[code] = resourceIndex.live(gameState, code, anchors, batteries);
	const markets = Object.freeze(tradingPosts(gameState));
	const accessibility = gameState.sharedScript.accessibility;
	return {
		"now": {
			"resources": Object.freeze(resources),
			"barter": Object.freeze({ "open": !!playerData.canBarter, "prices": playerData.barterPrices }),
			"anchors": Object.freeze(anchors),
			"workers": Object.freeze(staff.workers),
			"settlers": Object.freeze(staff.settlers),
			"traders": Object.freeze(staff.traders),
			"labour": staff.workers.length + fishers,
			"gatherers": Object.freeze(busy.gatherers),
			"hauls": Object.freeze(busy.hauls),
			"sites": Object.freeze(sites),
			"game": resourceIndex.liveGame(gameState, batteries),
			"wealth": resourceIndex.grid(gameState),
			"regionWealth": (region, code) => resourceIndex.grid(gameState).regions[code] && resourceIndex.grid(gameState).regions[code].get(region) || 0,
			"markets": markets,
			"treasures": Object.freeze(treasuresWithin(gameState, anchors, staff.workers))
		},
		"later": {
			"offered": () => Object.freeze(buildableBy(staff.workers)),
			"bestRoute": () => bestRoute(markets, accessibility.width * accessibility.cellSize, catalog.caravan())
		}
	};
}
