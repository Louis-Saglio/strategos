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

	live(gameState, code)
	{
		const sites = [];
		for (const id of this.sites.get(code))
		{
			const ent = gameState.getEntityById(id);
			if (!ent || !ent.position() || !(ent.resourceSupplyAmount() > 0))
				continue;
			sites.push(Object.freeze({
				"id": id,
				"position": ent.position(),
				"gatherers": ent.resourceSupplyNumGatherers() || 0,
				"capacity": ent.maxGatherers() || 1
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

export function buildWorld(gameState, catalog, resourceIndex)
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
		anchors.push(Object.freeze({ "id": ent.id(), "position": ent.position(), "types": ent.resourceDropsiteTypes() }));
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
		workers.push(Object.freeze({
			"id": ent.id(),
			"position": position,
			"idle": ent.isIdle(),
			"gatherTypes": Object.freeze(catalog.gatherTypes(ent))
		}));
	}

	const gatherers = {};
	for (const code of codes)
		gatherers[code] = (playerData.resourceGatherers && playerData.resourceGatherers[code]) || 0;

	const sites = {};
	for (const code of codes)
		sites[code] = resourceIndex.live(gameState, code);

	return Object.freeze({
		"time": gameState.getTimeElapsed(),
		"civ": catalog.civ,
		"codes": codes,
		"resources": Object.freeze(resources),
		"population": gameState.getPopulation(),
		"populationLimit": gameState.getPopulationLimit(),
		"populationRoom": Math.max(0, gameState.getPopulationLimit() - gameState.getPopulation() - queuedPopulation),
		"anchors": Object.freeze(anchors),
		"trainers": Object.freeze(trainers),
		"workers": Object.freeze(workers),
		"gatherers": Object.freeze(gatherers),
		"sites": Object.freeze(sites)
	});
}
