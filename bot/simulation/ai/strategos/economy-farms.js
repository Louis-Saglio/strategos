import { halfSizeOf } from "simulation/ai/strategos/gathering.js";
import { squareDistance } from "simulation/ai/strategos/geometry.js";
import { BUILDING_MARGIN, FIELD_MARGIN, SUPPLY_CLEARANCE } from "simulation/ai/strategos/placement.js";
import { edgeDistance } from "simulation/ai/strategos/world-supplies.js";
import { FOOD } from "simulation/ai/strategos/yields.js";

const FIELD_RING = 4;
const FIELD_FAR = 110;
const ZONE_SLACK = 8;
const FARMSTEAD_FROM = 30;
const FARMSTEAD_TO = 110;
const FARMSTEAD_STEP = 8;
const FARMSTEAD_APART = 40;

export function farmOf(world, catalog)
{
	return catalog.cheapest(world.offered, name => catalog.isPlaceableOnLand(name) && catalog.isFarm(name));
}

export function farmSupply(catalog, farm, id, position, haul)
{
	const template = catalog.template(farm);
	const type = template.resourceSupplyType();
	return {
		"id": id,
		"kind": type.generic + "." + type.specific,
		"position": position,
		"haul": haul,
		"amount": Infinity,
		"gatherers": 0,
		"capacity": catalog.maxGatherers(farm) || 1,
		"diminishing": +(template.get("ResourceSupply/DiminishingReturns") || 0),
		"half": halfSizeOf(template)
	};
}

export function anchorAt(catalog, id, template, position, angle)
{
	const shape = catalog.footprint(template);
	return { "id": id, "template": template, "position": position, "radius": Math.max(shape.width, shape.depth) / 2, "shape": shape,
		"angle": angle, "types": [FOOD] };
}

export function farmAnchors(world, catalog)
{
	const anchors = world.anchors.filter(anchor => anchor.types.includes(FOOD) && !anchor.shore);
	for (const foundation of world.foundations)
		if (catalog.dropsiteTypes(foundation.template).includes(FOOD) && !catalog.isShoreStructure(foundation.template))
			anchors.push(anchorAt(catalog, foundation.id, foundation.template, foundation.position, foundation.angle));
	return anchors;
}

export function plannedFarms(world, catalog)
{
	return world.pendingConstructions.filter(pending => catalog.isFarm(pending.template))
		.map(pending => ({ "template": pending.template, "position": [pending.x, pending.z] }))
		.concat(world.foundations.filter(foundation => catalog.isFarm(foundation.template))
			.map(foundation => ({ "template": foundation.template, "position": foundation.position })));
}

export function nearestFarmAnchor(anchors, position)
{
	let best = null;
	let bestHaul = Infinity;
	for (const anchor of anchors)
	{
		const haul = edgeDistance(anchor, position);
		if (haul < bestHaul)
		{
			best = anchor;
			bestHaul = haul;
		}
	}
	return best && { "anchor": best, "haul": bestHaul };
}

function box(shape, x, z)
{
	return { "x": x, "z": z, "halfWidth": shape.width / 2, "halfDepth": shape.depth / 2 };
}

export function farmReserved(world, catalog)
{
	return world.pendingConstructions.map(pending => box(catalog.footprint(pending.template), pending.x, pending.z))
		.concat(world.foundations.map(foundation => box(catalog.footprint(foundation.template), foundation.position[0], foundation.position[1])));
}

export function reservedWith(reserved, catalog, template, site)
{
	return reserved.concat([box(catalog.footprint(template), site.x, site.z)]);
}

function keepAway(world, position, radius, reserved)
{
	const boxes = reserved.slice();
	const zones = [];
	for (const code of world.codes)
		for (const supply of world.suppliesAround(code, position, radius))
		{
			if (!isFinite(supply.max))
				boxes.push({ "x": supply.position[0], "z": supply.position[1], "halfWidth": supply.half, "halfDepth": supply.half });
			else
				zones.push({ "position": supply.position, "radius": supply.half + SUPPLY_CLEARANCE });
		}
	return { boxes, zones };
}

function extent(footprint)
{
	return Math.max(footprint.width, footprint.depth) / 2;
}

function scan(world, placement, centre, rings, footprint, margin, reserved, reach, count, apart)
{
	const sites = [];
	for (let radius = rings.from; radius <= rings.to && sites.length < count; radius += rings.step)
	{
		const steps = Math.max(8, Math.ceil(2 * Math.PI * radius / rings.step));
		for (let k = 0; k < steps && sites.length < count; ++k)
		{
			const angle = 2 * Math.PI * k / steps;
			const point = placement.point(centre[0], centre[1], radius * Math.cos(angle), radius * Math.sin(angle));
			if (sites.some(site => squareDistance([site.x, site.z], point) < apart * apart) || !placement.fits(point, footprint, margin, reserved, []))
				continue;
			const { boxes, zones } = keepAway(world, point, reach, reserved);
			if (placement.fits(point, footprint, margin, boxes, zones))
				sites.push({ "x": point[0], "z": point[1], "angle": placement.angle });
		}
	}
	return sites;
}

export function fieldSite(world, placement, catalog, farm, anchor, reserved, far)
{
	const footprint = catalog.footprint(farm);
	const half = extent(footprint);
	const from = anchor.radius + FIELD_MARGIN + half;
	const rings = { from, "to": far ? anchor.radius + FIELD_FAR : from + 2 * half + FIELD_RING, "step": half };
	const reach = Math.SQRT2 * (2 * half + FIELD_MARGIN) + ZONE_SLACK;
	return scan(world, placement, anchor.position, rings, footprint, FIELD_MARGIN, reserved, reach, 1, 0)[0] || null;
}

export function farmsteadSites(world, placement, catalog, template, farm, reserved, count)
{
	const home = world.home;
	const footprint = catalog.footprint(template);
	const rings = { "from": home.radius + FARMSTEAD_FROM, "to": home.radius + FARMSTEAD_TO, "step": FARMSTEAD_STEP };
	const reach = Math.SQRT2 * (extent(footprint) + BUILDING_MARGIN + extent(catalog.footprint(farm))) + ZONE_SLACK;
	return scan(world, placement, home.position, rings, footprint, BUILDING_MARGIN, reserved, reach, count, FARMSTEAD_APART);
}
