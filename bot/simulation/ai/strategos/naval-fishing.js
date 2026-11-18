import { awayFrom, firstListed, nearest } from "simulation/ai/strategos/geometry.js";
import { gatherRequest, hold, orderRequest, walkTo } from "simulation/ai/strategos/requests.js";

export class Fishing
{
	requests(world, plan)
	{
		if (!world.fish.length)
			return [];
		const clearance = plan.naval.fishClearance;
		const requests = [];
		const boats = world.fleet.filter(ship => ship.fishing);
		const { foes, hostile, waters } = world.fishingGrounds(clearance);
		const reserved = new Map();
		for (const boat of boats)
		{
			if (hostile(boat.position))
			{
				const foe = nearest(foes, boat.position, firstListed).item;
				const away = awayFrom(boat.position, foe.position, clearance.flight);
				if (world.openWater(away, boat.sea, clearance.berth))
					requests.push(orderRequest("naval", "flee", boat.id, boat.state.walking ? hold() : walkTo(away[0], away[1]),
						plan.values.ferry, 1));
				continue;
			}
			if (!boat.idle || boat.gathering)
				continue;
			const best = nearest(waters, boat.position, firstListed,
				fish => fish.sea === boat.sea && !(fish.gatherers + (reserved.get(fish.id) || 0) >= fish.capacity)).item;
			if (!best)
				continue;
			reserved.set(best.id, (reserved.get(best.id) || 0) + 1);
			requests.push(gatherRequest("naval", "fish", boat.id, best.id, "food", plan.values.assignIdleWorker, 1));
		}
		return requests;
	}
}
