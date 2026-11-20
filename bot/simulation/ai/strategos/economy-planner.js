import { RETRY_MS } from "simulation/ai/strategos/cadence.js";
import { TERRITORY_PATH } from "simulation/ai/strategos/catalog.js";
import { crewOf, crewSize } from "simulation/ai/strategos/crews.js";
import { squareDistance } from "simulation/ai/strategos/geometry.js";
import { diminished, loadOutput, reachOf } from "simulation/ai/strategos/gathering.js";
import { BUILDING_MARGIN, Placement } from "simulation/ai/strategos/placement.js";
import { buildRequest, inTier, returning } from "simulation/ai/strategos/requests.js";
import { FOUNDATION_TIME_MODIFIER } from "simulation/ai/strategos/rules.js";
import { Change, Retry } from "simulation/ai/strategos/switches.js";
import { territoryAt } from "simulation/ai/strategos/terrain.js";
import { TECH_HORIZON_S, TRAINING_BATCH, pricedSum, resourcePrices } from "simulation/ai/strategos/valuation.js";
import { COVERAGE_REACH, edgeDistance } from "simulation/ai/strategos/world-supplies.js";
import { FOOD } from "simulation/ai/strategos/yields.js";

const PLAN_CELL = 16;
const CANDIDATES_TRIED = 6;
const SEARCH_STEP = 3;
const SEARCH_RINGS = 6;
const SUPPLY_CLEARANCE = 1;
const LANE = 4;
const MAX_URGENCY = 3;

function profileFor(world, code)
{
	const crew = world.workers.filter(worker => worker.gathering === code);
	const pool = crew.length ? crew : world.workers.filter(worker => worker.gatherTypes.includes(code));
	if (!pool.length)
		return null;
	const rates = {};
	let capacity = 0;
	let speed = 0;
	let range = 0;
	for (const worker of pool)
	{
		for (const kind in worker.profile.rates)
			rates[kind] = (rates[kind] || 0) + worker.profile.rates[kind] / pool.length;
		capacity += (worker.profile.capacities[code] || 0) / pool.length;
		speed += worker.profile.speed / pool.length;
		range += worker.profile.range / pool.length;
	}
	return { rates, capacity, speed, range };
}

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

function frontOutput(front, gatherers, profile)
{
	let total = 0;
	let left = gatherers;
	for (const supply of front.supplies)
	{
		if (left <= 0)
			break;
		const rate = profile.rates[supply.kind] || 0;
		if (!(rate > 0) || !(supply.amount > 0))
			continue;
		const taken = Math.min(supply.capacity, left);
		total += taken * loadOutput(diminished(rate, supply.diminishing, taken), profile.capacity, profile.speed, supply.haul,
			reachOf(profile.range, supply.half), gatherers);
		left -= taken;
	}
	return total;
}

function allocate(fronts, wanted, profile)
{
	const counts = fronts.map(() => 0);
	const totals = fronts.map(() => 0);
	let output = 0;
	for (let k = 0; k < wanted; ++k)
	{
		let best = -1;
		let bestGain = 0;
		let bestTotal = 0;
		fronts.forEach((front, index) => {
			const next = frontOutput(front, counts[index] + 1, profile);
			if (next - totals[index] > bestGain)
			{
				best = index;
				bestGain = next - totals[index];
				bestTotal = next;
			}
		});
		if (best < 0)
			break;
		counts[best] += 1;
		totals[best] = bestTotal;
		output += bestGain;
	}
	return { output, counts, totals };
}

