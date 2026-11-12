import { squareDistance } from "simulation/ai/strategos/world.js";

const TRAINER_QUEUE_DEPTH = 2;
const BATCH_MAX = 5;
const REBALANCE_MIN_GAP = 2;
const REBALANCE_GAP_SHARE = 0.08;
const REBALANCE_PER_DECISION = 2;

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
		return this.trainingRequests(world, priorities)
			.concat(this.gatherRequests(world, priorities, assigned, reserved))
			.concat(this.rebalanceRequests(world, priorities, assigned, reserved));
	}

	trainingRequests(world, priorities)
	{
		const requests = [];
		for (const trainer of world.trainers)
		{
			if (trainer.queueLength >= TRAINER_QUEUE_DEPTH)
				continue;
			const template = this.cheapestWorker(trainer.trainable);
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
				"urgency": 1
			});
		}
		return requests;
	}

	batchSize(world, template)
	{
		const cost = this.catalog.cost(template);
		let count = BATCH_MAX;
		for (const code of world.codes)
			if (cost[code] > 0)
				count = Math.min(count, Math.floor(world.resources[code] / cost[code]));
		const population = this.catalog.population(template);
		if (population > 0)
			count = Math.min(count, Math.floor(world.populationRoom / population));
		return Math.max(1, count);
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

	gatherRequests(world, priorities, assigned, reserved)
	{
		const requests = [];
		const idle = world.workers.filter(worker => worker.idle);
		if (!idle.length)
			return requests;
		const total = world.workers.length;
		for (const worker of idle)
		{
			const ranked = worker.gatherTypes
				.filter(code => priorities.gatherShares[code] > 0)
				.map(code => ({ "code": code, "deficit": priorities.gatherShares[code] * total - assigned[code] }))
				.sort((a, b) => b.deficit - a.deficit || world.codes.indexOf(a.code) - world.codes.indexOf(b.code));
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

	rebalanceRequests(world, priorities, assigned, reserved)
	{
		const requests = [];
		const total = world.workers.length;
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
				if (!best || distance < best.distance || (distance === best.distance && worker.id < best.worker.id))
					best = { worker, site, distance };
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
			if (site.gatherers + (reserved.get(site.id) || 0) >= site.capacity || !(worker.profile.rates[site.kind] > 0))
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
