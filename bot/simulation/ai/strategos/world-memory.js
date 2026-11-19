import { underFire } from "simulation/ai/strategos/fire.js";
import { distanceBetween, squareDistance } from "simulation/ai/strategos/geometry.js";
import { landRegionNear, territoryAt } from "simulation/ai/strategos/terrain.js";

const SITE_RADIUS = 110;
const SITES_KEPT = 48;
const SITES_EXPOSED = 16;
const WEALTH_CELL = 40;
export const FISH_RADIUS = 160;
const FISH_KEPT = 24;
const GAME_KEPT = 24;
const GAME_RADIUS = 240;
const MUSTER_WINDOW_MS = 120000;
const MUSTER_MIN_S = 30;

export class ResourceIndex
{
	constructor(player, codes)
	{
		this.player = player;
		this.codes = codes;
		this.sites = new Map(codes.map(code => [code, []]));
		this.cursor = 0;
		this.fish = [];
		this.game = [];
		this.schools = Object.freeze([]);
	}

	save()
	{
		return { "sites": this.sites, "cursor": this.cursor, "fish": this.fish, "game": this.game, "schools": this.schools, "wealth": this.wealth };
	}

	restore(data)
	{
		this.sites = data.sites;
		this.cursor = data.cursor;
		this.fish = data.fish;
		this.game = data.game || [];
		this.schools = data.schools;
		this.wealth = data.wealth;
	}

	liveFish(gameState)
	{
		const accessibility = gameState.sharedScript.accessibility;
		const fish = [];
		for (const id of this.fish)
		{
			const ent = gameState.getEntityById(id);
			const amount = ent && ent.resourceSupplyAmount();
			if (!ent || !ent.position() || !(amount > 0))
				continue;
			fish.push(Object.freeze({
				"id": id,
				"position": ent.position(),
				"sea": accessibility.getAccessValue(ent.position(), true),
				"amount": amount,
				"gatherers": ent.resourceSupplyNumGatherers() || 0,
				"capacity": ent.maxGatherers() || 1
			}));
		}
		return Object.freeze(fish);
	}

	liveGame(gameState, enemyStructures)
	{
		const accessibility = gameState.sharedScript.accessibility;
		const territory = gameState.sharedScript.territoryMap;
		const batteries = enemyStructures.filter(structure => structure.fire.arrows);
		const game = [];
		for (const id of this.game)
		{
			const ent = gameState.getEntityById(id);
			if (!ent || !ent.position() || !ent.get("UnitAI") || !(ent.hitpoints() > 0) || !(ent.resourceSupplyAmount() > 0))
				continue;
			const owner = territoryAt(territory, ent.position()[0], ent.position()[1]).owner;
			if (owner !== 0 && owner !== this.player || underFire(batteries, ent.position()))
				continue;
			game.push(Object.freeze({
				"id": id,
				"template": ent.templateName(),
				"kind": ent.resourceSupplyType().generic + "." + ent.resourceSupplyType().specific,
				"position": ent.position(),
				"region": accessibility.getAccessValue(ent.position()),
				"hitpoints": ent.hitpoints(),
				"maxHitpoints": ent.maxHitpoints(),
				"armed": !!ent.get("Attack"),
				"domestic": ent.hasClass("Domestic"),
				"fleeing": (ent.unitAIState() || "").includes("FLEEING"),
				"fighting": (ent.unitAIState() || "").includes("COMBAT"),
				"amount": ent.resourceSupplyAmount(),
				"gatherers": ent.resourceSupplyNumGatherers() || 0,
				"capacity": ent.maxGatherers() || 1
			}));
		}
		return Object.freeze(game);
	}

