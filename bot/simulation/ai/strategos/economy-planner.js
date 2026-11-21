import { RETRY_MS } from "simulation/ai/strategos/cadence.js";
import { TERRITORY_PATH } from "simulation/ai/strategos/catalog.js";
import { crewOf, crewSize } from "simulation/ai/strategos/crews.js";
import { anchorAt, farmAnchors, farmOf, farmReserved, farmSupply, farmsteadSites, fieldSite, nearestFarmAnchor, plannedFarms, reservedWith } from "simulation/ai/strategos/economy-farms.js";
import { NEAR_REACH, allocate, depleted, profileFor, ranked, singleOutput, withSupply } from "simulation/ai/strategos/economy-market.js";
import { squareDistance } from "simulation/ai/strategos/geometry.js";
import { BUILDING_MARGIN, Placement, SUPPLY_CLEARANCE, SUPPLY_LANE } from "simulation/ai/strategos/placement.js";
import { buildRequest, inTier, returning } from "simulation/ai/strategos/requests.js";
import { FOUNDATION_TIME_MODIFIER } from "simulation/ai/strategos/rules.js";
import { Change, Retry } from "simulation/ai/strategos/switches.js";
import { territoryAt } from "simulation/ai/strategos/terrain.js";
import { TECH_HORIZON_S, TRAINING_BATCH, pricedSum, resourcePrices } from "simulation/ai/strategos/valuation.js";
import { edgeDistance } from "simulation/ai/strategos/world-supplies.js";
import { FOOD } from "simulation/ai/strategos/yields.js";

const PLAN_CELL = 16;
const CANDIDATES_TRIED = 6;
const SEARCH_STEP = 3;
const SEARCH_RINGS = 6;
const MAX_URGENCY = 3;
const FARMS = "farms";
const NEW_ANCHOR = -1;
const NEW_FRONT = "new";
const SITE_CHOICES = 3;

function civilianGrowth(world, catalog)
{
	let growth = 0;
	for (const trainer of world.trainers)
	{
		const civilian = catalog.cheapest(trainer.trainable, name => catalog.isCivilian(name));
		const seconds = civilian ? catalog.buildTime(civilian) * Math.pow(TRAINING_BATCH, trainer.batchTimeModifier) / TRAINING_BATCH : 0;
		if (seconds > 0)
			growth += 1 / seconds;
	}
	return growth;
}

function safety(world, position)
{
	let ratio = 1;
	const home = world.home.position;
	for (const centre of world.enemyCentres)
	{
		const fromHome = Math.sqrt(squareDistance(home, centre.position));
		if (fromHome > 0)
			ratio = Math.min(ratio, Math.sqrt(squareDistance(position, centre.position)) / fromHome);
	}
	return ratio * ratio;
}

function outerRadius(shape)
{
	return Math.sqrt(shape.width * shape.width + shape.depth * shape.depth) / 2;
}

function idealOutput(profile, code)
{
	let best = 0;
	for (const kind in profile.rates)
		if (kind.split(".")[0] === code)
			best = Math.max(best, singleOutput(profile, { kind, "haul": 0, "half": 0, "diminishing": 0 }));
	return best;
}

function nearestHaul(anchors, position)
{
	let best = Infinity;
	for (const anchor of anchors)
		best = Math.min(best, edgeDistance(anchor, position));
	return best;
}

function withAnchor(fronts, anchor, key, extra, profile)
{
	const fresh = new Map();
	const others = fronts.map(front => ({ "key": front.key, "anchor": front.anchor, "crowd": front.crowd, "supplies": front.supplies.filter(supply => {
		const haul = edgeDistance(anchor, supply.position);
		if (haul >= supply.haul)
			return true;
		fresh.set(supply.id, Object.assign({}, supply, { haul }));
		return false;
	}) }));
	const known = new Set(fronts.flatMap(front => front.supplies.map(supply => supply.id)));
	for (const supply of extra)
		if (!known.has(supply.id) && !fresh.has(supply.id))
			fresh.set(supply.id, Object.assign({}, supply, { "haul": edgeDistance(anchor, supply.position) }));
	const front = { key, "anchor": anchor.id, "crowd": 0, "supplies": ranked([...fresh.values()], profile) };
	return { "fronts": others.concat([front]), front };
}

