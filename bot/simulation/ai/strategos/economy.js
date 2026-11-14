import { TRAINING_BATCH, combatRole, enemyProfile, populationPressure, resourcePrices, unitScore } from "simulation/ai/strategos/valuation.js";
import { squareDistance } from "simulation/ai/strategos/world.js";

const TRAINER_QUEUE_DEPTH = 2;
const HERO_RETRY_MS = 120000;
const HERO_STOCK = 2;
const REBALANCE_MIN_GAP = 2;
const REBALANCE_GAP_SHARE = 0.08;
const REBALANCE_PER_DECISION = 2;
const HUNTER_RATE = 2;

export class Economy
{
	constructor(catalog)
	{
		this.catalog = catalog;
	}

	requests(world, priorities)
	{
		const assigned = Object.assign({}, world.gatherers);
		const reserved = new Map();
		return this.heroRequests(world, priorities).concat(this.trainingRequests(world, priorities))
			.concat(this.treasureRequests(world, priorities))
			.concat(this.gatherRequests(world, priorities, assigned, reserved))
			.concat(this.rebalanceRequests(world, priorities, assigned, reserved));
	}

	heroRequests(world, priorities)
	{
		if (world.heroes.length || this.heroOrdered !== undefined && world.time - this.heroOrdered < HERO_RETRY_MS)
			return [];
		for (const trainer of world.trainers)
		{
			const template = trainer.trainable.filter(name => this.catalog.isHero(name)).sort()[0];
			if (!template || trainer.queueLength >= TRAINER_QUEUE_DEPTH)
				continue;
			const cost = this.catalog.cost(template);
			if (world.codes.some(code => world.resources[code] < HERO_STOCK * (cost[code] || 0)))
				return [];
			this.heroOrdered = world.time;
			return [{
				"source": "economy",
				"action": { "type": "train", "trainer": trainer.id, "template": template, "count": 1 },
				"claims": { "resources": cost, "population": this.catalog.population(template), "slots": [trainer.id] },
				"value": priorities.values.research,
				"urgency": 1
			}];
		}
		return [];
	}

	trainingRequests(world, priorities)
	{
		const requests = [];
		const civilians = world.workers.filter(worker => !worker.soldier).length;
		const soldiersOnly = civilians >= priorities.military.civilianTarget || priorities.military.raided;
		let context = null;
		for (const trainer of world.trainers)
		{
			if (trainer.queueLength >= TRAINER_QUEUE_DEPTH)
				continue;
			const soldiers = trainer.trainable.filter(name => this.catalog.isFighter(name));
			const civilian = !soldiersOnly && trainer.trainable.some(name => this.catalog.isCivilian(name));
			if (soldiersOnly && !soldiers.length)
				continue;
			if (!civilian && soldiers.length && !context)
				context = this.unitContext(world, priorities);
			const template = civilian || !soldiers.length ? this.cheapestWorker(trainer.trainable) : this.bestSoldier(world, soldiers, context);
			if (!template)
				continue;
			const count = this.batchSize(world, template);
			const unitCost = this.catalog.cost(template);
			const cost = {};
			for (const code of world.codes)
				cost[code] = unitCost[code] * count;
			requests.push({
				"source": "economy",
				"action": { "type": "train", "trainer": trainer.id, "template": template, "count": count },
				"claims": {
					"resources": cost,
					"population": this.catalog.population(template) * count,
					"slots": [trainer.id]
				},
				"value": priorities.values.trainWorker,
				"urgency": 1,
				"tier": trainer.queueLength === 0 ? "production" : "investment"
			});
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

	unitContext(world, priorities)
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
			"pressure": priorities.military.plentiful ? 1 : populationPressure(world),
			counts,
			roles,
			armySize
		};
	}

	bestSoldier(world, names, context)
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

	cheapestWorker(names)
	{
		let best = null;
		let bestCost = Infinity;
		for (const name of names)
		{
			if (!this.catalog.isWorker(name))
				continue;
			const cost = this.catalog.costSum(name);
			if (cost < bestCost || (cost === bestCost && name < best))
			{
				best = name;
				bestCost = cost;
			}
		}
		return best;
	}

	treasureRequests(world, priorities)
	{
		const collected = new Set();
		for (const worker of world.workers)
			if (worker.state.includes("COLLECTTREASURE") && worker.target !== undefined)
				collected.add(worker.target);
		const requests = [];
		const taken = new Set();
		for (const treasure of world.treasures)
		{
			if (collected.has(treasure.id))
				continue;
			let best = null;
			let bestDistance = Infinity;
			for (const worker of world.workers)
			{
				if (!worker.collector || taken.has(worker.id) ||
				    !(worker.idle || worker.state.includes("GATHER") || worker.state.includes("RETURNRESOURCE")))
					continue;
				const distance = squareDistance(worker.position, treasure.position);
				if (distance < bestDistance || (distance === bestDistance && worker.id < best.id))
				{
					best = worker;
					bestDistance = distance;
				}
			}
			if (!best)
				continue;
			taken.add(best.id);
			requests.push({
				"source": "economy",
				"action": { "type": "collect", "unit": best.id, "target": treasure.id },
				"claims": { "workers": [best.id] },
				"value": priorities.values.treasure,
				"urgency": 1
			});
		}
		return requests;
	}

