import { REPORT_MS, RETRY_MS } from "simulation/ai/strategos/cadence.js";
import { awayFrom, distanceBetween, squareDistance } from "simulation/ai/strategos/geometry.js";
import { Placement } from "simulation/ai/strategos/placement.js";
import { rankedSites } from "simulation/ai/strategos/sites.js";
import { Retry } from "simulation/ai/strategos/switches.js";
import { territoryAt } from "simulation/ai/strategos/terrain.js";

const BUILDING_MARGIN = 3;
const TIGHT_MARGIN = 1;
const FINE_STEP = 3;
const CRAMPED_MEMORY_MS = 60000;
const FIELD_MARGIN = 1;
const HOUSE_RING_WIDTH = 120;
const CENTRE_CLEARANCE = 8;
const KEEP_AWAY = { "food": 10, "wood": 6, "stone": 14, "metal": 14 };
const SAME_TYPE_KEEP_AWAY = 3;
const DROPSITE_REACH = 28;
const CLUSTER_RADIUS = 20;
const DROPSITE_SEARCH = 160;
const DROPSITE_DISTANCE_BIAS = 40;
const DROPSITE_CELLS_TRIED = 4;
const HAUL_CELL = 16;
const HAUL_FAR = 50;
const HAUL_SITES_TRIED = 4;
const HAUL_SEARCH = 40;
const HAUL_HORIZON_S = 240;
export const HAUL_RETURN = 1.5;
const FARMSTEAD_SEARCH = { "from": 30, "to": 110 };
const SETTLEMENT_SPACING_MARGIN = 10;
const SETTLEMENT_TRIES = 6;
const DOCK_OFFSETS = [0.5, 0.25, 0.75];
const DOCK_SITES_TRIED = 40;
const DOCK_OFFING = 30;
const DOCK_MATCH = 25;
const DOCK_SEA_ROOM = 18;
const DOCK_BLOCKED_CLEARANCE = 80;
const DOCK_SCHOOLS_COUNTED = 8;
const DOCK_SCHOOL_BONUS = 20;
const SPACING_MARGIN = 8;

export class Siting
{
	constructor(catalog, player, telemetry, builders)
	{
		this.catalog = catalog;
		this.player = player;
		this.telemetry = telemetry;
		this.builders = builders;
		this.noSiteReported = new Retry();
		this.noSiteTime = new Retry();
		this.dockSite = null;
		this.dockRefused = new Set();
	}

	save()
	{
		return { "noSiteReported": this.noSiteReported.save(), "noSiteTime": this.noSiteTime.save(), "dockSite": this.dockSite,
			"dockRefused": this.dockRefused, "crampedAt": this.crampedAt };
	}

	restore(data)
	{
		this.noSiteReported.restore(data.noSiteReported);
		this.noSiteTime.restore(data.noSiteTime);
		this.dockSite = data.dockSite;
		this.dockRefused = data.dockRefused;
		this.crampedAt = data.crampedAt;
	}

	searchable(world, key)
	{
		return this.noSiteTime.due(world.time, RETRY_MS, key);
	}

	noSite(world, key)
	{
		this.noSiteTime.record(world.time, key);
		if (this.noSiteReported.attempt(world.time, REPORT_MS, key))
			this.telemetry.line("BUILD", world.time, { "noSite": key });
		return null;
	}

	sought(world, key, search)
	{
		return this.searchable(world, key) ? search() || this.noSite(world, key) : null;
	}

	settle(outcomes)
	{
		for (const { request, issued } of outcomes)
			if (issued && request.note && request.note.dockSite)
				this.dockSite = request.note.dockSite;
	}

	halfSize(template)
	{
		const footprint = this.catalog.footprint(template);
		return Math.max(footprint.width, footprint.depth) / 2;
	}