export class SitePlanner
{
	constructor(catalog, player, telemetry)
	{
		this.catalog = catalog;
		this.player = player;
		this.telemetry = telemetry;
		this.turn = 0;
		this.noSite = new Retry();
		this.reported = new Map();
	}

	save()
	{
		return { "turn": this.turn, "noSite": this.noSite.save(), "reported": [...this.reported].map(([code, change]) => [code, change.save()]) };
	}

	restore(data)
	{
		if (!data)
			return;
		this.turn = data.turn;
		this.noSite.restore(data.noSite);
		this.reported = new Map(data.reported.map(([code, value]) => {
			const change = new Change();
			change.restore(value);
			return [code, change];
		}));
	}

	serves(code, name)
	{
		return this.catalog.dropsiteTypes(name).includes(code) && !this.catalog.isFarm(name);
	}

	template(world, code)
	{
		return this.catalog.cheapest(world.offered, name => this.catalog.isPlaceableOnLand(name) && this.serves(code, name));
	}

	planned(world, code)
	{
		const anchors = [];
		world.pendingConstructions.forEach((pending, index) => {
			if (this.serves(code, pending.template))
				anchors.push({ "id": NEW_ANCHOR - 1 - index, "position": [pending.x, pending.z], "shape": this.catalog.footprint(pending.template),
					"angle": pending.angle || 0 });
		});
		for (const foundation of world.foundations)
			if (this.serves(code, foundation.template))
				anchors.push({ "id": foundation.id, "position": foundation.position, "shape": this.catalog.footprint(foundation.template),
					"angle": foundation.angle });
		return anchors;
	}

	request(world, plan, assessments, survey)
	{
		if (!world.centres.length)
			return null;
		const code = world.codes[this.turn % world.codes.length];
		this.turn += 1;
		const ahead = TECH_HORIZON_S / 2;
		const labour = Math.min(world.populationMax, world.labour + world.queuedPopulation + civilianGrowth(world, this.catalog) * ahead);
		const farming = code === FOOD;
		const wanted = Math.round(assessments.gatherShares[code] * labour - (farming ? world.foodHelpers : 0));
		const template = this.template(world, code);
		const planned = template ? this.planned(world, code) : [];
		const open = !!template && !planned.length && this.noSite.due(world.time, RETRY_MS, code);
		const profile = profileFor(world, code, farming);
		const farmTemplate = farming ? farmOf(world, this.catalog) : null;
		const shortfall = farmTemplate && profile ? this.shortfall(world, assessments, farmTemplate, profile) : null;
		const farm = shortfall && this.noSite.due(world.time, RETRY_MS, FARMS) ? farmTemplate : null;
		if (wanted < 1 || !open && !farm || !profile)
			return null;
		const serial = { "id": 0 };
		const anchors = farming ? farmAnchors(world, this.catalog) : [];
		const fronts = this.fronts(world, code, profile, survey, ahead, anchors, planned, serial);
		const context = { world, code, profile, wanted, fronts, serial, shortfall, "before": allocate(fronts, wanted, profile),
			"placement": new Placement(world, this.player), "prices": resourcePrices(world) };
		const options = [];
		if (open)
		{
			const sited = this.dropsiteOption(context, template);
			if (!sited.found)
			{
				this.noSite.record(world.time, code);
				this.telemetry.line("BUILD", world.time, { "noSite": template, "code": code });
			}
			else if (sited.option)
				options.push(sited.option);
		}
		if (farm)
		{
			const sited = this.farmOptions(context, farm, planned.length ? null : template, anchors);
			if (!sited.found)
			{
				this.noSite.record(world.time, FARMS);
				this.telemetry.line("BUILD", world.time, { "noSite": farm, "code": code });
			}
			options.push(...sited.options);
		}
		let best = null;
		for (const option of options)
			if ((option.purpose !== "dropsite" || option.payback >= 1) && (!best || option.payback > best.payback))
				best = option;
		return best && this.ask(world, plan, context, best);
	}

