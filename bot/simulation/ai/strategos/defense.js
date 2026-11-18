import { attack, garrisonIn, hold, orderRequest, unloadAllRequest, unloadRequest, walkTo } from "simulation/ai/strategos/requests.js";
import { territoryAt } from "simulation/ai/strategos/terrain.js";
import { COVER_MARGIN, REACH_RADIUS, arriving, covering, standing } from "simulation/ai/strategos/forecast.js";
import { centroid, direction, lowerId, nearest, squareDistance } from "simulation/ai/strategos/geometry.js";
import { Hysteresis, Retry } from "simulation/ai/strategos/switches.js";
import { skirmish } from "simulation/ai/strategos/tactics.js";

const ENGAGE_RADIUS = 160;
const DANGER_RADIUS = 30;
const SHELTER_RADIUS = 90;
const RELEASE_DELAY_MS = 8000;
const COVER_RADIUS = 55;
const OUTNUMBERED_ENTER = 1;
const OUTNUMBERED_EXIT = 0.6;
const SAFE_RADIUS = 70;
const REPORT_PERIOD_MS = 10000;
const APPROACH_RADIUS = 80;
const BATTLE_RADIUS = 60;
const RETREAT_RADIUS = 90;
const WARNING_RADIUS = 100;
const LINE_FRONT = 14;
const LINE_BACK = 3;
const LINE_SPACING = 2.5;
const SLOT_TOLERANCE = 5;

export class Defense
{
	constructor(catalog, telemetry)
	{
		this.catalog = catalog;
		this.telemetry = telemetry;
		this.engaged = new Hysteresis(false);
		this.ratio = 0;
		this.lastThreatTime = -Infinity;
		this.reported = new Retry();
		this.outnumbered = new Hysteresis(false);
	}

	save()
	{
		return { "engaged": this.engaged.save(), "ratio": this.ratio, "lastThreatTime": this.lastThreatTime, "reported": this.reported.save(),
			"outnumbered": this.outnumbered.save(), "guarding": this.guarding };
	}

	restore(data)
	{
		this.engaged.restore(data.engaged);
		this.ratio = data.ratio;
		this.lastThreatTime = data.lastThreatTime;
		this.reported.restore(data.reported);
		this.outnumbered.restore(data.outnumbered);
		this.guarding = data.guarding;
	}

	requests(world, plan, assessments)
	{
		this.foes = world.wild.length ? world.enemyFighters.concat(world.wild) : world.enemyFighters;
		this.hostiles = world.threats.filter(threat => world.ownSide(threat.position)).concat(world.wild, this.approaching(world));
		if (this.hostiles.length)
			this.lastThreatTime = world.time;
		if (!this.hostiles.length)
		{
			this.outnumbered.on = false;
			this.engaged.on = false;
			return world.time - this.lastThreatTime >= RELEASE_DELAY_MS ? this.releaseRequests(world, plan) : [];
		}
		const force = world.fighters.length + world.garrisonedSoldiers;
		const ratio = this.hostiles.length / Math.max(1, force);
		this.outnumbered.atLeast(ratio, OUTNUMBERED_ENTER, OUTNUMBERED_EXIT);
		const free = new Map(world.holders.map(holder => [holder.id, holder.free]));
		const requests = this.engageRequests(world, plan, assessments, free)
			.concat(this.shelterRequests(world, plan, free))
			.concat(this.unloadRequests(world, plan));
		if (this.reported.attempt(world.time, REPORT_PERIOD_MS))
			this.telemetry.line("DEF", world.time, {
				"threats": world.threats.length,
				"approaching": this.hostiles.length - world.threats.length,
				"fighters": world.fighters.length,
				"garrisonedSoldiers": world.garrisonedSoldiers,
				"outnumbered": this.outnumbered.on,
				"engaged": this.engaged.on,
				"ratio": Math.round(Math.min(this.ratio, 99) * 100) / 100,
				"hostile": assessments.guard.group.length,
				"guard": this.guarding,
				"holds": assessments.guard.holds,
				"engage": requests.filter(request => request.action.type === "attack").length,
				"shelter": requests.filter(request => request.action.type === "garrison").length
			});
		return requests;
	}

	nearestThreat(world, position)
	{
		const found = nearest(this.hostiles, position, lowerId);
		return { "threat": found.item, "distance": Math.sqrt(found.squareDistance) };
	}

	nearestHolder(world, unit, free, accept, radius)
	{
		const found = nearest(world.holders, unit.position, lowerId,
			holder => !(free.get(holder.id) <= 0) && accept(holder) && MatchesClassList(unit.classes, holder.classes));
		return found.squareDistance < radius * radius ? found.item : null;
	}