	refresh(gameState, anchors)
	{
		const code = this.codes[this.cursor % this.codes.length];
		this.cursor += 1;
		const accessibility = gameState.sharedScript.accessibility;
		const points = anchors.filter(anchor => anchor.types.includes(code))
			.map(anchor => ({ "position": anchor.position, "region": landRegionNear(accessibility, anchor.position) }));
		const kept = [];
		const beyond = [];
		const grid = this.grid(gameState);
		const totals = new Float64Array(grid.width * grid.height);
		const weighted = new Float64Array(2 * grid.width * grid.height);
		const byRegion = new Map();
		const limit = SITE_RADIUS * SITE_RADIUS;
		const carcassLimit = GAME_RADIUS * GAME_RADIUS;
		const piers = code === "food" ? anchors.filter(anchor => anchor.shore && anchor.types.includes(code)) : [];
		const fish = [];
		if (code === "food")
		{
			const schools = [];
			for (const ent of gameState.updatingGlobalCollection("strategos-fish",
				{ "func": candidate => candidate.hasClass("SeaCreature") && !!candidate.resourceSupplyMax(), "dynamicProperties": [] },
				gameState.getEntities(0)).values())
			{
				const position = ent.position();
				if (!position)
					continue;
				schools.push(position);
				let nearest = Infinity;
				for (const pier of piers)
					nearest = Math.min(nearest, squareDistance(pier.position, position));
				if (nearest <= FISH_RADIUS * FISH_RADIUS)
					fish.push({ "id": ent.id(), "distance": nearest });
			}
			this.schools = Object.freeze(schools);
		}
		for (const ent of gameState.getResourceSupplies(code).values())
		{
			const owner = ent.owner();
			if (owner !== 0 && owner !== this.player)
				continue;
			const position = ent.position();
			if (!position || ent.hasClass("SeaCreature"))
				continue;
			const amount = ent.resourceSupplyAmount();
			let region = -1;
			if (owner === 0 && isFinite(amount) && amount > 0)
			{
				const i = Math.min(grid.width - 1, Math.max(0, Math.floor(position[0] / grid.cellSize)));
				const j = Math.min(grid.height - 1, Math.max(0, Math.floor(position[1] / grid.cellSize)));
				totals[i + j * grid.width] += amount;
				weighted[2 * (i + j * grid.width)] += amount * position[0];
				weighted[2 * (i + j * grid.width) + 1] += amount * position[1];
				region = accessibility.getAccessValue(position);
				byRegion.set(region, (byRegion.get(region) || 0) + amount);
			}
			if (!points.length)
				continue;
			const reach = code === "food" && !ent.get("UnitAI") && !!ent.get("ResourceSupply/KillBeforeGather") ? carcassLimit : limit;
			let best = Infinity;
			let nearest = Infinity;
			for (const point of points)
			{
				const distance = squareDistance(point.position, position);
				nearest = Math.min(nearest, distance);
				if (distance > reach || distance >= best)
					continue;
				if (region < 0)
					region = accessibility.getAccessValue(position);
				if (region < 2 || point.region < 2 || region === point.region)
					best = distance;
			}
			if (best <= reach)
				kept.push({ "id": ent.id(), "distance": best });
			else
				beyond.push({ "id": ent.id(), "distance": nearest, "position": position });
		}
		grid.totals[code] = totals;
		grid.weighted[code] = weighted;
		grid.regions[code] = byRegion;
		if (code === "food" && points.length)
			this.game = this.nearGame(gameState, points);
		if (code === "food")
			this.fish = fish.sort((a, b) => a.distance - b.distance || a.id - b.id).slice(0, FISH_KEPT).map(entry => entry.id);
		if (!kept.length)
			this.reachable(gameState, beyond, points, kept);
		kept.sort((a, b) => a.distance - b.distance || a.id - b.id);
		this.sites.set(code, kept.slice(0, SITES_KEPT).map(site => site.id));
	}

	nearGame(gameState, points)
	{
		const game = [];
		const limit = GAME_RADIUS * GAME_RADIUS;
		for (const ent of gameState.updatingGlobalCollection("strategos-game", { "func": candidate => candidate.hasClass("Animal") &&
			!candidate.hasClass("SeaCreature") && !!candidate.get("UnitAI") && !!candidate.resourceSupplyMax() &&
			!!candidate.get("ResourceSupply/KillBeforeGather"), "dynamicProperties": [] }, gameState.getEntities(0)).values())
		{
			const position = ent.position();
			if (!position)
				continue;
			let nearest = Infinity;
			for (const point of points)
				nearest = Math.min(nearest, squareDistance(point.position, position));
			if (nearest <= limit)
				game.push({ "id": ent.id(), "distance": nearest });
		}
		return game.sort((a, b) => a.distance - b.distance || a.id - b.id).slice(0, GAME_KEPT).map(entry => entry.id);
	}

	reachable(gameState, beyond, points, kept)
	{
		const accessibility = gameState.sharedScript.accessibility;
		const territory = gameState.sharedScript.territoryMap;
		const regions = new Set(points.map(point => point.region));
		beyond.sort((a, b) => a.distance - b.distance || a.id - b.id);
		for (const supply of beyond)
		{
			const owner = territoryAt(territory, supply.position[0], supply.position[1]).owner;
			if ((owner !== 0 && owner !== this.player) || !regions.has(accessibility.getAccessValue(supply.position)))
				continue;
			kept.push(supply);
			if (kept.length >= SITES_EXPOSED)
				break;
		}
	}

