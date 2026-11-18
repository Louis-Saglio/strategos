import { distanceBetween, lowerId, nearest, squareDistance } from "simulation/ai/strategos/geometry.js";
import { collect, gatherRequest, orderRequest } from "simulation/ai/strategos/requests.js";

const REBALANCE_MIN_GAP = 2;
const REBALANCE_GAP_SHARE = 0.08;
const REBALANCE_PER_DECISION = 2;
const HUNTER_RATE = 2;

export class Economy
{
	requests(world, plan, assessments)
	{
		const assigned = Object.assign({}, world.gatherers);
		const reserved = new Map();
		return this.treasureRequests(world, plan)
			.concat(this.gatherRequests(world, plan, assessments, assigned, reserved))
			.concat(this.rebalanceRequests(world, plan, assessments, assigned, reserved));
	}

	treasureRequests(world, plan)
	{
		const collected = new Set();
		for (const worker of world.workers)
			if (worker.state.collecting && worker.target !== undefined)
				collected.add(worker.target);
		const requests = [];
		const taken = new Set();
		for (const treasure of world.treasures)
		{
			if (collected.has(treasure.id))
				continue;
			const best = nearest(world.workers, treasure.position, lowerId, worker => worker.collector && !taken.has(worker.id) &&
				(worker.idle || worker.state.gathering || worker.state.returning)).item;
			if (!best)
				continue;
			taken.add(best.id);
			requests.push(orderRequest("economy", "treasure", best.id, collect(treasure.id), plan.values.treasure, 1));
		}
		return requests;
	}

	gatherRequests(world, plan, assessments, assigned, reserved)
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
				.filter(code => assessments.gatherShares[code] > 0)
				.map(code => {
					const deficit = assessments.gatherShares[code] * total - assigned[code];
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
				requests.push(gatherRequest("economy", "gather", worker.id, site.id, code, plan.values.assignIdleWorker,
					1 + Math.max(0, deficit) / Math.max(1, total)));
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

	rebalanceRequests(world, plan, assessments, assigned, reserved)
	{
		const requests = [];
		const advantage = this.advantages(world);
		const total = world.labour;
		const gap = Math.max(REBALANCE_MIN_GAP, REBALANCE_GAP_SHARE * total);
		const balance = code => assigned[code] - assessments.gatherShares[code] * total;
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
			requests.push(gatherRequest("economy", "rebalance", best.worker.id, best.site.id, deficit, plan.values.rebalance, 1));
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
			const distance = distanceBetween(site.position, worker.position) + 2 * site.anchorDistance;
			if (distance < bestDistance)
			{
				best = site;
				bestDistance = distance;
			}
		}
		return best;
	}
}
