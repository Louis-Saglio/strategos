const CONSTRUCT_CONFIRM_MS = 3000;
const CONSTRUCT_MATCH_DISTANCE = 1.5;
const BARTER_REPORT_MS = 30000;

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
			"repair": action => this.repair(action),
			"attack": action => this.unitCommand(action, { "type": "attack", "target": action.target, "allowCapture": false }),
			"capture": action => this.unitCommand(action, { "type": "attack", "target": action.target, "allowCapture": true }),
			"garrison": action => this.unitCommand(action, { "type": "garrison", "target": action.target }),
			"delete": action => this.deleteStructure(action),
			"unload-all": action => this.unloadAll(action),
			"unload": action => this.unload(action),
			"walk": action => this.walk(action),
			"hold": () => false,
			"attack-walk": action => this.attackWalk(action),
			"research": action => this.research(action),
			"barter": action => this.barter(action)
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

	unitCommand(action, command)
	{
		if (!this.gameState.getEntityById(action.unit) || !this.gameState.getEntityById(action.target))
			return false;
		Engine.PostCommand(this.player, Object.assign({ "entities": [action.unit], "queued": false }, command));
		return true;
	}

	research(action)
	{
		if (!this.gameState.getEntityById(action.researcher))
			return false;
		Engine.PostCommand(this.player, { "type": "research", "entity": action.researcher, "template": action.tech, "pushFront": false });
		this.telemetry.line("TECH", this.time, { "research": action.tech, "payback": action.payback });
		return true;
	}

	barter(action)
	{
		Engine.PostCommand(this.player, { "type": "barter", "sell": action.sell, "buy": action.buy, "amount": action.amount });
		if (this.telemetry.due("TRADE", this.time, BARTER_REPORT_MS))
			this.telemetry.line("TRADE", this.time, { "sell": action.sell, "buy": action.buy, "rate": Math.round(action.rate * 100) / 100 });
		return true;
	}

	deleteStructure(action)
	{
		if (!this.gameState.getEntityById(action.target))
			return false;
		Engine.PostCommand(this.player, { "type": "delete-entities", "entities": [action.target] });
		return true;
	}

	attackWalk(action)
	{
		if (!this.gameState.getEntityById(action.unit))
			return false;
		Engine.PostCommand(this.player, {
			"type": "attack-walk",
			"entities": [action.unit],
			"x": action.x,
			"z": action.z,
			"targetClasses": action.targetClasses,
			"allowCapture": true,
			"queued": false
		});
		return true;
	}

	walk(action)
	{
		if (!this.gameState.getEntityById(action.unit))
			return false;
		Engine.PostCommand(this.player, { "type": "walk", "entities": [action.unit], "x": action.x, "z": action.z, "queued": false });
		return true;
	}

	unloadAll(action)
	{
		if (!this.gameState.getEntityById(action.holder))
			return false;
		Engine.PostCommand(this.player, { "type": "unload-all", "garrisonHolders": [action.holder] });
		return true;
	}

	unload(action)
	{
		if (!this.gameState.getEntityById(action.holder))
			return false;
		Engine.PostCommand(this.player, { "type": "unload", "garrisonHolder": action.holder, "entities": action.units });
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
