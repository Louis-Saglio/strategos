const SITE_RADIUS = 110;
const SITES_KEPT = 48;
const SITES_EXPOSED = 16;
const WEALTH_CELL = 40;

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
		const points = anchors.filter(anchor => anchor.types.includes(code)).map(anchor => anchor.position);
		const kept = [];
		const grid = this.grid(gameState);
		const totals = new Float64Array(grid.width * grid.height);
		const limit = SITE_RADIUS * SITE_RADIUS;
		for (const ent of gameState.getResourceSupplies(code).values())
		{
			const owner = ent.owner();
			if (owner !== 0 && owner !== this.player)
				continue;
			const position = ent.position();
			if (!position)
				continue;
			const amount = ent.resourceSupplyAmount();
			if (owner === 0 && isFinite(amount) && amount > 0)
			{
				const i = Math.min(grid.width - 1, Math.max(0, Math.floor(position[0] / grid.cellSize)));
				const j = Math.min(grid.height - 1, Math.max(0, Math.floor(position[1] / grid.cellSize)));
				totals[i + j * grid.width] += amount;
			}
			if (!points.length)
				continue;
			let best = Infinity;
			for (const point of points)
				best = Math.min(best, squareDistance(point, position));
			if (best <= limit)
				kept.push({ "id": ent.id(), "distance": best });
		}
		grid.totals[code] = totals;
		kept.sort((a, b) => a.distance - b.distance || a.id - b.id);
		this.sites.set(code, kept.slice(0, SITES_KEPT).map(site => site.id));
	}

	grid(gameState)
	{
		if (!this.wealth)
		{
			const territory = gameState.sharedScript.territoryMap;
			const size = territory.width * territory.cellSize;
			const cells = Math.ceil(size / WEALTH_CELL);
			this.wealth = { "cellSize": WEALTH_CELL, "width": cells, "height": cells, "totals": {} };
		}
		return this.wealth;
	}

	live(gameState, code, anchors)
	{
		const points = anchors.filter(anchor => anchor.types.includes(code)).map(anchor => anchor.position);
		const sites = [];
		for (const id of this.sites.get(code))
		{
			const ent = gameState.getEntityById(id);
			const amount = ent && ent.resourceSupplyAmount();
			if (!ent || !ent.position() || !(amount > 0))
				continue;
			const position = ent.position();
			let nearest = Infinity;
			for (const point of points)
				nearest = Math.min(nearest, squareDistance(point, position));
			const type = ent.resourceSupplyType();
			sites.push(Object.freeze({
				"id": id,
				"kind": type.generic + "." + type.specific,
				"position": position,
				"amount": amount,
				"gatherers": ent.resourceSupplyNumGatherers() || 0,
				"capacity": ent.maxGatherers() || 1,
				"anchorDistance": Math.sqrt(nearest)
			}));
			if (sites.length >= SITES_EXPOSED)
				break;
		}
		return Object.freeze(sites);
	}
}

const TERRITORY_OWNER_MASK = 0x1F;
const TERRITORY_BLINKING_MASK = 0x40;
const THREAT_CLASSES = ["Soldier", "Siege", "Hero"];
const DEFAULT_DAMAGE_MIX = { "Hack": 0.5, "Pierce": 0.5 };