	grid(gameState)
	{
		if (!this.wealth)
		{
			const territory = gameState.sharedScript.territoryMap;
			const size = territory.width * territory.cellSize;
			const cells = Math.ceil(size / WEALTH_CELL);
			this.wealth = { "cellSize": WEALTH_CELL, "width": cells, "height": cells, "totals": {}, "weighted": {}, "regions": {} };
		}
		return this.wealth;
	}

	live(gameState, code, anchors, enemyStructures)
	{
		const batteries = enemyStructures.filter(structure => structure.fire.arrows);
		const points = anchors.filter(anchor => anchor.types.includes(code));
		const sites = [];
		for (const id of this.sites.get(code))
		{
			const ent = gameState.getEntityById(id);
			const amount = ent && ent.resourceSupplyAmount();
			if (!ent || !ent.position() || !(amount > 0))
				continue;
			const position = ent.position();
			if (underFire(batteries, position))
				continue;
			let nearest = Infinity;
			for (const point of points)
				nearest = Math.min(nearest, distanceBetween(point.position, position));
			const type = ent.resourceSupplyType();
			const alive = !!ent.get("UnitAI") && ent.hitpoints() > 0;
			sites.push(Object.freeze({
				"id": id,
				"kind": type.generic + "." + type.specific,
				"position": position,
				"region": gameState.sharedScript.accessibility.getAccessValue(position),
				"amount": amount,
				"gatherers": ent.resourceSupplyNumGatherers() || 0,
				"capacity": ent.maxGatherers() || 1,
				"armed": alive && !!ent.get("Attack"),
				"prey": alive && !ent.hasClass("Domestic"),
				"anchorDistance": nearest
			}));
			if (sites.length >= SITES_EXPOSED)
				break;
		}
		return Object.freeze(sites);
	}
}

const LOSS_MEMORY_S = 120;
const LOSS_KINDS = ["civilian", "soldier", "structure"];
const LOSS_ATTACK_WINDOW = 50;

export class LossIndex
{
	constructor(player)
	{
		this.player = player;
		this.pending = {};
		this.rates = {};
		for (const kind of LOSS_KINDS)
		{
			this.pending[kind] = 0;
			this.rates[kind] = 0;
		}
		this.lastTime = undefined;
		this.turn = 0;
		this.struck = new Map();
	}

	save()
	{
		return { "pending": this.pending, "rates": this.rates, "lastTime": this.lastTime, "turn": this.turn, "struck": this.struck };
	}

	restore(data)
	{
		this.pending = data.pending;
		this.rates = data.rates;
		this.lastTime = data.lastTime;
		this.turn = data.turn;
		this.struck = data.struck;
	}

	kind(ent)
	{
		if (ent.hasClass("Structure"))
			return "structure";
		if (!ent.hasClass("Unit") || ent.hasClass("Animal"))
			return null;
		return ent.hasClass("Soldier") || ent.hasClass("Siege") || ent.hasClass("Warship") ? "soldier" : "civilian";
	}

	record(events, catalog)
	{
		this.turn += 1;
		for (const evt of events && events.Attacked || [])
			this.struck.set(evt.target, this.turn);
		if (this.turn % LOSS_ATTACK_WINDOW === 0)
			for (const [id, turn] of this.struck)
				if (this.turn - turn > LOSS_ATTACK_WINDOW)
					this.struck.delete(id);
		const destroyed = events && events.Destroy || [];
		const taken = events && events.OwnershipChanged || [];
		if (!destroyed.length && !taken.length)
			return;
		const renamed = new Set((events.EntityRenamed || []).map(evt => evt.entity));
		for (const evt of destroyed)
		{
			const ent = evt.entityObj;
			const struck = this.struck.get(evt.entity);
			if (!ent || evt.SuccessfulFoundation || renamed.has(evt.entity) || ent.owner() !== this.player ||
			    ent.foundationProgress() !== undefined || struck === undefined || this.turn - struck > LOSS_ATTACK_WINDOW)
				continue;
			const kind = this.kind(ent);
			if (kind)
				this.pending[kind] += catalog.costSum(ent.templateName());
		}
		for (const evt of taken)
		{
			if (evt.from !== this.player)
				continue;
			const ent = catalog.gameState.getEntityById(evt.entity);
			const kind = ent && this.kind(ent);
			if (kind)
				this.pending[kind] += catalog.costSum(ent.templateName());
		}
	}

