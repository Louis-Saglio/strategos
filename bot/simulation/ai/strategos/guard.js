import { capture, hold, orderRequest, stance, walkTo } from "simulation/ai/strategos/requests.js";
import { CONTACT_RADIUS } from "simulation/ai/strategos/forecast.js";
import { awayFrom, firstListed, nearest, squareDistance, toward } from "simulation/ai/strategos/geometry.js";
import { Change, Hysteresis } from "simulation/ai/strategos/switches.js";
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
				requests.push(this.order("hero-stance", hero, stance("passive"), priorities));
				continue;
			}
			const centre = nearest(world.centres, hero.position, firstListed).item;
			const danger = nearest(world.enemyFighters.filter(enemy =>
				squareDistance(enemy.position, centre.position) <= DANGER_RADIUS * DANGER_RADIUS), centre.position, firstListed).item ||
				nearest(world.enemyTargets, centre.position, firstListed).item;
			const post = awayFrom(centre.position, danger ? danger.position : hero.position, centre.radius + POST_CLEARANCE);
			const away = squareDistance(hero.position, post) > POST_TOLERANCE * POST_TOLERANCE;
			requests.push(this.order("hero-post", hero, away && !hero.state.includes("WALKING") ?
				walkTo(post[0], post[1]) : hold(), priorities));
		}
		return requests;
	}

	order(purpose, hero, action, priorities)
	{
		return orderRequest("guard", purpose, hero.id, action, priorities.values.shelter, 1);
	}
}

const RELIC_SQUAD = 10;
const RELIC_HOME_THREATS = 3;
const RELIC_COVER_MARGIN = 8;
const RELIC_POST_CLEARANCE = 14;
const RELIC_POST_TOLERANCE = 10;
const RELIC_ENEMY_CLEARANCE = 300;

export class Relics
{
	constructor(catalog, telemetry)
	{
		this.catalog = catalog;
		this.telemetry = telemetry;
		this.squad = new Set();
		this.target = new Change(null);
		this.contested = new Hysteresis(false);
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
			const post = toward(home.position, relic.position, home.radius + RELIC_POST_CLEARANCE);
			const away = squareDistance(relic.position, post) > RELIC_POST_TOLERANCE * RELIC_POST_TOLERANCE;
			requests.push(this.order("relic-post", relic.id, away && !relic.state.includes("WALKING") ?
				walkTo(post[0], post[1]) : hold(), priorities));
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
			this.target.to(null);
			return requests;
		}
		if (this.target.to(wanted.id))
			this.telemetry.line("RELIC", world.time, { "seek": wanted.id, "owner": wanted.owner, "x": Math.round(wanted.position[0]), "z": Math.round(wanted.position[1]) });
		const members = world.fighters.filter(fighter => this.squad.has(fighter.id));
		const spare = world.fighters
			.filter(fighter => !this.squad.has(fighter.id) && fighter.region === world.homeRegion && !fighter.state.includes("COMBAT"))
			.map(fighter => ({ fighter, "distance": squareDistance(fighter.position, wanted.position) }))
			.sort((a, b) => a.distance - b.distance || a.fighter.id - b.fighter.id)
			.slice(0, Math.max(0, RELIC_SQUAD - members.length))
			.map(entry => entry.fighter);
		const squad = members.concat(spare);
		const guards = world.enemyFighters.concat(world.wild)
			.filter(enemy => squareDistance(enemy.position, wanted.position) <= CONTACT_RADIUS * CONTACT_RADIUS);
		const ratio = guards.length ? balance(this.catalog, squad, guards, []) : Infinity;
		if (this.contested.below(ratio, 1 / priorities.margin, priorities.margin))
		{
			this.squad = new Set();
			return requests;
		}
		this.squad = new Set(squad.map(fighter => fighter.id));
		for (const fighter of squad)
			requests.push(this.order("relic-capture", fighter.id, fighter.target === wanted.id ?
				hold() : capture(wanted.id), priorities));
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

	order(purpose, unit, action, priorities)
	{
		return orderRequest("relics", purpose, unit, action, priorities.values.relic, 1);
	}
}
