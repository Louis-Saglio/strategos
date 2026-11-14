import { resourcePrices } from "simulation/ai/strategos/valuation.js";
import { squareDistance } from "simulation/ai/strategos/world.js";

const HOME_CALM_THREATS = 3;
const BERTH_REACH = 35;
const BERTH_SPACING = 28;
const BERTH_TIMEOUT_MS = 45000;
const BERTH_SPEED = 8;
const MUSTER_RADIUS = 30;
const QUAY_CLEARANCE = 55;
const SUPPORT_RADIUS = 70;
const SUPPORT_VALUE = 100;
const BERTH_PATIENCE_MS = 30000;
const BERTH_READY_SHARE = 0.85;
const EMBARK_QUORUM = 0.85;
const EMBARK_PATIENCE_MS = 60000;
const EMBARK_PATIENT_SHARE = 0.7;
const EMBARK_TIMEOUT_MS = 120000;
const EMBARK_MIN_SHARE = 0.6;
const SAIL_TIMEOUT_MS = 300000;
const LANDING_RADIUS = 35;
const LANDING_CLEARANCE = 40;
const SAIL_SETTLE_MS = 6000;
const UNLOAD_TIMEOUT_MS = 60000;
const UNLOAD_NUDGE_MS = 12000;
const RETRY_MS = 30000;
const MIN_SETTLERS = 3;
const SETTLER_SHARE = 3;
const MAX_FERRIES = 3;
const CASTAWAY_MIN_AREA = 20000;
const ANCHOR_RINGS = [80, 110, 140, 170, 200];
const ANCHOR_SPACING = 30;
const ANCHOR_CLEARANCE = 16;
const ANCHOR_TOLERANCE = 15;
const ANCHOR_RETRY_MS = 12000;
const REPORT_MS = 60000;
const RAID_CLASSES = { "attack": ["Unit"], "avoid": [] };

export class Naval
{
	constructor(catalog, telemetry)
	{
		this.catalog = catalog;
		this.telemetry = telemetry;
		this.convoys = [];
		this.serial = 0;
		this.tried = new Map();
		this.anchorages = new Map();
		this.stations = new Map();
		this.steady = new Set();
		this.hunted = new Map();
	}

	requests(world, priorities)
	{
		if (!world.centres.length)
			return this.castawayRequests(world, priorities);
		if (!world.fleet.length && !world.docks.length)
			return [];
		const units = this.unitIndex(world);
		const requests = this.fleetRequests(world, priorities).concat(this.fishingRequests(world, priorities));
		this.planSettlement(world, priorities);
		this.planFerry(world, priorities);
		this.planInvasion(world, priorities);
		for (const convoy of this.convoys)
			requests.push(...this.advance(world, priorities, convoy, units));
		this.convoys = this.convoys.filter(convoy => convoy.state !== "done");
		requests.push(...this.strandedRequests(world, priorities));
		const bombarding = this.bombardRequests(world, priorities);
		const hunting = this.huntRequests(world, priorities);
		requests.push(...bombarding, ...hunting, ...this.raidRequests(world, priorities, hunting));
		this.report(world, priorities);
		return requests.concat(this.stationRequests(world, priorities, requests));
	}

	report(world, priorities)
	{
		if (!this.telemetry.due("SEA", world.time, REPORT_MS))
			return;
		const kinds = {};
		for (const ship of world.fleet)
		{
			const kind = ship.fishing ? "fishing" : ship.bombard ? "bombard" : ship.capacity > 0 ? "transport" : ship.warship ? "warship" : "other";
			kinds[kind] = (kinds[kind] || 0) + 1;
		}
		this.telemetry.line("SEA", world.time, {
			"home": world.homeRegion,
			"fleet": kinds,
			"enemyWarships": world.enemyWarships,
			"fish": world.fish.length,
			"docks": world.docks.map(dock => dock.blocked ? -dock.region : dock.region),
			"regions": world.regions.filter(region => region.workers || region.settlers || region.anchors || region.fighters).map(region => ({
				"id": region.id, "area": Math.round(world.regionArea(region.id) / 1000), "workers": region.workers, "idle": region.idle,
				"settlers": region.settlers, "fighters": region.fighters, "anchors": region.anchors, "centres": region.centres,
				"wealth": world.codes.map(code => Math.round(world.regionWealth(region.id, code) / 100))
			})),
			"short": priorities.short,
			"colony": priorities.colony && { "region": priorities.colony.region, "kind": priorities.colony.kind },
			"ferry": priorities.ferry && { "to": priorities.ferry.to, "code": priorities.ferry.code, "count": priorities.ferry.count },
			"convoys": this.convoys.map(convoy => convoy.kind + ":" + convoy.state)
		});
	}

	unitIndex(world)
	{
		const units = new Map();
		for (const list of [world.fighters, world.workers, world.settlers])
			for (const unit of list)
				if (!units.has(unit.id))
					units.set(unit.id, unit);
		return units;
	}

	due(world, key)
	{
		const last = this.tried.get(key);
		if (last !== undefined && world.time - last < RETRY_MS)
			return false;
		this.tried.set(key, world.time);
		return true;
	}

	engaged(id)
	{
		return this.convoys.some(convoy => convoy.ships.includes(id));
	}

	enlisted(id)
	{
		return this.convoys.some(convoy => convoy.party.has(id));
	}

	freeTransports(world, sea, origin)
	{
		return world.ships
			.filter(ship => ship.capacity > 0 && !ship.bombard && !ship.cargo.length && ship.sea === sea && !this.engaged(ship.id))
			.map(ship => ({ ship, "distance": squareDistance(ship.position, origin) }))
			.sort((a, b) => a.distance - b.distance || a.ship.id - b.ship.id)
			.map(entry => entry.ship);
	}

