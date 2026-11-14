import { territoryCell } from "simulation/ai/strategos/world.js";

const RING_STEP = 4;
const ARC_STEP = 4;
const MAX_CANDIDATES = 2000;
const MAX_FINE_CANDIDATES = 12000;
const DEFAULT_ANGLE = Math.PI;
const CELL_SLACK = Math.SQRT1_2;
const FIRE_MARGIN = 10;
const NEUTRAL_BLINKING = 0x40;

export class Placement
{
	constructor(world, player)
	{
		this.grids = world.grids;
		this.batteries = world.batteries;
		this.player = player;
		const home = world.centres[0];
		this.angle = home && isFinite(home.angle) ? home.angle : DEFAULT_ANGLE;
		this.u = [Math.cos(this.angle), -Math.sin(this.angle)];
		this.v = [Math.sin(this.angle), Math.cos(this.angle)];
	}

	territoryOwned(x, z)
	{
		const cell = territoryCell(this.grids.territory, x, z);
		return cell === this.player || this.neutralAllowed && (cell === 0 || cell === NEUTRAL_BLINKING);
	}

	allowNeutral(allowed)
	{
		this.neutralAllowed = allowed;
	}

	point(x, z, along, across)
	{
		return [x + along * this.u[0] + across * this.v[0], z + along * this.u[1] + across * this.v[1]];
	}

	corners(x, z, halfWidth, halfDepth)
	{
		return [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b]) => this.point(x, z, a * halfWidth, b * halfDepth));
	}

	clear(x, z, halfWidth, halfDepth)
	{
		const grid = this.grids.passability;
		const size = grid.cellSize;
		const corners = this.corners(x, z, halfWidth, halfDepth);
		const xs = corners.map(corner => corner[0]);
		const zs = corners.map(corner => corner[1]);
		const i0 = Math.floor(Math.min(...xs) / size);
		const i1 = Math.floor(Math.max(...xs) / size);
		const j0 = Math.floor(Math.min(...zs) / size);
		const j1 = Math.floor(Math.max(...zs) / size);
		if (i0 < 0 || j0 < 0 || i1 >= grid.width || j1 >= grid.height)
			return false;
		const mask = this.grids.buildingLand;
		const slack = CELL_SLACK * size;
		for (let j = j0; j <= j1; ++j)
		{
			const row = j * grid.width;
			const dz = (j + 0.5) * size - z;
			for (let i = i0; i <= i1; ++i)
			{
				if (!(grid.data[row + i] & mask))
					continue;
				const dx = (i + 0.5) * size - x;
				if (Math.abs(dx * this.u[0] + dz * this.u[1]) <= halfWidth + slack &&
				    Math.abs(dx * this.v[0] + dz * this.v[1]) <= halfDepth + slack)
					return false;
			}
		}
		return true;
	}

	fits(site, footprint, margin, reserved, keepAway)
	{
		const halfWidth = footprint.width / 2;
		const halfDepth = footprint.depth / 2;
		const [x, z] = site;
		if (!this.territoryOwned(x, z))
			return false;
		const corners = this.corners(x, z, halfWidth, halfDepth);
		if (corners.some(corner => !this.territoryOwned(corner[0], corner[1])))
			return false;
		for (const battery of this.batteries)
		{
			const dx = battery.position[0] - x;
			const dz = battery.position[1] - z;
			const reach = battery.range + FIRE_MARGIN + Math.max(halfWidth, halfDepth);
			if (dx * dx + dz * dz < reach * reach)
				return false;
		}
		for (const box of reserved)
		{
			const dx = box.x - x;
			const dz = box.z - z;
			if (Math.abs(dx * this.u[0] + dz * this.u[1]) < box.halfWidth + halfWidth + margin &&
			    Math.abs(dx * this.v[0] + dz * this.v[1]) < box.halfDepth + halfDepth + margin)
				return false;
		}
		for (const zone of keepAway)
		{
			const dx = zone.position[0] - x;
			const dz = zone.position[1] - z;
			const reach = zone.radius + Math.max(halfWidth, halfDepth);
			if (dx * dx + dz * dz < reach * reach)
				return false;
		}
		const grid = this.grids.passability;
		const mask = this.grids.buildingLand;
		for (const [px, pz] of [[x, z]].concat(corners))
		{
			const i = Math.floor(px / grid.cellSize);
			const j = Math.floor(pz / grid.cellSize);
			if (i < 0 || j < 0 || i >= grid.width || j >= grid.height || grid.data[i + j * grid.width] & mask)
				return false;
		}
		return this.clear(x, z, halfWidth + margin, halfDepth + margin);
	}

	ranked(anchor, minRadius, maxRadius, footprint, options, reserved, step)
	{
		const loosest = options[options.length - 1];
		let best = null;
		let tried = 0;
		for (let radius = minRadius; radius <= maxRadius; radius += step)
		{
			const steps = Math.max(8, Math.ceil(2 * Math.PI * radius / step));
			for (let k = 0; k < steps; ++k)
			{
				if (++tried > MAX_FINE_CANDIDATES)
					return best;
				const angle = 2 * Math.PI * k / steps;
				const site = this.point(anchor[0], anchor[1], radius * Math.cos(angle), radius * Math.sin(angle));
				if (!this.fits(site, footprint, loosest.margin, reserved, loosest.zones))
					continue;
				let rank = options.length - 1;
				for (let index = 0; index < rank; ++index)
					if (this.fits(site, footprint, options[index].margin, reserved, options[index].zones))
						rank = index;
				if (!best || rank < best.rank)
					best = { "x": site[0], "z": site[1], "angle": this.angle, "radius": radius, "rank": rank };
				if (rank === 0)
					return best;
			}
		}
		return best;
	}

	around(anchor, minRadius, maxRadius, footprint, margin, reserved, keepAway, step)
	{
		let tried = 0;
		const stride = step || Math.max(RING_STEP, Math.min(footprint.width, footprint.depth) / 2);
		const arc = step || Math.max(ARC_STEP, Math.min(footprint.width, footprint.depth) / 2);
		const limit = step ? MAX_FINE_CANDIDATES : MAX_CANDIDATES;
		for (let radius = minRadius; radius <= maxRadius; radius += stride)
		{
			const steps = Math.max(8, Math.ceil(2 * Math.PI * radius / arc));
			for (let k = 0; k < steps; ++k)
			{
				const angle = 2 * Math.PI * k / steps;
				const site = this.point(anchor[0], anchor[1], radius * Math.cos(angle), radius * Math.sin(angle));
				if (this.fits(site, footprint, margin, reserved, keepAway))
					return { "x": site[0], "z": site[1], "angle": this.angle, "radius": radius, "tried": tried + 1 };
				if (++tried >= limit)
					return null;
			}
		}
		return null;
	}
}
