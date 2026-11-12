const SITE_RADIUS = 110;
const SITES_KEPT = 48;
const SITES_EXPOSED = 16;

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
		if (points.length)
		{
			const limit = SITE_RADIUS * SITE_RADIUS;
			for (const ent of gameState.getResourceSupplies(code).values())
			{
				const owner = ent.owner();
				if (owner !== 0 && owner !== this.player)
					continue;
				const position = ent.position();
				if (!position)
					continue;
				let best = Infinity;
				for (const point of points)
					best = Math.min(best, squareDistance(point, position));
				if (best <= limit)
					kept.push({ "id": ent.id(), "distance": best });
			}
		}
		kept.sort((a, b) => a.distance - b.distance || a.id - b.id);
		this.sites.set(code, kept.slice(0, SITES_KEPT).map(site => site.id));
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
			sites.push(Object.freeze({
				"id": id,
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
		trainers.push(Object.freeze({
			"id": ent.id(),
			"queueLength": queue.length,
			"trainable": Object.freeze(catalog.trainable(ent))
		}));
	}

	const workers = [];
	for (const ent of gameState.getOwnEntitiesByClass("Worker", true).values())
	{
		const position = ent.position();
		if (!position || !ent.isGatherer())
			continue;
		const orders = ent.unitAIOrderData() || [];
		const state = ent.unitAIState() || "";
		let gathering = null;
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
		}
		workers.push(Object.freeze({
			"id": ent.id(),
			"position": position,
			"idle": ent.isIdle(),
			"state": state,
			"gathering": gathering,
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
	for (const ent of gameState.getOwnStructures().values())
		if (ent.foundationProgress() === undefined)
			structureCounts[ent.templateName()] = (structureCounts[ent.templateName()] || 0) + 1;

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
		"centres": Object.freeze(centres),
		"foundations": Object.freeze(foundations),
		"structureCounts": Object.freeze(structureCounts),
		"pendingConstructions": Object.freeze(pendingConstructions),
		"demand": demand,
		"trainers": Object.freeze(trainers),
		"workers": Object.freeze(workers),
		"gatherers": Object.freeze(gatherers),
		"sites": Object.freeze(sites)
	});
}
