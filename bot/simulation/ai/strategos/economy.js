import { Drives } from "simulation/ai/strategos/economy-drives.js";
import { distanceBetween, lowerId, nearest, squareDistance } from "simulation/ai/strategos/geometry.js";
import { collect, gatherRequest, orderRequest } from "simulation/ai/strategos/requests.js";

const REBALANCE_MIN_GAP = 2;
const REBALANCE_GAP_SHARE = 0.08;
const REBALANCE_PER_DECISION = 2;
const HUNTER_RATE = 2;
const FOOD = "food";
const MEAT = "food.meat";
const RELAY_REACH = 24;
const RELAY_WALK = 30;
const RELAY_MEAT_SHARE = 50;
const RELAY_PER_DECISION = 4;

export class Economy
{
	constructor(catalog, telemetry)
	{
		this.drives = new Drives(catalog, telemetry);
	}

	save()
	{
		return { "drives": this.drives.save() };
	}

	restore(data)
	{
		this.drives.restore(data.drives);
	}

	settle(world, outcomes)
	{
		this.drives.settle(outcomes);
	}

	requests(world, plan, assessments)
	{
		this.drives.observe(world);
		const assigned = Object.assign({}, world.gatherers);
		const reserved = new Map();
		const game = new Map(world.game.map(prey => [prey.id, prey]));
		const driving = this.drives.requests(world, plan);
		const busy = new Set(driving.flatMap(request => request.claims.units));
		driving.push(...this.huntRequests(world, plan, game, busy));
		for (const id of this.drives.quarries())
			reserved.set(id, Infinity);
		if (plan.hunting.relay)
		{
			const carcasses = world.sites.food.filter(site => site.kind === MEAT && !site.prey && site.anchorDistance <= RELAY_REACH);
			driving.push(...this.pickupRequests(world, plan, carcasses, reserved, busy));
			driving.push(...this.relayRequests(world, plan, carcasses, reserved, game, busy));
		}
		if (assigned.food !== undefined)
			assigned.food += this.drives.hunters().size;
		return this.treasureRequests(world, plan, busy)
			.concat(driving)
			.concat(this.gatherRequests(world, plan, assessments, assigned, reserved, game, busy))
			.concat(this.rebalanceRequests(world, plan, assessments, assigned, reserved, busy));
	}

	huntRequests(world, plan, game, busy)
	{
		const chasers = new Map();
		for (const worker of world.workers)
			if (game.has(worker.target))
				chasers.set(worker.target, (chasers.get(worker.target) || 0) + 1);
		const requests = [];
		for (const worker of world.workers)
		{
			const prey = game.get(worker.target);
			if (!prey || busy.has(worker.id) || worker.idle || worker.state.striking || chasers.get(prey.id) !== 1 ||
			    !(worker.profile.rates[prey.kind] >= HUNTER_RATE))
				continue;
			const request = this.drives.start(world, plan, worker, prey);
			if (!request)
				continue;
			busy.add(worker.id);
			requests.push(request);
		}
		return requests;
	}

	pickupRequests(world, plan, carcasses, reserved, busy)
	{
		const requests = [];
		for (const carcass of carcasses)
		{
			let wanted = Math.min(carcass.capacity, Math.ceil(carcass.amount / RELAY_MEAT_SHARE)) - carcass.gatherers - (reserved.get(carcass.id) || 0);
			const candidates = world.workers.filter(worker => wanted > 0 && !busy.has(worker.id) && worker.state.gathering &&
				worker.gathering === FOOD && worker.kind !== MEAT && worker.region === carcass.region &&
				(worker.profile.rates[MEAT] || 0) > (worker.profile.rates[worker.kind] || 0) &&
				squareDistance(worker.position, carcass.position) <= RELAY_WALK * RELAY_WALK)
				.sort((a, b) => squareDistance(a.position, carcass.position) - squareDistance(b.position, carcass.position) || a.id - b.id);
			for (const worker of candidates)
			{
				if (wanted <= 0 || requests.length >= RELAY_PER_DECISION)
					break;
				busy.add(worker.id);
				reserved.set(carcass.id, (reserved.get(carcass.id) || 0) + 1);
				wanted -= 1;
				requests.push(gatherRequest("economy", "pickup", worker.id, carcass.id, FOOD, plan.values.rebalance, 1));
			}
		}
		return requests;
	}

	relayRequests(world, plan, carcasses, reserved, game, busy)
	{
		const covered = new Map(carcasses.map(carcass => [carcass.id, carcass.gatherers - 1 + (reserved.get(carcass.id) || 0)]));
		const requests = [];
		for (const worker of world.workers)
		{
			if (busy.has(worker.id) || !worker.state.gathering || !(covered.get(worker.target) > 0) ||
			    !((worker.profile.rates[MEAT] || 0) >= HUNTER_RATE))
				continue;
			const site = this.nearestGame(world, worker, reserved, game);
			const request = site && this.drives.start(world, plan, worker, game.get(site.id));
			if (!request)
				continue;
			busy.add(worker.id);
			reserved.set(site.id, Infinity);
			covered.set(worker.target, covered.get(worker.target) - 1);
			requests.push(request);
		}
		return requests;
	}

	treasureRequests(world, plan, busy)
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
			const best = nearest(world.workers, treasure.position, lowerId, worker => worker.collector && !taken.has(worker.id) && !busy.has(worker.id) &&
				(worker.idle || worker.state.gathering || worker.state.returning)).item;
			if (!best)
				continue;
			taken.add(best.id);
			requests.push(orderRequest("economy", "treasure", best.id, collect(treasure.id), plan.values.treasure, 1));
		}
		return requests;
	}

	gatherRequests(world, plan, assessments, assigned, reserved, game, busy)
	{
		const requests = [];
		const idle = world.workers.filter(worker => worker.idle && !busy.has(worker.id));
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
				const site = this.nearestFreeSite(world.sites[code], worker, reserved) ||
					code === FOOD && this.nearestGame(world, worker, reserved, game);
				if (!site)
					continue;
				const drive = site.prey && game.has(site.id) && this.drives.start(world, plan, worker, game.get(site.id));
				if (!drive && site.armed)
					continue;
				reserved.set(site.id, drive ? Infinity : (reserved.get(site.id) || 0) + 1);
				assigned[code] += 1;
				requests.push(drive || gatherRequest("economy", "gather", worker.id, site.id, code, plan.values.assignIdleWorker,
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

	rebalanceRequests(world, plan, assessments, assigned, reserved, busy)
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
				if (worker.gathering !== surplus || moved.has(worker.id) || busy.has(worker.id) || !worker.gatherTypes.includes(deficit))
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

	nearestGame(world, worker, reserved, game)
	{
		let best = null;
		let bestCost = Infinity;
		for (const prey of game.values())
		{
			if (prey.gatherers + (reserved.get(prey.id) || 0) >= prey.capacity || prey.region !== worker.region ||
			    !(worker.profile.rates[prey.kind] >= HUNTER_RATE) || prey.armed && !this.drives.plan(world, worker, prey))
				continue;
			const goal = this.drives.anchorFor(world, prey);
			if (!goal)
				continue;
			const cost = distanceBetween(prey.position, worker.position) + goal.distance;
			if (cost < bestCost || cost === bestCost && prey.id < best.id)
			{
				best = prey;
				bestCost = cost;
			}
		}
		return best && Object.assign({ "prey": true }, best);
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
