import { firstListed, nearest, squareDistance } from "simulation/ai/strategos/geometry.js";

const BERTH_SPACING = 28;

export const LANDING_RADIUS = 35;

export function shoreNear(world, region, sea, position, accept)
{
	return nearest(world.shores, position, firstListed,
		shore => shore.region === region && shore.sea === sea && (!accept || accept(shore)), shore => shore.land).item;
}

export function shorePoints(world, region, sea, position, count, accept)
{
	const candidates = [];
	for (const shore of world.shores)
		if (shore.region === region && shore.sea === sea && (!accept || accept(shore)))
			candidates.push({ shore, "distance": squareDistance(shore.land, position) });
	candidates.sort((a, b) => a.distance - b.distance);
	const points = [];
	for (const { shore } of candidates)
	{
		if (points.length >= count)
			break;
		if (points.every(other => squareDistance(other.water, shore.water) >= BERTH_SPACING * BERTH_SPACING))
			points.push(shore);
	}
	return points;
}

export function remoteShore(world, region, sea)
{
	const batteries = world.enemyStructures.filter(structure => structure.fire.arrows);
	let best = null;
	let farthest = -1;
	for (const shore of world.shores)
	{
		if (shore.region !== region || shore.sea !== sea)
			continue;
		let clearance = Infinity;
		for (const structure of batteries)
			clearance = Math.min(clearance, squareDistance(structure.position, shore.land));
		if (clearance > farthest)
		{
			best = shore;
			farthest = clearance;
		}
	}
	return best;
}

export function objectiveFrom(world, region, from)
{
	let best = null;
	for (const target of world.enemyTargets)
	{
		if (target.region === region)
			return null;
		const sea = (world.regionLinks[region] || []).find(candidate => (world.regionLinks[candidate] || []).includes(target.region));
		if (sea === undefined)
			continue;
		const distance = squareDistance(target.position, from);
		if (!best || distance < best.distance || distance === best.distance && target.id < best.id)
			best = { "id": target.id, "region": target.region, "sea": sea, "position": target.position, "distance": distance };
	}
	return best;
}
