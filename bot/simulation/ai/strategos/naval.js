import { resourcePrices } from "simulation/ai/strategos/valuation.js";
import { squareDistance } from "simulation/ai/strategos/world.js";

const HOME_CALM_THREATS = 3;
const BERTH_RADIUS = 70;
const BERTH_TIMEOUT_MS = 90000;
const EMBARK_QUORUM = 0.9;
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
const CASTAWAY_MIN_AREA = 20000;
const ANCHOR_RINGS = [80, 110, 140, 170, 200];
const ANCHOR_SPACING = 30;
const ANCHOR_CLEARANCE = 16;
const ANCHOR_TOLERANCE = 15;
const ANCHOR_RETRY_MS = 12000;
const REPORT_MS = 60000;

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
			const kind = ship.fishing ? "fishing" : ship.capacity > 0 ? "transport" : ship.warship ? "warship" : "other";
			kinds[kind] = (kinds[kind] || 0) + 1;
		}
		this.telemetry.line("SEA", world.time, {
			"home": world.homeRegion,
			"fleet": kinds,
			"enemyWarships": world.enemyWarships,
			"fish": world.fish.length,
			"docks": world.docks.map(dock => dock.region),
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
			.filter(ship => ship.capacity > 0 && !ship.cargo.length && ship.sea === sea && !this.engaged(ship.id))
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

	launch(world, kind, ships, party, origin, landing, region, quorum, details)
	{
		const berths = new Map();
		let index = 0;
		for (const ship of ships)
			for (let slot = 0; slot < ship.capacity && index < party.length; ++slot)
				berths.set(party[index++].id, ship.id);
		const convoy = {
			"id": ++this.serial, "kind": kind, "ships": ships.map(ship => ship.id), "party": new Set(berths.keys()), "berths": berths,
			"origin": origin, "landing": landing, "region": region, "quorum": quorum, "state": "berth", "since": world.time,
			"sailed": null, "nudged": 0
		};
		this.convoys.push(convoy);
		this.telemetry.line("NAVAL", world.time, Object.assign({
			"convoy": convoy.id, "kind": kind, "state": "berth", "ships": ships.length, "party": convoy.party.size,
			"to": region, "landing": landing.land.map(Math.round)
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
		const landing = this.shoreNear(world, colony.region, colony.sea, colony.position);
		if (!landing)
			return;
		const wanted = Math.max(MIN_SETTLERS, Math.min(colony.kind === "centre" ? priorities.naval.founders : priorities.naval.settlers,
			Math.floor(able.length / SETTLER_SHARE)));
		const party = able
			.map(worker => ({ worker, "distance": squareDistance(worker.position, dock.position) }))
			.sort((a, b) => (b.worker.soldier ? 1 : 0) - (a.worker.soldier ? 1 : 0) || a.distance - b.distance || a.worker.id - b.worker.id)
			.slice(0, Math.min(ship.capacity, wanted))
			.map(entry => entry.worker);
		this.launch(world, "settle", [ship], party, dock.position, landing, colony.region, MIN_SETTLERS, { "build": colony.kind });
	}

	planFerry(world, priorities)
	{
		const ferry = priorities.ferry;
		if (!ferry || this.convoys.some(convoy => convoy.kind === "ferry"))
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
		const landing = this.shoreNear(world, ferry.to, ferry.sea, arrival.position);
		if (party.length < MIN_SETTLERS || !landing)
			return;
		this.launch(world, "ferry", [ship], party, dock.position, landing, ferry.to, MIN_SETTLERS, { "code": ferry.code });
	}

	planInvasion(world, priorities)
	{
		const crossing = world.crossing;
		if (!crossing || this.convoys.some(convoy => convoy.kind === "invade") || world.threats.length >= HOME_CALM_THREATS)
			return;
		const dock = world.docks.find(candidate => candidate.region === world.homeRegion && candidate.sea === crossing.sea);
		if (!dock)
			return;
		const offense = priorities.offense;
		const plan = priorities.naval;
		const ships = this.freeTransports(world, crossing.sea, dock.position).slice(priorities.colony || priorities.ferry ? 1 : 0);
		const capacity = ships.reduce((sum, ship) => sum + ship.capacity, 0);
		const available = world.fighters.filter(fighter => fighter.region === world.homeRegion && !fighter.state.includes("COMBAT") &&
			!this.enlisted(fighter.id));
		if (available.length < offense.minArmy || available.length < plan.superiority * world.enemySoldiers ||
		    world.ships.length < world.enemyWarships ||
		    capacity < plan.carried * Math.min(available.length, plan.maxCapacity) || !this.due(world, "invade"))
			return;
		const landing = this.shoreNear(world, crossing.region, crossing.sea, crossing.position, shore =>
			!world.enemyStructures.some(structure => {
				if (!structure.fire.arrows)
					return false;
				const reach = structure.range + LANDING_CLEARANCE;
				return squareDistance(structure.position, shore.land) <= reach * reach;
			}));
		if (!landing)
		{
			this.telemetry.line("NAVAL", world.time, { "noLanding": crossing.region });
			return;
		}
		const party = available
			.map(fighter => ({ fighter, "distance": squareDistance(fighter.position, dock.position) }))
			.sort((a, b) => a.distance - b.distance || a.fighter.id - b.fighter.id)
			.slice(0, capacity)
			.map(entry => entry.fighter);
		this.launch(world, "invade", ships, party, dock.position, landing, crossing.region, EMBARK_MIN_SHARE * offense.minArmy,
			{ "enemySoldiers": world.enemySoldiers });
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
		const limit = BERTH_RADIUS * BERTH_RADIUS;
		const away = ships.filter(ship => squareDistance(ship.position, convoy.origin) > limit);
		const late = world.time - convoy.since >= BERTH_TIMEOUT_MS;
		if (!away.length || late && away.length < ships.length)
		{
			const kept = new Set(ships.filter(ship => !away.includes(ship)).map(ship => ship.id));
			convoy.ships = convoy.ships.filter(id => kept.has(id));
			for (const [unit, ship] of convoy.berths)
				if (!kept.has(ship))
				{
					convoy.berths.delete(unit);
					convoy.party.delete(unit);
				}
			this.move(world, convoy, "embark", { "ships": convoy.ships.length });
			return this.embarkRequests(world, priorities, convoy, ships.filter(ship => kept.has(ship.id)), units);
		}
		if (late)
		{
			this.move(world, convoy, "done", { "reason": "berth" });
			return [];
		}
		return ships.map(ship => away.includes(ship) && ship.idle ?
			this.order(ship.id, { "type": "walk", "x": convoy.origin[0], "z": convoy.origin[1] }, priorities) :
			this.order(ship.id, { "type": "hold" }, priorities));
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
		if (convoy.party.size && aboard.size >= EMBARK_QUORUM * convoy.party.size || late && aboard.size >= convoy.quorum)
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
		const waiting = loaded.filter(ship => squareDistance(ship.position, convoy.landing.water) > limit);
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
		return loaded.map(ship => this.order(ship.id, { "type": "walk", "x": convoy.landing.land[0], "z": convoy.landing.land[1] }, priorities));
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
				requests.push(this.order(ship.id, { "type": "walk", "x": convoy.landing.land[0], "z": convoy.landing.land[1] }, priorities));
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
		const carries = name => this.catalog.transportCapacity(name) > 0;
		const yards = world.trainers.filter(trainer => trainer.trainable.some(carries));
		if (!yards.length)
			return [];
		const prices = resourcePrices(world);
		const priced = name => {
			const cost = this.catalog.cost(name);
			return world.codes.reduce((sum, code) => sum + prices[code] * (cost[code] || 0), 0);
		};
		const worth = name => this.catalog.transportCapacity(name) / Math.max(1, priced(name));
		const template = yards[0].trainable.filter(carries).sort((a, b) => worth(b) - worth(a) || (a < b ? -1 : 1))[0];
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
		const yard = yards.find(trainer => trainer.queueLength === 0);
		const building = yards.filter(trainer => trainer.queueLength > 0).length;
		const short = Math.max(Math.ceil((wanted - capacity) / this.catalog.transportCapacity(template)),
			Math.ceil(plan.seaSuperiority * world.enemyWarships) - world.ships.length);
		if (!yard || building >= short)
			return requests;
		requests.unshift({
			"source": "naval",
			"action": { "type": "train", "trainer": yard.id, "template": template, "count": 1 },
			"claims": { "resources": this.catalog.cost(template), "population": this.catalog.population(template), "slots": [yard.id] },
			"value": priorities.values.transport,
			"urgency": priorities.short.length && !world.ships.length ? priorities.values.ferry / priorities.values.transport : 1,
			"tier": priorities.short.length && !world.ships.length ? "production" : "investment",
			"reserve": true
		});
		return requests;
	}

	fishingRequests(world, priorities)
	{
		if (!world.fish.length)
			return [];
		const plan = priorities.naval.fishing;
		const requests = [];
		const boats = world.fleet.filter(ship => ship.fishing);
		const slots = world.fish.reduce((sum, fish) => sum + Math.min(fish.capacity, plan.perFish), 0);
		const fishes = name => this.catalog.isFishingBoat(name);
		const yards = world.trainers.filter(trainer => trainer.trainable.some(fishes));
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
			if (!boat.idle || boat.gathering)
				continue;
			let best = null;
			let nearest = Infinity;
			for (const fish of world.fish)
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

	openWater(world, point, sea)
	{
		const reach = ANCHOR_CLEARANCE;
		for (const [dx, dz] of [[0, 0], [reach, 0], [-reach, 0], [0, reach], [0, -reach]])
		{
			const x = point[0] + dx;
			const z = point[1] + dz;
			if (x < 0 || z < 0 || x >= world.mapSize || z >= world.mapSize || world.seaOf([x, z]) !== sea)
				return false;
		}
		return true;
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
					if (this.openWater(world, point, dock.sea))
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
