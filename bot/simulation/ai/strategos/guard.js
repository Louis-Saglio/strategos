import { squareDistance } from "simulation/ai/strategos/world.js";

const POST_CLEARANCE = 12;
const POST_TOLERANCE = 12;
const DANGER_RADIUS = 90;

export class Guard
{
	constructor()
	{
		this.passive = new Set();
	}

	requests(world, priorities)
	{
		if (!priorities.protectHero || !world.centres.length)
			return [];
		const requests = [];
		for (const hero of world.heroes)
		{
			if (!this.passive.has(hero.id))
			{
				this.passive.add(hero.id);
				requests.push(this.order(hero, { "type": "stance", "name": "passive" }, priorities));
				continue;
			}
			const centre = this.nearest(world.centres, hero.position);
			const danger = this.nearest(world.enemyFighters.filter(enemy =>
				squareDistance(enemy.position, centre.position) <= DANGER_RADIUS * DANGER_RADIUS), centre.position) ||
				this.nearest(world.enemyTargets, centre.position);
			const post = this.post(centre, danger ? danger.position : hero.position);
			const away = squareDistance(hero.position, post) > POST_TOLERANCE * POST_TOLERANCE;
			requests.push(this.order(hero, away && !hero.state.includes("WALKING") ?
				{ "type": "walk", "x": post[0], "z": post[1] } : { "type": "hold" }, priorities));
		}
		return requests;
	}

	nearest(items, position)
	{
		let best = null;
		let bestDistance = Infinity;
		for (const item of items)
		{
			const distance = squareDistance(item.position, position);
			if (distance < bestDistance)
			{
				best = item;
				bestDistance = distance;
			}
		}
		return best;
	}

	post(centre, danger)
	{
		const dx = centre.position[0] - danger[0];
		const dz = centre.position[1] - danger[1];
		const length = Math.sqrt(dx * dx + dz * dz) || 1;
		const reach = centre.radius + POST_CLEARANCE;
		return [centre.position[0] + dx / length * reach, centre.position[1] + dz / length * reach];
	}

	order(hero, action, priorities)
	{
		return {
			"source": "guard",
			"action": Object.assign({ "unit": hero.id }, action),
			"claims": { "workers": [hero.id] },
			"value": priorities.values.shelter,
			"urgency": 1
		};
	}
}