	garrison(purpose, unit, holder, free, value, urgency)
	{
		free.set(holder.id, free.get(holder.id) - 1);
		return orderRequest("defense", purpose, unit.id, garrisonIn(holder.id), value, urgency);
	}

	approaching(world)
	{
		const territory = world.grids.territory;
		const player = world.player;
		const sentinels = world.fighters.filter(fighter => territoryAt(territory, fighter.position[0], fighter.position[1]).owner === player);
		const limit = WARNING_RADIUS * WARNING_RADIUS;
		const inside = new Set(world.threats.map(threat => threat.id));
		return world.enemyFighters.filter(enemy => !inside.has(enemy.id) && !enemy.state.working &&
			world.ownSide(enemy.position) && sentinels.some(fighter => squareDistance(fighter.position, enemy.position) <= limit));
	}

	hostileGroup(world)
	{
		const limit = APPROACH_RADIUS * APPROACH_RADIUS;
		const ids = new Set(this.hostiles.map(threat => threat.id));
		return this.foes.filter(enemy => ids.has(enemy.id) ||
			this.hostiles.some(threat => squareDistance(threat.position, enemy.position) <= limit));
	}

	order(purpose, fighter, action, plan, urgency)
	{
		return orderRequest("defense", purpose, fighter.id, action, plan.values.defend, urgency || 1);
	}

	engageRequests(world, plan, assessments, free)
	{
		const guard = assessments.guard;
		const group = guard.group.length ? guard.group : this.hostileGroup(world);
		const centre = guard.group.length ? guard.centre : centroid(group.length ? group : this.hostiles);
		const near = world.fighters
			.map(fighter => ({ fighter, "distance": this.nearestThreat(world, fighter.position).distance }))
			.filter(entry => entry.distance <= ENGAGE_RADIUS)
			.sort((a, b) => a.distance - b.distance || a.fighter.id - b.fighter.id);
		this.guarding = guard.group.length ? guard.needed.length : 0;
		if (guard.group.length)
		{
			this.ratio = guard.ratio;
			return this.engaged.atLeast(this.ratio, plan.defense.engage.enter, plan.defense.engage.exit) ?
				this.fight(world, plan, free, guard.needed) : this.fallBack(world, plan, free, near, centre);
		}
		const cover = covering(world.holders, centre, []);
		const opposingCover = covering(world.enemyStructures, centre, []);
		const opposing = arriving(this.catalog, world.enemyFighters, centre, new Set(group.map(unit => unit.id)), true, REACH_RADIUS, true);
		const ratio = group.length ? fighters => standing(this.catalog, fighters, group, centre, cover, opposingCover, opposing, plan.guard.horizonS) :
			fighters => fighters.length ? Infinity : 0;
		this.ratio = ratio(near.map(entry => entry.fighter));
		return this.engaged.atLeast(this.ratio, plan.defense.engage.enter, plan.defense.engage.exit) ?
			this.respond(world, plan, free, near, ratio) : this.fallBack(world, plan, free, near, centre);
	}

	respond(world, plan, free, near, ratio)
	{
		const ordered = near.filter(entry => entry.fighter.state.fighting).concat(near.filter(entry => !entry.fighter.state.fighting))
			.map(entry => entry.fighter);
		let enough = ordered.length;
		if (enough > 1 && ratio(ordered) >= plan.guard.enter)
		{
			let short = 0;
			while (enough - short > 1)
			{
				const middle = Math.floor((short + enough) / 2);
				if (ratio(ordered.slice(0, middle)) >= plan.guard.enter)
					enough = middle;
				else
					short = middle;
			}
		}
		return this.fight(world, plan, free, ordered.slice(0, enough));
	}

	fight(world, plan, free, units)
	{
		const limit = BATTLE_RADIUS * BATTLE_RADIUS;
		const enemies = this.foes.filter(enemy => world.ownSide(enemy.position) &&
			units.some(unit => squareDistance(unit.position, enemy.position) <= limit));
		const allowed = new Set(enemies.map(enemy => enemy.id));
		for (const hostile of this.hostiles)
			allowed.add(hostile.id);
		const home = world.home;
		const retreating = new Set();
		const retreat = unit => {
			retreating.add(unit.id);
			const holder = this.nearestHolder(world, unit, free, candidate => candidate.heal > 0, RETREAT_RADIUS);
			if (holder)
			{
				free.set(holder.id, free.get(holder.id) - 1);
				return garrisonIn(holder.id);
			}
			return home ? walkTo(home.position[0], home.position[1]) : hold();
		};
		const actions = skirmish(this.catalog, units, enemies, retreat);
		const requests = [];
		for (const unit of units)
		{
			let action = actions.get(unit.id);
			if (!action)
			{
				const { threat } = this.nearestThreat(world, unit.position);
				action = unit.state.fighting && allowed.has(unit.target) || !threat ? hold() : attack(threat.id);
			}
			requests.push(this.order(retreating.has(unit.id) ? "retreat" : "engage", unit, action, plan));
		}
		return requests;
	}

