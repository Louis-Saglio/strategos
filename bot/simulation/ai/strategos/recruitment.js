import { squareDistance } from "simulation/ai/strategos/geometry.js";
import { inTier, noting, reserving, returning, roomRequest, trainRequest } from "simulation/ai/strategos/requests.js";
import { Retry } from "simulation/ai/strategos/switches.js";
import { HERO_EDGE, TECH_HORIZON_S, TRAINING_BATCH, combatRole, enemyProfile, heroWorth, populationPressure, pricedSum, resourcePrices, unitReturn, unitScore } from "simulation/ai/strategos/valuation.js";
import { unitGroup } from "simulation/ai/strategos/yields.js";

const TRAINER_QUEUE_DEPTH = 2;
const HERO_RETRY_MS = 120000;
const HERO_STOCK = 2;
const HUNTER_RATE = 2;
const MEAT = "food.meat";
const HUNTER_URGENCY = 1.2;

export class Recruitment
{
	constructor(catalog, telemetry)
	{
		this.catalog = catalog;
		this.telemetry = telemetry;
		this.heroOrdered = new Retry();
		this.healersTrained = 0;
		this.candidates = Object.freeze([
			{ "kind": "breaker", "requests": (world, plan) => this.breakerRequests(world, plan) },
			{ "kind": "ship", "requests": (world, plan, assessments) => this.shipRequests(world, plan, assessments) },
			{ "kind": "fishing-boat", "requests": (world, plan) => this.fishingBoatRequests(world, plan) },
			{ "kind": "hero", "requests": (world, plan) => this.heroRequests(world, plan) },
			{ "kind": "hunter", "requests": (world, plan) => this.hunterRequests(world, plan) },
			{ "kind": "worker-or-soldier", "requests": (world, plan, assessments) => this.unitRequests(world, plan, assessments) },
			{ "kind": "trader", "requests": (world, plan, assessments) => this.traderRequests(world, plan, assessments) },
			{ "kind": "healer", "requests": (world, plan) => this.healerRequests(world, plan) }
		].map(candidate => Object.freeze(candidate)));
	}

	save()
	{
		return { "heroOrdered": this.heroOrdered.save(), "healersTrained": this.healersTrained };
	}

	restore(data)
	{
		this.heroOrdered.restore(data.heroOrdered);
		this.healersTrained = data.healersTrained;
	}

	requests(world, plan, assessments)
	{
		const requests = [];
		for (const candidate of this.candidates)
			requests.push(...candidate.requests(world, plan, assessments));
		return requests;
	}

	settle(world, outcomes)
	{
		for (const { request, issued } of outcomes)
		{
			if (!issued)
				continue;
			if (request.purpose === "hero")
				this.heroOrdered.record(world.time);
			if (request.purpose !== "healer")
				continue;
			if (!this.healersTrained)
				this.telemetry.line("MEDIC", world.time, request.note);
			this.healersTrained += 1;
		}
	}

	breakerRequests(world, plan)
	{
		if (!world.home || !world.enemyStructures.length && world.enemyTargets.length)
			return [];
		const breakers = plan.offense.breakers;
		const wanted = Math.min(breakers.max, Math.floor(world.fighters.length / breakers.perSoldiers));
		const trains = trainer => trainer.trainable.some(name => this.catalog.isBreaker(name));
		const trainer = world.trainers.find(candidate => candidate.queueLength === 0 && trains(candidate));
		if (!trainer || world.trainers.some(candidate => candidate.queueLength > 0 && trains(candidate)) || world.breakers.length >= wanted)
			return [];
		const template = this.catalog.cheapest(trainer.trainable, name => this.catalog.isBreaker(name));
		return [reserving(trainRequest("recruitment", "breaker", trainer.id, template, 1, this.catalog.cost(template),
			this.catalog.population(template), plan.values.support, 1))];
	}

