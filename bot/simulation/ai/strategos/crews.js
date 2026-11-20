import { squareDistance } from "simulation/ai/strategos/geometry.js";

export const SECONDS_PER_BUILDER = 25;
export const MAX_BUILDERS = 6;
const WONDER_BUILDERS = 20;

export function crewWanted(world, catalog, template)
{
	if (!world.centres.length && catalog.isSettlement(template))
		return world.workers.length;
	const limit = catalog.isWonder(template) ? WONDER_BUILDERS : MAX_BUILDERS;
	return Math.max(1, Math.min(limit, Math.ceil(catalog.buildTime(template) / SECONDS_PER_BUILDER)));
}

export function crewSize(world, catalog, template)
{
	const wanted = crewWanted(world, catalog, template);
	return world.centres.length ? Math.min(MAX_BUILDERS, wanted) : wanted;
}

export function crewOf(world, template, position, count, taken, rank)
{
	const region = world.regionOf(position);
	return world.workers
		.filter(worker => (taken ? worker.buildable.length > 0 : worker.buildable.includes(template)) &&
			!worker.state.repairing && !worker.state.fighting &&
			!(taken && taken.has(worker.id)) && (region < 2 || worker.region === region))
		.map(worker => ({ "id": worker.id, "rank": rank ? rank(worker) : 0, "armed": worker.soldier ? 1 : 0,
			"distance": squareDistance(worker.position, position) }))
		.sort((a, b) => a.rank - b.rank || a.armed - b.armed || a.distance - b.distance || a.id - b.id)
		.slice(0, count)
		.map(worker => worker.id);
}
