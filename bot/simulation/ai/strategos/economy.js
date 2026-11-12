import { squareDistance } from "simulation/ai/strategos/world.js";

const TRAINER_QUEUE_DEPTH = 2;

export class Economy
{
	constructor(catalog)
	{
		this.catalog = catalog;
	}

	requests(world, priorities)
	{
		return this.trainingRequests(world, priorities).concat(this.gatherRequests(world, priorities));
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
			requests.push({
				"source": "economy",
				"action": { "type": "train", "trainer": trainer.id, "template": template, "count": 1 },
				"claims": {
					"resources": this.catalog.cost(template),
					"population": this.catalog.population(template),
					"slots": [trainer.id]
				},
				"value": priorities.values.trainWorker,
				"urgency": 1
			});
		}
		return requests;
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

	gatherRequests(world, priorities)
	{
		const requests = [];
		const idle = world.workers.filter(worker => worker.idle);
		if (!idle.length)
			return requests;
		const assigned = Object.assign({}, world.gatherers);
		const reserved = new Map();
		const total = world.workers.length;
		for (const worker of idle)
		{
			const ranked = worker.gatherTypes
				.filter(code => priorities.gatherShares[code] > 0)
				.map(code => ({ "code": code, "deficit": priorities.gatherShares[code] * total - assigned[code] }))
				.sort((a, b) => b.deficit - a.deficit || world.codes.indexOf(a.code) - world.codes.indexOf(b.code));
			for (const { code, deficit } of ranked)
			{
				const site = this.nearestFreeSite(world.sites[code], worker.position, reserved);
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

	nearestFreeSite(sites, position, reserved)
	{
		let best = null;
		let bestDistance = Infinity;
		for (const site of sites)
		{
			if (site.gatherers + (reserved.get(site.id) || 0) >= site.capacity)
				continue;
			const distance = Math.sqrt(squareDistance(site.position, position)) + 2 * site.anchorDistance;
			if (distance < bestDistance)
			{
				best = site;
				bestDistance = distance;
			}
		}
		return best;
	}
}
