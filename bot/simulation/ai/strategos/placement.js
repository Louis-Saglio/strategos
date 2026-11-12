import { territoryAt } from "simulation/ai/strategos/world.js";

const RING_STEP = 4;
const ARC_STEP = 4;
const MAX_CANDIDATES = 900;

export const BUILDING_ANGLE = Math.PI;

export class Placement
{
	constructor(world, player)
	{
		this.grids = world.grids;
		this.player = player;
	}

	territoryOwned(x, z)
	{
		const cell = territoryAt(this.grids.territory, x, z);
		return cell.owner === this.player && cell.connected;
	}

	clear(x, z, halfWidth, halfDepth)
	{
		const grid = this.grids.passability;
		const size = grid.cellSize;
		const i0 = Math.floor((x - halfWidth) / size);
		const i1 = Math.floor((x + halfWidth) / size);
		const j0 = Math.floor((z - halfDepth) / size);
		const j1 = Math.floor((z + halfDepth) / size);
		if (i0 < 0 || j0 < 0 || i1 >= grid.width || j1 >= grid.height)
			return false;
		const mask = this.grids.buildingLand;
		for (let j = j0; j <= j1; ++j)
		{
			const row = j * grid.width;
			for (let i = i0; i <= i1; ++i)
				if (grid.data[row + i] & mask)
					return false;
		}
		return true;
	}

	fits(site, footprint, margin, reserved, keepAway)
	{
		const halfWidth = footprint.width / 2;
		const halfDepth = footprint.depth / 2;
		const [x, z] = site;
		if (!this.territoryOwned(x, z) ||
		    !this.territoryOwned(x - halfWidth, z - halfDepth) || !this.territoryOwned(x + halfWidth, z - halfDepth) ||
		    !this.territoryOwned(x - halfWidth, z + halfDepth) || !this.territoryOwned(x + halfWidth, z + halfDepth))
			return false;
		for (const box of reserved)
			if (Math.abs(box.x - x) < box.halfWidth + halfWidth + margin &&
			    Math.abs(box.z - z) < box.halfDepth + halfDepth + margin)
				return false;
		for (const zone of keepAway)
		{
			const dx = zone.position[0] - x;
			const dz = zone.position[1] - z;
			const reach = zone.radius + Math.max(halfWidth, halfDepth);
			if (dx * dx + dz * dz < reach * reach)
				return false;
		}
		return this.clear(x, z, halfWidth + margin, halfDepth + margin);
	}

	around(anchor, minRadius, maxRadius, footprint, margin, reserved, keepAway)
	{
		let tried = 0;
		for (let radius = minRadius; radius <= maxRadius; radius += RING_STEP)
		{
			const steps = Math.max(8, Math.ceil(2 * Math.PI * radius / ARC_STEP));
			for (let k = 0; k < steps; ++k)
			{
				const angle = 2 * Math.PI * k / steps;
				const site = [anchor[0] + radius * Math.cos(angle), anchor[1] + radius * Math.sin(angle)];
				if (this.fits(site, footprint, margin, reserved, keepAway))
					return { "x": site[0], "z": site[1], "angle": BUILDING_ANGLE, "radius": radius, "tried": tried + 1 };
				if (++tried >= MAX_CANDIDATES)
					return null;
			}
		}
		return null;
	}
}
