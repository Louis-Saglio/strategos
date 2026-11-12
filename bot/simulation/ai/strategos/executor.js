export class Executor
{
	constructor(gameState, civ)
	{
		this.gameState = gameState;
		this.civ = civ;
		this.handlers = {
			"train": action => this.train(action),
			"gather": action => this.gather(action)
		};
	}

	execute(grants)
	{
		let issued = 0;
		for (const grant of grants)
			if (this.handlers[grant.action.type](grant.action))
				issued += 1;
		return issued;
	}

	train(action)
	{
		const trainer = this.gameState.getEntityById(action.trainer);
		if (!trainer)
			return false;
		trainer.train(this.civ, action.template, action.count, { "source": "economy" });
		return true;
	}

	gather(action)
	{
		const worker = this.gameState.getEntityById(action.worker);
		const target = this.gameState.getEntityById(action.target);
		if (!worker || !target)
			return false;
		worker.gather(target);
		return true;
	}
}