	reserved(world)
	{
		return world.pendingConstructions.map(pending => {
			const footprint = this.catalog.footprint(pending.template);
			return { "x": pending.x, "z": pending.z, "halfWidth": footprint.width / 2, "halfDepth": footprint.depth / 2 };
		}).concat(this.builders.abandoned);
	}

	resourceZones(world, spared)
	{
		const zones = [];
		for (const code of world.codes)
			for (const site of world.sites[code])
				if (isFinite(site.amount))
					zones.push({ "position": site.position, "radius": code === spared ? SAME_TYPE_KEEP_AWAY : KEEP_AWAY[code] || 0 });
		return zones;
	}

	farmBelts(world)
	{
		const farm = this.catalog.cheapest(world.offered, name => this.catalog.isPlaceableOnLand(name) && this.catalog.isFarm(name));
		if (!farm)
			return [];
		const belt = 2 * this.halfSize(farm) + FIELD_MARGIN + 2;
		return world.anchors
			.filter(anchor => anchor.types.includes("food"))
			.map(anchor => ({ "position": anchor.position, "radius": anchor.radius + belt }));
	}

	cramped(world)
	{
		return this.crampedAt !== undefined && world.time - this.crampedAt < CRAMPED_MEMORY_MS;
	}

	ring(world, placement, template)
	{
		const reserved = this.reserved(world);
		const footprint = this.catalog.footprint(template);
		const spacing = this.catalog.spacing(template);
		const apart = spacing ? world.footprints.filter(other => other.classes.includes(spacing.fromClass))
			.map(other => ({ "position": other.position, "radius": spacing.min + SPACING_MARGIN })) : [];
		const belts = this.farmBelts(world).concat(apart);
		for (const centre of world.centres)
		{
			const minRadius = centre.radius + CENTRE_CLEARANCE + this.halfSize(template);
			for (const zones of [this.resourceZones(world, null).concat(belts), belts, apart])
			{
				const site = placement.around(centre.position, minRadius, minRadius + HOUSE_RING_WIDTH, footprint, BUILDING_MARGIN, reserved, zones);
				if (site)
					return site;
			}
		}
		const options = [{ "margin": BUILDING_MARGIN, "zones": belts }, { "margin": TIGHT_MARGIN, "zones": belts },
			{ "margin": TIGHT_MARGIN, "zones": apart }, { "margin": 0, "zones": apart }];
		let best = null;
		for (const centre of world.centres)
		{
			const minRadius = centre.radius + TIGHT_MARGIN + this.halfSize(template);
			const site = placement.ranked(centre.position, minRadius, minRadius + HOUSE_RING_WIDTH, footprint, options, reserved, FINE_STEP);
			if (site && (!best || site.rank < best.rank))
				best = site;
			if (best && best.rank === 0)
				break;
		}
		if (!best)
			this.crampedAt = world.time;
		return best;
	}

	beside(world, placement, centre, template)
	{
		const minRadius = centre.radius + CENTRE_CLEARANCE + this.halfSize(template);
		return placement.around(centre.position, minRadius, minRadius + HOUSE_RING_WIDTH, this.catalog.footprint(template), BUILDING_MARGIN,
			this.reserved(world), this.farmBelts(world));
	}

	field(world, placement, farm, near)
	{
		const footprint = this.catalog.footprint(farm);
		const half = this.halfSize(farm);
		const reserved = this.reserved(world);
		const zones = near ? this.resourceZones(world, "food") : [];
		for (const anchor of world.anchors.filter(candidate => candidate.types.includes("food")))
		{
			const minRadius = anchor.radius + FIELD_MARGIN + half;
			const site = placement.around(anchor.position, minRadius, near ? minRadius + 2 * half + 4 : FARMSTEAD_SEARCH.to, footprint,
				FIELD_MARGIN, reserved, zones);
			if (site)
				return site;
		}
		return null;
	}

	farmstead(world, placement, template, farm)
	{
		const centre = world.home;
		return placement.around(centre.position, centre.radius + FARMSTEAD_SEARCH.from, centre.radius + FARMSTEAD_SEARCH.to,
			this.catalog.footprint(template), 2 * this.halfSize(farm) * 0.75, this.reserved(world),
			this.resourceZones(world, null));
	}

