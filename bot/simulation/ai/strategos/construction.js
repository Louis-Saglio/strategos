import { Placement } from "simulation/ai/strategos/placement.js";
import { techBenefit } from "simulation/ai/strategos/valuation.js";
import { squareDistance } from "simulation/ai/strategos/world.js";

const BUILDING_MARGIN = 3;
const FIELD_MARGIN = 1;
const HOUSE_RING_WIDTH = 120;
const NO_SITE_REPORT_MS = 30000;
const NO_SITE_RETRY_MS = 20000;
const CENTRE_CLEARANCE = 8;
const SECONDS_PER_BUILDER = 25;
const MAX_BUILDERS = 6;
const KEEP_AWAY = { "food": 10, "wood": 6, "stone": 14, "metal": 14 };
const SAME_TYPE_KEEP_AWAY = 3;
const WILD_FOOD_PER_GATHERER = 150;
const DROPSITE_REACH = 28;
const DROPSITE_MIN_GATHERERS = 3;
const CLUSTER_RADIUS = 20;
const FARMSTEAD_SEARCH = { "from": 30, "to": 110 };
const PRODUCTION_STOCK_BASE = 300;
const PRODUCTION_STOCK_PER_TRAINER = 300;
const PRODUCTION_STOCK_CODES = ["food", "wood"];

export class Construction
{
	constructor(catalog, player, telemetry)
	{
		this.catalog = catalog;
		this.player = player;
		this.telemetry = telemetry;
		this.noSiteReported = new Map();
		this.noSiteTime = new Map();
	}

	searchable(world, template)
	{
		const failed = this.noSiteTime.get(template);
		return failed === undefined || world.time - failed >= NO_SITE_RETRY_MS;
	}

	noSite(world, template)
	{
		this.noSiteTime.set(template, world.time);
		const last = this.noSiteReported.get(template);
		if (last === undefined || world.time - last >= NO_SITE_REPORT_MS)
		{
			this.noSiteReported.set(template, world.time);
			this.telemetry.line("BUILD", world.time, { "noSite": template });
		}
		return null;
	}

	requests(world, priorities)
	{
		if (!world.centres.length)
			return this.repairRequests(world, priorities);
		const requests = [];
		const placement = new Placement(world, this.player);
		for (const plan of [this.housingRequest, this.farmingRequest, this.dropsiteRequest, this.productionRequest, this.laboratoryRequest])
		{
			const request = plan.call(this, world, priorities, placement);
			if (request)
				requests.push(request);
		}
		return requests.concat(this.repairRequests(world, priorities));
	}

	offered(world)
	{
		const names = new Set();
		for (const worker of world.workers)
			for (const name of worker.buildable)
				names.add(name);
		return names;
	}

	cheapest(world, accept)
	{
		let best = null;
		let bestCost = Infinity;
		for (const name of this.offered(world))
		{
			if (!this.catalog.isPlaceableOnLand(name) || !accept(name))
				continue;
			const cost = this.catalog.costSum(name);
			if (cost < bestCost || (cost === bestCost && name < best))
			{
				best = name;
				bestCost = cost;
			}
		}
		return best;
	}

	count(world, accept)
	{
		let total = 0;
		for (const name in world.structureCounts)
			if (accept(name))
				total += world.structureCounts[name];
		for (const foundation of world.foundations)
			if (accept(foundation.template))
				total += 1;
		for (const pending of world.pendingConstructions)
			if (accept(pending.template))
				total += 1;
		return total;
	}

	wantedBuilders(template)
	{
		return Math.max(1, Math.min(MAX_BUILDERS, Math.ceil(this.catalog.buildTime(template) / SECONDS_PER_BUILDER)));
	}

	halfSize(template)
	{
		const footprint = this.catalog.footprint(template);
		return Math.max(footprint.width, footprint.depth) / 2;
	}

	constructRequest(world, template, site, value, urgency)
	{
		const builders = this.pickBuilders(world, template, [site.x, site.z], this.wantedBuilders(template));
		if (!builders.length)
			return null;
		return {
			"source": "construction",
			"action": { "type": "construct", "template": template, "x": site.x, "z": site.z, "angle": site.angle, "builders": builders },
			"claims": { "resources": this.catalog.cost(template), "workers": builders },
			"value": value,
			"urgency": urgency,
			"reserve": true
		};
	}

	reservedBoxes(world)
	{
		return world.pendingConstructions.map(pending => {
			const footprint = this.catalog.footprint(pending.template);
			return { "x": pending.x, "z": pending.z, "halfWidth": footprint.width / 2, "halfDepth": footprint.depth / 2 };
		});
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
		const farm = this.cheapest(world, name => this.catalog.isFarm(name));
		if (!farm)
			return [];
		const belt = 2 * this.halfSize(farm) + FIELD_MARGIN + 2;
		return world.anchors
			.filter(anchor => anchor.types.includes("food"))
			.map(anchor => ({ "position": anchor.position, "radius": anchor.radius + belt }));
	}

