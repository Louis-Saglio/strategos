export class Catalog
{
	constructor(gameState)
	{
		this.gameState = gameState;
		this.civ = gameState.getPlayerCiv();
		this.codes = Resources.GetCodes();
		this.templates = new Map();
		this.trainables = new Map();
		this.buildables = new Map();
		this.footprints = new Map();
		this.availability = new Map();
		this.availabilityTime = undefined;
	}

	available(name)
	{
		const time = this.gameState.getTimeElapsed();
		if (time !== this.availabilityTime)
		{
			this.availability.clear();
			this.availabilityTime = time;
		}
		if (!this.availability.has(name))
			this.availability.set(name, !this.gameState.isTemplateDisabled(name) && this.template(name).available(this.gameState));
		return this.availability.get(name);
	}

	template(name)
	{
		if (!this.templates.has(name))
			this.templates.set(name, this.gameState.getTemplate(name));
		return this.templates.get(name);
	}

	producerList(cache, entity, list)
	{
		const producer = entity.templateName();
		if (!cache.has(producer))
			cache.set(producer, (list.call(entity, this.civ) || []).filter(name => name && this.template(name)));
		return cache.get(producer).filter(name => this.available(name));
	}

	trainable(entity)
	{
		return this.producerList(this.trainables, entity, entity.trainableEntities);
	}

	buildable(entity)
	{
		return this.producerList(this.buildables, entity, entity.buildableEntities);
	}

	cost(name)
	{
		const raw = this.template(name).cost();
		const cost = {};
		for (const code of this.codes)
			cost[code] = raw[code] || 0;
		return cost;
	}

	costSum(name)
	{
		const cost = this.cost(name);
		return this.codes.reduce((sum, code) => sum + cost[code], 0);
	}

	population(name)
	{
		return +(this.template(name).get("Cost/Population") || 0);
	}

	populationBonus(name)
	{
		return this.template(name).getPopulationBonus();
	}

	buildTime(name)
	{
		return this.template(name).buildTime() || 0;
	}

	isWorker(name)
	{
		const template = this.template(name);
		return template.hasClass("Worker") && template.isGatherer();
	}

	gatherTypes(template)
	{
		return this.codes.filter(code => template.canGather(code));
	}

	footprint(name)
	{
		if (!this.footprints.has(name))
		{
			const template = this.template(name);
			let width = 0;
			let depth = 0;
			if (template.get("Obstruction/Static"))
			{
				width = +template.get("Obstruction/Static/@width");
				depth = +template.get("Obstruction/Static/@depth");
			}
			else if (template.get("Footprint/Square"))
			{
				width = +template.get("Footprint/Square/@width");
				depth = +template.get("Footprint/Square/@depth");
			}
			else if (template.get("Footprint/Circle"))
				width = depth = 2 * +template.get("Footprint/Circle/@radius");
			this.footprints.set(name, Object.freeze({ "width": width, "depth": depth }));
		}
		return this.footprints.get(name);
	}

	trainsWorkers(name)
	{
		const trainable = this.template(name).trainableEntities(this.civ) || [];
		return trainable.some(unit => unit && this.template(unit) && this.available(unit) && this.isWorker(unit));
	}

	maxGatherers(name)
	{
		return this.template(name).maxGatherers();
	}

	isFarm(name)
	{
		const template = this.template(name);
		const type = template.resourceSupplyType();
		return !!type && type.generic === "food" && template.resourceSupplyMax() === Infinity && template.hasClass("Structure");
	}

	dropsiteTypes(name)
	{
		return this.template(name).resourceDropsiteTypes() || [];
	}

	isPlaceableOnLand(name)
	{
		const template = this.template(name);
		const placement = template.buildPlacementType() || "land";
		return placement === "land" && !!template.hasBuildTerritory("own") && !template.buildDistance();
	}
}
