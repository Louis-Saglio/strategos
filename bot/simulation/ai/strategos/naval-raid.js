import { RETRY_MS } from "simulation/ai/strategos/cadence.js";
import { squareDistance } from "simulation/ai/strategos/geometry.js";
import { objectiveFrom } from "simulation/ai/strategos/naval-shores.js";
import { attackWalkTo, hold, orderRequest, withStance } from "simulation/ai/strategos/requests.js";

const SUPPORT_RADIUS = 70;
const SUPPORT_VALUE = 100;
const RAID_STANCE = "standground";
const RAID_CLASSES = { "attack": ["Unit"], "avoid": [] };

export class Raid
{
	constructor(catalog, telemetry, commitments)
	{
		this.catalog = catalog;
		this.telemetry = telemetry;
		this.commitments = commitments;
		this.current = null;
	}

	save(context)
	{
		return { "current": this.current && { "shore": context.shoreIndex(this.current.shore), "since": this.current.since } };
	}

	restore(data, context)
	{
		this.current = data.current && { "shore": context.shore(data.current.shore), "since": data.current.since };
	}

	raidTarget(world, plan, sea, region, power)
	{
		const raid = plan.naval.raid;
		const batteries = world.enemyStructures.filter(structure => structure.fire.arrows);
		const prey = world.enemyFighters.filter(enemy => world.regionOf(enemy.position) === region);
		if (prey.length < raid.minPrey)
			return null;
		const landed = world.fighters.filter(fighter => fighter.region === region);
		let best = null;
		let bestCount = raid.minPrey - 1;
		for (const shore of world.shores)
		{
			if (shore.region !== region || shore.sea !== sea)
				continue;
			if (batteries.some(structure => squareDistance(structure.position, shore.water) <=
				(structure.range + raid.clearance) * (structure.range + raid.clearance)))
				continue;
			let count = 0;
			let archers = 0;
			for (const enemy of prey)
				if (squareDistance(enemy.position, shore.water) <= raid.reach * raid.reach)
				{
					count += 1;
					if (this.catalog.combat(enemy.template).ranged)
						archers += 1;
				}
			if (count <= bestCount)
				continue;
			let friends = 0;
			for (const fighter of landed)
				if (squareDistance(fighter.position, shore.water) <= SUPPORT_RADIUS * SUPPORT_RADIUS)
					friends += 1;
			if (archers <= raid.preyPerValue * (power + SUPPORT_VALUE * friends))
			{
				best = shore;
				bestCount = count;
			}
		}
		return best && { "shore": best, "prey": bestCount };
	}

	requests(world, plan, hunting)
	{
		const raid = plan.naval.raid;
		const objective = world.centres.length ? objectiveFrom(world, world.homeRegion, world.home.position) : null;
		if (!objective)
			return [];
		const claimed = new Set();
		for (const request of hunting)
			for (const id of request.claims.units || [])
				claimed.add(id);
		const raiders = world.fleet.filter(ship => ship.warship && !ship.bombard && !ship.cargo.length && ship.sea === objective.sea &&
			!this.commitments.holds(ship.id) && !claimed.has(ship.id) && ship.hitpoints >= raid.hull * ship.maxHitpoints);
		if (raiders.length < raid.minShips)
		{
			this.current = null;
			return [];
		}
		if (!this.current || world.time - this.current.since >= RETRY_MS)
		{
			const power = raiders.reduce((sum, ship) => sum + this.catalog.costSum(ship.template) * ship.hitpoints / ship.maxHitpoints, 0);
			const found = this.raidTarget(world, plan, objective.sea, objective.region, power);
			if (found && (!this.current || this.current.shore !== found.shore))
				this.telemetry.line("NAVAL", world.time, {
					"raid": found.shore.water.map(Math.round), "ships": raiders.length, "prey": found.prey
				});
			this.current = found ? { "shore": found.shore, "since": world.time } : null;
		}
		if (!this.current)
			return [];
		const point = this.current.shore.water;
		const near = raid.reach * raid.reach;
		return raiders.map(ship => orderRequest("naval", "raid", ship.id,
			withStance(squareDistance(ship.position, point) <= near || !ship.idle ? hold() : attackWalkTo(point[0], point[1], RAID_CLASSES), RAID_STANCE),
			plan.values.ferry, 1));
	}
}
