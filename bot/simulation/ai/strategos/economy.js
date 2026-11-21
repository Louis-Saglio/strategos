import { Drives } from "simulation/ai/strategos/economy-drives.js";
import { farmOf, farmSupply } from "simulation/ai/strategos/economy-farms.js";
import { fullOutput, singleOutput } from "simulation/ai/strategos/economy-market.js";
import { SitePlanner } from "simulation/ai/strategos/economy-planner.js";
import { HUNTER_RATE, WORK_HORIZON_S, WorkSites } from "simulation/ai/strategos/economy-sites.js";
import { distanceBetween, lowerId, nearest, squareDistance } from "simulation/ai/strategos/geometry.js";
import { collect, gatherRequest, orderRequest } from "simulation/ai/strategos/requests.js";
import { resourcePrices } from "simulation/ai/strategos/valuation.js";
import { FOOD, MEAT, unitGroup } from "simulation/ai/strategos/yields.js";

const REBALANCE_MIN_GAP = 2;
const REBALANCE_GAP_SHARE = 0.08;
const REBALANCE_PER_DECISION = 2;
const SWAP_PER_DECISION = 2;
const SWAP_REST_MS = 90000;
const SWAP_MARGIN = 0.1;
const RELAY_REACH = 24;
const RELAY_WALK = 30;
const RELAY_MEAT_SHARE = 50;
const RELAY_PER_DECISION = 4;

export class Economy
{
	constructor(catalog, player, telemetry)
	{
		this.catalog = catalog;
		this.drives = new Drives(catalog, telemetry);
		this.sites = new WorkSites();
		this.planner = new SitePlanner(catalog, player, telemetry);
		this.swapped = new Map();
		this.retargeted = new Set();
	}

	save()
	{
		return { "drives": this.drives.save(), "sites": this.sites.save(), "planner": this.planner.save(), "swapped": this.swapped };
	}

	restore(data)
	{
		this.drives.restore(data.drives);
		this.sites.restore(data.sites);
		this.planner.restore(data.planner);
		this.swapped = data.swapped || new Map();
	}

	settle(world, outcomes)
	{
		this.drives.settle(outcomes);
		this.sites.settle(outcomes, world.time, this.retargeted);
	}