function depleted(front, profile, seconds)
{
	let left = frontOutput(front, front.crowd, profile) * seconds;
	const supplies = [];
	for (const supply of front.supplies)
	{
		if (left > 0 && isFinite(supply.amount))
		{
			const eaten = Math.min(left, supply.amount);
			left -= eaten;
			if (supply.amount - eaten > 0)
				supplies.push(Object.assign({}, supply, { "amount": supply.amount - eaten }));
			continue;
		}
		supplies.push(supply);
	}
	return { "key": front.key, "supplies": supplies, "crowd": front.crowd };
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

function nearestHaul(anchors, code, position)
{
	let best = Infinity;
	for (const anchor of anchors)
		if (anchor.types.includes(code))
			best = Math.min(best, edgeDistance(anchor, position));
	return best;
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

	coming(world, code)
	{
		return world.pendingConstructions.some(pending => this.serves(code, pending.template)) ||
			world.foundations.some(foundation => this.serves(code, foundation.template));
	}

	template(world, code)
	{
		return this.catalog.cheapest(world.offered, name => this.catalog.isPlaceableOnLand(name) && this.serves(code, name));
	}

	request(world, plan, assessments, survey)
	{
		if (!world.centres.length)
			return null;
		const code = world.codes[this.turn % world.codes.length];
		this.turn += 1;
		const finite = supply => isFinite(supply.amount);
		const ahead = TECH_HORIZON_S / 2;
		const labour = Math.min(world.populationMax, world.labour + world.queuedPopulation + civilianGrowth(world, this.catalog) * ahead);
		const share = Math.round(assessments.gatherShares[code] * labour);
		const wanted = code === FOOD ? Math.max(world.workers.filter(worker => worker.gathering === FOOD && worker.targetPosition).length,
			share - this.fieldSlots(survey)) : share;
		if (wanted < 1 || this.coming(world, code) || !this.noSite.due(world.time, RETRY_MS, code))
			return null;
		const template = this.template(world, code);
		const profile = template && profileFor(world, code);
		if (!profile)
			return null;
		const lead = this.catalog.buildTime(template);
		const fronts = [...survey.fronts.values()].filter(front => front.code === code)
			.map(front => depleted({ "key": front.key, "crowd": front.crowd, "supplies": front.supplies.filter(finite) }, profile, ahead));
		const far = (survey.beyond[code] || []).filter(site => !site.prey && isFinite(site.amount));
		if (far.length)
			fronts.push({ "key": "beyond", "supplies": far.slice().sort((a, b) => a.haul - b.haul || a.id - b.id), "crowd": 0 });
		const before = allocate(fronts, wanted, profile);
		const placement = new Placement(world, this.player);
		const known = new Set(fronts.flatMap(front => front.supplies.map(supply => supply.id)));
		let best = null;
		let tried = 0;
		for (const cell of this.cells(world, code, profile))
		{
			const centre = this.inside(world, cell);
			if (!centre)
				continue;
			if (++tried > CANDIDATES_TRIED)
				break;
			const site = this.search(world, placement, code, template, centre);
			if (!site)
				continue;
			const option = this.option(world, code, profile, fronts, known, wanted, template, site);
			if (!option)
				continue;
			option.safety = safety(world, [site.x, site.z]);
			option.value = (option.total - before.output) * option.safety;
			if (!best || option.value > best.value)
				best = option;
		}
		if (!best)
		{
			this.noSite.record(world.time, code);
			return null;
		}
		const gain = best.value;
		if (!(gain > 0) || !(best.output > 0))
			return null;
		const prices = resourcePrices(world);
		const crew = crewSize(world, this.catalog, template);
		const perGatherer = before.output / Math.max(1, wanted);
		const cost = pricedSum(world, prices, this.catalog.cost(template)) +
			prices[code] * perGatherer * lead * Math.pow(crew, 1 - FOUNDATION_TIME_MODIFIER);
		const life = Math.min(TECH_HORIZON_S, best.stock / best.output);
		const payback = prices[code] * gain * life / Math.max(1, cost);
		if (payback < 1)
			return null;
		const idle = new Set(world.workers.filter(worker => worker.idle).map(worker => worker.id));
		const builders = crewOf(world, template, [best.site.x, best.site.z], crew, null,
			worker => idle.has(worker.id) ? Infinity : worker.gathering === code ? 0 : 1).filter(id => !idle.has(id));
		if (!builders.length)
			return null;
		if (!this.reported.has(code))
			this.reported.set(code, new Change());
		if (this.reported.get(code).to(Math.round(best.site.x) + "," + Math.round(best.site.z)))
			this.telemetry.line("BUILD", world.time, { "dropsite": template, "code": code, "x": Math.round(best.site.x), "z": Math.round(best.site.z),
				"wanted": wanted, "gain": Math.round(gain * 100) / 100, "payback": Math.round(payback * 100) / 100, "stock": Math.round(best.stock),
				"moved": best.moved, "safety": Math.round(best.safety * 100) / 100 });
		const request = buildRequest("economy", "dropsite", template, best.site, builders, this.catalog.cost(template), plan.values.investment,
			Math.min(MAX_URGENCY, payback));
		return returning(inTier(request, "production"), payback);
	}

	fieldSlots(survey)
	{
		let slots = 0;
		for (const front of survey.fronts.values())
			if (front.code === FOOD)
				for (const supply of front.supplies)
					if (!isFinite(supply.amount))
						slots += supply.capacity;
		return slots;
	}

	cells(world, code, profile)
	{
		const anchors = world.anchors.filter(anchor => anchor.types.includes(code));
		const ideal = loadOutput(profile.rates[this.mainKind(code, profile)] || 0, profile.capacity, profile.speed, 0, 0, 0);
		const grid = new Map();
		const seen = new Set();
		for (const centre of world.centres)
		{
			const anchor = world.anchors.find(candidate => candidate.id === centre.id);
			const territory = anchor ? +(this.catalog.template(anchor.template).get(TERRITORY_PATH) || 0) : 0;
			for (const supply of world.suppliesAround(code, centre.position, territory + COVERAGE_REACH))
			{
				if (seen.has(supply.id) || !isFinite(supply.amount) || !(profile.rates[supply.kind] > 0))
					continue;
				seen.add(supply.id);
				const haul = nearestHaul(anchors, code, supply.position);
				const output = loadOutput(profile.rates[supply.kind], profile.capacity, profile.speed, haul, reachOf(profile.range, supply.half), 0);
				const potential = supply.amount * Math.max(0, 1 - output / Math.max(1e-6, ideal));
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
		for (let back = SEARCH_STEP; back <= COVERAGE_REACH && back < length; back += SEARCH_STEP)
		{
			const point = [centre[0] + (home[0] - centre[0]) * back / length, centre[1] + (home[1] - centre[1]) * back / length];
			if (owned(point))
				return point;
		}
		return null;
	}

	mainKind(code, profile)
	{
		let best = null;
		for (const kind in profile.rates)
			if (kind.split(".")[0] === code && (!best || profile.rates[kind] > profile.rates[best]))
				best = kind;
		return best;
	}

	search(world, placement, code, template, centre)
	{
		const footprint = this.catalog.footprint(template);
		const half = Math.max(footprint.width, footprint.depth) / 2;
		const outer = Math.sqrt(footprint.width * footprint.width + footprint.depth * footprint.depth) / 2;
		const nearby = world.codes.flatMap(other => world.suppliesAround(other, centre, outer + SEARCH_RINGS * SEARCH_STEP + LANE + PLAN_CELL));
		const zones = nearby.filter(supply => supply.code !== code)
			.map(supply => ({ "position": supply.position, "radius": supply.half + LANE }));
		const own = nearby.filter(supply => supply.code === code);
		const reserved = world.pendingConstructions.map(pending => {
			const size = this.catalog.footprint(pending.template);
			return { "x": pending.x, "z": pending.z, "halfWidth": size.width / 2, "halfDepth": size.depth / 2 };
		});
		for (let ring = 0; ring <= SEARCH_RINGS; ++ring)
		{
			const radius = half + SUPPLY_CLEARANCE + ring * SEARCH_STEP;
			const steps = Math.max(8, Math.ceil(2 * Math.PI * radius / SEARCH_STEP));
			for (let k = 0; k < steps; ++k)
			{
				const angle = 2 * Math.PI * k / steps;
				const point = placement.point(centre[0], centre[1], radius * Math.cos(angle), radius * Math.sin(angle));
				if (territoryAt(world.grids.territory, point[0], point[1]).owner !== this.player)
					continue;
				const anchor = { "position": point, "shape": footprint, "angle": placement.angle };
				if (own.some(supply => squareDistance(point, supply.position) <= (outer + supply.half + SUPPLY_CLEARANCE) *
					(outer + supply.half + SUPPLY_CLEARANCE) && edgeDistance(anchor, supply.position) < supply.half + SUPPLY_CLEARANCE))
					continue;
				if (!placement.fits(point, footprint, BUILDING_MARGIN, reserved, zones))
					continue;
				return { "x": point[0], "z": point[1], "angle": placement.angle };
			}
		}
		return null;
	}

	option(world, code, profile, fronts, known, wanted, template, site)
	{
		const anchor = { "position": [site.x, site.z], "shape": this.catalog.footprint(template), "angle": site.angle };
		const outer = Math.sqrt(anchor.shape.width * anchor.shape.width + anchor.shape.depth * anchor.shape.depth) / 2;
		const covered = new Map();
		for (const supply of world.suppliesAround(code, anchor.position, outer + COVERAGE_REACH))
		{
			const haul = edgeDistance(anchor, supply.position);
			if (haul <= COVERAGE_REACH && profile.rates[supply.kind] > 0)
				covered.set(supply.id, Object.assign({}, supply, { "haul": haul }));
		}
		if (!covered.size)
			return null;
		const moved = new Set();
		const others = fronts.map(front => ({ "key": front.key, "crowd": front.crowd, "supplies": front.supplies.filter(supply => {
			const closer = covered.get(supply.id);
			if (!closer || closer.haul >= supply.haul)
				return true;
			moved.add(supply.id);
			covered.set(supply.id, Object.assign({}, closer, { "amount": supply.amount }));
			return false;
		}) }));
		const fresh = { "key": "new", "crowd": 0, "supplies": [...covered.values()]
			.filter(supply => moved.has(supply.id) || !known.has(supply.id))
			.sort((a, b) => a.haul - b.haul || a.id - b.id) };
		if (!fresh.supplies.length)
			return null;
		const after = allocate(others.concat([fresh]), wanted, profile);
		const index = others.length;
		const stock = fresh.supplies.reduce((sum, supply) => sum + (isFinite(supply.amount) ? supply.amount : 0), 0);
		return { site, "total": after.output, "output": after.totals[index], stock, "moved": after.counts[index] };
	}
}