	shipRequests(world, plan, assessments)
	{
		if (!world.centres.length || !world.fleet.length && !world.docks.length)
			return [];
		const naval = plan.naval;
		const capacity = world.ships.reduce((sum, ship) => sum + ship.capacity, 0);
		const carries = name => this.catalog.transportCapacity(name) > 0 && !this.catalog.isBombardShip(name);
		const dead = new Set(world.docks.filter(dock => dock.blocked).map(dock => dock.id));
		const berth = new Map(world.docks.map(dock => [dock.id, dock.position]));
		const boats = world.fleet.filter(ship => ship.fishing);
		const crowd = trainer => berth.has(trainer.id) ? boats.filter(boat =>
			squareDistance(boat.position, berth.get(trainer.id)) <= naval.yardCrowd * naval.yardCrowd).length : 0;
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
			Math.ceil((naval.maxCapacity - capacity) / this.catalog.transportCapacity(template)),
			Math.ceil(naval.seaSuperiority * world.enemyWarships) - world.ships.length);
		if (world.crossing && world.populationMax - world.population - world.queuedPopulation <= missing)
			for (let room = 0; room < missing; ++room)
				requests.push(roomRequest("recruitment", "ship-room", this.catalog.population(template), plan.values.investment, 1));
		const wanted = world.crossing ? Math.min(naval.maxCapacity,
			Math.max(plan.minArmy, naval.maxCapacity * world.population / Math.max(1, world.populationMax))) :
			assessments.colony || assessments.ferry ? 1 : 0;
		const squadron = world.crossing ? Math.min(naval.fleetMax, Math.floor(world.fighters.length / naval.fightersPerShip)) : 0;
		const army = world.fighters.filter(fighter => fighter.region === world.homeRegion).length;
		const waiting = !!world.crossing && army >= plan.minArmy && army >= naval.superiority * world.enemySoldiers &&
			capacity < naval.carried * Math.min(army, naval.maxCapacity);
		const pressed = waiting || assessments.short.length && !world.ships.length || world.enemyWarships > 0 &&
			world.ships.length < naval.seaSuperiority * world.enemyWarships;
		const yard = yards.find(trainer => trainer.queueLength === 0);
		const building = yards.filter(trainer => trainer.queueLength > 0).length;
		const short = Math.max(Math.ceil((wanted - capacity) / this.catalog.transportCapacity(template)),
			Math.ceil(naval.seaSuperiority * world.enemyWarships) - world.ships.length, squadron - world.ships.length);
		const bombards = name => this.catalog.isBombardShip(name);
		const guns = world.fleet.filter(ship => ship.bombard).length;
		const arsenal = world.trainers.find(trainer => !dead.has(trainer.id) && trainer.queueLength === 0 && trainer.trainable.some(bombards));
		if (arsenal && world.crossing && guns + building < naval.bombard.ships && world.ships.length >= naval.raid.minShips)
		{
			const gun = this.catalog.cheapest(arsenal.trainable, bombards);
			if (payable(gun))
				requests.push(trainRequest("recruitment", "siege-ship", arsenal.id, gun, 1, this.catalog.cost(gun), this.catalog.population(gun),
					plan.values.support, 1));
		}
		if (!yard || building >= short)
			return requests;
		const urgency = pressed ? plan.values.ferry / plan.values.investment : 1;
		requests.unshift(inTier(reserving(trainRequest("recruitment", "ship", yard.id, template, 1, this.catalog.cost(template),
			this.catalog.population(template), plan.values.investment, urgency)), pressed ? "production" : "investment"));
		return requests;
	}

	fishingBoatRequests(world, plan)
	{
		if (!world.centres.length || !world.fleet.length && !world.docks.length || !world.fish.length)
			return [];
		const fishing = plan.naval.fishing;
		const boats = world.fleet.filter(ship => ship.fishing);
		const slots = world.fishingGrounds(plan.naval.fishClearance).waters
			.reduce((sum, fish) => sum + Math.min(fish.capacity, fishing.perFish), 0);
		const fishes = name => this.catalog.isFishingBoat(name);
		const dead = new Set(world.docks.filter(dock => dock.blocked).map(dock => dock.id));
		const yards = world.trainers.filter(trainer => !dead.has(trainer.id) && trainer.trainable.some(fishes));
		const building = yards.filter(trainer => trainer.queueLength > 0).length;
		const yard = yards.find(trainer => trainer.queueLength === 0);
		if (!yard || boats.length + building >= Math.min(fishing.maxBoats, slots))
			return [];
		const template = this.catalog.cheapest(yard.trainable, fishes);
		return [returning(inTier(trainRequest("recruitment", "fishing-boat", yard.id, template, 1, this.catalog.cost(template),
			this.catalog.population(template), plan.values.fishing, 1), "production"), this.unitReturn(world, template))];
	}

	heroRequests(world, plan)
	{
		if (world.heroes.length || !this.heroOrdered.due(world.time, HERO_RETRY_MS))
			return [];
		for (const trainer of world.trainers)
		{
			const best = trainer.trainable.filter(name => this.catalog.isHero(name))
				.map(name => ({ name, "worth": heroWorth(world, this.catalog, name) }))
				.sort((a, b) => b.worth - a.worth || (a.name < b.name ? -1 : 1))[0];
			if (!best || trainer.queueLength >= TRAINER_QUEUE_DEPTH)
				continue;
			const cost = this.catalog.cost(best.name);
			const prices = resourcePrices(world);
			const stocked = world.codes.every(code => world.resources[code] >= HERO_STOCK * (cost[code] || 0));
			if (!stocked && best.worth < HERO_EDGE * world.codes.reduce((sum, code) => sum + prices[code] * cost[code], 0))
				return [];
			return [reserving(trainRequest("recruitment", "hero", trainer.id, best.name, 1, cost, this.catalog.population(best.name),
				plan.values.research, 1))];
		}
		return [];
	}

	unitReturn(world, template)
	{
		return unitReturn(world, resourcePrices(world), unitGroup(this.catalog.template(template).classes()), this.catalog.cost(template));
	}

	hunts(name)
	{
		return this.catalog.isFighter(name) && (this.catalog.gathering(this.catalog.template(name)).rates[MEAT] || 0) >= HUNTER_RATE;
	}

	hunterRequests(world, plan)
	{
		const hunting = plan.hunting;
		if (!world.home || !hunting.hunters)
			return [];
		const meat = world.game.filter(prey => !prey.domestic && !prey.armed && prey.region === world.homeRegion)
			.reduce((sum, prey) => sum + prey.amount, 0);
		const wanted = Math.min(hunting.hunters, Math.floor(meat / hunting.meatPerHunter));
		const hunters = world.workers.filter(worker => worker.soldier && (worker.profile.rates[MEAT] || 0) >= HUNTER_RATE).length;
		if (hunters >= wanted || world.trainers.some(trainer => trainer.training.some(name => this.hunts(name))))
			return [];
		const trainer = world.trainers.find(candidate => candidate.queueLength < TRAINER_QUEUE_DEPTH && candidate.trainable.some(name => this.hunts(name)));
		if (!trainer)
			return [];
		const template = this.catalog.cheapest(trainer.trainable, name => this.hunts(name));
		const tier = trainer.queueLength === 0 ? "production" : "investment";
		return [noting(returning(inTier(trainRequest("recruitment", "hunter", trainer.id, template, 1, this.catalog.cost(template),
			this.catalog.population(template), plan.values.trainWorker, HUNTER_URGENCY), tier), this.unitReturn(world, template)),
			{ "meat": Math.round(meat), "hunters": hunters, "wanted": wanted })];
	}

	unitRequests(world, plan, assessments)
	{
		const requests = [];
		const posture = assessments.posture;
		const drafted = new Set(posture.drafted);
		let context = null;
		for (const trainer of world.trainers)
		{
			if (trainer.queueLength >= TRAINER_QUEUE_DEPTH)
				continue;
			const soldiers = trainer.trainable.filter(name => this.catalog.isFighter(name));
			const civilian = !drafted.has(trainer.id) && trainer.trainable.some(name => this.catalog.isCivilian(name));
			if (!soldiers.length && posture.allLines)
				continue;
			if (!civilian && soldiers.length && !context)
				context = this.unitContext(world, assessments);
			const labour = civilian || !soldiers.length;
			const template = labour ? this.catalog.cheapest(trainer.trainable, name => this.catalog.isWorker(name)) :
				this.soldier(world, soldiers, context);
			if (!template)
				continue;
			const count = this.batchSize(world, template);
			const unitCost = this.catalog.cost(template);
			const cost = {};
			for (const code of world.codes)
				cost[code] = unitCost[code] * count;
			const tier = trainer.queueLength === 0 ? "production" : "investment";
			const request = inTier(trainRequest("recruitment", labour ? "workers" : "soldiers", trainer.id, template, count, cost,
				this.catalog.population(template) * count, plan.values.trainWorker, 1), tier);
			requests.push(labour ? returning(request, this.unitReturn(world, template)) : request);
		}
		return requests;
	}

	batchSize(world, template)
	{
		const cost = this.catalog.cost(template);
		let affordable = TRAINING_BATCH;
		for (const code of world.codes)
			if (cost[code] > 0)
				affordable = Math.min(affordable, Math.floor(world.resources[code] / cost[code]));
		let count = TRAINING_BATCH;
		const population = this.catalog.population(template);
		if (population > 0)
			count = Math.min(count, Math.floor(world.populationRoom / population));
		return Math.max(1, affordable > 0 ? Math.min(count, affordable) : count);
	}

	unitContext(world, assessments)
	{
		const counts = new Map();
		const roles = new Map();
		let armySize = 0;
		for (const group of world.army)
		{
			counts.set(group.template, group.count);
			const role = combatRole(this.catalog.combat(group.template));
			roles.set(role, (roles.get(role) || 0) + group.count);
			armySize += group.count;
		}
		return {
			"enemy": enemyProfile(world, this.catalog),
			"prices": resourcePrices(world),
			"pressure": assessments.posture.saturated ? 1 : populationPressure(world),
			counts,
			roles,
			armySize
		};
	}

	soldier(world, names, context)
	{
		let best = null;
		let bestScore = -Infinity;
		for (const name of names)
		{
			const score = unitScore(world, this.catalog, name, context);
			if (score > bestScore || (score === bestScore && name < best))
			{
				best = name;
				bestScore = score;
			}
		}
		return best;
	}

	traderRequests(world, plan, assessments)
	{
		const trade = plan.trade;
		const route = world.bestRoute;
		if (!route || route.rate < trade.minRate)
			return [];
		const wanted = assessments.scarce.length || route.rate >= trade.richRate ?
			Math.min(trade.max, Math.floor(world.population / trade.populationPerTrader)) : 0;
		if (world.traders.length >= wanted)
			return [];
		for (const trainer of world.trainers)
		{
			if (trainer.queueLength > 0)
				continue;
			const template = this.catalog.cheapest(trainer.trainable, name => this.catalog.isTrader(name));
			if (!template)
				continue;
			const prices = resourcePrices(world);
			const price = world.codes.reduce((sum, code) => sum + prices[code], 0) / world.codes.length;
			return [returning(trainRequest("recruitment", "trader", trainer.id, template, 1, this.catalog.cost(template),
				this.catalog.population(template), plan.values.support, 1),
				TECH_HORIZON_S * route.rate * price / Math.max(1, pricedSum(world, prices, this.catalog.cost(template))))];
		}
		return [];
	}

	healerRequests(world, plan)
	{
		const wounded = world.fighters.filter(fighter => fighter.hitpoints < fighter.maxHitpoints);
		const missing = wounded.reduce((sum, fighter) => sum + fighter.maxHitpoints - fighter.hitpoints, 0);
		const wanted = Math.min(plan.medics.max, Math.floor(world.fighters.length / plan.medics.soldiersPerHealer), Math.floor(missing / plan.medics.woundsPerHealer));
		if (world.healers.length >= wanted)
			return [];
		for (const trainer of world.trainers)
		{
			if (trainer.queueLength > 0)
				continue;
			const template = this.catalog.cheapest(trainer.trainable, name => this.catalog.isHealer(name));
			if (!template)
				continue;
			return [noting(trainRequest("recruitment", "healer", trainer.id, template, 1, this.catalog.cost(template), this.catalog.population(template),
				plan.values.support, 1), { "train": template, "wounds": Math.round(missing), "soldiers": world.fighters.length })];
		}
		return [];
	}
}