	gatherRequests(world, priorities, assigned, reserved)
	{
		const requests = [];
		const idle = world.workers.filter(worker => worker.idle);
		if (!idle.length)
			return requests;
		const total = world.labour;
		const advantage = this.advantages(world);
		for (const worker of idle)
		{
			const ranked = worker.gatherTypes
				.filter(code => priorities.gatherShares[code] > 0)
				.map(code => {
					const deficit = priorities.gatherShares[code] * total - assigned[code];
					const edge = advantage(worker, code);
					return { "code": code, "deficit": deficit, "rank": deficit > 0 ? deficit * edge : deficit / edge };
				})
				.sort((a, b) => b.rank - a.rank || world.codes.indexOf(a.code) - world.codes.indexOf(b.code));
			for (const { code, deficit } of ranked)
			{
				const site = this.nearestFreeSite(world.sites[code], worker, reserved);
				if (!site)
					continue;
				reserved.set(site.id, (reserved.get(site.id) || 0) + 1);
				assigned[code] += 1;
				requests.push({
					"source": "economy",
					"action": { "type": "gather", "worker": worker.id, "target": site.id, "resource": code },
					"claims": { "workers": [worker.id] },
					"value": priorities.values.assignIdleWorker,
					"urgency": 1 + Math.max(0, deficit) / Math.max(1, total)
				});
				break;
			}
		}
		return requests;
	}

	advantages(world)
	{
		const average = {};
		for (const code of world.codes)
		{
			let sum = 0;
			let count = 0;
			for (const worker of world.workers)
				if (worker.meanRates[code] > 0)
				{
					sum += worker.meanRates[code];
					count += 1;
				}
			average[code] = count ? sum / count : 0;
		}
		return (worker, code) => average[code] > 0 && worker.meanRates[code] > 0 ? worker.meanRates[code] / average[code] : 0.01;
	}

	rebalanceRequests(world, priorities, assigned, reserved)
	{
		const requests = [];
		const advantage = this.advantages(world);
		const total = world.labour;
		const gap = Math.max(REBALANCE_MIN_GAP, REBALANCE_GAP_SHARE * total);
		const balance = code => assigned[code] - priorities.gatherShares[code] * total;
		const moved = new Set();
		for (let step = 0; step < REBALANCE_PER_DECISION; ++step)
		{
			const surplus = world.codes.filter(code => balance(code) > gap).sort((a, b) => balance(b) - balance(a))[0];
			const deficit = world.codes.filter(code => balance(code) < -gap).sort((a, b) => balance(a) - balance(b))[0];
			if (!surplus || !deficit)
				break;
			let best = null;
			for (const worker of world.workers)
			{
				if (worker.gathering !== surplus || moved.has(worker.id) || !worker.gatherTypes.includes(deficit))
					continue;
				const site = this.nearestFreeSite(world.sites[deficit], worker, reserved);
				if (!site)
					continue;
				const distance = squareDistance(site.position, worker.position);
				const gain = advantage(worker, deficit) - advantage(worker, surplus);
				if (!best || gain > best.gain || (gain === best.gain && (distance < best.distance ||
				    (distance === best.distance && worker.id < best.worker.id))))
					best = { worker, site, distance, gain };
			}
			if (!best)
				break;
			moved.add(best.worker.id);
			reserved.set(best.site.id, (reserved.get(best.site.id) || 0) + 1);
			assigned[surplus] -= 1;
			assigned[deficit] += 1;
			requests.push({
				"source": "economy",
				"action": { "type": "gather", "worker": best.worker.id, "target": best.site.id, "resource": deficit },
				"claims": { "workers": [best.worker.id] },
				"value": priorities.values.rebalance,
				"urgency": 1
			});
		}
		return requests;
	}

	nearestFreeSite(sites, worker, reserved)
	{
		let best = null;
		let bestDistance = Infinity;
		for (const site of sites)
		{
			if (site.gatherers + (reserved.get(site.id) || 0) >= site.capacity || !(worker.profile.rates[site.kind] > 0) ||
			    site.region >= 2 && site.region !== worker.region || site.armed && !worker.soldier ||
			    site.prey && worker.profile.rates[site.kind] < HUNTER_RATE)
				continue;
			const distance = Math.sqrt(squareDistance(site.position, worker.position)) + 2 * site.anchorDistance;
			if (distance < bestDistance)
			{
				best = site;
				bestDistance = distance;
			}
		}
		return best;
	}
}