	shoreNear(world, region, sea, position, accept)
	{
		let best = null;
		let nearest = Infinity;
		for (const shore of world.shores)
		{
			if (shore.region !== region || shore.sea !== sea || accept && !accept(shore))
				continue;
			const distance = squareDistance(shore.land, position);
			if (distance < nearest)
			{
				best = shore;
				nearest = distance;
			}
		}
		return best;
	}

	shorePoints(world, region, sea, position, count, accept)
	{
		const candidates = [];
		for (const shore of world.shores)
			if (shore.region === region && shore.sea === sea && (!accept || accept(shore)))
				candidates.push({ shore, "distance": squareDistance(shore.land, position) });
		candidates.sort((a, b) => a.distance - b.distance);
		const points = [];
		for (const { shore } of candidates)
		{
			if (points.length >= count)
				break;
			if (points.every(other => squareDistance(other.water, shore.water) >= BERTH_SPACING * BERTH_SPACING))
				points.push(shore);
		}
		return points;
	}

	remoteShore(world, region, sea)
	{
		const batteries = world.enemyStructures.filter(structure => structure.fire.arrows);
		let best = null;
		let farthest = -1;
		for (const shore of world.shores)
		{
			if (shore.region !== region || shore.sea !== sea)
				continue;
			let nearest = Infinity;
			for (const structure of batteries)
				nearest = Math.min(nearest, squareDistance(structure.position, shore.land));
			if (nearest > farthest)
			{
				best = shore;
				farthest = nearest;
			}
		}
		return best;
	}

	launch(world, kind, ships, party, from, to, quorum, details)
	{
		const clear = shore => world.docks.every(dock => squareDistance(dock.position, shore.water) >= QUAY_CLEARANCE * QUAY_CLEARANCE);
		const apart = this.shorePoints(world, from.region, from.sea, from.position, ships.length, clear);
		const quays = apart.length ? apart : this.shorePoints(world, from.region, from.sea, from.position, ships.length);
		const beaches = this.shorePoints(world, to.region, from.sea, to.position, ships.length, to.accept);
		if (!quays.length || !beaches.length)
			return null;
		const quay = new Map(ships.map((ship, index) => [ship.id, quays[index % quays.length]]));
		const beach = new Map(ships.map((ship, index) => [ship.id, beaches[index % beaches.length]]));
		const room = new Map(ships.map(ship => [ship.id, ship.capacity]));
		const berths = new Map();
		for (const unit of party)
		{
			let best = null;
			let nearest = Infinity;
			for (const ship of ships)
			{
				const distance = squareDistance(quay.get(ship.id).land, unit.position);
				if (room.get(ship.id) > 0 && distance < nearest)
				{
					best = ship;
					nearest = distance;
				}
			}
			if (!best)
				break;
			room.set(best.id, room.get(best.id) - 1);
			berths.set(unit.id, best.id);
		}
		const voyage = Math.max(...ships.map(ship => Math.sqrt(squareDistance(ship.position, quay.get(ship.id).water))));
		const convoy = {
			"id": ++this.serial, "kind": kind, "ships": ships.map(ship => ship.id), "party": new Set(berths.keys()), "berths": berths,
			"quay": quay, "beach": beach, "region": to.region, "quorum": quorum, "state": "berth", "since": world.time,
			"sailed": null, "nudged": 0, "berthBy": world.time + BERTH_TIMEOUT_MS + 1000 * voyage / BERTH_SPEED
		};
		this.convoys.push(convoy);
		this.telemetry.line("NAVAL", world.time, Object.assign({
			"convoy": convoy.id, "kind": kind, "state": "berth", "ships": ships.length, "party": convoy.party.size,
			"to": to.region, "landing": beaches[0].land.map(Math.round)
		}, details || {}));
		return convoy;
	}

	move(world, convoy, state, details)
	{
		convoy.state = state;
		convoy.since = world.time;
		this.telemetry.line("NAVAL", world.time, Object.assign({ "convoy": convoy.id, "kind": convoy.kind, "state": state, "party": convoy.party.size },
			details || {}));
	}

	planSettlement(world, priorities)
	{
		const colony = priorities.colony;
		if (!colony || this.convoys.some(convoy => convoy.kind === "settle" && convoy.region === colony.region) ||
		    world.settlers.some(settler => settler.region === colony.region))
			return;
		const dock = world.docks.find(candidate => candidate.region === world.homeRegion && candidate.sea === colony.sea);
		if (!dock)
			return;
		const ship = this.freeTransports(world, colony.sea, dock.position)[0];
		const structure = colony.kind === "centre" ? name => this.catalog.isSettlement(name) :
			name => this.catalog.isShoreStructure(name) && this.catalog.trainsTransports(name);
		const able = world.workers.filter(worker => worker.region === world.homeRegion && !this.enlisted(worker.id) &&
			worker.buildable.some(structure));
		if (!ship || able.length < MIN_SETTLERS || !this.due(world, "settle"))
			return;
		const wanted = Math.max(MIN_SETTLERS, Math.min(colony.kind === "centre" ? priorities.naval.founders : priorities.naval.settlers,
			Math.floor(able.length / SETTLER_SHARE)));
		const party = able
			.map(worker => ({ worker, "distance": squareDistance(worker.position, dock.position) }))
			.sort((a, b) => (b.worker.soldier ? 1 : 0) - (a.worker.soldier ? 1 : 0) || a.distance - b.distance || a.worker.id - b.worker.id)
			.slice(0, Math.min(ship.capacity, wanted))
			.map(entry => entry.worker);
		this.launch(world, "settle", [ship], party, { "region": world.homeRegion, "sea": colony.sea, "position": dock.position },
			{ "region": colony.region, "position": colony.position }, MIN_SETTLERS, { "build": colony.kind });
	}

