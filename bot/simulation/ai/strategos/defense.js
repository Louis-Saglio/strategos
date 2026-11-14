import { squareDistance, territoryAt } from "simulation/ai/strategos/world.js";
import { balance, centroid, coveringHolders, skirmish } from "simulation/ai/strategos/tactics.js";

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
const ENGAGE_ENTER = 1.3;
const ENGAGE_EXIT = 0.8;
const RESPONSE_MARGIN = 2;
const COVER_MARGIN = 5;
const BATTLE_RADIUS = 60;
const RETREAT_RADIUS = 90;
const WARNING_RADIUS = 100;
const WORKING_STATES = ["GATHER", "RETURNRESOURCE", "REPAIR", "GARRISON"];
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
		this.engaged = false;
		this.ratio = 0;
		this.lastThreatTime = -Infinity;
		this.lastReport = -Infinity;
		this.outnumbered = false;
	}

	requests(world, priorities)
	{
		this.foes = world.wild.length ? world.enemyFighters.concat(world.wild) : world.enemyFighters;
		this.hostiles = world.threats.concat(world.wild, this.approaching(world));
		if (this.hostiles.length)
			this.lastThreatTime = world.time;
		if (!this.hostiles.length)
		{
			this.outnumbered = false;
			this.engaged = false;
			return world.time - this.lastThreatTime >= RELEASE_DELAY_MS ? this.releaseRequests(world, priorities) : [];
		}
		const force = world.fighters.length + world.garrisonedSoldiers;
		const ratio = this.hostiles.length / Math.max(1, force);
		this.outnumbered = this.outnumbered ? ratio >= OUTNUMBERED_EXIT : ratio >= OUTNUMBERED_ENTER;
		const free = new Map(world.holders.map(holder => [holder.id, holder.free]));
		const requests = this.engageRequests(world, priorities, free)
			.concat(this.shelterRequests(world, priorities, free))
			.concat(this.unloadRequests(world, priorities));
		if (world.time - this.lastReport >= REPORT_PERIOD_MS)
		{
			this.lastReport = world.time;
			this.telemetry.line("DEF", world.time, {
				"threats": world.threats.length,
				"approaching": this.hostiles.length - world.threats.length,
				"fighters": world.fighters.length,
				"garrisonedSoldiers": world.garrisonedSoldiers,
				"outnumbered": this.outnumbered,
				"engaged": this.engaged,
				"ratio": Math.round(Math.min(this.ratio, 99) * 100) / 100,
				"engage": requests.filter(request => request.action.type === "attack").length,
				"shelter": requests.filter(request => request.action.type === "garrison").length
			});
		}
		return requests;
	}

	nearestThreat(world, position)
	{
		let best = null;
		let bestDistance = Infinity;
		for (const threat of this.hostiles)
		{
			const distance = squareDistance(threat.position, position);
			if (distance < bestDistance || (distance === bestDistance && threat.id < best.id))
			{
				best = threat;
				bestDistance = distance;
			}
		}
		return { "threat": best, "distance": Math.sqrt(bestDistance) };
	}

	nearestHolder(world, unit, free, accept, radius)
	{
		let best = null;
		let bestDistance = radius * radius;
		for (const holder of world.holders)
		{
			if (free.get(holder.id) <= 0 || !accept(holder) || !MatchesClassList(unit.classes, holder.classes))
				continue;
			const distance = squareDistance(holder.position, unit.position);
			if (distance < bestDistance || (distance === bestDistance && best && holder.id < best.id))
			{
				best = holder;
				bestDistance = distance;
			}
		}
		return best;
	}

	garrison(unit, holder, free, value, urgency)
	{
		free.set(holder.id, free.get(holder.id) - 1);
		return {
			"source": "defense",
			"action": { "type": "garrison", "unit": unit.id, "target": holder.id },
			"claims": { "workers": [unit.id] },
			"value": value,
			"urgency": urgency
		};
	}

	approaching(world)
	{
		const territory = world.grids.territory;
		const player = world.player;
		const sentinels = world.fighters.filter(fighter => territoryAt(territory, fighter.position[0], fighter.position[1]).owner === player);
		const limit = WARNING_RADIUS * WARNING_RADIUS;
		const inside = new Set(world.threats.map(threat => threat.id));
		return world.enemyFighters.filter(enemy => !inside.has(enemy.id) && !WORKING_STATES.some(state => enemy.state.includes(state)) &&
			sentinels.some(fighter => squareDistance(fighter.position, enemy.position) <= limit));
	}

	hostileGroup(world)
	{
		const limit = APPROACH_RADIUS * APPROACH_RADIUS;
		const ids = new Set(this.hostiles.map(threat => threat.id));
		return this.foes.filter(enemy => ids.has(enemy.id) ||
			this.hostiles.some(threat => squareDistance(threat.position, enemy.position) <= limit));
	}

	order(fighter, action, priorities, urgency)
	{
		return {
			"source": "defense",
			"action": Object.assign({ "unit": fighter.id }, action),
			"claims": { "workers": [fighter.id] },
			"value": priorities.values.defend,
			"urgency": urgency || 1
		};
	}

	engageRequests(world, priorities, free)
	{
		const group = this.hostileGroup(world);
		const centre = centroid(group.length ? group : this.hostiles);
		const near = world.fighters
			.map(fighter => ({ fighter, "distance": this.nearestThreat(world, fighter.position).distance }))
			.filter(entry => entry.distance <= ENGAGE_RADIUS)
			.sort((a, b) => a.distance - b.distance || a.fighter.id - b.fighter.id);
		const cover = coveringHolders(world.holders, centre, COVER_MARGIN);
		this.ratio = balance(this.catalog, near.map(entry => entry.fighter), group, cover);
		this.engaged = this.engaged ? this.ratio >= ENGAGE_EXIT : this.ratio >= ENGAGE_ENTER;
		return this.engaged ? this.respond(world, priorities, free, near, group, cover) : this.fallBack(world, priorities, free, near, centre);
	}

	respond(world, priorities, free, near, group, cover)
	{
		const ordered = near.filter(entry => entry.fighter.state.includes("COMBAT")).concat(near.filter(entry => !entry.fighter.state.includes("COMBAT")))
			.map(entry => entry.fighter);
		let enough = ordered.length;
		if (enough > 1 && balance(this.catalog, ordered, group, cover) >= RESPONSE_MARGIN)
		{
			let short = 0;
			while (enough - short > 1)
			{
				const middle = Math.floor((short + enough) / 2);
				if (balance(this.catalog, ordered.slice(0, middle), group, cover) >= RESPONSE_MARGIN)
					enough = middle;
				else
					short = middle;
			}
		}
		return this.fight(world, priorities, free, ordered.slice(0, enough));
	}

	fight(world, priorities, free, units)
	{
		const limit = BATTLE_RADIUS * BATTLE_RADIUS;
		const enemies = this.foes.filter(enemy => units.some(unit => squareDistance(unit.position, enemy.position) <= limit));
		const home = world.centres[0];
		const retreat = unit => {
			const holder = this.nearestHolder(world, unit, free, candidate => candidate.heal > 0, RETREAT_RADIUS);
			if (holder)
			{
				free.set(holder.id, free.get(holder.id) - 1);
				return { "type": "garrison", "target": holder.id };
			}
			return home ? { "type": "walk", "x": home.position[0], "z": home.position[1] } : { "type": "hold" };
		};
		const actions = skirmish(this.catalog, units, enemies, retreat);
		const requests = [];
		for (const unit of units)
		{
			let action = actions.get(unit.id);
			if (!action)
			{
				const { threat } = this.nearestThreat(world, unit.position);
				action = unit.state.includes("COMBAT") || !threat ? { "type": "hold" } : { "type": "attack", "target": threat.id };
			}
			requests.push(this.order(unit, action, priorities));
		}
		return requests;
	}

	fallBack(world, priorities, free, near, centre)
	{
		const requests = [];
		const cover = this.nearestCover(world, centre) || world.centres[0];
		if (!cover)
			return requests;
		const reach = (cover.range || COVER_RADIUS) + COVER_MARGIN;
		const slots = this.battleLine(cover, centre, near.map(entry => entry.fighter));
		const defenders = [];
		const { threat } = this.nearestThreat(world, cover.position);
		const contact = !!threat && squareDistance(threat.position, cover.position) <= reach * reach;
		for (const { fighter } of near)
		{
			if (this.outnumbered)
			{
				const holder = this.nearestHolder(world, fighter, free,
					candidate => candidate.arrows && this.nearestThreat(world, candidate.position).distance <= COVER_RADIUS, ENGAGE_RADIUS);
				if (holder)
				{
					requests.push(this.garrison(fighter, holder, free, priorities.values.defend, 1));
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
			if (squareDistance(fighter.position, slot) <= SLOT_TOLERANCE * SLOT_TOLERANCE || fighter.state.includes("WALKING"))
			{
				requests.push(this.order(fighter, { "type": "hold" }, priorities));
				continue;
			}
			requests.push(this.order(fighter, { "type": "walk", "x": slot[0], "z": slot[1] }, priorities));
		}
		return requests.concat(this.fight(world, priorities, free, defenders));
	}

	battleLine(cover, centre, fighters)
	{
		let dx = centre[0] - cover.position[0];
		let dz = centre[1] - cover.position[1];
		const length = Math.sqrt(dx * dx + dz * dz) || 1;
		dx /= length;
		dz /= length;
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
		let best = null;
		let bestDistance = Infinity;
		for (const holder of world.holders)
		{
			if (!holder.arrows)
				continue;
			const distance = squareDistance(holder.position, position);
			if (distance < bestDistance || (distance === bestDistance && holder.id < best.id))
			{
				best = holder;
				bestDistance = distance;
			}
		}
		return best;
	}

	shelterRequests(world, priorities, free)
	{
		const requests = [];
		const unarmed = holder => !holder.arrows;
		const any = () => true;
		for (const worker of world.workers)
		{
			if (worker.soldier || worker.state.includes("GARRISON"))
				continue;
			const { distance } = this.nearestThreat(world, worker.position);
			if (distance > DANGER_RADIUS)
				continue;
			const holder = this.outnumbered && this.nearestHolder(world, worker, free, unarmed, SHELTER_RADIUS) ||
				this.nearestHolder(world, worker, free, any, SHELTER_RADIUS);
			if (holder)
				requests.push(this.garrison(worker, holder, free, priorities.values.shelter, 1 + (DANGER_RADIUS - distance) / DANGER_RADIUS));
		}
		return requests;
	}

	unloadRequests(world, priorities)
	{
		const requests = [];
		for (const holder of world.holders)
		{
			if (!holder.garrisoned || holder.forward)
				continue;
			const safe = this.nearestThreat(world, holder.position).distance > SAFE_RADIUS;
			const units = holder.units.filter(id => safe || !this.outnumbered && holder.soldiers.includes(id) && !(holder.heal > 0 && holder.hurt.includes(id)));
			if (units.length)
				requests.push({
					"source": "defense",
					"action": { "type": "unload", "holder": holder.id, "units": units },
					"claims": { "slots": ["garrison-" + holder.id] },
					"value": priorities.values.defend,
					"urgency": 1
				});
		}
		return requests;
	}

	releaseRequests(world, priorities)
	{
		return world.holders
			.filter(holder => holder.garrisoned > 0 && !holder.forward)
			.map(holder => ({
				"source": "defense",
				"action": { "type": "unload-all", "holder": holder.id },
				"claims": { "slots": ["garrison-" + holder.id] },
				"value": priorities.values.shelter,
				"urgency": 1
			}));
	}
}