	shortfall(world, assessments, farm, profile)
	{
		const desired = assessments.gatherShares[FOOD] * (world.labour + world.queuedPopulation);
		let places = world.foodHelpers + this.farms(world) * (this.catalog.maxGatherers(farm) || 1);
		const anchors = world.anchors.filter(anchor => anchor.types.includes(FOOD));
		for (const site of world.sites[FOOD])
		{
			const supply = Object.assign({ "half": 0, "diminishing": 0 }, site, { "haul": nearestHaul(anchors, site.position) });
			if (!isFinite(supply.amount) || supply.prey)
				continue;
			const output = singleOutput(profile, supply);
			if (output > 0 && output >= world.fieldRate)
				places += Math.min(supply.capacity, supply.amount / (output * TECH_HORIZON_S));
		}
		return desired > places ? { "places": desired - places, "share": (desired - places) / Math.max(1, desired) } : null;
	}

	farms(world)
	{
		let total = 0;
		for (const name in world.structureCounts)
			if (this.catalog.isFarm(name))
				total += world.structureCounts[name];
		return total + plannedFarms(world, this.catalog).length;
	}

	fronts(world, code, profile, survey, ahead, anchors, planned, serial)
	{
		let fronts = [...survey.fronts.values()].filter(front => front.code === code)
			.map(front => depleted({ "key": front.key, "anchor": front.anchor, "crowd": front.crowd, "supplies": ranked(front.supplies, profile) }, profile,
				ahead, survey.holders));
		const far = (survey.beyond[code] || []).filter(site => !site.prey && isFinite(site.amount));
		if (far.length)
			fronts.push({ "key": "beyond", "anchor": null, "crowd": 0, "supplies": ranked(far, profile) });
		for (const anchor of planned)
			fronts = withAnchor(fronts, anchor, "planned:" + anchor.id, this.around(world, code, anchor, profile), profile).fronts;
		if (!anchors.length)
			return fronts;
		for (const planned of plannedFarms(world, this.catalog))
		{
			const nearest = nearestFarmAnchor(anchors, planned.position);
			if (nearest)
				fronts = withSupply(fronts, nearest.anchor.id + ":" + FOOD,
					farmSupply(this.catalog, planned.template, --serial.id, planned.position, nearest.haul), profile);
		}
		return fronts;
	}

	around(world, code, anchor, profile)
	{
		return world.suppliesAround(code, anchor.position, outerRadius(anchor.shape) + NEAR_REACH)
			.filter(supply => isFinite(supply.amount) && profile.rates[supply.kind] > 0);
	}

	dropsiteOption(context, template)
	{
		const { world, code, profile, fronts, placement } = context;
		const reach = +(this.catalog.template(template).get(TERRITORY_PATH) || 0);
		let found = false;
		let best = null;
		const consider = candidate => {
			if (!candidate)
				return;
			found = true;
			const option = this.priced(context, candidate.option, candidate.templates, "dropsite", "investment");
			if (option && (!best || option.payback > best.payback))
				best = option;
		};
		let tried = 0;
		for (const cell of this.cells(world, code, profile, fronts))
		{
			const centre = this.inside(world, cell);
			if (!centre)
				continue;
			if (++tried > CANDIDATES_TRIED)
				break;
			const sites = this.search(world, placement, code, template, centre, cell);
			for (const site of sites)
				consider(this.valued(context, template, site, site, 1));
			if (sites.length && centre !== cell && reach > 0)
				consider(this.chain(context, template, sites[0], cell, reach));
		}
		return { found, "option": best };
	}

	valued(context, template, site, target, links)
	{
		const { world, code, profile, fronts, wanted, before } = context;
		const option = this.option(world, code, profile, fronts, wanted, template, target);
		if (!option)
			return null;
		option.site = site;
		option.links = links;
		option.delay = (links - 1) * this.catalog.buildTime(template);
		option.safety = safety(world, [target.x, target.z]);
		option.value = (option.total - before.output) * option.safety;
		return { option, "templates": Array(links).fill(template) };
	}

	chain(context, template, first, cell, reach)
	{
		const from = [first.x, first.z];
		const length = Math.sqrt(squareDistance(from, cell));
		const span = length - PLAN_CELL;
		if (!(span > 0))
			return null;
		const target = { "x": from[0] + (cell[0] - from[0]) * span / length, "z": from[1] + (cell[1] - from[1]) * span / length, "angle": first.angle };
		return this.valued(context, template, first, target, Math.ceil(span / reach) + 1);
	}

