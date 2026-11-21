import { GRANTED } from "simulation/ai/strategos/allocator.js";
import { distanceBetween } from "simulation/ai/strategos/geometry.js";
import { diminished, loadOutput, reachOf } from "simulation/ai/strategos/gathering.js";
import { bestRate, marketSupplies, profileFor } from "simulation/ai/strategos/economy-market.js";
import { edgeDistance } from "simulation/ai/strategos/world-supplies.js";

export const WORK_HORIZON_S = 90;
const FRONT_CHOICES = 4;
export const HUNTER_RATE = 2;

function nearestAnchor(anchors, code, position)
{
	let best = null;
	let bestDistance = Infinity;
	for (const anchor of anchors)
	{
		if (!anchor.types.includes(code))
			continue;
		const distance = edgeDistance(anchor, position);
		if (distance < bestDistance || distance === bestDistance && best && anchor.id < best.id)
		{
			best = anchor;
			bestDistance = distance;
		}
	}
	return best && { "anchor": best, "distance": bestDistance };
}

export class WorkSites
{
	constructor()
	{
		this.ordered = new Map();
		this.moved = new Map();
	}

	save()
	{
		return { "ordered": this.ordered, "moved": this.moved };
	}

	restore(data)
	{
		this.ordered = data && data.ordered || new Map();
		this.moved = data && data.moved || new Map();
	}

	survey(world, assessments)
	{
		const fronts = new Map();
		const frontOf = new Map();
		for (const code of world.codes)
		{
			const profile = profileFor(world, code, false);
			const wanted = Math.max(1, Math.round((assessments.gatherShares[code] || 0) * world.labour));
			for (const supply of marketSupplies(world, code, wanted, profile ? bestRate(profile, code) : 0))
			{
				const key = supply.anchor + ":" + code;
				if (!fronts.has(key))
					fronts.set(key, { "key": key, "anchor": supply.anchor, "code": code, "supplies": [], "crowd": 0 });
				fronts.get(key).supplies.push(supply);
				frontOf.set(supply.id, fronts.get(key));
			}
		}
		const holders = new Map();
		for (const worker of world.workers)
		{
			if (worker.target === undefined)
				continue;
			holders.set(worker.target, (holders.get(worker.target) || 0) + 1);
			const front = frontOf.get(worker.target);
			if (front && worker.gathering === front.code)
				front.crowd += 1;
		}
		const beyond = {};
		for (const code of world.codes)
		{
			beyond[code] = [];
			for (const site of world.sites[code])
			{
				if (frontOf.has(site.id))
					continue;
				const found = nearestAnchor(world.anchors, code, site.position);
				beyond[code].push(Object.assign({ "haul": found ? found.distance : site.anchorDistance, "half": 0, "diminishing": 0 }, site));
			}
		}
		const ids = new Set(world.workers.map(worker => worker.id));
		for (const memory of [this.ordered, this.moved])
			for (const id of [...memory.keys()])
				if (!ids.has(id))
					memory.delete(id);
		return { fronts, frontOf, holders, beyond };
	}

	open(supply, survey, reserved, self)
	{
		const held = (survey.holders.get(supply.id) || 0) - (self ? 1 : 0);
		const taken = Math.max(supply.gatherers - (self ? 1 : 0), held) + (reserved.get(supply.id) || 0);
		return taken < supply.capacity ? taken : null;
	}

	value(worker, supply, crowd, taken)
	{
		const code = supply.kind.split(".")[0];
		const profile = worker.profile;
		const rate = diminished(profile.rates[supply.kind] || 0, supply.diminishing, taken + 1);
		if (!(rate > 0) || !(profile.speed > 0))
			return null;
		const output = loadOutput(rate, profile.capacities[code] || 0, profile.speed, supply.haul, reachOf(profile.range, supply.half), crowd);
		const walk = distanceBetween(worker.position, supply.position) / profile.speed;
		const delivered = output * Math.max(0, WORK_HORIZON_S - walk);
		return isFinite(supply.amount) ? Math.min(delivered, supply.amount / (taken + 1)) : delivered;
	}

	allowed(worker, supply)
	{
		if (supply.region >= 2 && supply.region !== worker.region)
			return false;
		if (supply.armed && !worker.soldier)
			return false;
		return !(supply.prey && (worker.profile.rates[supply.kind] || 0) < HUNTER_RATE);
	}

	best(worker, code, survey, reserved, except)
	{
		let best = null;
		const consider = (supply, crowd, front) => {
			if (supply.id === except || !this.allowed(worker, supply))
				return false;
			const self = worker.target === supply.id;
			const taken = this.open(supply, survey, reserved, self);
			if (taken === null)
				return false;
			const score = this.value(worker, supply, crowd, taken);
			if (score === null)
				return false;
			if (!best || score > best.score || score === best.score && supply.id < best.supply.id)
				best = { supply, score, front };
			return true;
		};
		for (const front of survey.fronts.values())
		{
			if (front.code !== code)
				continue;
			const crowd = front.crowd + (survey.frontOf.get(worker.target) === front ? 0 : 1);
			let tried = 0;
			for (const supply of front.supplies)
				if (consider(supply, crowd, front) && ++tried >= FRONT_CHOICES)
					break;
		}
		if (best)
			return best;
		for (const supply of survey.beyond[code] || [])
			consider(supply, 1, null);
		return best;
	}

	current(worker, survey)
	{
		const front = survey.frontOf.get(worker.target);
		const supply = front ? front.supplies.find(candidate => candidate.id === worker.target) :
			(survey.beyond[worker.gathering] || []).find(candidate => candidate.id === worker.target);
		if (!supply || worker.gathering !== supply.kind.split(".")[0])
			return null;
		const taken = Math.max(0, Math.max(supply.gatherers, survey.holders.get(supply.id) || 0) - 1);
		const score = this.value(worker, supply, front ? front.crowd : 1, taken);
		return score === null ? null : { supply, score, front };
	}

	resting(worker, time)
	{
		const last = this.moved.get(worker.id);
		return last !== undefined && time - last < WORK_HORIZON_S * 1000;
	}

	free(worker)
	{
		if (worker.idle || !worker.gathering || worker.target === undefined || !worker.state.gathering)
			return false;
		if (worker.state.hauling)
			return worker.carried > 0 && worker.carriedType === worker.gathering;
		return worker.state.moving && this.ordered.get(worker.id) !== worker.target;
	}

	settle(outcomes, time, retargeted)
	{
		for (const { request, outcome } of outcomes)
		{
			if (outcome !== GRANTED || !request.action || request.action.type !== "gather")
				continue;
			this.ordered.set(request.action.worker, request.action.target);
			if (retargeted.has(request))
				this.moved.set(request.action.worker, time);
		}
	}

	accept(worker)
	{
		this.ordered.set(worker.id, worker.target);
	}
}
