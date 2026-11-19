import { attack, garrisonIn, hold, orderRequest, unloadAllRequest, unloadRequest, walkTo, withStance } from "simulation/ai/strategos/requests.js";
import { territoryAt } from "simulation/ai/strategos/terrain.js";
import { FIRE_MARGIN, underFire } from "simulation/ai/strategos/fire.js";
import { REACH_RADIUS, arriving, covering, standing } from "simulation/ai/strategos/forecast.js";
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
const LINE_STANCE = "standground";

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
		this.line = null;
		this.lineOrders = { "walk": 0, "hold": 0 };
	}

	save()
	{
		return { "engaged": this.engaged.save(), "ratio": this.ratio, "lastThreatTime": this.lastThreatTime, "reported": this.reported.save(),
			"outnumbered": this.outnumbered.save(), "guarding": this.guarding, "line": this.line,
			"lineOrders": this.lineOrders };
	}

	restore(data)
	{
		this.engaged.restore(data.engaged);
		this.ratio = data.ratio;
		this.lastThreatTime = data.lastThreatTime;
		this.reported.restore(data.reported);
		this.outnumbered.restore(data.outnumbered);
		this.guarding = data.guarding;
		this.line = data.line;
		this.lineOrders = data.lineOrders;
	}

	requests(world, plan, assessments)
	{
		this.foes = world.wild.length ? world.enemyFighters.concat(world.wild) : world.enemyFighters;
		this.hostiles = world.threats.filter(threat => world.ownSide(threat.position)).concat(world.wild, this.approaching(world));
		this.heldLine = this.line;
		this.line = null;
		if (this.hostiles.length)
			this.lastThreatTime = world.time;
		if (!this.hostiles.length)
		{
			this.outnumbered.on = false;
			this.engaged.on = false;
			return world.time - this.lastThreatTime >= RELEASE_DELAY_MS ? this.releaseRequests(world, plan) : [];
		}
		this.shooters = this.shootersOf(world);
		const force = world.fighters.length + world.garrisonedSoldiers;
		const ratio = this.hostiles.length / Math.max(1, force);
		this.outnumbered.atLeast(ratio, OUTNUMBERED_ENTER, OUTNUMBERED_EXIT);
		const free = new Map(world.holders.map(holder => [holder.id, holder.free]));
		const engaging = this.engageRequests(world, plan, assessments, free);
		const requests = engaging
			.concat(this.shelterRequests(world, plan, free))
			.concat(this.unloadRequests(world, plan));
		for (const request of engaging)
			if (request.purpose === "line")
				this.lineOrders[request.action.type === "walk" ? "walk" : "hold"] += 1;
		if (this.reported.attempt(world.time, REPORT_PERIOD_MS))
		{
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
				"shelter": requests.filter(request => request.action.type === "garrison").length,
				"lineWalks": this.lineOrders.walk,
				"lineHolds": this.lineOrders.hold
			});
			this.lineOrders = { "walk": 0, "hold": 0 };
		}
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
		const reach = (cover.range || COVER_RADIUS) + FIRE_MARGIN;
		const slots = this.battleLine(world, cover, centre, near.map(entry => entry.fighter));
		const defenders = [];
		const { threat } = this.nearestThreat(world, cover.position);
		const contact = !!threat && squareDistance(threat.position, cover.position) <= reach * reach;
		for (const { fighter } of near)
		{
			const slot = slots.get(fighter.id);
			const atCover = contact && squareDistance(fighter.position, cover.position) <= reach * reach;
			if (this.outnumbered.on || !slot && !atCover)
			{
				const holder = this.nearestHolder(world, fighter, free,
					candidate => candidate.arrows && (!slot || this.nearestThreat(world, candidate.position).distance <= COVER_RADIUS), ENGAGE_RADIUS);
				if (holder)
				{
					requests.push(this.garrison("man", fighter, holder, free, plan.values.defend, 1));
					continue;
				}
			}
			if (atCover || !slot)
			{
				defenders.push(fighter);
				continue;
			}
			const settled = squareDistance(fighter.position, slot) <= SLOT_TOLERANCE * SLOT_TOLERANCE || fighter.state.walking;
			requests.push(this.order("line", fighter, withStance(settled ? hold() : walkTo(slot[0], slot[1]), LINE_STANCE), plan));
		}
		return requests.concat(this.fight(world, plan, free, defenders));
	}

	shootersOf(world)
	{
		const shooters = world.batteries.slice();
		for (const foe of this.foes)
		{
			const profile = this.catalog.combat(foe.template, foe.owner);
			if (profile.ranged)
				shooters.push({ "position": foe.position, "range": profile.range });
		}
		return shooters;
	}

	battleLine(world, cover, centre, fighters)
	{
		const [dx, dz] = direction(cover.position, centre);
		const radius = cover.radius || 0;
		const front = [];
		for (let depth = radius + LINE_FRONT; depth >= radius + LINE_BACK; depth -= LINE_SPACING)
			front.push(depth);
		const ladder = front.concat(front.slice().reverse().map(depth => -depth));
		const held = this.heldLine && this.heldLine.cover === cover.id ? this.heldLine.rows : [];
		const rows = [
			{ "units": fighters.filter(fighter => !this.catalog.combat(fighter.template).ranged), "start": 0 },
			{ "units": fighters.filter(fighter => this.catalog.combat(fighter.template).ranged), "start": front.length - 1 }
		];
		const slots = new Map();
		const chosen = [];
		let ahead = -1;
		rows.forEach((row, rowIndex) => {
			const units = row.units.slice().sort((a, b) => {
				const sideA = (a.position[0] - cover.position[0]) * -dz + (a.position[1] - cover.position[1]) * dx;
				const sideB = (b.position[0] - cover.position[0]) * -dz + (b.position[1] - cover.position[1]) * dx;
				return sideA - sideB || a.id - b.id;
			});
			const placed = depth => units.map((unit, index) => {
				const side = (index - (units.length - 1) / 2) * LINE_SPACING;
				return [cover.position[0] + dx * depth - dz * side, cover.position[1] + dz * depth + dx * side];
			});
			const previous = rowIndex < held.length ? held[rowIndex] : -1;
			let found = null;
			for (let index = Math.max(row.start, ahead + 1); index < ladder.length && found === null; ++index)
			{
				const extra = index < previous ? LINE_SPACING : 0;
				const line = placed(ladder[index]);
				if (line.some(slot => underFire(this.shooters, slot, extra)))
					continue;
				found = index;
				units.forEach((unit, unitIndex) => slots.set(unit.id, line[unitIndex]));
			}
			if (found === null)
				units.forEach(unit => slots.set(unit.id, null));
			else if (units.length)
				ahead = found;
			chosen.push(!units.length ? -1 : found === null ? ladder.length : found);
		});
		this.line = { "cover": cover.id, "rows": chosen };
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
			if (distance > DANGER_RADIUS && !underFire(this.shooters, worker.position))
				continue;
			const holder = this.outnumbered.on && this.nearestHolder(world, worker, free, unarmed, SHELTER_RADIUS) ||
				this.nearestHolder(world, worker, free, any, SHELTER_RADIUS);
			if (holder)
				requests.push(this.garrison("shelter", worker, holder, free, plan.values.shelter, 1 + Math.max(0, DANGER_RADIUS - distance) / DANGER_RADIUS));
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
			const safe = this.nearestThreat(world, holder.position).distance > SAFE_RADIUS &&
				!underFire(this.shooters, holder.position, holder.radius);
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
