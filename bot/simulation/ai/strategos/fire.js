import { squareDistance } from "simulation/ai/strategos/geometry.js";

export const FIRE_MARGIN = 8;

export function reaches(source, position, extra)
{
	const reach = source.range + FIRE_MARGIN + (extra || 0);
	return squareDistance(source.position, position) <= reach * reach;
}

export function underFire(sources, position, extra)
{
	return sources.some(source => reaches(source, position, extra));
}