	planFerry(world, priorities)
	{
		const ferry = priorities.ferry;
		if (!ferry || this.convoys.filter(convoy => convoy.kind === "ferry").length >= MAX_FERRIES)
			return;
		const dock = world.docks.find(candidate => candidate.region === ferry.from && candidate.sea === ferry.sea);
		const arrival = world.docks.find(candidate => candidate.region === ferry.to);
		if (!dock || !arrival)
			return;
		const ship = this.freeTransports(world, ferry.sea, dock.position)[0];
		if (!ship || !this.due(world, "ferry"))
			return;
		const rank = worker => worker.idle ? -1 : ferry.excess.indexOf(worker.gathering);
		const able = world.workers.filter(worker => worker.region === ferry.from && !this.enlisted(worker.id) &&
			worker.gatherTypes.includes(ferry.code) && (worker.idle || worker.gathering && worker.gathering !== ferry.code) &&
			!worker.state.includes("REPAIR") && !worker.state.includes("COMBAT"));
		const party = able
			.map(worker => ({ worker, "rank": rank(worker), "distance": squareDistance(worker.position, dock.position) }))
			.filter(entry => entry.rank >= -1)
			.sort((a, b) => a.rank - b.rank || (a.worker.soldier ? 1 : 0) - (b.worker.soldier ? 1 : 0) || a.distance - b.distance ||
				a.worker.id - b.worker.id)
			.slice(0, Math.min(ship.capacity, ferry.count))
			.map(entry => entry.worker);
		if (party.length < MIN_SETTLERS)
			return;
		this.launch(world, "ferry", [ship], party, { "region": ferry.from, "sea": ferry.sea, "position": dock.position },
			{ "region": ferry.to, "position": arrival.position }, MIN_SETTLERS, { "code": ferry.code });
	}

	objectiveFrom(world, region, from)
	{
		let best = null;
		for (const target of world.enemyTargets)
		{
			if (target.region === region)
				return null;
			const sea = (world.regionLinks[region] || []).find(candidate => (world.regionLinks[candidate] || []).includes(target.region));
			if (sea === undefined)
				continue;
			const distance = squareDistance(target.position, from);
			if (!best || distance < best.distance || distance === best.distance && target.id < best.id)
				best = { "id": target.id, "region": target.region, "sea": sea, "position": target.position, "distance": distance };
		}
		return best;
	}

	planInvasion(world, priorities)
	{
		if (this.convoys.some(convoy => convoy.kind === "invade") || world.threats.length >= HOME_CALM_THREATS ||
		    world.ships.length < world.enemyWarships || !world.enemyTargets.length)
			return;
		const offense = priorities.offense;
		const plan = priorities.naval;
		const groups = new Map();
		for (const fighter of world.fighters)
		{
			if (fighter.state.includes("COMBAT") || this.enlisted(fighter.id))
				continue;
			if (!groups.has(fighter.region))
				groups.set(fighter.region, []);
			groups.get(fighter.region).push(fighter);
		}
		const present = new Map(world.regions.map(region => [region.id, region]));
		const order = [...groups.keys()].sort((a, b) =>
			(b === world.homeRegion) - (a === world.homeRegion) || groups.get(b).length - groups.get(a).length || a - b);
		for (const region of order)
		{
			const group = groups.get(region);
			if (present.has(region) && present.get(region).enemyStructures > 0)
				continue;
			const centre = [0, 0];
			for (const fighter of group)
			{
				centre[0] += fighter.position[0] / group.length;
				centre[1] += fighter.position[1] / group.length;
			}
			const objective = this.objectiveFrom(world, region, region === world.homeRegion ? world.centres[0].position : centre);
			if (!objective)
				continue;
			const landed = present.has(objective.region) ? present.get(objective.region).fighters : 0;
			const least = landed >= offense.minArmy ? plan.reinforcement : offense.minArmy;
			if (group.length < least || group.length + landed < plan.superiority * world.enemySoldiers)
				continue;
			if (landed < offense.minArmy && group.length < plan.edge * world.enemySoldiers &&
			    group.length < plan.massShare * world.populationMax)
				continue;
			const dock = world.docks.find(candidate => candidate.region === region && candidate.sea === objective.sea);
			const beach = dock ? null : this.shoreNear(world, region, objective.sea, centre);
			if (!dock && !beach)
				continue;
			const origin = dock ? dock.position : beach.water;
			const ships = this.freeTransports(world, objective.sea, origin).slice(priorities.colony || priorities.ferry ? 1 : 0);
			const capacity = ships.reduce((sum, ship) => sum + ship.capacity, 0);
			if (capacity < Math.min(least, group.length) || landed < offense.minArmy &&
			    capacity < plan.carried * Math.min(group.length, plan.maxCapacity))
				continue;
			if (!this.due(world, "invade"))
				return;
			const sheltered = shore => !world.enemyStructures.some(structure => {
				if (!structure.fire.arrows)
					return false;
				const reach = structure.range + LANDING_CLEARANCE;
				return squareDistance(structure.position, shore.land) <= reach * reach;
			});
			const party = group
				.map(fighter => ({ fighter, "distance": squareDistance(fighter.position, origin) }))
				.sort((a, b) => a.distance - b.distance || a.fighter.id - b.fighter.id)
				.slice(0, capacity)
				.map(entry => entry.fighter);
			const used = [];
			let room = 0;
			for (const ship of ships)
			{
				if (room >= party.length)
					break;
				used.push(ship);
				room += ship.capacity;
			}
			const covered = !this.shorePoints(world, objective.region, objective.sea, objective.position, 1, sheltered).length;
			const remote = covered ? this.remoteShore(world, objective.region, objective.sea) : null;
			const to = remote ? { "region": objective.region, "position": remote.land } :
				{ "region": objective.region, "position": objective.position, "accept": sheltered };
			if (!this.launch(world, "invade", used, party, { "region": region, "sea": objective.sea, "position": origin }, to,
				EMBARK_MIN_SHARE * party.length, { "from": region, "landed": landed, "enemySoldiers": world.enemySoldiers, "covered": covered }))
				this.telemetry.line("NAVAL", world.time, { "noLanding": objective.region });
			return;
		}
	}