	cluster(world, placement, code, template)
	{
		const sites = world.sites[code].filter(site => isFinite(site.amount));
		if (!sites.length || Math.min(...sites.map(site => site.anchorDistance)) <= DROPSITE_REACH)
			return null;
		const half = this.halfSize(template);
		const zones = this.resourceZones(world, code).concat(this.farmBelts(world));
		const reserved = this.reserved(world);
		for (const centre of this.richestCells(world, code).concat([this.densest(sites).position]))
		{
			const site = placement.around(centre, half + SAME_TYPE_KEEP_AWAY, half + CLUSTER_RADIUS,
				this.catalog.footprint(template), BUILDING_MARGIN, reserved, zones);
			if (site)
				return site;
		}
		return null;
	}

	richestCells(world, code)
	{
		const grid = world.wealth;
		const totals = grid.totals[code];
		const weighted = grid.weighted[code];
		if (!totals || !weighted)
			return [];
		const home = world.home.position;
		const served = world.anchors.filter(anchor => anchor.types.includes(code));
		const cells = [];
		for (let index = 0; index < totals.length; ++index)
		{
			const amount = totals[index];
			if (!(amount > 0))
				continue;
			const position = [weighted[2 * index] / amount, weighted[2 * index + 1] / amount];
			const distance = distanceBetween(position, home);
			if (distance > DROPSITE_SEARCH || territoryAt(world.grids.territory, position[0], position[1]).owner !== this.player ||
			    served.some(anchor => squareDistance(anchor.position, position) <= DROPSITE_REACH * DROPSITE_REACH))
				continue;
			cells.push({ position, "score": amount / (distance + DROPSITE_DISTANCE_BIAS), index });
		}
		cells.sort((a, b) => b.score - a.score || a.index - b.index);
		return cells.slice(0, DROPSITE_CELLS_TRIED).map(cell => cell.position);
	}

	densest(sites)
	{
		const limit = CLUSTER_RADIUS * CLUSTER_RADIUS;
		let best = sites[0];
		let bestCount = -1;
		for (const site of sites)
		{
			let count = 0;
			for (const other of sites)
				if (squareDistance(site.position, other.position) <= limit)
					count += 1;
			if (count > bestCount)
			{
				best = site;
				bestCount = count;
			}
		}
		return best;
	}

	haulers(world, code)
	{
		const haulers = [];
		for (const worker of world.workers)
		{
			if (worker.gathering !== code || !worker.targetPosition || !(worker.haul > HAUL_FAR))
				continue;
			const rate = worker.profile.rates[worker.kind] || 0;
			const capacity = worker.profile.capacities[code] || 0;
			if (rate > 0 && capacity > 0 && worker.profile.speed > 0)
				haulers.push({ "target": worker.targetPosition, "haul": worker.haul, "rate": rate, "fill": capacity / rate,
					"speed": worker.profile.speed });
		}
		return haulers;
	}

	haulGain(haulers, position, radius)
	{
		let gain = 0;
		let output = 0;
		let gatherers = 0;
		for (const hauler of haulers)
		{
			const next = Math.max(0, distanceBetween(hauler.target, position) - radius);
			if (next >= hauler.haul)
				continue;
			const working = distance => hauler.fill / (hauler.fill + 2 * distance / hauler.speed);
			gain += hauler.rate * (working(next) - working(hauler.haul));
			output += hauler.rate * working(next);
			gatherers += 1;
		}
		return { gain, output, gatherers };
	}

