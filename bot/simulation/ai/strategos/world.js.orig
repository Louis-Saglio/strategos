import { byClass, isTreasure } from "simulation/ai/common-api/filters.js";

const SITE_RADIUS = 110;
const TREASURE_RADIUS = 120;
const SITES_KEPT = 48;
const SITES_EXPOSED = 16;
const WEALTH_CELL = 40;
const FIRE_MARGIN = 10;

export class ResourceIndex
{
	constructor(player, codes)
	{
		this.player = player;
		this.codes = codes;
		this.sites = new Map(codes.map(code => [code, []]));
		this.cursor = 0;
	}

	refresh(gameState, anchors)
	{
		const code = this.codes[this.cursor % this.codes.length];
		this.cursor += 1;
		const accessibility = gameState.sharedScript.accessibility;
		const points = anchors.filter(anchor => anchor.types.includes(code))
			.map(anchor => ({ "position": anchor.position, "region": landRegionNear(accessibility, anchor.position) }));
		const kept = [];
		const beyond = [];
		const grid = this.grid(gameState);
		const totals = new Float64Array(grid.width * grid.height);
		const weighted = new Float64Array(2 * grid.width * grid.height);
		const limit = SITE_RADIUS * SITE_RADIUS;
		for (const ent of gameState.getResourceSupplies(code).values())
		{
			const owner = ent.owner();
			if (owner !== 0 && owner !== this.player)
				continue;
			const position = ent.position();
			if (!position || ent.hasClass("SeaCreature"))
				continue;
			const amount = ent.resourceSupplyAmount();
			if (owner === 0 && isFinite(amount) && amount > 0)
			{
				const i = Math.min(grid.width - 1, Math.max(0, Math.floor(position[0] / grid.cellSize)));
				const j = Math.min(grid.height - 1, Math.max(0, Math.floor(position[1] / grid.cellSize)));
				totals[i + j * grid.width] += amount;
				weighted[2 * (i + j * grid.width)] += amount * position[0];
				weighted[2 * (i + j * grid.width) + 1] += amount * position[1];
			}
			if (!points.length)
				continue;
			let best = Infinity;
			let nearest = Infinity;
			let region = -1;
			for (const point of points)
			{
				const distance = squareDistance(point.position, position);
				nearest = Math.min(nearest, distance);
				if (distance > limit || distance >= best)
					continue;
				if (region < 0)
					region = accessibility.getAccessValue(position);
				if (region < 2 || point.region < 2 || region === point.region)
					best = distance;
			}
			if (best <= limit)
				kept.push({ "id": ent.id(), "distance": best });
			else
				beyond.push({ "id": ent.id(), "distance": nearest, "position": position });
		}
		grid.totals[code] = totals;
		grid.weighted[code] = weighted;
		if (!kept.length)
			this.reachable(gameState, beyond, points, kept);
		kept.sort((a, b) => a.distance - b.distance || a.id - b.id);
		this.sites.set(code, kept.slice(0, SITES_KEPT).map(site => site.id));
	}

	reachable(gameState, beyond, points, kept)
	{
		const accessibility = gameState.sharedScript.accessibility;
		const territory = gameState.sharedScript.territoryMap;
		const regions = new Set(points.map(point => point.region));
		beyond.sort((a, b) => a.distance - b.distance || a.id - b.id);
		for (const supply of beyond)
		{
			const owner = territoryAt(territory, supply.position[0], supply.position[1]).owner;
			if ((owner !== 0 && owner !== this.player) || !regions.has(accessibility.getAccessValue(supply.position)))
				continue;
			kept.push(supply);
			if (kept.length >= SITES_EXPOSED)
				break;
		}
	}

	grid(gameState)
	{
		if (!this.wealth)
		{
			const territory = gameState.sharedScript.territoryMap;
			const size = territory.width * territory.cellSize;
			const cells = Math.ceil(size / WEALTH_CELL);
			this.wealth = { "cellSize": WEALTH_CELL, "width": cells, "height": cells, "totals": {}, "weighted": {} };
		}
		return this.wealth;
	}