	populationHeadroom(world)
	{
		let incoming = 0;
		for (const foundation of world.foundations)
			incoming += foundation.populationBonus;
		for (const pending of world.pendingConstructions)
			incoming += this.catalog.populationBonus(pending.template);
		return {
			"capacity": world.populationLimit + incoming,
			"headroom": world.populationLimit + incoming - world.population - world.queuedPopulation
		};
	}

	housingRequest(world, priorities, placement)
	{
		const { capacity, headroom } = this.populationHeadroom(world);
		const need = priorities.housing.base + priorities.housing.perTrainer * world.trainers.length;
		if (headroom >= need || capacity >= world.populationMax)
			return null;
		const template = this.bestHouse(world);
		if (!template)
			return null;
		const centre = world.centres[0];
		const minRadius = centre.radius + CENTRE_CLEARANCE + this.halfSize(template);
		if (!this.searchable(world, template))
			return null;
		const site = placement.around(centre.position, minRadius, minRadius + HOUSE_RING_WIDTH,
			this.catalog.footprint(template), BUILDING_MARGIN, this.reservedBoxes(world),
			this.resourceZones(world, null).concat(this.farmBelts(world)));
		if (!site)
			return this.noSite(world, template);
		return this.constructRequest(world, template, site, priorities.values.house, 1 + Math.max(0, need - headroom) / need);
	}

	bestHouse(world)
	{
		let best = null;
		let bestRate = 0;
		for (const name of this.offered(world))
		{
			const bonus = this.catalog.populationBonus(name);
			if (bonus <= 0 || !this.catalog.isPlaceableOnLand(name))
				continue;
			const rate = bonus / Math.max(1, this.catalog.costSum(name));
			if (rate > bestRate || (rate === bestRate && name < best))
			{
				best = name;
				bestRate = rate;
			}
		}
		return best;
	}

	farmingRequest(world, priorities, placement)
	{
		const farm = this.cheapest(world, name => this.catalog.isFarm(name));
		if (!farm)
			return null;
		const desired = priorities.gatherShares.food * (world.workers.length + world.queuedPopulation);
		let wild = 0;
		for (const site of world.sites.food)
			if (isFinite(site.amount))
				wild += Math.min(site.capacity, site.amount / WILD_FOOD_PER_GATHERER);
		const farms = this.count(world, name => this.catalog.isFarm(name));
		const supply = wild + farms * this.catalog.maxGatherers(farm);
		if (supply >= desired)
			return null;
		const urgency = 1 + (desired - supply) / Math.max(1, desired);
		const footprint = this.catalog.footprint(farm);
		const half = this.halfSize(farm);
		const reserved = this.reservedBoxes(world);
		const zones = this.resourceZones(world, "food");
		for (const anchor of world.anchors.filter(candidate => candidate.types.includes("food")))
		{
			const minRadius = anchor.radius + FIELD_MARGIN + half;
			const site = placement.around(anchor.position, minRadius, minRadius + 2 * half + 4, footprint, FIELD_MARGIN, reserved, zones);
			if (site)
				return this.constructRequest(world, farm, site, priorities.values.farm, urgency);
		}
		return this.farmsteadRequest(world, priorities, placement, farm, urgency);
	}

	farmsteadRequest(world, priorities, placement, farm, urgency)
	{
		const isFoodDropsite = name => this.catalog.dropsiteTypes(name).includes("food") && !this.catalog.isFarm(name);
		if (world.pendingConstructions.some(pending => isFoodDropsite(pending.template)) ||
		    world.foundations.some(foundation => isFoodDropsite(foundation.template)))
			return null;
		const template = this.cheapest(world, isFoodDropsite);
		if (!template)
			return null;
		const centre = world.centres[0];
		if (!this.searchable(world, template))
			return null;
		const site = placement.around(centre.position, centre.radius + FARMSTEAD_SEARCH.from, centre.radius + FARMSTEAD_SEARCH.to,
			this.catalog.footprint(template), 2 * this.halfSize(farm) * 0.75, this.reservedBoxes(world),
			this.resourceZones(world, null));
		if (!site)
			return this.noSite(world, template);
		return this.constructRequest(world, template, site, priorities.values.farm, urgency);
	}