export function territoryAt(territory, x, z)
{
	const i = Math.floor(x / territory.cellSize);
	const j = Math.floor(z / territory.cellSize);
	if (i < 0 || j < 0 || i >= territory.width || j >= territory.height)
		return { "owner": -1, "connected": false };
	const cell = territory.data[i + j * territory.width];
	return { "owner": cell & TERRITORY_OWNER_MASK, "connected": (cell & TERRITORY_BLINKING_MASK) === 0 };
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

export function captureStrength(ent)
{
	return +(ent.get("Attack/Capture/Capture") || 0);
}

export function squareDistance(a, b)
{
	const dx = a[0] - b[0];
	const dz = a[1] - b[1];
	return dx * dx + dz * dz;
}

export function buildWorld(gameState, catalog, resourceIndex, pendingConstructions, demand)
{
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
		if (!trainable.length)
			continue;
		trainers.push(Object.freeze({
			"id": ent.id(),
			"queueLength": queue.length,
			"trainable": Object.freeze(trainable)
		}));
	}

	const workers = [];
	for (const ent of gameState.getOwnUnits().values())
	{
		const position = ent.position();
		if (!position || !ent.isGatherer() || ent.hasClass("Ship"))
			continue;
		const orders = ent.unitAIOrderData() || [];
		const state = ent.unitAIState() || "";
		const soldier = ent.hasClass("Soldier");
		let gathering = null;
		let kind = null;
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
		}
		workers.push(Object.freeze({
			"id": ent.id(),
			"position": position,
			"idle": ent.isIdle(),
			"state": state,
			"soldier": soldier,
			"classes": ent.classes(),
			"gathering": gathering,
			"kind": kind,
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
	const holders = [];
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
			garrisonedSoldiers += soldiers.length;
			holders.push(Object.freeze({
				"id": ent.id(),
				"position": ent.position(),
				"free": capacity - ent.garrisonedSlots(),
				"garrisoned": garrisoned.length,
				"units": Object.freeze(garrisoned.slice()),
				"soldiers": Object.freeze(soldiers),
				"arrows": !!ent.get("BuildingAI"),
				"classes": ent.garrisonableClasses() || ""
			}));
		}
	}

	const territory = gameState.sharedScript.territoryMap;
	const player = gameState.getPlayerID();
	const threats = [];
	const enemyCentres = [];
	let enemySoldiers = 0;
	const enemyFighters = [];
	const enemyDamage = {};
	let enemyDamageTotal = 0;
	for (const enemy of gameState.getEnemies())
	{
		if (enemy === 0)
			continue;
		for (const ent of gameState.getEnemyStructures(enemy).values())
			if (ent.hasClass("CivCentre") && ent.position())
				enemyCentres.push(Object.freeze({
					"id": ent.id(),
					"owner": enemy,
					"position": ent.position(),
					"regen": captureRegen(gameState, ent)
				}));
		for (const ent of gameState.getEnemyUnits(enemy).values())
		{
			if (ent.hasClass("Soldier"))
			{
				enemySoldiers += 1;
				if (ent.position())
					enemyFighters.push(Object.freeze({ "id": ent.id(), "position": ent.position() }));
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

	const enemyDamageMix = {};
	for (const kind in enemyDamage)
		enemyDamageMix[kind] = enemyDamage[kind] / enemyDamageTotal;
	if (!enemyDamageTotal)
		Object.assign(enemyDamageMix, DEFAULT_DAMAGE_MIX);

	const fighters = [];
	const army = new Map();
	for (const ent of gameState.getOwnEntitiesByClass("Soldier", true).values())
	{
		const position = ent.position();
		if (!position)
			continue;
		const orders = ent.unitAIOrderData() || [];
		fighters.push(Object.freeze({
			"id": ent.id(),
			"position": position,
			"state": ent.unitAIState() || "",
			"classes": ent.classes(),
			"capture": captureStrength(ent),
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
			"radius": Math.max(footprint.width, footprint.depth) / 2
		}));
	}

	const gatherers = {};
	for (const code of codes)
		gatherers[code] = 0;
	for (const worker of workers)
		if (worker.gathering && gatherers[worker.gathering] !== undefined)
			gatherers[worker.gathering] += 1;

	const sites = {};
	for (const code of codes)
		sites[code] = resourceIndex.live(gameState, code, anchors);

	return Object.freeze({
		"time": gameState.getTimeElapsed(),
		"phase": gameState.currentPhase(),
		"nextPhaseTech": gameState.getPhaseName(gameState.currentPhase() + 1) || null,
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
			"buildingLand": gameState.getPassabilityClassMask("building-land")
		}),
		"anchors": Object.freeze(anchors),
		"wealth": resourceIndex.grid(gameState),
		"centres": Object.freeze(centres),
		"foundations": Object.freeze(foundations),
		"enemySoldiers": enemySoldiers,
		"enemyFighters": Object.freeze(enemyFighters),
		"enemyCentres": Object.freeze(enemyCentres),
		"structureCounts": Object.freeze(structureCounts),
		"holders": Object.freeze(holders),
		"footprints": Object.freeze(footprints),
		"garrisonedSoldiers": garrisonedSoldiers,
		"researchers": Object.freeze(researchers),
		"threats": Object.freeze(threats),
		"fighters": Object.freeze(fighters),
		"army": Object.freeze([...army.values()].sort((a, b) => a.template < b.template ? -1 : 1).map(group => Object.freeze(group))),
		"enemyDamageMix": Object.freeze(enemyDamageMix),
		"pendingConstructions": Object.freeze(pendingConstructions),
		"demand": demand,
		"trainers": Object.freeze(trainers),
		"workers": Object.freeze(workers),
		"gatherers": Object.freeze(gatherers),
		"sites": Object.freeze(sites)
	});
}