	live(gameState, code, anchors, enemyStructures)
	{
		const batteries = enemyStructures.filter(structure => structure.fire.arrows);
		const points = anchors.filter(anchor => anchor.types.includes(code)).map(anchor => anchor.position);
		const sites = [];
		for (const id of this.sites.get(code))
		{
			const ent = gameState.getEntityById(id);
			const amount = ent && ent.resourceSupplyAmount();
			if (!ent || !ent.position() || !(amount > 0))
				continue;
			const position = ent.position();
			if (batteries.some(structure => squareDistance(structure.position, position) <= (structure.range + FIRE_MARGIN) * (structure.range + FIRE_MARGIN)))
				continue;
			let nearest = Infinity;
			for (const point of points)
				nearest = Math.min(nearest, squareDistance(point, position));
			const type = ent.resourceSupplyType();
			sites.push(Object.freeze({
				"id": id,
				"kind": type.generic + "." + type.specific,
				"position": position,
				"region": gameState.sharedScript.accessibility.getAccessValue(position),
				"amount": amount,
				"gatherers": ent.resourceSupplyNumGatherers() || 0,
				"capacity": ent.maxGatherers() || 1,
				"armed": !!ent.get("Attack"),
				"anchorDistance": Math.sqrt(nearest)
			}));
			if (sites.length >= SITES_EXPOSED)
				break;
		}
		return Object.freeze(sites);
	}
}

const SHORE_SPACING = 12;

export class ShoreIndex
{
	constructor()
	{
		this.points = null;
	}

	all(gameState)
	{
		if (this.points)
			return this.points;
		const accessibility = gameState.sharedScript.accessibility;
		const land = accessibility.landPassMap;
		const water = accessibility.navalPassMap;
		const width = accessibility.width;
		const height = accessibility.height;
		const size = accessibility.cellSize;
		const stride = Math.max(1, Math.round(SHORE_SPACING / size));
		const points = [];
		for (let j = stride; j < height - stride; j += stride)
			for (let i = stride; i < width - stride; i += stride)
			{
				const region = land[i + j * width];
				if (region < 2)
					continue;
				for (const [di, dj] of [[stride, 0], [-stride, 0], [0, stride], [0, -stride]])
				{
					const sea = water[i + di + (j + dj) * width];
					if (sea < 2 || land[i + di + (j + dj) * width] === region)
						continue;
					points.push(Object.freeze({
						"land": Object.freeze([(i + 0.5) * size, (j + 0.5) * size]),
						"water": Object.freeze([(i + di + 0.5) * size, (j + dj + 0.5) * size]),
						"region": region,
						"sea": sea
					}));
					break;
				}
			}
		this.points = Object.freeze(points);
		return this.points;
	}
}

const TERRITORY_OWNER_MASK = 0x1F;
const TERRITORY_BLINKING_MASK = 0x40;
const THREAT_CLASSES = ["Soldier", "Siege", "Hero"];
const DEFAULT_DAMAGE_MIX = { "Hack": 0.5, "Pierce": 0.5 };
const CRITICAL_CLASS = "ConquestCritical";
const UNCAPTURABLE_CLASSES = ["Wall", "Palisade", "Field"];

export function territoryAt(territory, x, z)
{
	const i = Math.floor(x / territory.cellSize);
	const j = Math.floor(z / territory.cellSize);
	if (i < 0 || j < 0 || i >= territory.width || j >= territory.height)
		return { "owner": -1, "connected": false };
	const cell = territory.data[i + j * territory.width];
	return { "owner": cell & TERRITORY_OWNER_MASK, "connected": (cell & TERRITORY_BLINKING_MASK) === 0 };
}

const SHORE_PROBES = [6, 12, 18];

function landRegionNear(accessibility, position)
{
	const region = accessibility.getAccessValue(position);
	if (region >= 2)
		return region;
	for (const reach of SHORE_PROBES)
		for (let k = 0; k < 8; ++k)
		{
			const found = accessibility.getAccessValue([position[0] + reach * Math.cos(k * Math.PI / 4), position[1] + reach * Math.sin(k * Math.PI / 4)]);
			if (found >= 2)
				return found;
		}
	return region;
}