	huntRequests(world, priorities)
	{
		if (!world.enemyShips.length)
			return [];
		const requests = [];
		const seas = new Map();
		for (const ship of world.fleet)
		{
			if (!ship.warship || ship.bombard || ship.cargo.length || this.engaged(ship.id))
				continue;
			if (!seas.has(ship.sea))
				seas.set(ship.sea, []);
			seas.get(ship.sea).push(ship);
		}
		for (const [sea, hunters] of seas)
		{
			const prey = world.enemyShips.filter(enemy => enemy.sea === sea && !world.batteries.some(structure =>
				squareDistance(structure.position, enemy.position) <= structure.range * structure.range));
			if (!prey.length || hunters.length < priorities.naval.huntSuperiority * prey.filter(enemy => enemy.warship).length)
				continue;
			const centre = [0, 0];
			for (const ship of hunters)
			{
				centre[0] += ship.position[0] / hunters.length;
				centre[1] += ship.position[1] / hunters.length;
			}
			const kept = prey.find(enemy => enemy.id === this.hunted.get(sea));
			const target = kept && (kept.warship || !prey.some(enemy => enemy.warship)) ? kept : prey
				.map(enemy => ({ enemy, "distance": squareDistance(enemy.position, centre) }))
				.sort((a, b) => (b.enemy.warship ? 1 : 0) - (a.enemy.warship ? 1 : 0) || a.distance - b.distance || a.enemy.id - b.enemy.id)[0].enemy;
			if (this.hunted.get(sea) !== target.id)
			{
				this.hunted.set(sea, target.id);
				this.telemetry.line("NAVAL", world.time, { "hunt": target.id, "warship": target.warship, "hunters": hunters.length, "prey": prey.length });
			}
			for (const ship of hunters)
				requests.push(ship.target === target.id ? this.order(ship.id, { "type": "hold" }, priorities) :
					this.order(ship.id, { "type": "attack", "target": target.id }, priorities));
		}
		return requests;
	}

	advance(world, priorities, convoy, units)
	{
		const afloat = new Map(world.fleet.map(ship => [ship.id, ship]));
		const ships = convoy.ships.map(id => afloat.get(id)).filter(ship => !!ship);
		convoy.ships = ships.map(ship => ship.id);
		if (!ships.length)
		{
			this.move(world, convoy, "done", { "reason": "sunk" });
			return [];
		}
		if (convoy.state === "berth")
			return this.berthRequests(world, priorities, convoy, ships, units);
		if (convoy.state === "embark")
			return this.embarkRequests(world, priorities, convoy, ships, units);
		if (convoy.state === "sail")
			return this.sailRequests(world, priorities, convoy, ships);
		return this.landRequests(world, priorities, convoy, ships);
	}

	berthRequests(world, priorities, convoy, ships, units)
	{
		const limit = BERTH_REACH * BERTH_REACH;
		const settled = convoy.called !== undefined && world.time - convoy.called >= SAIL_SETTLE_MS;
		const away = ships.filter(ship => squareDistance(ship.position, convoy.quay.get(ship.id).water) > limit && !(settled && ship.idle));
		if (convoy.called === undefined)
			convoy.called = world.time;
		const late = world.time >= convoy.berthBy;
		const patient = world.time - convoy.since >= BERTH_PATIENCE_MS && ships.length - away.length >= BERTH_READY_SHARE * ships.length;
		if (!away.length || (late || patient) && away.length < ships.length)
		{
			const kept = new Set(ships.filter(ship => !away.includes(ship)).map(ship => ship.id));
			convoy.ships = convoy.ships.filter(id => kept.has(id));
			for (const [unit, ship] of convoy.berths)
				if (!kept.has(ship))
				{
					convoy.berths.delete(unit);
					convoy.party.delete(unit);
				}
			convoy.quorum = Math.min(convoy.quorum, Math.max(MIN_SETTLERS, EMBARK_MIN_SHARE * convoy.party.size));
			this.move(world, convoy, "embark", { "ships": convoy.ships.length });
			return this.embarkRequests(world, priorities, convoy, ships.filter(ship => kept.has(ship.id)), units);
		}
		if (late)
		{
			this.move(world, convoy, "done", { "reason": "berth" });
			return [];
		}
		const requests = ships.map(ship => away.includes(ship) && ship.idle ?
			this.order(ship.id, { "type": "walk", "x": convoy.quay.get(ship.id).land[0], "z": convoy.quay.get(ship.id).land[1] }, priorities) :
			this.order(ship.id, { "type": "hold" }, priorities));
		for (const [id, ship] of convoy.berths)
		{
			const unit = units.get(id);
			const quay = convoy.quay.get(ship);
			if (!unit || !quay)
				continue;
			requests.push(squareDistance(unit.position, quay.land) <= MUSTER_RADIUS * MUSTER_RADIUS || unit.state.includes("WALKING") ?
				this.order(id, { "type": "hold" }, priorities) :
				this.order(id, { "type": "walk", "x": quay.land[0], "z": quay.land[1] }, priorities));
		}
		return requests;
	}

	aboard(convoy, ships)
	{
		const aboard = new Set();
		for (const ship of ships)
			for (const id of ship.cargo)
				if (convoy.party.has(id))
					aboard.add(id);
		return aboard;
	}

