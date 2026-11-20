import { UNIT_CLEARANCE } from "simulation/ai/strategos/rules.js";

export const LOAD_OVERHEAD_S = 0.9;
export const CROWD_FREE = 5;
export const CROWD_COST_S = 0.165;

export function halfSizeOf(template)
{
	if (!template)
		return 0;
	if (template.get("Obstruction/Static"))
		return Math.min(+template.get("Obstruction/Static/@width"), +template.get("Obstruction/Static/@depth")) / 2;
	if (template.get("Obstruction/Unit"))
		return +template.get("Obstruction/Unit/@radius");
	return 0;
}

export function reachOf(range, targetHalf)
{
	return targetHalf + 2 * (range + UNIT_CLEARANCE);
}

export function loadCycle(rate, capacity, speed, haul, reach, crowd)
{
	if (!(rate > 0) || !(capacity > 0))
		return Infinity;
	const walk = speed > 0 ? 2 * Math.max(0, haul - reach) / speed : Infinity;
	return capacity / rate + LOAD_OVERHEAD_S + walk + CROWD_COST_S * Math.max(0, crowd - CROWD_FREE);
}

export function loadOutput(rate, capacity, speed, haul, reach, crowd)
{
	const cycle = loadCycle(rate, capacity, speed, haul, reach, crowd);
	return isFinite(cycle) ? capacity / cycle : 0;
}
