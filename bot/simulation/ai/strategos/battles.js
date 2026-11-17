import { arriving, covering, engagement, forecast, within } from "simulation/ai/strategos/forecast.js";
import { centroid, squareDistance } from "simulation/ai/strategos/geometry.js";
import { Retry } from "simulation/ai/strategos/switches.js";
import { balance } from "simulation/ai/strategos/tactics.js";

const MIN_SIDE = 4;
const SAME_BATTLE_RADIUS = 120;
const REPORT_PERIOD_MS = 30000;
const FORGET_MS = 60000;
const UNIT_PREFIX = "units/";

function round(value)
{
	return Math.round(value * 100) / 100;
}

function described(side)
{
	return {
		"groups": side.groups.map(group => [group.template.startsWith(UNIT_PREFIX) ? group.template.slice(UNIT_PREFIX.length) : group.template,
			group.count, Math.round(group.hitpoints), group.ranged ? 1 : 0, group.value, group.engaged, Math.round(group.at)]),
		"rates": side.groups.map(group => group.rates.map(round)),
		"fire": side.fire.map(round)
	};
}

export class BattleLog
{
	constructor(catalog, telemetry)
	{
		this.catalog = catalog;
		this.telemetry = telemetry;
		this.known = [];
		this.count = 0;
	}

	clashes(world)
	{
		const own = new Map(world.fighters.map(fighter => [fighter.id, fighter]));
		const foes = new Map(world.enemyFighters.map(enemy => [enemy.id, enemy]));
		const seeds = [];
		for (const fighter of world.fighters)
			if (fighter.state.fighting && foes.has(fighter.target))
				seeds.push([fighter, foes.get(fighter.target)]);
		for (const enemy of world.enemyFighters)
			if (enemy.state.fighting && own.has(enemy.target))
				seeds.push([own.get(enemy.target), enemy]);
		const taken = new Set();
		const found = [];
		for (const [fighter, enemy] of seeds)
		{
			if (taken.has(fighter.id) || taken.has(enemy.id))
				continue;
			const first = [(fighter.position[0] + enemy.position[0]) / 2, (fighter.position[1] + enemy.position[1]) / 2];
			const near = within(world.fighters, first, taken).concat(within(world.enemyFighters, first, taken));
			const centre = centroid(near);
			const units = within(world.fighters, centre, taken);
			const opponents = within(world.enemyFighters, centre, taken);
			for (const unit of units)
				taken.add(unit.id);
			for (const unit of opponents)
				taken.add(unit.id);
			if (units.length >= MIN_SIDE && opponents.length >= MIN_SIDE)
				found.push({ centre, units, opponents });
		}
		return found;
	}

	observe(world)
	{
		this.known = this.known.filter(battle => world.time - battle.seen < FORGET_MS);
		for (const clash of this.clashes(world))
		{
			let battle = this.known.find(candidate =>
				squareDistance(candidate.centre, clash.centre) <= SAME_BATTLE_RADIUS * SAME_BATTLE_RADIUS);
			if (!battle)
			{
				this.count += 1;
				battle = { "id": this.count, "reports": 0, "reported": new Retry() };
				this.known.push(battle);
			}
			battle.centre = clash.centre;
			battle.seen = world.time;
			if (!battle.reported.attempt(world.time, REPORT_PERIOD_MS))
				continue;
			const cover = covering(world.holders, clash.centre, clash.units);
			const present = new Set(clash.units.concat(clash.opponents).map(unit => unit.id));
			const joining = arriving(this.catalog, world.fighters, clash.centre, present, false);
			const opposing = arriving(this.catalog, world.enemyFighters, clash.centre, present, true);
			const input = engagement(this.catalog, clash.units, clash.opponents, cover, covering(world.enemyStructures, clash.centre, clash.opponents),
				joining, opposing);
			const outlook = forecast(input);
			this.telemetry.line("FORECAST", world.time, {
				"id": battle.id,
				"seq": battle.reports,
				"x": Math.round(clash.centre[0]),
				"z": Math.round(clash.centre[1]),
				"ours": described(input.ours),
				"theirs": described(input.theirs),
				"ids": [clash.units.map(unit => unit.id).concat(joining.map(entry => entry.unit.id)),
					clash.opponents.map(unit => unit.id).concat(opposing.map(entry => entry.unit.id))],
				"marks": outlook.marks.map(mark => [mark.t, round(mark.ours), round(mark.theirs)]),
				"edge": Math.round(outlook.edge),
				"winner": outlook.winner,
				"balance": round(Math.min(99, balance(this.catalog, clash.units, clash.opponents, cover)))
			});
			battle.reports += 1;
		}
	}
}