	embarkRequests(world, priorities, convoy, ships, units)
	{
		const aboard = this.aboard(convoy, ships);
		const ashore = [...convoy.party].filter(id => units.has(id)).map(id => units.get(id));
		convoy.party = new Set([...aboard, ...ashore.map(unit => unit.id)]);
		const late = world.time - convoy.since >= EMBARK_TIMEOUT_MS;
		const patient = world.time - convoy.since >= EMBARK_PATIENCE_MS && aboard.size >= EMBARK_PATIENT_SHARE * convoy.party.size;
		if (convoy.party.size && aboard.size >= Math.floor(EMBARK_QUORUM * convoy.party.size) || patient && aboard.size >= convoy.quorum ||
		    late && aboard.size >= convoy.quorum)
		{
			convoy.party = aboard;
			convoy.sailed = null;
			this.move(world, convoy, "sail", { "aboard": aboard.size });
			return this.sailRequests(world, priorities, convoy, ships);
		}
		if (late || !convoy.party.size)
		{
			this.move(world, convoy, "done", { "reason": "embark", "aboard": aboard.size });
			return this.disembark(ships.filter(ship => ship.cargo.length), priorities);
		}
		const present = new Set(ships.map(ship => ship.id));
		const requests = ships.map(ship => this.order(ship.id, { "type": "hold" }, priorities));
		for (const unit of ashore)
		{
			const ship = convoy.berths.get(unit.id);
			if (!present.has(ship))
				continue;
			requests.push(unit.state.includes("GARRISON") && unit.target === ship ?
				this.order(unit.id, { "type": "hold" }, priorities) :
				this.order(unit.id, { "type": "garrison", "target": ship }, priorities));
		}
		return requests;
	}

	sailRequests(world, priorities, convoy, ships)
	{
		const loaded = ships.filter(ship => ship.cargo.some(id => convoy.party.has(id)));
		const limit = LANDING_RADIUS * LANDING_RADIUS;
		const waiting = loaded.filter(ship => squareDistance(ship.position, convoy.beach.get(ship.id).water) > limit);
		const settled = convoy.sailed !== null && world.time - convoy.sailed >= SAIL_SETTLE_MS && waiting.every(ship => ship.idle);
		if (!waiting.length || settled || world.time - convoy.since >= SAIL_TIMEOUT_MS)
		{
			this.move(world, convoy, "land", { "ships": loaded.length, "short": waiting.length });
			convoy.nudged = world.time;
			return this.landRequests(world, priorities, convoy, ships);
		}
		if (convoy.sailed !== null)
			return loaded.map(ship => this.order(ship.id, { "type": "hold" }, priorities));
		convoy.sailed = world.time;
		return loaded.map(ship => this.order(ship.id,
			{ "type": "walk", "x": convoy.beach.get(ship.id).land[0], "z": convoy.beach.get(ship.id).land[1] }, priorities));
	}

	landRequests(world, priorities, convoy, ships)
	{
		const loaded = ships.filter(ship => ship.cargo.some(id => convoy.party.has(id)));
		if (!loaded.length || world.time - convoy.since >= UNLOAD_TIMEOUT_MS)
		{
			this.move(world, convoy, "done", {
				"reason": loaded.length ? "stuck" : "landed", "left": loaded.reduce((sum, ship) => sum + ship.cargo.length, 0)
			});
			return this.disembark(loaded, priorities);
		}
		const requests = this.disembark(loaded, priorities);
		if (world.time - convoy.nudged >= UNLOAD_NUDGE_MS)
		{
			convoy.nudged = world.time;
			for (const ship of loaded)
				requests.push(this.order(ship.id,
					{ "type": "walk", "x": convoy.beach.get(ship.id).land[0], "z": convoy.beach.get(ship.id).land[1] }, priorities));
		}
		else
			for (const ship of loaded)
				requests.push(this.order(ship.id, { "type": "hold" }, priorities));
		return requests;
	}

	order(unit, action, priorities)
	{
		return {
			"source": "naval",
			"action": Object.assign({ "unit": unit }, action),
			"claims": { "workers": [unit] },
			"value": priorities.values.ferry,
			"urgency": 1
		};
	}

	disembark(ships, priorities)
	{
		return ships.map(ship => ({
			"source": "naval",
			"action": { "type": "unload-all", "holder": ship.id },
			"claims": { "slots": ["garrison-" + ship.id] },
			"value": priorities.values.ferry,
			"urgency": 1
		}));
	}