	requests(world, plan, assessments)
	{
		this.drives.observe(world);
		this.sites.observe(world);
		const survey = this.sites.survey(world, assessments);
		this.retargeted = new Set();
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
		const exchange = this.exchange(world);
		const diverted = world.workers.filter(worker => this.dominated(exchange, worker, worker.gathering, this.sites.current(worker, survey))).length;
		const dropsite = this.planner.request(world, plan, assessments, survey, diverted);
		return this.treasureRequests(world, plan, busy)
			.concat(dropsite ? [dropsite] : [])
			.concat(driving)
			.concat(this.gatherRequests(world, plan, assessments, assigned, reserved, game, busy, survey, exchange))
			.concat(this.rebalanceRequests(world, plan, assessments, assigned, reserved, busy, survey, exchange))
			.concat(this.divertRequests(world, plan, assigned, reserved, busy, survey, exchange))
			.concat(this.swapRequests(world, plan, busy))
			.concat(this.retargetRequests(world, plan, reserved, busy, survey));
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

	exchange(world)
	{
		const farm = farmOf(world, this.catalog);
		const prices = world.barter.open && world.barter.prices;
		if (!farm || !prices)
			return null;
		const field = farmSupply(this.catalog, farm, 0, [0, 0], 0);
		field.haul = field.half;
		const outputs = new Map();
		return {
			"field": worker => {
				if (!outputs.has(worker.template))
					outputs.set(worker.template, worker.gatherTypes.includes(FOOD) ? fullOutput(worker.profile, field) : 0);
				return outputs.get(worker.template);
			},
			"rate": code => code === FOOD || !(prices.buy[code] > 0) ? 0 : prices.sell[FOOD] / prices.buy[code]
		};
	}

	dominated(exchange, worker, code, option)
	{
		if (!exchange || !option || !code || code === FOOD)
			return false;
		const field = exchange.field(worker);
		return field > 0 && singleOutput(worker.profile, option.supply) < exchange.rate(code) * field;
	}

	divertRequests(world, plan, assigned, reserved, busy, survey, exchange)
	{
		const requests = [];
		if (!exchange)
			return requests;
		for (const worker of world.workers)
		{
			if (requests.length >= REBALANCE_PER_DECISION)
				break;
			if (busy.has(worker.id) || worker.idle || !worker.state.gathering || !worker.state.moving || worker.carried > 0)
				continue;
			const current = this.sites.current(worker, survey);
			if (!this.dominated(exchange, worker, worker.gathering, current))
				continue;
			const found = this.sites.best(worker, FOOD, survey, reserved);
			if (!found || !(exchange.rate(worker.gathering) * fullOutput(worker.profile, found.supply) > singleOutput(worker.profile, current.supply)))
				continue;
			busy.add(worker.id);
			reserved.set(found.supply.id, (reserved.get(found.supply.id) || 0) + 1);
			assigned[worker.gathering] -= 1;
			assigned[FOOD] += 1;
			requests.push(gatherRequest("economy", "divert", worker.id, found.supply.id, FOOD, plan.values.rebalance, 1));
		}
		return requests;
	}

	gatherRequests(world, plan, assessments, assigned, reserved, game, busy, survey, exchange)
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
					const found = this.sites.best(worker, code, survey, reserved);
					const efficiency = found ? this.sites.efficiency(worker, code, found.score) : 0;
					return { "code": code, "deficit": deficit, found,
						"rank": deficit > 0 ? deficit * edge * efficiency : deficit / edge };
				})
				.sort((a, b) => b.rank - a.rank || world.codes.indexOf(a.code) - world.codes.indexOf(b.code));
			for (const { code, deficit, found } of ranked)
			{
				if (this.dominated(exchange, worker, code, found))
					continue;
				const site = found ? found.supply : code === FOOD && this.nearestGame(world, worker, reserved, game);
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

	rebalanceRequests(world, plan, assessments, assigned, reserved, busy, survey, exchange)
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
				const found = this.sites.best(worker, deficit, survey, reserved);
				if (!found || this.dominated(exchange, worker, deficit, found))
					continue;
				const site = found.supply;
				const lost = worker.carried > 0 && worker.carriedType !== deficit ? 1 : 0;
				const gain = advantage(worker, deficit) - advantage(worker, surplus);
				if (!best || gain > best.gain || gain === best.gain && (lost < best.lost || lost === best.lost && (found.score > best.score ||
				    found.score === best.score && worker.id < best.worker.id)))
					best = { worker, site, "score": found.score, lost, gain };
			}
			if (!best)
				break;
			moved.add(best.worker.id);
			busy.add(best.worker.id);
			reserved.set(best.site.id, (reserved.get(best.site.id) || 0) + 1);
			assigned[surplus] -= 1;
			assigned[deficit] += 1;
			requests.push(gatherRequest("economy", "rebalance", best.worker.id, best.site.id, deficit, plan.values.rebalance, 1));
		}
		return requests;
	}

	swapRequests(world, plan, busy)
	{
		for (const [id, time] of this.swapped)
			if (world.time - time > SWAP_REST_MS)
				this.swapped.delete(id);
		const kinds = world.yieldRates.kinds;
		if (!kinds)
			return [];
		const prices = resourcePrices(world);
		const rate = (kind, worker) => kinds[kind + "|" + unitGroup(worker.classes)];
		const worth = (kind, worker) => (rate(kind, worker) || 0) * (prices[kind.split(".")[0]] || 0);
		const free = worker => !busy.has(worker.id) && !this.swapped.has(worker.id) && worker.state.gathering && worker.kind &&
			worker.target !== undefined && rate(worker.kind, worker) !== undefined;
		const soldiers = world.workers.filter(worker => worker.soldier && free(worker)).sort((a, b) => a.id - b.id);
		const civilians = world.workers.filter(worker => !worker.soldier && free(worker));
		const requests = [];
		const taken = new Set();
		for (const soldier of soldiers)
		{
			if (requests.length >= 2 * SWAP_PER_DECISION)
				break;
			let best = null;
			for (const civilian of civilians)
			{
				if (taken.has(civilian.id) || civilian.gathering === soldier.gathering || !soldier.gatherTypes.includes(civilian.gathering) ||
				    !civilian.gatherTypes.includes(soldier.gathering) || rate(civilian.kind, soldier) === undefined || rate(soldier.kind, civilian) === undefined)
					continue;
				const before = worth(soldier.kind, soldier) + worth(civilian.kind, civilian);
				const after = worth(civilian.kind, soldier) + worth(soldier.kind, civilian);
				const walk = distanceBetween(soldier.position, civilian.position);
				const cost = walk / Math.max(1, soldier.profile.speed) * worth(soldier.kind, soldier) + walk / Math.max(1, civilian.profile.speed) * worth(civilian.kind, civilian);
				const gain = (after - before) * WORK_HORIZON_S - cost;
				if (after > (1 + SWAP_MARGIN) * before && gain > 0 && (!best || gain > best.gain || gain === best.gain && civilian.id < best.civilian.id))
					best = { civilian, gain };
			}
			if (!best)
				continue;
			const civilian = best.civilian;
			taken.add(civilian.id);
			for (const id of [soldier.id, civilian.id])
			{
				busy.add(id);
				this.swapped.set(id, world.time);
			}
			requests.push(gatherRequest("economy", "swap", soldier.id, civilian.target, civilian.gathering, plan.values.rebalance, 1));
			requests.push(gatherRequest("economy", "swap", civilian.id, soldier.target, soldier.gathering, plan.values.rebalance, 1));
		}
		return requests;
	}

	retargetRequests(world, plan, reserved, busy, survey)
	{
		const requests = [];
		for (const worker of world.workers)
		{
			if (busy.has(worker.id) || !this.sites.free(worker) || this.sites.resting(worker, world.time))
				continue;
			const current = this.sites.current(worker, survey);
			if (!current)
				continue;
			const better = this.sites.best(worker, worker.gathering, survey, reserved, worker.target);
			if (!better || better.score < plan.margin * current.score)
			{
				if (!worker.state.hauling)
					this.sites.accept(worker);
				continue;
			}
			busy.add(worker.id);
			reserved.set(better.supply.id, (reserved.get(better.supply.id) || 0) + 1);
			if (current.front && current.front !== better.front)
				current.front.crowd -= 1;
			if (better.front && current.front !== better.front)
				better.front.crowd += 1;
			survey.holders.set(worker.target, (survey.holders.get(worker.target) || 1) - 1);
			const request = gatherRequest("economy", "retarget", worker.id, better.supply.id, worker.gathering, plan.values.rebalance, 1);
			this.retargeted.add(request);
			requests.push(request);
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
}
