export class Catalog
{
	constructor(gameState)
	{
		this.gameState = gameState;
		this.civ = gameState.getPlayerCiv();
		this.codes = Resources.GetCodes();
		this.templates = new Map();
		this.trainables = new Map();
	}

	template(name)
	{
		if (!this.templates.has(name))
			this.templates.set(name, this.gameState.getTemplate(name));
		return this.templates.get(name);
	}

	trainable(entity)
	{
		const producer = entity.templateName();
		if (!this.trainables.has(producer))
		{
			const names = (entity.trainableEntities(this.civ) || []).filter(name => name && this.template(name));
			this.trainables.set(producer, names);
		}
		return this.trainables.get(producer).filter(name => !this.gameState.isTemplateDisabled(name));
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

	isWorker(name)
	{
		const template = this.template(name);
		return template.hasClass("Worker") && template.isGatherer();
	}

	gatherTypes(template)
	{
		return this.codes.filter(code => template.canGather(code));
	}
}