	farmOptions(context, farm, farmstead, anchors)
	{
		const world = context.world;
		const reserved = farmReserved(world, this.catalog);
		const options = [];
		const near = this.fieldOption(context, farm, anchors, reserved, false);
		if (near.option)
			options.push(near.option);
		const fields = Math.max(1, Math.ceil(context.shortfall.places / (this.catalog.maxGatherers(farm) || 1)));
		const stead = farmstead ? this.steadOption(context, farm, farmstead, reserved, fields) :
			{ "found": false, "option": null };
		if (stead.option)
			options.push(stead.option);
		if (near.found || stead.found)
			return { "found": true, options };
		const far = this.fieldOption(context, farm, anchors, reserved, true);
		return { "found": far.found, "options": far.option ? [far.option] : [] };
	}

	fieldOption(context, farm, anchors, reserved, far)
	{
		const { world, profile, fronts, wanted, placement, before, serial } = context;
		let best = null;
		for (const anchor of anchors)
		{
			const site = fieldSite(world, placement, this.catalog, farm, anchor, reserved, far);
			if (!site)
				continue;
			const position = [site.x, site.z];
			const key = anchor.id + ":" + FOOD;
			const extended = withSupply(fronts, key, farmSupply(this.catalog, farm, --serial.id, position, edgeDistance(anchor, position)), profile);
			const after = allocate(extended, wanted, profile);
			const index = extended.findIndex(front => front.key === key);
			const option = { site, "anchor": anchor.id, "total": after.output, "output": after.totals[index], "stock": Infinity,
				"moved": after.counts[index], "safety": safety(world, position) };
			option.value = (option.total - before.output) * option.safety;
			if (!best || option.value > best.value)
				best = option;
		}
		return { "found": !!best, "option": best && this.priced(context, best, [farm], "farm", "farm") };
	}

	steadOption(context, farm, farmstead, reserved, fields)
	{
		const { world, profile, fronts, wanted, placement, before, serial } = context;
		let best = null;
		let found = false;
		for (const site of farmsteadSites(world, placement, this.catalog, farmstead, farm, reserved, CANDIDATES_TRIED))
		{
			const anchor = anchorAt(this.catalog, NEW_ANCHOR, farmstead, [site.x, site.z], site.angle);
			let taken = reservedWith(reserved, this.catalog, farmstead, site);
			const supplies = [];
			while (supplies.length < fields)
			{
				const field = fieldSite(world, placement, this.catalog, farm, anchor, taken, false);
				if (!field)
					break;
				const position = [field.x, field.z];
				supplies.push(farmSupply(this.catalog, farm, --serial.id, position, edgeDistance(anchor, position)));
				taken = reservedWith(taken, this.catalog, farm, field);
			}
			if (!supplies.length)
				continue;
			found = true;
			const after = allocate(fronts.concat([{ "key": NEW_FRONT, "anchor": NEW_ANCHOR, "crowd": 0, "supplies": ranked(supplies, profile) }]), wanted,
				profile);
			const option = { site, "fields": supplies.length, "total": after.output, "output": after.totals[fronts.length], "stock": Infinity,
				"moved": after.counts[fronts.length], "safety": safety(world, [site.x, site.z]) };
			option.value = (option.total - before.output) * option.safety;
			if (!best || option.value > best.value)
				best = option;
		}
		return { found, "option": best && this.priced(context, best, [farmstead].concat(Array(best.fields).fill(farm)), "farmstead", "farm") };
	}

	priced(context, option, templates, purpose, worth)
	{
		if (!(option.value > 0) || !(option.output > 0))
			return null;
		const { world, code, prices, before, wanted } = context;
		const perGatherer = before.output / Math.max(1, wanted);
		let cost = 0;
		for (const name of templates)
			cost += pricedSum(world, prices, this.catalog.cost(name)) +
				prices[code] * perGatherer * this.catalog.buildTime(name) * Math.pow(crewSize(world, this.catalog, name), 1 - FOUNDATION_TIME_MODIFIER);
		const life = Math.min(TECH_HORIZON_S, option.stock / option.output) * Math.exp(-(option.delay || 0) / TECH_HORIZON_S);
		return Object.assign(option, { "template": templates[0], "purpose": purpose, "worth": worth,
			"payback": prices[code] * option.value * life / Math.max(1, cost) });
	}