	fallBack(world, plan, free, near, centre)
	{
		const requests = [];
		const cover = this.nearestCover(world, centre) || world.home;
		if (!cover)
			return requests;
		const reach = (cover.range || COVER_RADIUS) + COVER_MARGIN;
		const slots = this.battleLine(cover, centre, near.map(entry => entry.fighter));
		const defenders = [];
		const { threat } = this.nearestThreat(world, cover.position);
		const contact = !!threat && squareDistance(threat.position, cover.position) <= reach * reach;
		for (const { fighter } of near)
		{
			if (this.outnumbered.on)
			{
				const holder = this.nearestHolder(world, fighter, free,
					candidate => candidate.arrows && this.nearestThreat(world, candidate.position).distance <= COVER_RADIUS, ENGAGE_RADIUS);
				if (holder)
				{
					requests.push(this.garrison("man", fighter, holder, free, plan.values.defend, 1));
					continue;
				}
			}
			const slot = slots.get(fighter.id);
			const away = squareDistance(fighter.position, cover.position) > reach * reach;
			if (contact && !away)
			{
				defenders.push(fighter);
				continue;
			}
			if (squareDistance(fighter.position, slot) <= SLOT_TOLERANCE * SLOT_TOLERANCE || fighter.state.walking)
			{
				requests.push(this.order("line", fighter, hold(), plan));
				continue;
			}
			requests.push(this.order("line", fighter, walkTo(slot[0], slot[1]), plan));
		}
		return requests.concat(this.fight(world, plan, free, defenders));
	}

	battleLine(cover, centre, fighters)
	{
		const [dx, dz] = direction(cover.position, centre);
		const radius = cover.radius || 0;
		const slots = new Map();
		const rows = [
			{ "units": fighters.filter(fighter => !this.catalog.combat(fighter.template).ranged), "depth": radius + LINE_FRONT },
			{ "units": fighters.filter(fighter => this.catalog.combat(fighter.template).ranged), "depth": radius + LINE_BACK }
		];
		for (const row of rows)
		{
			const units = row.units.slice().sort((a, b) => {
				const sideA = (a.position[0] - cover.position[0]) * -dz + (a.position[1] - cover.position[1]) * dx;
				const sideB = (b.position[0] - cover.position[0]) * -dz + (b.position[1] - cover.position[1]) * dx;
				return sideA - sideB || a.id - b.id;
			});
			units.forEach((unit, index) => {
				const side = (index - (units.length - 1) / 2) * LINE_SPACING;
				slots.set(unit.id, [cover.position[0] + dx * row.depth - dz * side, cover.position[1] + dz * row.depth + dx * side]);
			});
		}
		return slots;
	}

	nearestCover(world, position)
	{
		return nearest(world.holders, position, lowerId, holder => holder.arrows).item;
	}

	shelterRequests(world, plan, free)
	{
		const requests = [];
		const unarmed = holder => !holder.arrows;
		const any = () => true;
		for (const worker of world.workers)
		{
			if (worker.soldier || worker.state.garrisoning)
				continue;
			const { distance } = this.nearestThreat(world, worker.position);
			if (distance > DANGER_RADIUS)
				continue;
			const holder = this.outnumbered.on && this.nearestHolder(world, worker, free, unarmed, SHELTER_RADIUS) ||
				this.nearestHolder(world, worker, free, any, SHELTER_RADIUS);
			if (holder)
				requests.push(this.garrison("shelter", worker, holder, free, plan.values.shelter, 1 + (DANGER_RADIUS - distance) / DANGER_RADIUS));
		}
		return requests;
	}

	unloadRequests(world, plan)
	{
		const requests = [];
		for (const holder of world.holders)
		{
			if (!holder.garrisoned || holder.forward)
				continue;
			const safe = this.nearestThreat(world, holder.position).distance > SAFE_RADIUS;
			const units = holder.units.filter(id => safe || !this.outnumbered.on && holder.soldiers.includes(id) && !(holder.heal > 0 && holder.hurt.includes(id)));
			if (units.length)
				requests.push(unloadRequest("defense", "unload", holder.id, units, plan.values.defend, 1));
		}
		return requests;
	}

	releaseRequests(world, plan)
	{
		return world.holders
			.filter(holder => holder.garrisoned > 0 && !holder.forward)
			.map(holder => unloadAllRequest("defense", "release", holder.id, plan.values.shelter, 1));
	}
}