	productionRequest(world, priorities, placement)
	{
		const trains = name => this.catalog.populationBonus(name) <= 0 && this.catalog.trainsWorkers(name);
		if (world.pendingConstructions.some(pending => trains(pending.template)) ||
		    world.foundations.some(foundation => trains(foundation.template)))
			return null;
		const trainers = world.trainers.filter(trainer => trainer.trainable.some(name => this.catalog.isWorker(name)));
		const soldierTrainers = world.trainers.filter(trainer => trainer.trainable.some(name => this.catalog.isSoldier(name)) &&
			!trainer.trainable.some(name => this.catalog.isCivilian(name)));
		const military = priorities.military;
		const wantedSoldierTrainers = world.population < military.firstTrainerPopulation ? 0 :
			1 + Math.floor((world.population - military.firstTrainerPopulation) / military.populationPerTrainer);
		const stock = PRODUCTION_STOCK_CODES.reduce((sum, code) => sum + (world.resources[code] || 0), 0);
		const forArmy = soldierTrainers.length < wantedSoldierTrainers;
		const forStock = !trainers.some(trainer => trainer.queueLength === 0) &&
			stock >= PRODUCTION_STOCK_BASE + PRODUCTION_STOCK_PER_TRAINER * trainers.length;
		if (!forArmy && !forStock)
			return null;
		const template = this.cheapest(world, forArmy ? name => trains(name) && this.catalog.trainsOnlySoldierWorkers(name) : trains);
		if (!template)
			return null;
		return this.nearCentreRequest(world, placement, template, priorities.values.production);
	}

	nearCentreRequest(world, placement, template, value)
	{
		const centre = world.centres[0];
		const minRadius = centre.radius + CENTRE_CLEARANCE + this.halfSize(template);
		if (!this.searchable(world, template))
			return null;
		const site = placement.around(centre.position, minRadius, minRadius + HOUSE_RING_WIDTH,
			this.catalog.footprint(template), BUILDING_MARGIN, this.reservedBoxes(world),
			this.resourceZones(world, null).concat(this.farmBelts(world)));
		if (!site)
			return this.noSite(world, template);
		return this.constructRequest(world, template, site, value, 1);
	}

	laboratoryRequest(world, priorities, placement)
	{
		let best = null;
		for (const name of this.offered(world))
		{
			if (!this.catalog.isPlaceableOnLand(name) || !this.catalog.template(name).get("Researcher") ||
			    this.count(world, other => other === name) > 0)
				continue;
			let surplus = 0;
			for (const tech of this.catalog.researchable(this.catalog.template(name)))
			{
				const cost = this.catalog.techCost(tech, name);
				surplus += Math.max(0, techBenefit(world, this.catalog, tech) - world.codes.reduce((sum, code) => sum + cost[code], 0));
			}
			const ratio = surplus / Math.max(1, this.catalog.costSum(name));
			if (ratio > 1 && (!best || ratio > best.ratio || (ratio === best.ratio && name < best.name)))
				best = { name, ratio };
		}
		if (!best)
			return null;
		return this.nearCentreRequest(world, placement, best.name, priorities.values.laboratory);
	}

	dropsiteRequest(world, priorities, placement)
	{
		const total = world.workers.length;
		for (const code of world.codes)
		{
			if (priorities.gatherShares[code] * total < DROPSITE_MIN_GATHERERS)
				continue;
			const sites = world.sites[code].filter(site => isFinite(site.amount));
			if (!sites.length || Math.min(...sites.map(site => site.anchorDistance)) <= DROPSITE_REACH)
				continue;
			const serves = name => this.catalog.dropsiteTypes(name).includes(code) && !this.catalog.isFarm(name);
			if (world.pendingConstructions.some(pending => serves(pending.template)) ||
			    world.foundations.some(foundation => serves(foundation.template)))
				continue;
			const template = this.cheapest(world, serves);
			if (!template)
				continue;
			const cluster = this.densest(sites);
			const half = this.halfSize(template);
			const site = placement.around(cluster.position, half + SAME_TYPE_KEEP_AWAY, half + CLUSTER_RADIUS,
				this.catalog.footprint(template), BUILDING_MARGIN, this.reservedBoxes(world),
				this.resourceZones(world, code).concat(this.farmBelts(world)));
			if (site)
				return this.constructRequest(world, template, site, priorities.values.dropsite, 1);
		}
		return null;
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

	pickBuilders(world, template, position, count, taken)
	{
		return world.workers
			.filter(worker => worker.buildable.includes(template) && !worker.state.includes("REPAIR") &&
				!(taken && taken.has(worker.id)))
			.map(worker => ({ "id": worker.id, "distance": squareDistance(worker.position, position) }))
			.sort((a, b) => a.distance - b.distance || a.id - b.id)
			.slice(0, count)
			.map(worker => worker.id);
	}

	repairRequests(world, priorities)
	{
		const requests = [];
		const assigned = new Map();
		for (const worker of world.workers)
			if (worker.state.includes("REPAIR") && worker.target !== undefined)
				assigned.set(worker.target, (assigned.get(worker.target) || 0) + 1);
		const taken = new Set();
		for (const foundation of world.foundations)
		{
			const missing = this.wantedBuilders(foundation.template) - (assigned.get(foundation.id) || 0);
			if (missing <= 0)
				continue;
			for (const id of this.pickBuilders(world, foundation.template, foundation.position, missing, taken))
			{
				taken.add(id);
				requests.push({
					"source": "construction",
					"action": { "type": "repair", "worker": id, "target": foundation.id },
					"claims": { "workers": [id] },
					"value": priorities.values.build,
					"urgency": 1
				});
			}
		}
		return requests;
	}
}