	ask(world, plan, context, option)
	{
		const code = context.code;
		const idle = new Set(world.workers.filter(worker => worker.idle).map(worker => worker.id));
		const builders = crewOf(world, option.template, [option.site.x, option.site.z], crewSize(world, this.catalog, option.template), null,
			worker => idle.has(worker.id) ? Infinity : worker.gathering === code ? 0 : 1).filter(id => !idle.has(id));
		if (!builders.length)
			return null;
		const key = option.purpose === "dropsite" ? code : option.purpose;
		if (!this.reported.has(key))
			this.reported.set(key, new Change());
		if (this.reported.get(key).to(Math.round(option.site.x) + "," + Math.round(option.site.z)))
			this.telemetry.line("BUILD", world.time, this.line(context, option));
		const urgency = option.purpose === "dropsite" ? Math.min(MAX_URGENCY, option.payback) : 1 + context.shortfall.share;
		const request = buildRequest("economy", option.purpose, option.template, option.site, builders, this.catalog.cost(option.template),
			plan.values[option.worth], urgency);
		return returning(inTier(request, "production"), option.payback);
	}

	line(context, option)
	{
		const round = value => Math.round(value * 100) / 100;
		const where = { "x": Math.round(option.site.x), "z": Math.round(option.site.z), "wanted": context.wanted, "gain": round(option.value),
			"payback": round(option.payback) };
		if (option.purpose === "farm")
			return Object.assign({ "farm": option.template, "anchor": option.anchor }, where, { "safety": round(option.safety) });
		return Object.assign({ "dropsite": option.template, "code": context.code }, option.purpose === "farmstead" ? { "fields": option.fields } : {},
			option.links > 1 ? { "links": option.links } : {}, where,
			{ "stock": isFinite(option.stock) ? Math.round(option.stock) : "field", "moved": option.moved, "safety": round(option.safety) });
	}

	cells(world, code, profile, fronts)
	{
		const ideal = idealOutput(profile, code);
		const anchors = world.anchors.filter(anchor => anchor.types.includes(code));
		const candidates = new Map();
		for (const front of fronts)
			for (const supply of front.supplies)
				candidates.set(supply.id, supply);
		for (const centre of world.centres)
		{
			const anchor = world.anchors.find(candidate => candidate.id === centre.id);
			const territory = anchor ? +(this.catalog.template(anchor.template).get(TERRITORY_PATH) || 0) : 0;
			for (const supply of world.suppliesAround(code, centre.position, territory + NEAR_REACH))
				if (!candidates.has(supply.id))
					candidates.set(supply.id, Object.assign({}, supply, { "haul": nearestHaul(anchors, supply.position) }));
		}
		const grid = new Map();
		for (const supply of candidates.values())
		{
			if (!isFinite(supply.amount) || !(profile.rates[supply.kind] > 0))
				continue;
			const potential = supply.amount * Math.max(0, 1 - singleOutput(profile, supply) / Math.max(1e-6, ideal));
			if (!(potential > 0))
				continue;
			const i = Math.floor(supply.position[0] / PLAN_CELL);
			const j = Math.floor(supply.position[1] / PLAN_CELL);
			const key = i + "," + j;
			if (!grid.has(key))
				grid.set(key, { i, j, "potential": 0, "amount": 0, "x": 0, "z": 0 });
			const cell = grid.get(key);
			cell.potential += potential;
			cell.amount += supply.amount;
			cell.x += supply.amount * supply.position[0];
			cell.z += supply.amount * supply.position[1];
		}
		const scored = [...grid.values()].map(cell => {
			let around = 0;
			for (let dj = -1; dj <= 1; ++dj)
				for (let di = -1; di <= 1; ++di)
				{
					const other = grid.get((cell.i + di) + "," + (cell.j + dj));
					if (other)
						around += other.potential;
				}
			return { cell, around };
		}).sort((a, b) => b.around - a.around || a.cell.i - b.cell.i || a.cell.j - b.cell.j);
		const chosen = [];
		for (const { cell } of scored)
		{
			if (chosen.some(other => Math.abs(other.i - cell.i) <= 1 && Math.abs(other.j - cell.j) <= 1))
				continue;
			chosen.push(cell);
		}
		return chosen.map(cell => [cell.x / cell.amount, cell.z / cell.amount]);
	}