	wealthNear(world, code, position)
	{
		const grid = world.wealth;
		const totals = grid.totals[code];
		const weighted = grid.weighted[code];
		if (!totals || !weighted)
			return 0;
		const reach = (HAUL_SEARCH + DROPSITE_REACH) * (HAUL_SEARCH + DROPSITE_REACH);
		const i0 = Math.floor(position[0] / grid.cellSize);
		const j0 = Math.floor(position[1] / grid.cellSize);
		let wealth = 0;
		for (let j = Math.max(0, j0 - 2); j <= Math.min(grid.height - 1, j0 + 2); ++j)
			for (let i = Math.max(0, i0 - 2); i <= Math.min(grid.width - 1, i0 + 2); ++i)
			{
				const index = i + j * grid.width;
				const amount = totals[index];
				if (amount > 0 && squareDistance([weighted[2 * index] / amount, weighted[2 * index + 1] / amount], position) <= reach)
					wealth += amount;
			}
		return wealth;
	}

	relief(world, placement, code, template)
	{
		const haulers = this.haulers(world, code);
		if (!haulers.length)
			return null;
		const cells = new Map();
		for (const hauler of haulers)
		{
			const key = Math.floor(hauler.target[0] / HAUL_CELL) + "," + Math.floor(hauler.target[1] / HAUL_CELL);
			if (!cells.has(key))
				cells.set(key, { "x": 0, "z": 0, "count": 0 });
			const cell = cells.get(key);
			cell.x += hauler.target[0];
			cell.z += hauler.target[1];
			cell.count += 1;
		}
		const cost = this.catalog.costSum(template);
		const centres = [...cells.values()]
			.map((cell, index) => {
				const position = [cell.x / cell.count, cell.z / cell.count];
				return { position, index, "gain": this.haulGain(haulers, position, 0).gain };
			})
			.filter(centre => centre.gain * HAUL_HORIZON_S >= HAUL_RETURN * cost)
			.sort((a, b) => b.gain - a.gain || a.index - b.index)
			.slice(0, HAUL_SITES_TRIED);
		if (!centres.length)
			return null;
		const half = this.halfSize(template);
		const zones = this.resourceZones(world, code);
		const reserved = this.reserved(world);
		for (const centre of centres)
		{
			const site = placement.around(centre.position, half + SAME_TYPE_KEEP_AWAY, half + HAUL_SEARCH,
				this.catalog.footprint(template), BUILDING_MARGIN, reserved, zones);
			if (!site)
				continue;
			const { gain, output, gatherers } = this.haulGain(haulers, [site.x, site.z], half);
			const lasting = Math.min(HAUL_HORIZON_S, this.wealthNear(world, code, [site.x, site.z]) / Math.max(0.1, output));
			const payback = gain * lasting / cost;
			if (payback >= HAUL_RETURN)
				return { template, site, gain, payback, gatherers };
		}
		return null;
	}

	settlement(world, plan, template, home, reach, region)
	{
		const spacing = this.catalog.spacing(template);
		const minimum = (spacing ? spacing.min : 0) + SETTLEMENT_SPACING_MARGIN + world.wealth.cellSize * Math.SQRT2;
		const spaced = spacing ? world.footprints.filter(footprint => footprint.classes.includes(spacing.fromClass)) : [];
		const grid = world.wealth;
		const candidates = rankedSites(grid, world.codes, plan.sites.wealthCap, null, 1,
			position => {
				const fromHome = distanceBetween(position, home);
				if (fromHome > reach || region !== undefined && world.regionOf(position) !== region ||
				    spaced.some(footprint => squareDistance(footprint.position, position) < minimum * minimum))
					return null;
				const fromEnemy = Math.min(Infinity, ...world.enemyCentres.map(centre => distanceBetween(centre.position, position)));
				if (fromEnemy < plan.sites.enemyClearance || fromEnemy <= fromHome)
					return null;
				const owner = territoryAt(world.grids.territory, position[0], position[1]).owner;
				return owner !== 0 && owner !== this.player ? null : fromHome;
			},
			(wealth, position, fromHome) => wealth > 0 ? wealth * (1 - fromHome / (2 * reach)) : null);
		const placement = new Placement(world, this.player);
		placement.allowNeutral(true);
		const zones = this.resourceZones(world, null);
		for (const candidate of candidates.slice(0, SETTLEMENT_TRIES))
		{
			const site = placement.around(candidate.position, 0, grid.cellSize, this.catalog.footprint(template), BUILDING_MARGIN,
				this.reserved(world), zones);
			if (site)
				return site;
		}
		return null;
	}