	fleetRequests(world, priorities)
	{
		const plan = priorities.naval;
		const capacity = world.ships.reduce((sum, ship) => sum + ship.capacity, 0);
		const carries = name => this.catalog.transportCapacity(name) > 0 && !this.catalog.isBombardShip(name);
		const dead = new Set(world.docks.filter(dock => dock.blocked).map(dock => dock.id));
		const berth = new Map(world.docks.map(dock => [dock.id, dock.position]));
		const boats = world.fleet.filter(ship => ship.fishing);
		const crowd = trainer => berth.has(trainer.id) ? boats.filter(boat =>
			squareDistance(boat.position, berth.get(trainer.id)) <= plan.yardCrowd * plan.yardCrowd).length : 0;
		const yards = world.trainers.filter(trainer => !dead.has(trainer.id) && trainer.trainable.some(carries))
			.map(trainer => ({ trainer, "crowd": crowd(trainer) }))
			.sort((a, b) => a.crowd - b.crowd || a.trainer.id - b.trainer.id)
			.map(entry => entry.trainer);
		if (!yards.length)
			return [];
		const prices = resourcePrices(world);
		const priced = name => {
			const cost = this.catalog.cost(name);
			return world.codes.reduce((sum, code) => sum + prices[code] * (cost[code] || 0), 0);
		};
		const worth = name => this.catalog.transportCapacity(name) / Math.max(1, priced(name));
		const payable = name => {
			const cost = this.catalog.cost(name);
			return world.codes.every(code => (cost[code] || 0) <= world.resources[code]) ? 1 : 0;
		};
		const template = yards[0].trainable.filter(carries)
			.sort((a, b) => payable(b) - payable(a) || worth(b) - worth(a) || (a < b ? -1 : 1))[0];
		const requests = [];
		const missing = Math.max(
			Math.ceil((plan.maxCapacity - capacity) / this.catalog.transportCapacity(template)),
			Math.ceil(plan.seaSuperiority * world.enemyWarships) - world.ships.length);
		if (world.crossing && world.populationMax - world.population - world.queuedPopulation <= missing)
			for (let berth = 0; berth < missing; ++berth)
				requests.push({
					"source": "naval",
					"action": { "type": "hold" },
					"claims": { "population": this.catalog.population(template) },
					"value": priorities.values.transport,
					"urgency": 1
				});
		const wanted = world.crossing ? Math.min(plan.maxCapacity,
			Math.max(priorities.offense.minArmy, plan.maxCapacity * world.population / Math.max(1, world.populationMax))) :
			priorities.colony || priorities.ferry ? 1 : 0;
		const squadron = world.crossing ? Math.min(plan.fleetMax, Math.floor(world.fighters.length / plan.fightersPerShip)) : 0;
		const army = world.fighters.filter(fighter => fighter.region === world.homeRegion).length;
		const waiting = !!world.crossing && army >= priorities.offense.minArmy && army >= plan.superiority * world.enemySoldiers &&
			capacity < plan.carried * Math.min(army, plan.maxCapacity);
		const pressed = waiting || priorities.short.length && !world.ships.length || world.enemyWarships > 0 &&
			world.ships.length < plan.seaSuperiority * world.enemyWarships;
		const yard = yards.find(trainer => trainer.queueLength === 0);
		const building = yards.filter(trainer => trainer.queueLength > 0).length;
		const short = Math.max(Math.ceil((wanted - capacity) / this.catalog.transportCapacity(template)),
			Math.ceil(plan.seaSuperiority * world.enemyWarships) - world.ships.length, squadron - world.ships.length);
		const bombards = name => this.catalog.isBombardShip(name);
		const guns = world.fleet.filter(ship => ship.bombard).length;
		const arsenal = world.trainers.find(trainer => !dead.has(trainer.id) && trainer.queueLength === 0 && trainer.trainable.some(bombards));
		if (arsenal && world.crossing && guns + building < plan.bombard.ships && world.ships.length >= plan.raid.minShips)
		{
			const gun = arsenal.trainable.filter(bombards).sort((a, b) => this.catalog.costSum(a) - this.catalog.costSum(b) || (a < b ? -1 : 1))[0];
			if (payable(gun))
				requests.push({
					"source": "naval",
					"action": { "type": "train", "trainer": arsenal.id, "template": gun, "count": 1 },
					"claims": { "resources": this.catalog.cost(gun), "population": this.catalog.population(gun), "slots": [arsenal.id] },
					"value": priorities.values.siege,
					"urgency": 1
				});
		}
		if (!yard || building >= short)
			return requests;
		requests.unshift({
			"source": "naval",
			"action": { "type": "train", "trainer": yard.id, "template": template, "count": 1 },
			"claims": { "resources": this.catalog.cost(template), "population": this.catalog.population(template), "slots": [yard.id] },
			"value": priorities.values.transport,
			"urgency": pressed ? priorities.values.ferry / priorities.values.transport : 1,
			"tier": pressed ? "production" : "investment",
			"reserve": true
		});
		return requests;
	}

	firingPoint(world, plan, structure, sea, range, from)
	{
		let best = null;
		let nearest = Infinity;
		for (let k = 0; k < plan.bearings; ++k)
		{
			const angle = 2 * Math.PI * k / plan.bearings;
			const point = [structure.position[0] + (range - plan.margin) * Math.cos(angle),
				structure.position[1] + (range - plan.margin) * Math.sin(angle)];
			if (!world.openWater(point, sea, plan.searoom) || world.batteries.some(battery =>
				squareDistance(battery.position, point) <= (battery.range + plan.clearance) * (battery.range + plan.clearance)))
				continue;
			const distance = squareDistance(point, from);
			if (distance < nearest)
			{
				best = point;
				nearest = distance;
			}
		}
		return best;
	}

	bombardRequests(world, priorities)
	{
		const plan = priorities.naval.bombard;
		const guns = world.fleet.filter(ship => ship.bombard && !ship.cargo.length && !this.engaged(ship.id));
		if (!guns.length || !world.enemyStructures.length)
		{
			this.bombardment = null;
			return [];
		}
		const sea = guns[0].sea;
		const battery = guns.filter(ship => ship.sea === sea);
		const range = Math.min(...battery.map(ship => this.catalog.combat(ship.template).range));
		const centre = [0, 0];
		for (const ship of battery)
		{
			centre[0] += ship.position[0] / battery.length;
			centre[1] += ship.position[1] / battery.length;
		}
		const standing = this.bombardment && world.enemyStructures.some(structure => structure.id === this.bombardment.target);
		if (!standing && (!this.bombardment || this.bombardment.target !== null || world.time - this.bombardment.since >= plan.retargetMs))
		{
			const ranked = world.enemyStructures.slice().sort((a, b) =>
				(b.fire.arrows > 0 ? 1 : 0) - (a.fire.arrows > 0 ? 1 : 0) || (b.centre ? 1 : 0) - (a.centre ? 1 : 0) ||
				squareDistance(a.position, centre) - squareDistance(b.position, centre) || a.id - b.id);
			this.bombardment = { "target": null, "point": null, "since": world.time };
			for (const structure of ranked.slice(0, plan.tried))
			{
				const point = this.firingPoint(world, plan, structure, sea, range, centre);
				if (!point)
					continue;
				this.bombardment = { "target": structure.id, "point": point, "since": world.time };
				this.telemetry.line("NAVAL", world.time, {
					"bombard": structure.id, "centre": structure.centre, "arrows": structure.fire.arrows, "ships": battery.length,
					"from": point.map(Math.round)
				});
				break;
			}
		}
		if (!this.bombardment || this.bombardment.target === null)
			return [];
		const point = this.bombardment.point;
		const target = this.bombardment.target;
		return battery.map(ship => {
			if (ship.target === target)
				return this.order(ship.id, { "type": "hold" }, priorities);
			if (squareDistance(ship.position, point) <= plan.arrive * plan.arrive)
				return this.order(ship.id, { "type": "attack", "target": target }, priorities);
			return ship.idle ? this.order(ship.id, { "type": "walk", "x": point[0], "z": point[1] }, priorities) :
				this.order(ship.id, { "type": "hold" }, priorities);
		});
	}

