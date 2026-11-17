import { awayFrom, firstListed, nearest, squareDistance } from "simulation/ai/strategos/geometry.js";
import { gatherRequest, hold, inTier, orderRequest, trainRequest, walkTo } from "simulation/ai/strategos/requests.js";

export class Fishing
{
	constructor(catalog)
	{
		this.catalog = catalog;
	}

	requests(world, priorities)
	{
		if (!world.fish.length)
			return [];
		const plan = priorities.naval.fishing;
		const clearance = priorities.naval.fishClearance;
		const requests = [];
		const boats = world.fleet.filter(ship => ship.fishing);
		const foes = world.enemyFighters.concat(world.enemyShips.filter(enemy => enemy.warship));
		const hostile = position => foes.some(enemy =>
			squareDistance(enemy.position, position) <= clearance.soldier * clearance.soldier);
		const waters = world.fish.filter(fish =>
			!world.batteries.some(structure => squareDistance(structure.position, fish.position) <=
				(structure.range + clearance.battery) * (structure.range + clearance.battery)) &&
			!world.enemyStructures.some(structure => squareDistance(structure.position, fish.position) <= clearance.structure * clearance.structure) &&
			!hostile(fish.position));
		const slots = waters.reduce((sum, fish) => sum + Math.min(fish.capacity, plan.perFish), 0);
		const fishes = name => this.catalog.isFishingBoat(name);
		const dead = new Set(world.docks.filter(dock => dock.blocked).map(dock => dock.id));
		const yards = world.trainers.filter(trainer => !dead.has(trainer.id) && trainer.trainable.some(fishes));
		const building = yards.filter(trainer => trainer.queueLength > 0).length;
		const yard = yards.find(trainer => trainer.queueLength === 0);
		if (yard && boats.length + building < Math.min(plan.maxBoats, slots))
		{
			const template = yard.trainable.filter(fishes)
				.sort((a, b) => this.catalog.costSum(a) - this.catalog.costSum(b) || (a < b ? -1 : 1))[0];
			requests.push(inTier(trainRequest("naval", "fishing-boat", yard.id, template, 1, this.catalog.cost(template),
				this.catalog.population(template), priorities.values.fishing, 1), "production"));
		}
		const reserved = new Map();
		for (const boat of boats)
		{
			if (hostile(boat.position))
			{
				const foe = nearest(foes, boat.position, firstListed).item;
				const away = awayFrom(boat.position, foe.position, clearance.flight);
				if (world.openWater(away, boat.sea, clearance.berth))
					requests.push(orderRequest("naval", "flee", boat.id, boat.state.walking ? hold() : walkTo(away[0], away[1]),
						priorities.values.ferry, 1));
				continue;
			}
			if (!boat.idle || boat.gathering)
				continue;
			const best = nearest(waters, boat.position, firstListed,
				fish => fish.sea === boat.sea && !(fish.gatherers + (reserved.get(fish.id) || 0) >= fish.capacity)).item;
			if (!best)
				continue;
			reserved.set(best.id, (reserved.get(best.id) || 0) + 1);
			requests.push(gatherRequest("naval", "fish", boat.id, best.id, "food", priorities.values.assignIdleWorker, 1));
		}
		return requests;
	}
}
