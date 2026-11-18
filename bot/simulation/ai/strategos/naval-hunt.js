import { centroid, squareDistance } from "simulation/ai/strategos/geometry.js";
import { attack, hold, orderRequest } from "simulation/ai/strategos/requests.js";

export class Hunt
{
	constructor(telemetry, commitments)
	{
		this.telemetry = telemetry;
		this.commitments = commitments;
		this.hunted = new Map();
	}

	save()
	{
		return { "hunted": this.hunted };
	}

	restore(data)
	{
		this.hunted = data.hunted;
	}

	requests(world, plan)
	{
		if (!world.enemyShips.length)
			return [];
		const requests = [];
		const seas = new Map();
		for (const ship of world.fleet)
		{
			if (!ship.warship || ship.bombard || ship.cargo.length || this.commitments.holds(ship.id))
				continue;
			if (!seas.has(ship.sea))
				seas.set(ship.sea, []);
			seas.get(ship.sea).push(ship);
		}
		for (const [sea, hunters] of seas)
		{
			const prey = world.enemyShips.filter(enemy => enemy.sea === sea && !world.batteries.some(structure =>
				squareDistance(structure.position, enemy.position) <= structure.range * structure.range));
			if (!prey.length || hunters.length < plan.naval.huntSuperiority * prey.filter(enemy => enemy.warship).length)
				continue;
			const centre = centroid(hunters);
			const kept = prey.find(enemy => enemy.id === this.hunted.get(sea));
			const target = kept && (kept.warship || !prey.some(enemy => enemy.warship)) ? kept : prey
				.map(enemy => ({ enemy, "distance": squareDistance(enemy.position, centre) }))
				.sort((a, b) => (b.enemy.warship ? 1 : 0) - (a.enemy.warship ? 1 : 0) || a.distance - b.distance || a.enemy.id - b.enemy.id)[0].enemy;
			if (this.hunted.get(sea) !== target.id)
			{
				this.hunted.set(sea, target.id);
				this.telemetry.line("NAVAL", world.time, { "hunt": target.id, "warship": target.warship, "hunters": hunters.length, "prey": prey.length });
			}
			for (const ship of hunters)
				requests.push(orderRequest("naval", "hunt", ship.id, ship.target === target.id ? hold() : attack(target.id),
					plan.values.ferry, 1));
		}
		return requests;
	}
}
