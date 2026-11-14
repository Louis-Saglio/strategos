import { resourcePrices } from "simulation/ai/strategos/valuation.js";
import { squareDistance } from "simulation/ai/strategos/world.js";

const HOME_CALM_THREATS = 3;
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
const CASTAWAY_MIN_AREA = 20000;

export class Naval
{
	constructor(catalog, telemetry)
	{
		this.catalog = catalog;
		this.telemetry = telemetry;
		this.mode = "idle";
		this.since = 0;
		this.party = new Set();
		this.berths = new Map();
		this.landing = null;
		this.nudged = 0;
		this.sailed = null;
		this.quorum = 0;
		this.settled = -Infinity;
	}

	requests(world, priorities)
	{
		if (!world.centres.length)
			return this.castawayRequests(world, priorities);
		if (!world.crossing && !priorities.colony)
			return [];
		const requests = this.fleetRequests(world, priorities);
		if (this.mode === "idle")
		{
			const settling = this.settle(world, priorities);
			return requests.concat(this.strandedRequests(world, priorities), settling || (world.crossing ? this.muster(world, priorities) : []));
		}
		if (this.mode === "embark")
			return requests.concat(this.embarkRequests(world, priorities));
		if (this.mode === "sail")
			return requests.concat(this.sailRequests(world, priorities));
		return requests.concat(this.landRequests(world, priorities));
	}

	switchMode(world, mode, details)
	{
		this.mode = mode;
		this.since = world.time;
		this.telemetry.line("NAVAL", world.time, Object.assign({ "mode": mode, "party": this.party.size }, details || {}));
	}

	homeFighters(world)
	{
		return world.fighters.filter(fighter => fighter.region === world.homeRegion && !fighter.state.includes("COMBAT"));
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
		const wanted = Math.min(plan.maxCapacity,
			Math.max(priorities.offense.minArmy, plan.maxCapacity * world.population / Math.max(1, world.populationMax)));
		if (capacity >= wanted && world.ships.length >= plan.seaSuperiority * world.enemyWarships)
			return requests;
		const yard = yards.find(trainer => trainer.queueLength === 0);
		if (!yard || yards.some(trainer => trainer.queueLength > 0))
			return requests;
		requests.unshift({
			"source": "naval",
			"action": { "type": "train", "trainer": yard.id, "template": template, "count": 1 },
			"claims": { "resources": this.catalog.cost(template), "population": this.catalog.population(template), "slots": [yard.id] },
			"value": priorities.values.transport,
			"urgency": 1,
			"reserve": true
		});
		return requests;
	}

	chooseLanding(world)
	{
		const crossing = world.crossing;
		let best = null;
		let bestDistance = Infinity;
		for (const shore of world.shores)
		{
			if (shore.region !== crossing.region || shore.sea !== crossing.sea)
				continue;
			const exposed = world.enemyStructures.some(structure => {
				if (!structure.fire.arrows)
					return false;
				const reach = structure.range + LANDING_CLEARANCE;
				return squareDistance(structure.position, shore.land) <= reach * reach;
			});
			if (exposed)
				continue;
			const distance = squareDistance(shore.land, crossing.position);
			if (distance < bestDistance)
			{
				best = shore;
				bestDistance = distance;
			}
		}
		return best;
	}

	settle(world, priorities)
	{
		const colony = priorities.colony;
		if (!colony || !world.docks.length || world.time - this.settled < RETRY_MS ||
		    world.settlers.some(settler => settler.region === colony.region))
			return null;
		const ship = world.ships.find(candidate => !candidate.cargo.length);
		const outpost = name => this.catalog.isShoreStructure(name) && this.catalog.trainsTransports(name);
		const able = world.workers.filter(worker => worker.soldier && worker.region === world.homeRegion && worker.buildable.some(outpost));
		if (!ship || able.length < MIN_SETTLERS)
			return null;
		let landing = null;
		let nearest = Infinity;
		for (const shore of world.shores)
		{
			if (shore.region !== colony.region || shore.sea !== colony.sea)
				continue;
			const distance = squareDistance(shore.land, colony.position);
			if (distance < nearest)
			{
				landing = shore;
				nearest = distance;
			}
		}
		this.settled = world.time;
		if (!landing)
			return null;
		const dock = world.docks[0].position;
		const chosen = able
			.map(worker => ({ worker, "distance": squareDistance(worker.position, dock) }))
			.sort((a, b) => a.distance - b.distance || a.worker.id - b.worker.id)
			.slice(0, Math.min(ship.capacity, priorities.naval.settlers))
			.map(entry => entry.worker);
		this.party = new Set(chosen.map(worker => worker.id));
		this.berths = new Map(chosen.map(worker => [worker.id, ship.id]));
		this.landing = landing;
		this.quorum = MIN_SETTLERS;
		this.switchMode(world, "embark", { "settle": colony.region, "landing": landing.land.map(Math.round) });
		return this.embarkRequests(world, priorities);
	}

