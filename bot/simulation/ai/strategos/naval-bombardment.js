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

	save()
	{
		return { "current": this.current };
	}

	restore(data)
	{
		this.current = data.current;
	}

	firingPoint(world, bombard, structure, sea, range, from)
	{
		let best = null;
		let shortest = Infinity;
		for (let k = 0; k < bombard.bearings; ++k)
		{
			const angle = 2 * Math.PI * k / bombard.bearings;
			const point = [structure.position[0] + (range - bombard.margin) * Math.cos(angle),
				structure.position[1] + (range - bombard.margin) * Math.sin(angle)];
			if (!world.openWater(point, sea, bombard.searoom) || world.batteries.some(battery =>
				squareDistance(battery.position, point) <= (battery.range + bombard.clearance) * (battery.range + bombard.clearance)))
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

	requests(world, plan)
	{
		const bombard = plan.naval.bombard;
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
			for (const structure of ranked.slice(0, bombard.tried))
			{
				const point = this.firingPoint(world, bombard, structure, sea, range, centre);
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
			squareDistance(ship.position, point) <= bombard.arrive * bombard.arrive ? attack(target) :
			ship.idle ? walkTo(point[0], point[1]) : hold(), plan.values.ferry, 1));
	}
}
