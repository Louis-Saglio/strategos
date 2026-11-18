import { REACH_RADIUS, arriving, covering, standing } from "simulation/ai/strategos/forecast.js";
import { centroid, squareDistance } from "simulation/ai/strategos/geometry.js";
import { Hysteresis } from "simulation/ai/strategos/switches.js";
import { territoryAt } from "simulation/ai/strategos/terrain.js";

const NO_GUARD = Object.freeze({ "group": Object.freeze([]), "needed": Object.freeze([]), "ids": new Set(), "ratio": Infinity, "holds": true, "value": 0,
	"report": guardReport });

function guardReport()
{
	return { "hostiles": this.group.length, "needed": this.needed.length, "ratio": this.ratio, "holds": this.holds, "value": this.value };
}

export class HomeGuard
{
	constructor(catalog)
	{
		this.catalog = catalog;
		this.held = new Hysteresis(true);
	}

	save()
	{
		return { "held": this.held.save(), "guards": this.guards };
	}

	restore(data)
	{
		this.held.restore(data.held);
		this.guards = data.guards;
	}

	assess(world, plan)
	{
		const guard = plan.guard;
		const inside = new Set(world.threats.filter(threat => world.ownSide(threat.position)).map(threat => threat.id));
		for (const unit of world.wild)
			inside.add(unit.id);
		const foes = world.wild.length ? world.enemyFighters.concat(world.wild) : world.enemyFighters;
		const seeds = foes.filter(unit => inside.has(unit.id));
		if (!seeds.length)
		{
			this.guards = new Set();
			this.held.on = true;
			return NO_GUARD;
		}
		const near = guard.near * guard.near;
		const group = foes.filter(unit => inside.has(unit.id) || seeds.some(seed => squareDistance(seed.position, unit.position) <= near));
		const centre = centroid(group);
		const present = new Set(group.map(unit => unit.id));
		const opposing = arriving(this.catalog, world.enemyFighters, centre, present, true, REACH_RADIUS, true);
		const cover = covering(world.holders, centre, []);
		const opposingCover = covering(world.enemyStructures, centre, []);
		const territory = world.grids.territory;
		const reach = REACH_RADIUS * REACH_RADIUS;
		const kept = this.guards || new Set();
		let candidates = world.fighters
			.map(fighter => ({ "fighter": fighter, "distance": squareDistance(fighter.position, centre) }))
			.filter(entry => entry.distance <= reach ||
				territoryAt(territory, entry.fighter.position[0], entry.fighter.position[1]).owner === world.player);
		candidates.sort((a, b) => a.distance - b.distance || a.fighter.id - b.fighter.id);
		if (candidates.length)
			candidates = candidates.filter(entry => entry.fighter.region === candidates[0].fighter.region);
		candidates.sort((a, b) => kept.has(b.fighter.id) - kept.has(a.fighter.id) || a.distance - b.distance || a.fighter.id - b.fighter.id);
		const fighters = candidates.map(entry => entry.fighter);
		const ratio = count => standing(this.catalog, fighters.slice(0, count), group, centre, cover, opposingCover, opposing, guard.horizonS);
		const whole = fighters.length ? ratio(fighters.length) : 0;
		let enough = fighters.length;
		if (whole >= guard.enter)
		{
			let short = 0;
			while (enough - short > 1)
			{
				const middle = Math.floor((short + enough) / 2);
				if (ratio(middle) >= guard.enter)
					enough = middle;
				else
					short = middle;
			}
		}
		const needed = fighters.slice(0, enough);
		let value = 0;
		for (const unit of group)
			value += this.catalog.costSum(unit.template);
		for (const entry of opposing)
			value += this.catalog.costSum(entry.unit.template);
		this.guards = new Set(needed.map(fighter => fighter.id));
		this.held.atLeast(whole, guard.enter, guard.exit);
		return Object.freeze({ "group": Object.freeze(group), "centre": Object.freeze(centre), "needed": Object.freeze(needed), "ids": this.guards,
			"ratio": whole, "holds": this.held.on, "value": value, "report": guardReport });
	}
}