	raidTarget(world, priorities, sea, region, power)
	{
		const plan = priorities.naval.raid;
		const batteries = world.enemyStructures.filter(structure => structure.fire.arrows);
		const prey = world.enemyFighters.filter(enemy => world.regionOf(enemy.position) === region);
		if (prey.length < plan.minPrey)
			return null;
		const landed = world.fighters.filter(fighter => fighter.region === region);
		let best = null;
		let bestCount = plan.minPrey - 1;
		for (const shore of world.shores)
		{
			if (shore.region !== region || shore.sea !== sea)
				continue;
			if (batteries.some(structure => squareDistance(structure.position, shore.water) <=
				(structure.range + plan.clearance) * (structure.range + plan.clearance)))
				continue;
			let count = 0;
			let archers = 0;
			for (const enemy of prey)
				if (squareDistance(enemy.position, shore.water) <= plan.reach * plan.reach)
				{
					count += 1;
					if (this.catalog.combat(enemy.template).ranged)
						archers += 1;
				}
			if (count <= bestCount)
				continue;
			let friends = 0;
			for (const fighter of landed)
				if (squareDistance(fighter.position, shore.water) <= SUPPORT_RADIUS * SUPPORT_RADIUS)
					friends += 1;
			if (archers <= plan.preyPerValue * (power + SUPPORT_VALUE * friends))
			{
				best = shore;
				bestCount = count;
			}
		}
		return best && { "shore": best, "prey": bestCount };
	}

	raidRequests(world, priorities, hunting)
	{
		const plan = priorities.naval.raid;
		const objective = world.centres.length ? this.objectiveFrom(world, world.homeRegion, world.centres[0].position) : null;
		if (!objective)
			return [];
		const claimed = new Set();
		for (const request of hunting)
			for (const id of request.claims.workers || [])
				claimed.add(id);
		const raiders = world.fleet.filter(ship => ship.warship && !ship.bombard && !ship.cargo.length && ship.sea === objective.sea &&
			!this.engaged(ship.id) && !claimed.has(ship.id) && ship.hitpoints >= plan.hull * ship.maxHitpoints);
		if (raiders.length < plan.minShips)
		{
			this.raid = null;
			return [];
		}
		if (!this.raid || world.time - this.raid.since >= plan.retargetMs)
		{
			const power = raiders.reduce((sum, ship) => sum + this.catalog.costSum(ship.template) * ship.hitpoints / ship.maxHitpoints, 0);
			const found = this.raidTarget(world, priorities, objective.sea, objective.region, power);
			if (found && (!this.raid || this.raid.shore !== found.shore))
				this.telemetry.line("NAVAL", world.time, {
					"raid": found.shore.water.map(Math.round), "ships": raiders.length, "prey": found.prey
				});
			this.raid = found ? { "shore": found.shore, "since": world.time } : null;
		}
		if (!this.raid)
			return [];
		const point = this.raid.shore.water;
		const near = plan.reach * plan.reach;
		const posture = [];
		for (const ship of raiders)
			if (!this.steady.has(ship.id))
			{
				this.steady.add(ship.id);
				posture.push({
					"source": "naval",
					"action": { "type": "stance", "unit": ship.id, "name": "standground" },
					"claims": {},
					"value": priorities.values.ferry,
					"urgency": 1
				});
			}
		return posture.concat(raiders.map(ship => squareDistance(ship.position, point) <= near || !ship.idle ?
			this.order(ship.id, { "type": "hold" }, priorities) :
			this.order(ship.id, { "type": "attack-walk", "x": point[0], "z": point[1], "targetClasses": RAID_CLASSES }, priorities)));
	}

	fishingRequests(world, priorities)
	{
		if (!world.fish.length)
			return [];
		const plan = priorities.naval.fishing;
		const clearance = priorities.naval.fishClearance;
		const requests = [];
		const boats = world.fleet.filter(ship => ship.fishing);
		const hostile = position => world.enemyFighters.some(enemy =>
			squareDistance(enemy.position, position) <= clearance.soldier * clearance.soldier);
		const waters = world.fish.filter(fish =>
			!world.batteries.some(structure => squareDistance(structure.position, fish.position) <=
				(structure.range + clearance.battery) * (structure.range + clearance.battery)) &&
			!world.enemyStructures.some(structure => squareDistance(structure.position, fish.position) <= clearance.structure * clearance.structure) &&
			!hostile(fish.position));
		const slots = waters.reduce((sum, fish) => sum + Math.min(fish.capacity, plan.perFish), 0);
		const fishes = name => this.catalog.isFishingBoat(name);
		const dead = new Set(world.docks.filter(dock => dock.blocked).map(dock => dock.id));
		const yards = world.trainers.filter(trainer => !dead.has(trainer.id) && trainer.trainable.some(fishes));
		const building = yards.filter(trainer => trainer.queueLength > 0).length;
		const yard = yards.find(trainer => trainer.queueLength === 0);
		if (yard && boats.length + building < Math.min(plan.maxBoats, slots))
		{
			const template = yard.trainable.filter(fishes)
				.sort((a, b) => this.catalog.costSum(a) - this.catalog.costSum(b) || (a < b ? -1 : 1))[0];
			requests.push({
				"source": "naval",
				"action": { "type": "train", "trainer": yard.id, "template": template, "count": 1 },
				"claims": { "resources": this.catalog.cost(template), "population": this.catalog.population(template), "slots": [yard.id] },
				"value": priorities.values.fishing,
				"urgency": 1,
				"tier": "production"
			});
		}
		const reserved = new Map();
		for (const boat of boats)
		{
			if (hostile(boat.position))
			{
				let foe = null;
				let closest = Infinity;
				for (const enemy of world.enemyFighters)
				{
					const distance = squareDistance(enemy.position, boat.position);
					if (distance < closest)
					{
						foe = enemy;
						closest = distance;
					}
				}
				const length = Math.sqrt(closest) || 1;
				const away = [boat.position[0] + (boat.position[0] - foe.position[0]) / length * clearance.flight,
					boat.position[1] + (boat.position[1] - foe.position[1]) / length * clearance.flight];
				if (world.openWater(away, boat.sea, clearance.berth))
					requests.push(boat.state.includes("WALKING") ? this.order(boat.id, { "type": "hold" }, priorities) :
						this.order(boat.id, { "type": "walk", "x": away[0], "z": away[1] }, priorities));
				continue;
			}
			if (!boat.idle || boat.gathering)
				continue;
			let best = null;
			let nearest = Infinity;
			for (const fish of waters)
			{
				if (fish.sea !== boat.sea || fish.gatherers + (reserved.get(fish.id) || 0) >= fish.capacity)
					continue;
				const distance = squareDistance(fish.position, boat.position);
				if (distance < nearest)
				{
					best = fish;
					nearest = distance;
				}
			}
			if (!best)
				continue;
			reserved.set(best.id, (reserved.get(best.id) || 0) + 1);
			requests.push({
				"source": "naval",
				"action": { "type": "gather", "worker": boat.id, "target": best.id, "resource": "food" },
				"claims": { "workers": [boat.id] },
				"value": priorities.values.assignIdleWorker,
				"urgency": 1
			});
		}
		return requests;
	}

