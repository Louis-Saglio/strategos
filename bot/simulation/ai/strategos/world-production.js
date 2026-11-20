function trainingSites(gameState, catalog)
{
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
			"position": ent.position(),
			"batchTimeModifier": +(ent.get("Trainer/BatchTimeModifier") || 1),
			"queueLength": queue.length,
			"training": Object.freeze(queue.map(item => item.unitTemplate).filter(name => !!name)),
			"trainable": Object.freeze(trainable)
		}));
	}
	return { queuedPopulation, locked, trainers };
}

function buildingSites(gameState, catalog)
{
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
			"angle": ent.angle() || 0,
			"progress": ent.foundationProgress(),
			"populationBonus": catalog.populationBonus(name),
			"buildTime": catalog.buildTime(name)
		}));
	}
	return foundations;
}

function standingStructures(gameState, catalog)
{
	const structureCounts = {};
	const damaged = [];
	const researchers = [];
	for (const ent of gameState.getOwnStructures().values())
	{
		if (ent.foundationProgress() !== undefined)
			continue;
		structureCounts[ent.templateName()] = (structureCounts[ent.templateName()] || 0) + 1;
		if (ent.position() && ent.needsRepair())
			damaged.push(Object.freeze({
				"id": ent.id(),
				"template": ent.templateName(),
				"position": ent.position(),
				"missing": 1 - ent.healthLevel(),
				"value": catalog.costSum(ent.templateName())
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
	}
	return { structureCounts, damaged, researchers };
}

function structureFootprints(gameState)
{
	const footprints = [];
	for (const ent of gameState.getOwnStructures().values())
		if (ent.position())
			footprints.push(Object.freeze({ "position": ent.position(), "classes": ent.classes() }));
	return footprints;
}

function civicCentres(gameState, catalog)
{
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
	return centres;
}

function unitRoster(gameState, catalog)
{
	const roster = new Map();
	for (const ent of gameState.getOwnUnits().values())
	{
		const unitName = ent.templateName();
		if (!roster.has(unitName))
			roster.set(unitName, { "template": unitName, "classes": ent.classes(), "count": 0, "value": 0, "soldier": ent.hasClass("Soldier"),
				"military": ent.hasClass("Soldier") || ent.hasClass("Siege") || ent.hasClass("Warship"), "structure": false,
				"healer": catalog.isHealer(unitName), "trader": catalog.isTrader(unitName) });
		const listed = roster.get(unitName);
		listed.count += 1;
		listed.value += catalog.costSum(unitName);
	}
	return [...roster.values()].sort((a, b) => a.template < b.template ? -1 : 1).map(group => Object.freeze(group));
}

function structureEstate(catalog, structureCounts)
{
	return Object.keys(structureCounts).sort().map(name => Object.freeze({
		"template": name, "classes": catalog.template(name).classes(), "count": structureCounts[name],
		"value": structureCounts[name] * catalog.costSum(name), "soldier": false, "military": false, "structure": true
	}));
}

function upgradableEntities(gameState, catalog)
{
	const upgradable = [];
	for (const ent of gameState.updatingCollection("strategos-upgradable",
		{ "func": candidate => !!candidate.get("Upgrade"), "dynamicProperties": [] }, gameState.getOwnEntities()).values())
	{
		if (ent.foundationProgress() !== undefined || !ent.position())
			continue;
		const options = catalog.upgrades(ent.templateName());
		if (options.length)
			upgradable.push(Object.freeze({ "id": ent.id(), "template": ent.templateName(), "unit": ent.hasClass("Unit"), "options": options }));
	}
	return upgradable.sort((a, b) => a.id - b.id);
}

export function productionSection(gameState, catalog)
{
	const training = trainingSites(gameState, catalog);
	const standing = standingStructures(gameState, catalog);
	return {
		"now": {
			"trainers": Object.freeze(training.trainers),
			"locked": Object.freeze(training.locked),
			"queuedPopulation": training.queuedPopulation,
			"populationRoom": Math.max(0, gameState.getPopulationLimit() - gameState.getPopulation() - training.queuedPopulation),
			"researchers": Object.freeze(standing.researchers),
			"foundations": Object.freeze(buildingSites(gameState, catalog)),
			"structureCounts": Object.freeze(standing.structureCounts),
			"damaged": Object.freeze(standing.damaged),
			"centres": Object.freeze(civicCentres(gameState, catalog)),
			"roster": Object.freeze(unitRoster(gameState, catalog)),
			"estate": Object.freeze(structureEstate(catalog, standing.structureCounts)),
			"upgradable": Object.freeze(upgradableEntities(gameState, catalog))
		},
		"later": {
			"footprints": () => Object.freeze(structureFootprints(gameState))
		}
	};
}