	muster(world, priorities)
	{
		const offense = priorities.offense;
		if (world.time - this.since < RETRY_MS && this.since > 0 || world.threats.length >= HOME_CALM_THREATS || !world.docks.length)
			return [];
		const ships = world.ships.filter(ship => !ship.cargo.length);
		const capacity = ships.reduce((sum, ship) => sum + ship.capacity, 0);
		const available = this.homeFighters(world);
		const plan = priorities.naval;
		if (available.length < offense.minArmy || available.length < plan.superiority * world.enemySoldiers ||
		    world.ships.length < world.enemyWarships ||
		    capacity < plan.carried * Math.min(available.length, plan.maxCapacity))
			return [];
		const landing = this.chooseLanding(world);
		if (!landing)
		{
			this.since = world.time;
			this.telemetry.line("NAVAL", world.time, { "noLanding": world.crossing.region });
			return [];
		}
		const dock = world.docks[0].position;
		const chosen = available
			.map(fighter => ({ fighter, "distance": squareDistance(fighter.position, dock) }))
			.sort((a, b) => a.distance - b.distance || a.fighter.id - b.fighter.id)
			.slice(0, capacity)
			.map(entry => entry.fighter);
		this.party = new Set(chosen.map(fighter => fighter.id));
		this.berths = new Map();
		let index = 0;
		for (const ship of ships)
			for (let slot = 0; slot < ship.capacity && index < chosen.length; ++slot)
				this.berths.set(chosen[index++].id, ship.id);
		this.landing = landing;
		this.quorum = EMBARK_MIN_SHARE * offense.minArmy;
		this.switchMode(world, "embark", { "ships": ships.length, "landing": landing.land.map(Math.round), "enemySoldiers": world.enemySoldiers });
		return this.embarkRequests(world, priorities);
	}

	order(unit, action, priorities)
	{
		return {
			"source": "naval",
			"action": Object.assign({ "unit": unit }, action),
			"claims": { "workers": [unit] },
			"value": priorities.values.offense,
			"urgency": 1
		};
	}

	aboard(world)
	{
		const aboard = new Set();
		for (const ship of world.ships)
			for (const id of ship.cargo)
				if (this.party.has(id))
					aboard.add(id);
		return aboard;
	}

	disembark(world, priorities)
	{
		return world.ships.filter(ship => ship.cargo.length).map(ship => ({
			"source": "naval",
			"action": { "type": "unload-all", "holder": ship.id },
			"claims": { "slots": ["garrison-" + ship.id] },
			"value": priorities.values.offense,
			"urgency": 1
		}));
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
		const carrying = world.ships.filter(ship => ship.cargo.length);
		if (!carrying.length || !world.docks.length)
			return [];
		const dock = world.docks[0].position;
		return this.disembark(world, priorities).concat(carrying.filter(ship => ship.idle &&
			squareDistance(ship.position, dock) > LANDING_RADIUS * LANDING_RADIUS)
			.map(ship => this.order(ship.id, { "type": "walk", "x": dock[0], "z": dock[1] }, priorities)));
	}

	embarkRequests(world, priorities)
	{
		const aboard = this.aboard(world);
		const ashore = world.fighters.filter(fighter => this.party.has(fighter.id));
		this.party = new Set([...aboard, ...ashore.map(fighter => fighter.id)]);
		const afloat = new Set(world.ships.map(ship => ship.id));
		const late = world.time - this.since >= EMBARK_TIMEOUT_MS;
		if (this.party.size && aboard.size >= EMBARK_QUORUM * this.party.size ||
		    late && aboard.size >= this.quorum)
		{
			this.party = aboard;
			this.sailed = null;
			this.switchMode(world, "sail", { "aboard": aboard.size });
			return this.sailRequests(world, priorities);
		}
		if (late || !this.party.size)
		{
			this.party = new Set();
			this.switchMode(world, "idle", { "reason": "embark", "aboard": aboard.size });
			return this.disembark(world, priorities);
		}
		const requests = [];
		for (const fighter of ashore)
		{
			const ship = this.berths.get(fighter.id);
			if (!afloat.has(ship))
				continue;
			requests.push(fighter.state.includes("GARRISON") && fighter.target === ship ?
				this.order(fighter.id, { "type": "hold" }, priorities) :
				this.order(fighter.id, { "type": "garrison", "target": ship }, priorities));
		}
		return requests;
	}

	sailRequests(world, priorities)
	{
		const loaded = world.ships.filter(ship => ship.cargo.some(id => this.party.has(id)));
		const limit = LANDING_RADIUS * LANDING_RADIUS;
		const waiting = loaded.filter(ship => squareDistance(ship.position, this.landing.water) > limit);
		const settled = this.sailed !== null && world.time - this.sailed >= SAIL_SETTLE_MS && waiting.every(ship => ship.idle);
		if (!waiting.length || settled || world.time - this.since >= SAIL_TIMEOUT_MS)
		{
			this.switchMode(world, "land", { "ships": loaded.length, "short": waiting.length });
			this.nudged = world.time;
			return this.landRequests(world, priorities);
		}
		if (this.sailed !== null)
			return [];
		this.sailed = world.time;
		return loaded.map(ship => this.order(ship.id, { "type": "walk", "x": this.landing.land[0], "z": this.landing.land[1] }, priorities));
	}

	landRequests(world, priorities)
	{
		const loaded = world.ships.filter(ship => ship.cargo.some(id => this.party.has(id)));
		if (!loaded.length || world.time - this.since >= UNLOAD_TIMEOUT_MS)
		{
			const dock = world.docks.length ? world.docks[0].position : world.centres[0].position;
			const requests = world.ships.filter(ship => !ship.cargo.length)
				.map(ship => this.order(ship.id, { "type": "walk", "x": dock[0], "z": dock[1] }, priorities));
			this.switchMode(world, "idle", { "reason": loaded.length ? "stuck" : "landed", "left": loaded.reduce((sum, ship) => sum + ship.cargo.length, 0) });
			this.party = new Set();
			return requests.concat(loaded.length ? this.disembark(world, priorities) : []);
		}
		const requests = this.disembark(world, priorities);
		if (world.time - this.nudged >= UNLOAD_NUDGE_MS)
		{
			this.nudged = world.time;
			for (const ship of loaded)
				requests.push(this.order(ship.id, { "type": "walk", "x": this.landing.land[0], "z": this.landing.land[1] }, priorities));
		}
		return requests;
	}
}
