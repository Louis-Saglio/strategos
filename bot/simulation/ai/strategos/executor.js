const CONSTRUCT_CONFIRM_MS = 3000;
const CONSTRUCT_MATCH_DISTANCE = 1.5;

export class Executor
{
	constructor(gameState, civ, telemetry)
	{
		this.gameState = gameState;
		this.player = gameState.getPlayerID();
		this.civ = civ;
		this.telemetry = telemetry;
		this.issued = [];
		this.time = 0;
		this.handlers = {
			"train": action => this.train(action),
			"gather": action => this.gather(action),
			"construct": action => this.construct(action),
			"repair": action => this.repair(action)
		};
	}

	reconcile(time)
	{
		if (!this.issued.length)
			return [];
		const foundations = this.gameState.getOwnFoundations().toEntityArray();
		const pending = [];
		for (const order of this.issued)
		{
			const placed = foundations.find(ent => ent.templateName() === "foundation|" + order.template &&
				ent.position() && Math.abs(ent.position()[0] - order.x) < CONSTRUCT_MATCH_DISTANCE &&
				Math.abs(ent.position()[1] - order.z) < CONSTRUCT_MATCH_DISTANCE);
			if (placed)
				this.telemetry.line("BUILD", time, {
					"placed": order.template, "id": placed.id(), "x": Math.round(order.x), "z": Math.round(order.z)
				});
			else if (time - order.issuedAt > CONSTRUCT_CONFIRM_MS)
				this.telemetry.line("BUILD", time, {
					"rejected": order.template, "x": Math.round(order.x), "z": Math.round(order.z)
				});
			else
				pending.push(order);
		}
		this.issued = pending;
		return pending.map(order => Object.freeze(Object.assign({}, order)));
	}

	execute(world, grants)
	{
		this.time = world.time;
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

	construct(action)
	{
		Engine.PostCommand(this.player, {
			"type": "construct",
			"entities": action.builders,
			"template": action.template,
			"x": action.x,
			"z": action.z,
			"angle": action.angle,
			"autorepair": true,
			"autocontinue": true,
			"queued": false
		});
		this.issued.push({ "template": action.template, "x": action.x, "z": action.z, "issuedAt": this.time });
		return true;
	}

	repair(action)
	{
		if (!this.gameState.getEntityById(action.worker) || !this.gameState.getEntityById(action.target))
			return false;
		Engine.PostCommand(this.player, {
			"type": "repair",
			"entities": [action.worker],
			"target": action.target,
			"autocontinue": true,
			"queued": false
		});
		return true;
	}
}