	forward(world, plan, template, front)
	{
		const placement = new Placement(world, this.player);
		placement.allowNeutral(true);
		placement.man(front.region);
		const site = placement.around(front.position, 0, plan.forwardBase.reach, this.catalog.footprint(template), BUILDING_MARGIN,
			this.reserved(world), []);
		const spacing = this.catalog.spacing(template);
		const apart = (spacing ? spacing.min : 0) + SETTLEMENT_SPACING_MARGIN;
		return site && !world.enemyCentres.concat(world.centres).some(centre =>
			squareDistance(centre.position, [site.x, site.z]) < apart * apart) ? site : null;
	}

	follow(world, ordered, rising)
	{
		const tried = this.dockSite;
		if (!tried)
			return;
		tried.seen = tried.seen || ordered;
		if (rising || world.docks.some(dock => squareDistance(dock.position, [tried.x, tried.z]) <= DOCK_MATCH * DOCK_MATCH))
			this.dockSite = null;
		else if (tried.seen && !ordered)
		{
			this.dockRefused.add(tried.key);
			this.telemetry.line("BUILD", world.time, { "refused": tried.template, "x": Math.round(tried.x), "z": Math.round(tried.z) });
			this.dockSite = null;
		}
	}

	shore(world, template, region, sea, origin, spacing)
	{
		const grid = world.grids.passability;
		const shores = [];
		for (let index = 0; index < world.shores.length; ++index)
		{
			const shore = world.shores[index];
			if (shore.region !== region || shore.sea !== sea)
				continue;
			const owner = territoryAt(world.grids.territory, shore.land[0], shore.land[1]).owner;
			if (owner !== 0 && owner !== this.player)
				continue;
			const offing = awayFrom(shore.water, shore.land, DOCK_OFFING);
			if (!world.openWater(offing, sea, DOCK_SEA_ROOM) ||
			    world.docks.some(dock => squareDistance(dock.position, shore.land) <
				Math.max(spacing || 0, dock.blocked ? DOCK_BLOCKED_CLEARANCE : 0) * Math.max(spacing || 0, dock.blocked ? DOCK_BLOCKED_CLEARANCE : 0)))
				continue;
			const reach = world.fishRadius * world.fishRadius;
			const schools = spacing ? 0 :
				Math.min(DOCK_SCHOOLS_COUNTED, world.schools.filter(school => squareDistance(school, shore.water) <= reach).length);
			const distance = Math.max(0, distanceBetween(shore.land, origin) - DOCK_SCHOOL_BONUS * schools);
			shores.push({ shore, index, "distance": distance });
		}
		shores.sort((a, b) => a.distance - b.distance || a.index - b.index);
		for (const { shore, index } of shores.slice(0, DOCK_SITES_TRIED))
			for (const offset of DOCK_OFFSETS)
			{
				const key = index + ":" + offset;
				if (this.dockRefused.has(key))
					continue;
				const x = shore.land[0] + offset * (shore.water[0] - shore.land[0]);
				const z = shore.land[1] + offset * (shore.water[1] - shore.land[1]);
				const i = Math.floor(x / grid.cellSize);
				const j = Math.floor(z / grid.cellSize);
				if (i < 0 || j < 0 || i >= grid.width || j >= grid.height || grid.data[i + j * grid.width] & world.grids.buildingShore)
				{
					this.dockRefused.add(key);
					continue;
				}
				return { "x": x, "z": z, "angle": 0, "note": { "dockSite": { key, template, x, z, region, "seen": false } } };
			}
		return null;
	}
}
