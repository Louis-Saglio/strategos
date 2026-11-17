import { squareDistance } from "simulation/ai/strategos/geometry.js";
import { inTier, reserving, roomRequest, trainRequest } from "simulation/ai/strategos/requests.js";
import { resourcePrices } from "simulation/ai/strategos/valuation.js";

export class Shipyards
{
	constructor(catalog)
	{
		this.catalog = catalog;
	}

	requests(world, priorities)
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
				requests.push(roomRequest("naval", "ship-room", this.catalog.population(template), priorities.values.investment, 1));
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
				requests.push(trainRequest("naval", "siege-ship", arsenal.id, gun, 1, this.catalog.cost(gun), this.catalog.population(gun),
					priorities.values.support, 1));
		}
		if (!yard || building >= short)
			return requests;
		const urgency = pressed ? priorities.values.ferry / priorities.values.investment : 1;
		requests.unshift(inTier(reserving(trainRequest("naval", "ship", yard.id, template, 1, this.catalog.cost(template),
			this.catalog.population(template), priorities.values.investment, urgency)), pressed ? "production" : "investment"));
		return requests;
	}
}
