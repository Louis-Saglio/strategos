import { RETRY_MS } from "simulation/ai/strategos/cadence.js";
import { centroid, squareDistance } from "simulation/ai/strategos/geometry.js";
import { attack, hold, orderRequest, walkTo } from "simulation/ai/strategos/requests.js";

export class Bombardment
{
	constructor(catalog, telemetry, commitments)
	{
		this.catalog = catalog;
		this.telemetry = telemetry;
		this.commitments = commitments;
		this.current = null;
	}

	firingPoint(world, plan, structure, sea, range, from)
	{
		let best = null;
		let shortest = Infinity;
		for (let k = 0; k < plan.bearings; ++k)
		{
			const angle = 2 * Math.PI * k / plan.bearings;
			const point = [structure.position[0] + (range - plan.margin) * Math.cos(angle),
				structure.position[1] + (range - plan.margin) * Math.sin(angle)];
			if (!world.openWater(point, sea, plan.searoom) || world.batteries.some(battery =>
				squareDistance(battery.position, point) <= (battery.range + plan.clearance) * (battery.range + plan.clearance)))
				continue;
			const distance = squareDistance(point, from);
			if (distance < shortest)
			{
				best = point;
				shortest = distance;
			}
		}
		return best;
	}

	requests(world, priorities)
	{
		const plan = priorities.naval.bombard;
		const guns = world.fleet.filter(ship => ship.bombard && !ship.cargo.length && !this.commitments.holds(ship.id));
		if (!guns.length || !world.enemyStructures.length)
		{
			this.current = null;
			return [];
		}
		const sea = guns[0].sea;
		const battery = guns.filter(ship => ship.sea === sea);
		const range = Math.min(...battery.map(ship => this.catalog.combat(ship.template).range));
		const centre = centroid(battery);
		const standing = this.current && world.enemyStructures.some(structure => structure.id === this.current.target);
		if (!standing && (!this.current || this.current.target !== null || world.time - this.current.since >= RETRY_MS))
		{
			const ranked = world.enemyStructures.slice().sort((a, b) =>
				(b.fire.arrows > 0 ? 1 : 0) - (a.fire.arrows > 0 ? 1 : 0) || (b.centre ? 1 : 0) - (a.centre ? 1 : 0) ||
				squareDistance(a.position, centre) - squareDistance(b.position, centre) || a.id - b.id);
			this.current = { "target": null, "point": null, "since": world.time };
			for (const structure of ranked.slice(0, plan.tried))
			{
				const point = this.firingPoint(world, plan, structure, sea, range, centre);
				if (!point)
					continue;
				this.current = { "target": structure.id, "point": point, "since": world.time };
				this.telemetry.line("NAVAL", world.time, {
					"bombard": structure.id, "centre": structure.centre, "arrows": structure.fire.arrows, "ships": battery.length,
					"from": point.map(Math.round)
				});
				break;
			}
		}
		if (!this.current || this.current.target === null)
			return [];
		const point = this.current.point;
		const target = this.current.target;
		return battery.map(ship => orderRequest("naval", "bombard", ship.id, ship.target === target ? hold() :
			squareDistance(ship.position, point) <= plan.arrive * plan.arrive ? attack(target) :
			ship.idle ? walkTo(point[0], point[1]) : hold(), priorities.values.ferry, 1));
	}
}