	inside(world, centre)
	{
		const owned = point => territoryAt(world.grids.territory, point[0], point[1]).owner === this.player;
		if (owned(centre))
			return centre;
		const home = world.home.position;
		const length = Math.sqrt(squareDistance(home, centre));
		for (let back = SEARCH_STEP; back < length; back += SEARCH_STEP)
		{
			const point = [centre[0] + (home[0] - centre[0]) * back / length, centre[1] + (home[1] - centre[1]) * back / length];
			if (owned(point))
				return point;
		}
		return null;
	}

	search(world, placement, code, template, centre, target)
	{
		const footprint = this.catalog.footprint(template);
		const half = Math.max(footprint.width, footprint.depth) / 2;
		const outer = outerRadius(footprint);
		const nearby = world.codes.flatMap(other => world.suppliesAround(other, centre, outer + SEARCH_RINGS * SEARCH_STEP + SUPPLY_LANE + PLAN_CELL));
		const zones = nearby.filter(supply => supply.code !== code)
			.map(supply => ({ "position": supply.position, "radius": supply.half + SUPPLY_LANE }));
		const own = nearby.filter(supply => supply.code === code);
		const reserved = world.pendingConstructions.map(pending => {
			const size = this.catalog.footprint(pending.template);
			return { "x": pending.x, "z": pending.z, "halfWidth": size.width / 2, "halfDepth": size.depth / 2 };
		});
		const points = [];
		for (let ring = 0; ring <= SEARCH_RINGS; ++ring)
		{
			const radius = half + SUPPLY_CLEARANCE + ring * SEARCH_STEP;
			const steps = Math.max(8, Math.ceil(2 * Math.PI * radius / SEARCH_STEP));
			for (let k = 0; k < steps; ++k)
			{
				const angle = 2 * Math.PI * k / steps;
				const point = placement.point(centre[0], centre[1], radius * Math.cos(angle), radius * Math.sin(angle));
				points.push({ point, "order": points.length, "distance": squareDistance(point, target) });
			}
		}
		points.sort((a, b) => a.distance - b.distance || a.order - b.order);
		const sites = [];
		for (const { point } of points)
		{
			if (sites.length >= SITE_CHOICES)
				break;
			if (sites.some(site => squareDistance([site.x, site.z], point) < 4 * half * half))
				continue;
			if (territoryAt(world.grids.territory, point[0], point[1]).owner !== this.player)
				continue;
			const anchor = { "position": point, "shape": footprint, "angle": placement.angle };
			if (own.some(supply => squareDistance(point, supply.position) <= (outer + supply.half + SUPPLY_CLEARANCE) *
				(outer + supply.half + SUPPLY_CLEARANCE) && edgeDistance(anchor, supply.position) < supply.half + SUPPLY_CLEARANCE))
				continue;
			if (!placement.fits(point, footprint, BUILDING_MARGIN, reserved, zones))
				continue;
			sites.push({ "x": point[0], "z": point[1], "angle": placement.angle });
		}
		return sites;
	}

	option(world, code, profile, fronts, wanted, template, site)
	{
		const anchor = { "id": NEW_ANCHOR, "position": [site.x, site.z], "shape": this.catalog.footprint(template), "angle": site.angle };
		const extended = withAnchor(fronts, anchor, NEW_FRONT, this.around(world, code, anchor, profile), profile);
		if (!extended.front.supplies.length)
			return null;
		const after = allocate(extended.fronts, wanted, profile);
		const index = extended.fronts.length - 1;
		const stock = extended.front.supplies.reduce((sum, supply) => sum + (isFinite(supply.amount) ? supply.amount : 0), 0);
		return { site, "total": after.output, "output": after.totals[index], stock, "moved": after.counts[index] };
	}
}
