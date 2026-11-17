import { centroid, firstListed, nearest, squareDistance } from "simulation/ai/strategos/geometry.js";
import { noting, orderRequest, trainRequest, walkTo } from "simulation/ai/strategos/requests.js";
import { territoryAt } from "simulation/ai/strategos/terrain.js";

const SAFE_RADIUS = 35;
const FLEE_RADIUS = 22;
const REACH = 9;
const FIELD_ARMY = 10;
const HOME_CLEARANCE = 14;

export class Medics
{
	constructor(catalog, telemetry)
	{
		this.catalog = catalog;
		this.telemetry = telemetry;
		this.trained = 0;
	}

	requests(world, priorities)
	{
		const plan = priorities.medics;
		const wounded = world.fighters.filter(fighter => fighter.hitpoints < fighter.maxHitpoints);
		return this.trainRequests(world, priorities, plan, wounded).concat(this.followRequests(world, priorities, wounded));
	}

	trainRequests(world, priorities, plan, wounded)
	{
		const missing = wounded.reduce((sum, fighter) => sum + fighter.maxHitpoints - fighter.hitpoints, 0);
		const wanted = Math.min(plan.max, Math.floor(world.fighters.length / plan.soldiersPerHealer), Math.floor(missing / plan.woundsPerHealer));
		if (world.healers.length >= wanted)
			return [];
		for (const trainer of world.trainers)
		{
			if (trainer.queueLength > 0)
				continue;
			const template = trainer.trainable.filter(name => this.catalog.isHealer(name))
				.sort((a, b) => this.catalog.costSum(a) - this.catalog.costSum(b) || (a < b ? -1 : 1))[0];
			if (!template)
				continue;
			return [noting(trainRequest("medics", "healer", trainer.id, template, 1, this.catalog.cost(template), this.catalog.population(template),
				priorities.values.support, 1), { "train": template, "wounds": Math.round(missing), "soldiers": world.fighters.length })];
		}
		return [];
	}

	settle(world, outcomes)
	{
		for (const { request, issued } of outcomes)
		{
			if (!issued || request.purpose !== "healer")
				continue;
			if (!this.trained)
				this.telemetry.line("MEDIC", world.time, request.note);
			this.trained += 1;
		}
	}

	followRequests(world, priorities, wounded)
	{
		if (!world.healers.length)
			return [];
		const home = world.centres[0];
		const safe = SAFE_RADIUS * SAFE_RADIUS;
		const calm = wounded.filter(fighter => !world.enemyFighters.some(enemy => squareDistance(enemy.position, fighter.position) <= safe));
		const abroad = world.fighters.filter(fighter =>
			territoryAt(world.grids.territory, fighter.position[0], fighter.position[1]).owner !== world.player);
		let post = home ? [home.position[0], home.position[1] + home.radius + HOME_CLEARANCE] : null;
		const front = abroad.length >= FIELD_ARMY ? nearest(abroad, centroid(abroad), firstListed).item : null;
		if (front)
			post = front.position;
		const requests = [];
		for (const healer of world.healers)
		{
			if (healer.state.healing)
				continue;
			const danger = world.enemyFighters.some(enemy => squareDistance(enemy.position, healer.position) <= FLEE_RADIUS * FLEE_RADIUS);
			let goal = post;
			if (danger)
				goal = home ? home.position : null;
			else
			{
				const patient = nearest(calm, healer.position, firstListed, fighter => fighter.region === healer.region).item;
				if (patient)
					goal = patient.position;
			}
			if (!goal || squareDistance(goal, healer.position) <= REACH * REACH || healer.state.walking)
				continue;
			requests.push(orderRequest("medics", "follow", healer.id, walkTo(goal[0], goal[1]), priorities.values.support, 1));
		}
		return requests;
	}
}
