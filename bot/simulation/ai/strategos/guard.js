import { squareDistance } from "simulation/ai/strategos/world.js";
import { balance } from "simulation/ai/strategos/tactics.js";

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

const RELIC_SQUAD = 10;
const RELIC_HOME_THREATS = 3;
const RELIC_COVER_MARGIN = 8;
const RELIC_POST_CLEARANCE = 14;
const RELIC_POST_TOLERANCE = 10;
const RELIC_GUARD_RADIUS = 60;
const RELIC_ENEMY_CLEARANCE = 300;
const RELIC_BALANCE_ENGAGE = 1.3;
const RELIC_BALANCE_ABORT = 0.8;

export class Relics
{
	constructor(catalog, telemetry)
	{
		this.catalog = catalog;
		this.telemetry = telemetry;
		this.squad = new Set();
		this.target = null;
		this.contested = false;
	}

	requests(world, priorities)
	{
		if (!priorities.seekRelics || !world.centres.length)
			return [];
		const home = world.centres[0];
		const requests = [];
		for (const relic of world.relics)
		{
			if (relic.owner !== world.player)
				continue;
			const dx = relic.position[0] - home.position[0];
			const dz = relic.position[1] - home.position[1];
			const length = Math.sqrt(dx * dx + dz * dz) || 1;
			const reach = home.radius + RELIC_POST_CLEARANCE;
			const post = [home.position[0] + dx / length * reach, home.position[1] + dz / length * reach];
			const away = squareDistance(relic.position, post) > RELIC_POST_TOLERANCE * RELIC_POST_TOLERANCE;
			requests.push(this.order(relic.id, away && !relic.state.includes("WALKING") ?
				{ "type": "walk", "x": post[0], "z": post[1] } : { "type": "hold" }, priorities));
		}
		const wanted = world.relics
			.filter(relic => relic.owner !== world.player && relic.region === world.homeRegion && !this.covered(world, relic) &&
				!world.enemyCentres.some(centre => squareDistance(centre.position, relic.position) <= squareDistance(home.position, relic.position) &&
					squareDistance(centre.position, relic.position) < RELIC_ENEMY_CLEARANCE * RELIC_ENEMY_CLEARANCE))
			.map(relic => ({ relic, "distance": squareDistance(relic.position, home.position) }))
			.sort((a, b) => a.distance - b.distance || a.relic.id - b.relic.id)
			.map(entry => entry.relic)[0];
		if (!wanted || world.threats.length >= RELIC_HOME_THREATS)
		{
			this.squad = new Set();
			this.target = null;
			return requests;
		}
		if (this.target !== wanted.id)
		{
			this.target = wanted.id;
			this.telemetry.line("RELIC", world.time, { "seek": wanted.id, "owner": wanted.owner, "x": Math.round(wanted.position[0]), "z": Math.round(wanted.position[1]) });
		}
		const members = world.fighters.filter(fighter => this.squad.has(fighter.id));
		const spare = world.fighters
			.filter(fighter => !this.squad.has(fighter.id) && fighter.region === world.homeRegion && !fighter.state.includes("COMBAT"))
			.map(fighter => ({ fighter, "distance": squareDistance(fighter.position, wanted.position) }))
			.sort((a, b) => a.distance - b.distance || a.fighter.id - b.fighter.id)
			.slice(0, Math.max(0, RELIC_SQUAD - members.length))
			.map(entry => entry.fighter);
		const squad = members.concat(spare);
		const guards = world.enemyFighters.concat(world.wild)
			.filter(enemy => squareDistance(enemy.position, wanted.position) <= RELIC_GUARD_RADIUS * RELIC_GUARD_RADIUS);
		const ratio = guards.length ? balance(this.catalog, squad, guards, []) : Infinity;
		this.contested = this.contested ? ratio < RELIC_BALANCE_ENGAGE : ratio < RELIC_BALANCE_ABORT;
		if (this.contested)
		{
			this.squad = new Set();
			return requests;
		}
		this.squad = new Set(squad.map(fighter => fighter.id));
		for (const fighter of squad)
			requests.push(this.order(fighter.id, fighter.target === wanted.id ?
				{ "type": "hold" } : { "type": "capture", "target": wanted.id }, priorities));
		return requests;
	}

	covered(world, relic)
	{
		return world.enemyStructures.some(structure => {
			if (!structure.fire.arrows)
				return false;
			const reach = structure.range + RELIC_COVER_MARGIN;
			return squareDistance(structure.position, relic.position) <= reach * reach;
		});
	}

	order(unit, action, priorities)
	{
		return {
			"source": "relics",
			"action": Object.assign({ "unit": unit }, action),
			"claims": { "workers": [unit] },
			"value": priorities.values.relic,
			"urgency": 1
		};
	}
}
