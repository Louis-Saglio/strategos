import { TERRITORY_BLINKING_MASK, TERRITORY_OWNER_MASK } from "simulation/ai/strategos/rules.js";

export function territoryAt(territory, x, z)
{
	const i = Math.floor(x / territory.cellSize);
	const j = Math.floor(z / territory.cellSize);
	if (i < 0 || j < 0 || i >= territory.width || j >= territory.height)
		return { "owner": -1, "connected": false };
	const cell = territory.data[i + j * territory.width];
	return { "owner": cell & TERRITORY_OWNER_MASK, "connected": (cell & TERRITORY_BLINKING_MASK) === 0 };
}

export function territoryCell(territory, x, z)
{
	const i = Math.floor(x / territory.cellSize);
	const j = Math.floor(z / territory.cellSize);
	if (i < 0 || j < 0 || i >= territory.width || j >= territory.height)
		return -1;
	return territory.data[i + j * territory.width] & (TERRITORY_OWNER_MASK | TERRITORY_BLINKING_MASK);
}

const SHORE_PROBES = [6, 12, 18];

export function landRegionNear(accessibility, position)
{
	const region = accessibility.getAccessValue(position);
	if (region >= 2)
		return region;
	for (const reach of SHORE_PROBES)
		for (let k = 0; k < 8; ++k)
		{
			const found = accessibility.getAccessValue([position[0] + reach * Math.cos(k * Math.PI / 4), position[1] + reach * Math.sin(k * Math.PI / 4)]);
			if (found >= 2)
				return found;
		}
	return region;
}

const SEA_PROBES = [8, 16, 24];

export function seaNear(accessibility, position)
{
	const sea = accessibility.getAccessValue(position, true);
	if (sea >= 2)
		return sea;
	for (const reach of SEA_PROBES)
		for (let k = 0; k < 8; ++k)
		{
			const found = accessibility.getAccessValue([position[0] + reach * Math.cos(k * Math.PI / 4), position[1] + reach * Math.sin(k * Math.PI / 4)], true);
			if (found >= 2)
				return found;
		}
	return 0;
}

export function landRegionsOf(accessibility, places)
{
	return new Set(places.map(place => landRegionNear(accessibility, place.position)));
}