function treasuresWithin(gameState, player, anchors, workers)
{
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

function enemyTarget(gameState, catalog, ent, owner, player)
{
	const range = ent.get("BuildingAI") && ent.attackRange("Ranged");
	return Object.freeze({
		"id": ent.id(),
		"owner": owner,
		"position": ent.position(),
		"region": gameState.sharedScript.accessibility.getAccessValue(ent.position()),
		"regen": captureRegen(gameState, ent),
		"points": capturePointsToTake(ent, player),
		"fire": defensiveFire(gameState, ent),
		"range": range ? range.max : 0,
		"centre": ent.hasClass("CivCentre"),
		"value": catalog.costSum(ent.templateName())
	});
}

function captureRegen(gameState, ent)
{
	let regen = +(ent.get("Capturable/RegenRate") || 0);
	const factor = +(ent.get("Capturable/GarrisonRegenRate") || 0);
	for (const id of ent.garrisoned() || [])
	{
		const unit = gameState.getEntityById(id);
		regen += factor * (unit ? captureStrength(unit) : 0);
	}
	return regen;
}

function defensiveFire(gameState, ent)
{
	const damage = ent.get("BuildingAI") && ent.attackStrengths("Ranged");
	if (!damage)
		return Object.freeze({ "arrows": 0, "repeat": 1, "damage": Object.freeze({}) });
	const classes = ent.get("BuildingAI/GarrisonArrowClasses") || "";
	let shooters = 0;
	for (const id of ent.garrisoned() || [])
	{
		const unit = gameState.getEntityById(id);
		if (unit && MatchesClassList(unit.classes(), classes))
			shooters += 1;
	}
	const arrows = (+ent.get("BuildingAI/DefaultArrowCount") || 0) +
		Math.round(shooters * (+ent.get("BuildingAI/GarrisonArrowMultiplier") || 0));
	return Object.freeze({
		"arrows": Math.min(arrows, +ent.get("BuildingAI/MaxArrowCount") || Infinity),
		"repeat": ent.attackTimes("Ranged").repeat / 1000,
		"damage": Object.freeze(damage)
	});
}

function capturePointsToTake(ent, player)
{
	const points = ent.capturePoints() || [];
	let total = 0;
	for (let owner = 0; owner < points.length; ++owner)
		if (owner !== player)
			total += points[owner];
	return total;
}

function phaseNeeds(gameState, tech)
{
	const template = tech && gameState.getTemplate(tech);
	const alternatives = template && template.requirements(gameState.getPlayerCiv());
	if (!alternatives || !alternatives.length)
		return [];
	const counts = gameState.playerData.classCounts || {};
	const variants = gameState.playerData.typeCountsByClass || {};
	const needs = [];
	for (const spec of alternatives[0].entities || [])
	{
		const have = spec.check === "variants" ? Object.keys(variants[spec.class] || {}).length : counts[spec.class] || 0;
		if (have < spec.number)
			needs.push(Object.freeze({ "class": spec.class, "check": spec.check, "missing": spec.number - have }));
	}
	return needs;
}

function techCost(gameState, codes, tech)
{
	const template = tech && gameState.getTemplate(tech);
	const raw = template && template.cost() || {};
	const cost = {};
	for (const code of codes)
		cost[code] = raw[code] || 0;
	return Object.freeze(cost);
}

export function captureStrength(ent)
{
	return +(ent.get("Attack/Capture/Capture") || 0);
}

function anchorDistance(anchors, code, position)
{
	let best = Infinity;
	for (const anchor of anchors)
		if (anchor.types.includes(code))
			best = Math.min(best, squareDistance(anchor.position, position));
	return Math.sqrt(best);
}

export function squareDistance(a, b)
{
	const dx = a[0] - b[0];
	const dz = a[1] - b[1];
	return dx * dx + dz * dz;
}

export function buildWorld(gameState, catalog, resourceIndex, shoreIndex, pendingConstructions, demand)
{
	const accessibility = gameState.sharedScript.accessibility;
	const playerData = gameState.playerData;
	const codes = catalog.codes;

	const resources = {};
	for (const code of codes)
		resources[code] = playerData.resourceCounts[code] || 0;

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
			"types": ent.resourceDropsiteTypes()
		}));
	}
	resourceIndex.refresh(gameState, anchors);

	let queuedPopulation = 0;
	const locked = [];
	const trainers = [];
	for (const ent of gameState.getOwnTrainingFacilities().values())
	{
		if (ent.foundationProgress() !== undefined)
			continue;
		const queue = ent.trainingQueue() || [];
		for (const item of queue)
			if (item.unitTemplate)
				queuedPopulation += item.count * catalog.population(item.unitTemplate);
		const trainable = catalog.trainable(ent);
		for (const entry of catalog.locked(ent))
			locked.push(Object.freeze(entry));
		if (!trainable.length)
			continue;
		trainers.push(Object.freeze({
			"id": ent.id(),
			"template": ent.templateName(),
			"batchTimeModifier": +(ent.get("Trainer/BatchTimeModifier") || 1),
			"queueLength": queue.length,
			"trainable": Object.freeze(trainable)
		}));
	}

	const workers = [];
	const settlers = [];
	const breakers = [];
	const anchorRegions = new Set(anchors.map(anchor => landRegionNear(accessibility, anchor.position)));
	for (const ent of gameState.getOwnUnits().values())
	{
		const position = ent.position();
		if (position && catalog.isBreaker(ent.templateName()))
		{
			const orders = ent.unitAIOrderData() || [];
			breakers.push(Object.freeze({
				"id": ent.id(),
				"position": position,
				"state": ent.unitAIState() || "",
				"target": orders.length && orders[0] ? orders[0].target : undefined
			}));
		}
		if (!position || !ent.isGatherer() || ent.hasClass("Ship"))
			continue;
		const region = accessibility.getAccessValue(position);
		if (anchorRegions.size && !anchorRegions.has(region))
		{
			settlers.push(Object.freeze({
				"id": ent.id(),
				"position": position,
				"region": region,
				"state": ent.unitAIState() || "",
				"buildable": Object.freeze(catalog.buildable(ent))
			}));
			continue;
		}
		const orders = ent.unitAIOrderData() || [];
		const state = ent.unitAIState() || "";
		const soldier = ent.hasClass("Soldier");
		let gathering = null;
		let kind = null;
		let haul = null;
		let targetPosition = null;
		if (state.includes("RETURNRESOURCE"))
		{
			const carried = ent.resourceCarrying();
			gathering = carried && carried.length ? carried[0].type : null;
		}
		else if (state.includes("GATHER") && orders.length && orders[0] && orders[0].target !== undefined)
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
		workers.push(Object.freeze({
			"id": ent.id(),
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

	const foundations = [];
	for (const ent of gameState.getOwnFoundations().values())
	{
		const built = gameState.getBuiltTemplate(ent.templateName());
		if (!built || !ent.position())
			continue;
		const name = built.templateName();
		foundations.push(Object.freeze({
			"id": ent.id(),
			"template": name,
			"position": ent.position(),
			"progress": ent.foundationProgress(),
			"populationBonus": catalog.populationBonus(name),
			"buildTime": catalog.buildTime(name)
		}));
	}

	const structureCounts = {};
	const docks = [];
	const holders = [];
	const decaying = [];
	let garrisonedSoldiers = 0;
	const researchers = [];
	const footprints = [];
	for (const ent of gameState.getOwnStructures().values())
	{
		if (ent.position())
			footprints.push(Object.freeze({ "position": ent.position(), "classes": ent.classes() }));
		if (ent.foundationProgress() !== undefined)
			continue;
		structureCounts[ent.templateName()] = (structureCounts[ent.templateName()] || 0) + 1;
		if (ent.position() && catalog.isShoreStructure(ent.templateName()))
			docks.push(Object.freeze({ "id": ent.id(), "position": ent.position(), "region": landRegionNear(accessibility, ent.position()) }));
		const holder = ent.isGarrisonHolder();
		if (ent.position() && ent.decaying())
			decaying.push(Object.freeze({
				"id": ent.id(),
				"position": ent.position(),
				"decayRate": ent.territoryDecayRate(),
				"regen": captureRegen(gameState, ent),
				"garrisonRegenRate": ent.garrisonRegenRate(),
				"free": holder ? +(ent.garrisonMax() || 0) - ent.garrisonedSlots() : 0,
				"classes": holder ? ent.garrisonableClasses() || "" : "",
				"arrows": !!ent.get("BuildingAI")
			}));
		if (ent.get("Researcher"))
		{
			const techs = catalog.researchable(ent);
			if (techs.length)
				researchers.push(Object.freeze({
					"id": ent.id(),
					"template": ent.templateName(),
					"queueLength": (ent.trainingQueue() || []).length,
					"trainsWorkers": catalog.trainable(ent).some(name => catalog.isWorker(name)),
					"techs": Object.freeze(techs)
				}));
		}
		const capacity = +(ent.garrisonMax() || 0);
		if (capacity > 0 && ent.position())
		{
			const garrisoned = ent.garrisoned() || [];
			const soldiers = garrisoned.filter(id => {
				const unit = gameState.getEntityById(id);
				return !!unit && unit.hasClass("Soldier");
			});
			const hurt = garrisoned.filter(id => {
				const unit = gameState.getEntityById(id);
				return !!unit && unit.hitpoints() < unit.maxHitpoints();
			});
			garrisonedSoldiers += soldiers.length;
			const reach = ent.get("BuildingAI") && ent.attackRange("Ranged");
			const footprint = catalog.footprint(ent.templateName());
			holders.push(Object.freeze({
				"id": ent.id(),
				"position": ent.position(),
				"radius": Math.max(footprint.width, footprint.depth) / 2,
				"fire": defensiveFire(gameState, ent),
				"range": reach ? +reach.max || 0 : 0,
				"heal": +(ent.get("GarrisonHolder/BuffHeal") || 0),
				"free": capacity - ent.garrisonedSlots(),
				"garrisoned": garrisoned.length,
				"units": Object.freeze(garrisoned.slice()),
				"soldiers": Object.freeze(soldiers),
				"hurt": Object.freeze(hurt),
				"arrows": !!ent.get("BuildingAI"),
				"forward": !!ent.decaying(),
				"classes": ent.garrisonableClasses() || ""
			}));
		}
	}

	const territory = gameState.sharedScript.territoryMap;
	const player = gameState.getPlayerID();
	const threats = [];
	const enemyCentres = [];
	const enemyCritical = [];
	let enemyWarships = 0;
	const enemyStructures = [];
	let enemySoldiers = 0;
	const enemyFighters = [];
	const enemyDamage = {};
	const enemyTemplates = new Map();
	let enemyDamageTotal = 0;
	for (const enemy of gameState.getEnemies())
	{
		if (enemy === 0)
			continue;
		for (const ent of gameState.getEnemyStructures(enemy).values())
		{
			if (!ent.position())
				continue;
			const capturable = ent.foundationProgress() === undefined && !!ent.get("Capturable") &&
				!UNCAPTURABLE_CLASSES.some(cls => ent.hasClass(cls));
			const target = (capturable || ent.hasClass("CivCentre")) && enemyTarget(gameState, catalog, ent, enemy, player);
			if (capturable)
				enemyStructures.push(target);
			if (ent.hasClass("CivCentre"))
				enemyCentres.push(target);
			else if (ent.hasClass(CRITICAL_CLASS) && ent.foundationProgress() === undefined)
				enemyCritical.push(ent);
		}
		for (const ent of gameState.getEnemyUnits(enemy).values())
		{
			if (ent.hasClass("Warship") && ent.position())
				enemyWarships += 1;
			if (ent.hasClass("Soldier"))
			{
				enemySoldiers += 1;
				enemyTemplates.set(ent.templateName(), (enemyTemplates.get(ent.templateName()) || 0) + 1);
				if (ent.position())
				{
					const orders = ent.unitAIOrderData() || [];
					enemyFighters.push(Object.freeze({
						"id": ent.id(),
						"position": ent.position(),
						"template": ent.templateName(),
						"hitpoints": ent.hitpoints(),
						"state": ent.unitAIState() || "",
						"target": orders.length && orders[0] ? orders[0].target : undefined
					}));
				}
				const attacks = catalog.combat(ent.templateName()).attacks;
				for (const type in attacks)
					for (const kind in attacks[type].damage)
					{
						const rate = attacks[type].damage[kind] / attacks[type].repeat;
						enemyDamage[kind] = (enemyDamage[kind] || 0) + rate;
						enemyDamageTotal += rate;
					}
			}
			const position = ent.position();
			if (!position || !THREAT_CLASSES.some(cls => ent.hasClass(cls)) || territoryAt(territory, position[0], position[1]).owner !== player)
				continue;
			threats.push(Object.freeze({ "id": ent.id(), "position": position }));
		}
	}

	const wild = [];
	const armedGaia = gameState.updatingGlobalCollection("strategos-gaia-armed",
		{ "func": ent => ent.hasClass("Unit") && !!ent.get("Attack"), "dynamicProperties": [] }, gameState.getEntities(0));
	for (const ent of armedGaia.values())
	{
		const position = ent.position();
		if (!position)
			continue;
		const state = ent.unitAIState() || "";
		const orders = ent.unitAIOrderData() || [];
		const target = orders.length && orders[0] && orders[0].target !== undefined ? gameState.getEntityById(orders[0].target) : null;
		const attacksUs = state.includes("COMBAT") && !!target && target.owner() === player;
		const trespasses = THREAT_CLASSES.some(cls => ent.hasClass(cls)) && territoryAt(territory, position[0], position[1]).owner === player;
		if (!attacksUs && !trespasses)
			continue;
		wild.push(Object.freeze({
			"id": ent.id(),
			"position": position,
			"template": ent.templateName(),
			"hitpoints": ent.hitpoints(),
			"state": state,
			"target": target ? target.id() : undefined
		}));
	}

	const enemyDamageMix = {};
	for (const kind in enemyDamage)
		enemyDamageMix[kind] = enemyDamage[kind] / enemyDamageTotal;
	if (!enemyDamageTotal)
		Object.assign(enemyDamageMix, DEFAULT_DAMAGE_MIX);

	const fighters = [];
	const heroes = [];
	const regicide = gameState.getVictoryConditions().has("regicide");
	const army = new Map();
	for (const ent of gameState.getOwnEntitiesByClass("Hero", true).values())
		if (ent.position())
			heroes.push(Object.freeze({ "id": ent.id(), "position": ent.position(), "state": ent.unitAIState() || "" }));
	for (const ent of gameState.getOwnEntitiesByClass("Soldier", true).values())
	{
		const position = ent.position();
		if (!position || ent.hasClass("Hero") && regicide)
			continue;
		const orders = ent.unitAIOrderData() || [];
		fighters.push(Object.freeze({
			"id": ent.id(),
			"position": position,
			"region": accessibility.getAccessValue(position),
			"template": ent.templateName(),
			"state": ent.unitAIState() || "",
			"classes": ent.classes(),
			"capture": captureStrength(ent),
			"hitpoints": ent.hitpoints(),
			"maxHitpoints": ent.maxHitpoints(),
			"resistance": catalog.combat(ent.templateName()).resistance,
			"target": orders.length && orders[0] ? orders[0].target : undefined
		}));
		const name = ent.templateName();
		if (!army.has(name))
			army.set(name, { "template": name, "classes": ent.classes(), "count": 0, "value": 0 });
		const group = army.get(name);
		group.count += 1;
		group.value += catalog.costSum(name);
	}

	const centres = [];
	for (const ent of gameState.getOwnEntitiesByClass("CivCentre", true).values())
	{
		if (ent.foundationProgress() !== undefined || !ent.position())
			continue;
		const footprint = catalog.footprint(ent.templateName());
		centres.push(Object.freeze({
			"id": ent.id(),
			"position": ent.position(),
			"angle": ent.angle(),
			"radius": Math.max(footprint.width, footprint.depth) / 2
		}));
	}

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

	const sites = {};
	for (const code of codes)
		sites[code] = resourceIndex.live(gameState, code, anchors, enemyStructures);

	const ships = [];
	for (const ent of gameState.getOwnEntitiesByClass("Ship", true).values())
	{
		const capacity = catalog.transportCapacity(ent.templateName());
		const cargo = ent.garrisoned() || [];
		if (!capacity && !cargo.length || !ent.position())
			continue;
		ships.push(Object.freeze({
			"id": ent.id(),
			"position": ent.position(),
			"template": ent.templateName(),
			"capacity": capacity,
			"cargo": Object.freeze(cargo.slice()),
			"state": ent.unitAIState() || "",
			"idle": ent.isIdle()
		}));
	}
	const relics = [];
	for (const ent of gameState.updatingGlobalCollection("strategos-relics", byClass("Relic")).values())
		if (ent.position())
			relics.push(Object.freeze({
				"id": ent.id(),
				"position": ent.position(),
				"owner": ent.owner(),
				"region": accessibility.getAccessValue(ent.position()),
				"state": ent.unitAIState() || ""
			}));
	const homeRegion = centres.length ? accessibility.getAccessValue(centres[0].position) : 0;
	const seas = accessibility.regionLinks[homeRegion] || [];
	const objectives = enemyCentres.length ? enemyCentres :
		enemyCritical.map(ent => enemyTarget(gameState, catalog, ent, ent.owner(), player));
	let crossing = null;
	if (centres.length && objectives.length && !objectives.some(target => target.region === homeRegion))
	{
		const home = centres[0].position;
		for (const target of objectives)
		{
			const sea = seas.find(candidate => (accessibility.regionLinks[candidate] || []).includes(target.region));
			if (sea === undefined)
				continue;
			const distance = squareDistance(target.position, home);
			if (!crossing || distance < crossing.distance || (distance === crossing.distance && target.id < crossing.target))
				crossing = { "target": target.id, "position": target.position, "region": target.region, "sea": sea, "distance": distance };
		}
	}

	return Object.freeze({
		"time": gameState.getTimeElapsed(),
		"player": player,
		"homeRegion": homeRegion,
		"victory": Object.freeze(Array.from(gameState.getVictoryConditions()).sort()),
		"heroes": Object.freeze(heroes),
		"locked": Object.freeze(locked),
		"relics": Object.freeze(relics.sort((a, b) => a.id - b.id)),
		"crossing": crossing ? Object.freeze(crossing) : null,
		"seas": Object.freeze(seas.slice()),
		"regionLinks": accessibility.regionLinks,
		"regionOf": position => accessibility.getAccessValue(position),
		"regionArea": region => (accessibility.regionSize[region] || 0) * accessibility.cellSize * accessibility.cellSize,
		"settlers": Object.freeze(settlers),
		"docks": Object.freeze(docks.sort((a, b) => (b.region === homeRegion) - (a.region === homeRegion) || a.id - b.id)),
		"enemyWarships": enemyWarships,
		"shores": shoreIndex.all(gameState),
		"ships": Object.freeze(ships.sort((a, b) => a.id - b.id)),
		"treasures": Object.freeze(treasuresWithin(gameState, player, anchors, workers)),
		"phase": gameState.currentPhase(),
		"nextPhaseTech": gameState.getPhaseName(gameState.currentPhase() + 1) || null,
		"nextPhaseCost": techCost(gameState, codes, gameState.getPhaseName(gameState.currentPhase() + 1)),
		"phaseNeeds": Object.freeze(phaseNeeds(gameState, gameState.getPhaseName(gameState.currentPhase() + 1))),
		"civ": catalog.civ,
		"codes": codes,
		"resources": Object.freeze(resources),
		"population": gameState.getPopulation(),
		"populationLimit": gameState.getPopulationLimit(),
		"populationMax": gameState.getPopulationMax(),
		"queuedPopulation": queuedPopulation,
		"populationRoom": Math.max(0, gameState.getPopulationLimit() - gameState.getPopulation() - queuedPopulation),
		"grids": Object.freeze({
			"passability": gameState.getPassabilityMap(),
			"territory": gameState.sharedScript.territoryMap,
			"buildingLand": gameState.getPassabilityClassMask("building-land"),
			"buildingShore": gameState.getPassabilityClassMask("building-shore")
		}),
		"anchors": Object.freeze(anchors),
		"wealth": resourceIndex.grid(gameState),
		"centres": Object.freeze(centres),
		"foundations": Object.freeze(foundations),
		"barter": Object.freeze({ "open": !!playerData.canBarter, "prices": playerData.barterPrices }),
		"enemySoldiers": enemySoldiers,
		"enemyFighters": Object.freeze(enemyFighters),
		"enemyCentres": Object.freeze(enemyCentres),
		"enemyTargets": Object.freeze(objectives),
		"enemyStructures": Object.freeze(enemyStructures),
		"decaying": Object.freeze(decaying),
		"structureCounts": Object.freeze(structureCounts),
		"holders": Object.freeze(holders),
		"footprints": Object.freeze(footprints),
		"garrisonedSoldiers": garrisonedSoldiers,
		"researchers": Object.freeze(researchers),
		"threats": Object.freeze(threats),
		"wild": Object.freeze(wild),
		"fighters": Object.freeze(fighters),
		"breakers": Object.freeze(breakers),
		"army": Object.freeze([...army.values()].sort((a, b) => a.template < b.template ? -1 : 1).map(group => Object.freeze(group))),
		"enemyDamageMix": Object.freeze(enemyDamageMix),
		"enemyArmy": Object.freeze([...enemyTemplates].sort((a, b) => a[0] < b[0] ? -1 : 1)
			.map(([template, count]) => Object.freeze({ template, count }))),
		"pendingConstructions": Object.freeze(pendingConstructions),
		"demand": demand,
		"trainers": Object.freeze(trainers),
		"workers": Object.freeze(workers),
		"gatherers": Object.freeze(gatherers),
		"hauls": Object.freeze(hauls),
		"sites": Object.freeze(sites)
	});
}
