import { firstListed, nearest, squareDistance } from "simulation/ai/strategos/geometry.js";
import { LANDING_RADIUS } from "simulation/ai/strategos/naval-shores.js";
import { orderRequest, unloadAllRequest, walkTo } from "simulation/ai/strategos/requests.js";

const CASTAWAY_MIN_AREA = 20000;

export class Rescue
{
	constructor(commitments)
	{
		this.commitments = commitments;
	}

	castaways(world, priorities)
	{
		const requests = [];
		for (const ship of world.ships)
		{
			if (!ship.cargo.length)
				continue;
			const found = nearest(world.shores, ship.position, firstListed,
				candidate => world.regionArea(candidate.region) >= CASTAWAY_MIN_AREA, candidate => candidate.water);
			const shore = found.item;
			if (!shore)
				continue;
			if (found.squareDistance > LANDING_RADIUS * LANDING_RADIUS && ship.idle)
				requests.push(orderRequest("naval", "castaway", ship.id, walkTo(shore.land[0], shore.land[1]), priorities.values.ferry, 1));
			else if (ship.idle)
				requests.push(unloadAllRequest("naval", "castaway", ship.id, priorities.values.founding, 1));
		}
		return requests;
	}

	stranded(world, priorities)
	{
		const carrying = world.ships.filter(ship => ship.cargo.length && !this.commitments.holds(ship.id));
		if (!carrying.length || !world.docks.length)
			return [];
		const dock = world.docks[0].position;
		return carrying.map(ship => unloadAllRequest("naval", "stranded", ship.id, priorities.values.ferry, 1)).concat(carrying
			.filter(ship => ship.idle && squareDistance(ship.position, dock) > LANDING_RADIUS * LANDING_RADIUS)
			.map(ship => orderRequest("naval", "stranded", ship.id, walkTo(dock[0], dock[1]), priorities.values.ferry, 1)));
	}
}
