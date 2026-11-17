import { orderRequest, trainRequest, walkTo } from "simulation/ai/strategos/requests.js";
import { squareDistance, territoryAt } from "simulation/ai/strategos/world.js";

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
			if (!this.trained)
				this.telemetry.line("MEDIC", world.time, { "train": template, "wounds": Math.round(missing), "soldiers": world.fighters.length });
			this.trained += 1;
			return [trainRequest("medics", "healer", trainer.id, template, 1, this.catalog.cost(template), this.catalog.population(template),
				priorities.values.support, 1)];
		}
		return [];
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
		if (abroad.length >= FIELD_ARMY)
		{
			const centre = [0, 0];
			for (const fighter of abroad)
			{
				centre[0] += fighter.position[0] / abroad.length;
				centre[1] += fighter.position[1] / abroad.length;
			}
			let nearest = Infinity;
			for (const fighter of abroad)
			{
				const distance = squareDistance(fighter.position, centre);
				if (distance < nearest)
				{
					nearest = distance;
					post = fighter.position;
				}
			}
		}
		const requests = [];
		for (const healer of world.healers)
		{
			if (healer.state.includes("HEAL"))
				continue;
			const danger = world.enemyFighters.some(enemy => squareDistance(enemy.position, healer.position) <= FLEE_RADIUS * FLEE_RADIUS);
			let goal = post;
			if (danger)
				goal = home ? home.position : null;
			else
			{
				let nearest = Infinity;
				for (const fighter of calm)
				{
					const distance = squareDistance(fighter.position, healer.position);
					if (fighter.region === healer.region && distance < nearest)
					{
						nearest = distance;
						goal = fighter.position;
					}
				}
			}
			if (!goal || squareDistance(goal, healer.position) <= REACH * REACH || healer.state.includes("WALKING"))
				continue;
			requests.push(orderRequest("medics", "follow", healer.id, walkTo(goal[0], goal[1]), priorities.values.support, 1));
		}
		return requests;
	}
}
