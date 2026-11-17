import { capture, memberRequest, stance, walkTo } from "simulation/ai/strategos/requests.js";
import { CONTACT_RADIUS } from "simulation/ai/strategos/forecast.js";
import { awayFrom, firstListed, nearest, squareDistance, toward } from "simulation/ai/strategos/geometry.js";
import { Operations } from "simulation/ai/strategos/operations.js";
import { Hysteresis } from "simulation/ai/strategos/switches.js";
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
				requests.push(this.member("hero-stance", hero, false, stance("passive"), priorities));
				continue;
			}
			const centre = nearest(world.centres, hero.position, firstListed).item;
			const danger = nearest(world.enemyFighters.filter(enemy =>
				squareDistance(enemy.position, centre.position) <= DANGER_RADIUS * DANGER_RADIUS), centre.position, firstListed).item ||
				nearest(world.enemyTargets, centre.position, firstListed).item;
			const post = awayFrom(centre.position, danger ? danger.position : hero.position, centre.radius + POST_CLEARANCE);
			const away = squareDistance(hero.position, post) > POST_TOLERANCE * POST_TOLERANCE;
			requests.push(this.member("hero-post", hero, !away || hero.state.walking, walkTo(post[0], post[1]), priorities));
		}
		return requests;
	}

	settle(world, outcomes)
	{
		for (const { request, issued } of outcomes)
			if (issued && request.purpose === "hero-stance")
				this.passive.add(request.action.unit);
	}

	member(purpose, hero, engaged, order, priorities)
	{
		return memberRequest("guard", purpose, hero.id, engaged, order, priorities.values.shelter, 1);
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
		this.squads = new Operations("relics", "RELIC", telemetry);
		this.contested = new Hysteresis(false);
	}

	requests(world, priorities)
	{
		if (!priorities.seekRelics || !world.centres.length)
			return [];
		const home = world.home;
		const requests = [];
		for (const relic of world.relics)
		{
			if (relic.owner !== world.player)
				continue;
			const post = toward(home.position, relic.position, home.radius + RELIC_POST_CLEARANCE);
			const away = squareDistance(relic.position, post) > RELIC_POST_TOLERANCE * RELIC_POST_TOLERANCE;
			requests.push(this.member("relic-post", relic.id, !away || relic.state.walking, walkTo(post[0], post[1]), priorities));
		}
		const wanted = world.relics
			.filter(relic => relic.owner !== world.player && relic.region === world.homeRegion && !this.covered(world, relic) &&
				!world.enemyCentres.some(centre => squareDistance(centre.position, relic.position) <= squareDistance(home.position, relic.position) &&
					squareDistance(centre.position, relic.position) < RELIC_ENEMY_CLEARANCE * RELIC_ENEMY_CLEARANCE))
			.map(relic => ({ relic, "distance": squareDistance(relic.position, home.position) }))
			.sort((a, b) => a.distance - b.distance || a.relic.id - b.relic.id)
			.map(entry => entry.relic)[0];
		const current = this.squads.list[0];
		if (!wanted || world.threats.length >= RELIC_HOME_THREATS)
		{
			if (current)
				this.squads.close(current);
			return requests;
		}
		const squad = current || this.squads.open("squad");
		if (squad.objective !== wanted.id)
		{
			squad.objective = wanted.id;
			this.squads.enter(squad, world.time, "seek",
				{ "seek": wanted.id, "owner": wanted.owner, "x": Math.round(wanted.position[0]), "z": Math.round(wanted.position[1]) });
		}
		const enlisted = new Set(squad.members);
		const members = world.fighters.filter(fighter => enlisted.has(fighter.id));
		const spare = world.fighters
			.filter(fighter => !enlisted.has(fighter.id) && fighter.region === world.homeRegion && !fighter.state.fighting)
			.map(fighter => ({ fighter, "distance": squareDistance(fighter.position, wanted.position) }))
			.sort((a, b) => a.distance - b.distance || a.fighter.id - b.fighter.id)
			.slice(0, Math.max(0, RELIC_SQUAD - members.length))
			.map(entry => entry.fighter);
		const party = members.concat(spare);
		const guards = world.enemyFighters.concat(world.wild)
			.filter(enemy => squareDistance(enemy.position, wanted.position) <= CONTACT_RADIUS * CONTACT_RADIUS);
		const ratio = guards.length ? balance(this.catalog, party, guards, []) : Infinity;
		if (this.contested.below(ratio, 1 / priorities.margin, priorities.margin))
		{
			squad.members = [];
			return requests;
		}
		squad.members = party.map(fighter => fighter.id);
		for (const fighter of party)
			requests.push(this.squads.serving(
				this.member("relic-capture", fighter.id, fighter.target === wanted.id, capture(wanted.id), priorities), squad));
		return requests;
	}

	settle(world, outcomes)
	{
		this.squads.settle(outcomes);
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

	member(purpose, unit, engaged, order, priorities)
	{
		return memberRequest("relics", purpose, unit, engaged, order, priorities.values.relic, 1);
	}
}