	castawayRequests(world, priorities)
	{
		const requests = [];
		for (const ship of world.ships)
		{
			if (!ship.cargo.length)
				continue;
			let shore = null;
			let nearest = Infinity;
			for (const candidate of world.shores)
			{
				const distance = squareDistance(candidate.water, ship.position);
				if (distance < nearest && world.regionArea(candidate.region) >= CASTAWAY_MIN_AREA)
				{
					shore = candidate;
					nearest = distance;
				}
			}
			if (!shore)
				continue;
			if (nearest > LANDING_RADIUS * LANDING_RADIUS && ship.idle)
				requests.push(this.order(ship.id, { "type": "walk", "x": shore.land[0], "z": shore.land[1] }, priorities));
			else if (ship.idle)
				requests.push({
					"source": "naval",
					"action": { "type": "unload-all", "holder": ship.id },
					"claims": { "slots": ["garrison-" + ship.id] },
					"value": priorities.values.founding,
					"urgency": 1
				});
		}
		return requests;
	}

	strandedRequests(world, priorities)
	{
		const carrying = world.ships.filter(ship => ship.cargo.length && !this.engaged(ship.id));
		if (!carrying.length || !world.docks.length)
			return [];
		const dock = world.docks[0].position;
		return this.disembark(carrying, priorities).concat(carrying.filter(ship => ship.idle &&
			squareDistance(ship.position, dock) > LANDING_RADIUS * LANDING_RADIUS)
			.map(ship => this.order(ship.id, { "type": "walk", "x": dock[0], "z": dock[1] }, priorities)));
	}

	anchorage(world, dock)
	{
		if (!this.anchorages.has(dock.id))
		{
			const points = [];
			for (const radius of ANCHOR_RINGS)
			{
				const count = Math.floor(2 * Math.PI * radius / ANCHOR_SPACING);
				for (let k = 0; k < count; ++k)
				{
					const angle = 2 * Math.PI * k / count;
					const point = [dock.position[0] + radius * Math.cos(angle), dock.position[1] + radius * Math.sin(angle)];
					if (world.openWater(point, dock.sea, ANCHOR_CLEARANCE))
						points.push(Object.freeze(point));
				}
			}
			this.anchorages.set(dock.id, points);
		}
		return this.anchorages.get(dock.id);
	}

	stationRequests(world, priorities, issued)
	{
		const busy = new Set();
		for (const convoy of this.convoys)
			for (const id of convoy.ships)
				busy.add(id);
		for (const request of issued)
			for (const id of request.claims.workers || [])
				busy.add(id);
		const docks = new Map(world.docks.map(dock => [dock.id, dock]));
		const afloat = new Set(world.fleet.map(ship => ship.id));
		const taken = new Set();
		for (const [id, station] of this.stations)
			if (!afloat.has(id) || !docks.has(station.dock))
				this.stations.delete(id);
			else
				taken.add(station.dock + ":" + station.slot);
		const requests = [];
		for (const ship of world.fleet)
		{
			if (busy.has(ship.id) || ship.cargo.length)
				continue;
			let station = this.stations.get(ship.id);
			if (!station)
			{
				const dock = world.docks
					.filter(candidate => candidate.sea === ship.sea)
					.map(candidate => ({ "dock": candidate, "home": candidate.region === world.homeRegion ? 0 : 1,
						"distance": squareDistance(candidate.position, ship.position) }))
					.sort((a, b) => a.home - b.home || a.distance - b.distance || a.dock.id - b.dock.id)
					.map(entry => entry.dock)[0];
				if (!dock)
					continue;
				const points = this.anchorage(world, dock);
				let slot = 0;
				while (slot < points.length && taken.has(dock.id + ":" + slot))
					slot += 1;
				if (slot >= points.length)
					continue;
				station = { "dock": dock.id, "slot": slot, "ordered": -Infinity };
				this.stations.set(ship.id, station);
				taken.add(dock.id + ":" + slot);
			}
			const point = this.anchorage(world, docks.get(station.dock))[station.slot];
			if (!ship.idle || world.time - station.ordered < ANCHOR_RETRY_MS ||
			    squareDistance(ship.position, point) <= ANCHOR_TOLERANCE * ANCHOR_TOLERANCE)
				continue;
			station.ordered = world.time;
			requests.push(this.order(ship.id, { "type": "walk", "x": point[0], "z": point[1] }, priorities));
		}
		return requests;
	}
}
