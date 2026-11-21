import { diminished, loadOutput, reachOf } from "simulation/ai/strategos/gathering.js";
import { TECH_HORIZON_S } from "simulation/ai/strategos/valuation.js";

export const NEAR_REACH = 40;
const MARKET_MIN = 16;
const MARKET_MAX = 256;
const PLACES_PER_GATHERER = 2;

function byHaul(a, b)
{
	return a.haul - b.haul || a.id - b.id;
}

function codeOf(supply)
{
	return supply.kind.split(".")[0];
}

function gathererOutput(profile, supply, gatherers, crowd)
{
	const rate = profile.rates[supply.kind] || 0;
	const capacity = profile.capacities[codeOf(supply)] || 0;
	if (!(rate > 0) || !(capacity > 0) || !(profile.speed > 0))
		return 0;
	return loadOutput(diminished(rate, supply.diminishing, gatherers), capacity, profile.speed, supply.haul, reachOf(profile.range, supply.half), crowd);
}

export function singleOutput(profile, supply)
{
	return gathererOutput(profile, supply, 1, 0);
}

export function fullOutput(profile, supply)
{
	return gathererOutput(profile, supply, supply.capacity, 0);
}

export function ranked(supplies, profile)
{
	return supplies.map(supply => ({ supply, "output": singleOutput(profile, supply) }))
		.sort((a, b) => b.output - a.output || byHaul(a.supply, b.supply))
		.map(entry => entry.supply);
}

export function profileFor(world, code, civilian)
{
	const able = world.workers.filter(worker => worker.gatherTypes.includes(code));
	const preferred = civilian && able.some(worker => !worker.soldier) ? able.filter(worker => !worker.soldier) : able;
	const crew = preferred.filter(worker => worker.gathering === code);
	const pool = crew.length ? crew : preferred;
	if (!pool.length)
		return null;
	const rates = {};
	let capacity = 0;
	let speed = 0;
	let range = 0;
	for (const worker of pool)
	{
		for (const kind in worker.profile.rates)
			rates[kind] = (rates[kind] || 0) + worker.profile.rates[kind] / pool.length;
		capacity += (worker.profile.capacities[code] || 0) / pool.length;
		speed += worker.profile.speed / pool.length;
		range += worker.profile.range / pool.length;
	}
	return { rates, "capacities": { [code]: capacity }, speed, range };
}

export function bestRate(profile, code)
{
	let best = 0;
	for (const kind in profile.rates)
		if (kind.split(".")[0] === code)
			best = Math.max(best, profile.rates[kind]);
	return best;
}

export function marketSupplies(world, code, wanted, rate)
{
	const enough = supplies => {
		let places = 0;
		let stock = 0;
		for (const supply of supplies)
		{
			places += supply.capacity;
			stock += supply.amount;
		}
		return places >= PLACES_PER_GATHERER * wanted && stock >= wanted * rate * TECH_HORIZON_S;
	};
	let supplies = world.hauledWithin(code, NEAR_REACH);
	let count = Math.max(MARKET_MIN, supplies.length);
	while (!enough(supplies) && count <= MARKET_MAX)
	{
		const more = world.hauled(code, count);
		if (more.length <= supplies.length)
			break;
		supplies = more;
		count *= 2;
	}
	return supplies;
}

function frontOutput(front, gatherers, profile)
{
	let total = 0;
	let left = gatherers;
	for (const supply of front.supplies)
	{
		if (left <= 0)
			break;
		if (!(profile.rates[supply.kind] > 0) || !(supply.amount > 0))
			continue;
		const taken = Math.min(supply.capacity, left);
		total += taken * gathererOutput(profile, supply, taken, gatherers);
		left -= taken;
	}
	return total;
}

export function allocate(fronts, wanted, profile)
{
	const counts = fronts.map(() => 0);
	const totals = fronts.map(() => 0);
	const nexts = fronts.map(front => frontOutput(front, 1, profile));
	let output = 0;
	for (let k = 0; k < wanted; ++k)
	{
		let best = -1;
		let bestGain = 0;
		for (let index = 0; index < fronts.length; ++index)
			if (nexts[index] - totals[index] > bestGain)
			{
				best = index;
				bestGain = nexts[index] - totals[index];
			}
		if (best < 0)
			break;
		counts[best] += 1;
		totals[best] = nexts[best];
		output += bestGain;
		nexts[best] = frontOutput(fronts[best], counts[best] + 1, profile);
	}
	return { output, counts, totals };
}

export function depleted(front, profile, seconds, holders)
{
	let crowd = front.crowd;
	const finite = [];
	for (const supply of front.supplies)
		if (isFinite(supply.amount))
			finite.push(supply);
		else
			crowd -= holders.get(supply.id) || 0;
	let left = frontOutput({ "supplies": finite }, Math.max(0, crowd), profile) * seconds;
	const supplies = [];
	for (const supply of front.supplies)
	{
		if (left > 0 && isFinite(supply.amount))
		{
			const eaten = Math.min(left, supply.amount);
			left -= eaten;
			if (supply.amount - eaten > 0)
				supplies.push(Object.assign({}, supply, { "amount": supply.amount - eaten }));
			continue;
		}
		supplies.push(supply);
	}
	return { "key": front.key, "anchor": front.anchor, "supplies": supplies, "crowd": front.crowd };
}

export function withSupply(fronts, key, supply, profile)
{
	let found = false;
	const result = fronts.map(front => {
		if (front.key !== key)
			return front;
		found = true;
		return { "key": front.key, "anchor": front.anchor, "crowd": front.crowd, "supplies": ranked(front.supplies.concat([supply]), profile) };
	});
	return found ? result : result.concat([{ "key": key, "anchor": null, "crowd": 0, "supplies": [supply] }]);
}