	flush(time)
	{
		const seconds = this.lastTime === undefined ? 0 : (time - this.lastTime) / 1000;
		this.lastTime = time;
		if (seconds > 0)
		{
			const blend = 1 - Math.exp(-seconds / LOSS_MEMORY_S);
			for (const kind of LOSS_KINDS)
			{
				this.rates[kind] += blend * (this.pending[kind] / seconds - this.rates[kind]);
				this.pending[kind] = 0;
			}
		}
		return Object.freeze(Object.assign({}, this.rates));
	}
}

const SHORE_SPACING = 12;
const YARD_BLOCKED_MS = 150000;

export class MusterIndex
{
	constructor()
	{
		this.known = null;
		this.since = undefined;
		this.recruits = [];
		this.renamed = new Set();
	}

	save()
	{
		return { "known": this.known, "since": this.since, "recruits": this.recruits, "renamed": this.renamed };
	}

	restore(data)
	{
		this.known = data.known;
		this.since = data.since;
		this.recruits = data.recruits;
		this.renamed = data.renamed;
	}

	record(events)
	{
		for (const evt of events && events.EntityRenamed || [])
			this.renamed.add(evt.newentity);
	}

	observe(time, soldiers)
	{
		const current = new Set();
		for (const soldier of soldiers)
		{
			current.add(soldier.id);
			if (this.known && !this.known.has(soldier.id) && !this.renamed.has(soldier.id))
				this.recruits.push({ "time": time, "template": soldier.template, "owner": soldier.owner });
		}
		this.renamed.clear();
		if (!this.known)
			this.since = time;
		this.known = current;
		this.recruits = this.recruits.filter(recruit => time - recruit.time <= MUSTER_WINDOW_MS);
	}

	rates(time)
	{
		const seconds = Math.min(MUSTER_WINDOW_MS, time - this.since) / 1000;
		if (!(seconds >= MUSTER_MIN_S))
			return Object.freeze([]);
		const groups = new Map();
		for (const recruit of this.recruits)
		{
			const key = recruit.template + "|" + recruit.owner;
			if (!groups.has(key))
				groups.set(key, { "key": key, "template": recruit.template, "owner": recruit.owner, "count": 0 });
			groups.get(key).count += 1;
		}
		return Object.freeze([...groups.values()].sort((a, b) => a.key < b.key ? -1 : 1)
			.map(group => Object.freeze({ "template": group.template, "owner": group.owner, "rate": group.count / seconds })));
	}
}

export class ShoreIndex
{
	constructor()
	{
		this.points = null;
		this.busy = new Map();
		this.blocked = new Set();
	}

	save()
	{
		return { "busy": this.busy, "blocked": this.blocked };
	}

	restore(data)
	{
		this.busy = data.busy;
		this.blocked = data.blocked;
	}

	indexOf(gameState, point)
	{
		return point ? this.all(gameState).indexOf(point) : -1;
	}

	at(gameState, index)
	{
		return index < 0 ? null : this.all(gameState)[index];
	}

	watch(id, queueLength, time)
	{
		if (!queueLength)
			this.busy.delete(id);
		else if (!this.busy.has(id))
			this.busy.set(id, time);
		else if (time - this.busy.get(id) >= YARD_BLOCKED_MS)
			this.blocked.add(id);
		return this.blocked.has(id);
	}

	all(gameState)
	{
		if (this.points)
			return this.points;
		const accessibility = gameState.sharedScript.accessibility;
		const land = accessibility.landPassMap;
		const water = accessibility.navalPassMap;
		const width = accessibility.width;
		const height = accessibility.height;
		const size = accessibility.cellSize;
		const stride = Math.max(1, Math.round(SHORE_SPACING / size));
		const points = [];
		for (let j = stride; j < height - stride; j += stride)
			for (let i = stride; i < width - stride; i += stride)
			{
				const region = land[i + j * width];
				if (region < 2)
					continue;
				for (const [di, dj] of [[stride, 0], [-stride, 0], [0, stride], [0, -stride]])
				{
					const sea = water[i + di + (j + dj) * width];
					if (sea < 2 || land[i + di + (j + dj) * width] === region)
						continue;
					points.push(Object.freeze({
						"land": Object.freeze([(i + 0.5) * size, (j + 0.5) * size]),
						"water": Object.freeze([(i + di + 0.5) * size, (j + dj + 0.5) * size]),
						"region": region,
						"sea": sea
					}));
					break;
				}
			}
		this.points = Object.freeze(points);
		return this.points;
	}
}
