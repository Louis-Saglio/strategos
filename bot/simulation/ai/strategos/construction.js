import { Placement } from "simulation/ai/strategos/placement.js";
import { exchangeOutlook, techBenefit } from "simulation/ai/strategos/valuation.js";
import { squareDistance, territoryAt } from "simulation/ai/strategos/world.js";

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
const DROPSITE_SEARCH = 160;
const DROPSITE_DISTANCE_BIAS = 40;
const DROPSITE_CELLS_TRIED = 4;
const FARMSTEAD_SEARCH = { "from": 30, "to": 110 };
const PRODUCTION_STOCK_BASE = 300;
const PRODUCTION_STOCK_PER_TRAINER = 300;
const PRODUCTION_STOCK_CODES = ["food", "wood"];
const SETTLEMENT_SPACING_MARGIN = 10;
const SETTLEMENT_MAX_DISTANCE = 360;
const SETTLEMENT_ENEMY_CLEARANCE = 220;
const SETTLEMENT_WEALTH_CAP = 6000;
const SETTLEMENT_TRIES = 6;
const FOUNDING_MAX_DISTANCE = 200;
const DOCK_OFFSETS = [0.5, 0.25, 0.75];
const DOCK_SITES_TRIED = 40;
const MARKET_SURPLUS = 500;

export class Construction
{
	constructor(catalog, player, telemetry)
	{
		this.catalog = catalog;
		this.player = player;
		this.telemetry = telemetry;
		this.noSiteReported = new Map();
		this.noSiteTime = new Map();
		this.dockSite = null;
		this.dockRefused = new Set();
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
		{
			const founding = this.foundingRequest(world, priorities);
			return (founding ? [founding] : []).concat(this.repairRequests(world, priorities));
		}
		const requests = [];
		const placement = new Placement(world, this.player);
		for (const plan of [this.housingRequest, this.farmingRequest, this.dropsiteRequest, this.productionRequest, this.laboratoryRequest,
			this.phaseBuildingRequest, this.siegeWorkshopRequest, this.marketRequest, this.expansionRequest, this.dockRequest])
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

	wantedBuilders(world, template)
	{
		if (!world.centres.length && this.catalog.isSettlement(template))
			return world.workers.length;
		return Math.max(1, Math.min(MAX_BUILDERS, Math.ceil(this.catalog.buildTime(template) / SECONDS_PER_BUILDER)));
	}

	halfSize(template)
	{
		const footprint = this.catalog.footprint(template);
		return Math.max(footprint.width, footprint.depth) / 2;
	}

	constructRequest(world, template, site, value, urgency)
	{
		const builders = this.pickBuilders(world, template, [site.x, site.z], this.wantedBuilders(world, template));
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

	production(request)
	{
		return request ? Object.assign(request, { "tier": "production" }) : request;
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
		if (!this.searchable(world, template))
			return null;
		const site = this.ringSite(world, placement, template);
		if (!site)
			return this.noSite(world, template);
		return this.production(this.constructRequest(world, template, site, priorities.values.house, 1 + Math.max(0, need - headroom) / need));
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
				return this.production(this.constructRequest(world, farm, site, priorities.values.farm, urgency));
		}
		return this.production(this.farmsteadRequest(world, priorities, placement, farm, urgency));
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

	ringSite(world, placement, template)
	{
		const centre = world.centres[0];
		const minRadius = centre.radius + CENTRE_CLEARANCE + this.halfSize(template);
		const reserved = this.reservedBoxes(world);
		const footprint = this.catalog.footprint(template);
		const belts = this.farmBelts(world);
		for (const zones of [this.resourceZones(world, null).concat(belts), belts, []])
		{
			const site = placement.around(centre.position, minRadius, minRadius + HOUSE_RING_WIDTH, footprint, BUILDING_MARGIN, reserved, zones);
			if (site)
				return site;
		}
		return null;
	}

	nearCentreRequest(world, placement, template, value)
	{
		if (!this.searchable(world, template))
			return null;
		const site = this.ringSite(world, placement, template);
		if (!site)
			return this.noSite(world, template);
		return this.constructRequest(world, template, site, value, 1);
	}

	expansionRequest(world, priorities)
	{
		const expansion = priorities.expansion;
		const isSettlement = name => this.catalog.isSettlement(name);
		const settlements = this.count(world, isSettlement);
		const wanted = Math.min(expansion.max, 1 + Math.floor(Math.max(0, world.population - expansion.firstPopulation) / expansion.populationPerSettlement));
		if (settlements >= wanted || world.pendingConstructions.some(pending => isSettlement(pending.template)) ||
		    world.foundations.some(foundation => isSettlement(foundation.template)))
			return null;
		const template = [...this.offered(world)].filter(isSettlement)
			.sort((a, b) => this.catalog.costSum(a) - this.catalog.costSum(b) || (a < b ? -1 : 1))[0];
		if (!template || !this.searchable(world, template))
			return null;
		return this.settlementRequest(world, template, world.centres[0].position, SETTLEMENT_MAX_DISTANCE, priorities.values.expansion);
	}

	dockRequest(world, priorities)
	{
		const isDock = name => this.catalog.isShoreStructure(name) && this.catalog.trainsTransports(name);
		const tried = this.dockSite;
		if (tried)
		{
			const pending = world.pendingConstructions.some(order => isDock(order.template));
			const standing = world.docks.length > 0 || world.foundations.some(foundation => isDock(foundation.template));
			tried.seen = tried.seen || pending;
			if (standing)
				this.dockSite = null;
			else if (tried.seen && !pending)
			{
				this.dockRefused.add(tried.key);
				this.telemetry.line("BUILD", world.time, { "refused": tried.template, "x": Math.round(tried.x), "z": Math.round(tried.z) });
				this.dockSite = null;
			}
		}
		if (!world.crossing || world.population < priorities.naval.dockPopulation || this.count(world, isDock) > 0)
			return null;
		const template = [...this.offered(world)].filter(isDock)
			.sort((a, b) => this.catalog.costSum(a) - this.catalog.costSum(b) || (a < b ? -1 : 1))[0];
		if (!template || !this.searchable(world, template))
			return null;
		const home = world.centres[0].position;
		const grid = world.grids.passability;
		const shores = [];
		for (let index = 0; index < world.shores.length; ++index)
		{
			const shore = world.shores[index];
			if (shore.region !== world.homeRegion || shore.sea !== world.crossing.sea)
				continue;
			const owner = territoryAt(world.grids.territory, shore.land[0], shore.land[1]).owner;
			if (owner === 0 || owner === this.player)
				shores.push({ shore, index, "distance": squareDistance(shore.land, home) });
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
				const request = this.constructRequest(world, template, { "x": x, "z": z, "angle": 0 }, priorities.values.dock, 1);
				if (request)
					this.dockSite = { key, template, x, z, "seen": false };
				return request;
			}
		return this.noSite(world, template);
	}

	foundingRequest(world, priorities)
	{
		const isSettlement = name => this.catalog.isSettlement(name);
		if (!world.workers.length || !world.codes.every(code => world.wealth.totals[code]) ||
		    world.pendingConstructions.some(pending => isSettlement(pending.template)) ||
		    world.foundations.some(foundation => isSettlement(foundation.template)))
			return null;
		const template = [...this.offered(world)].filter(isSettlement)
			.sort((a, b) => this.catalog.costSum(a) - this.catalog.costSum(b) || (a < b ? -1 : 1))[0];
		if (!template || !this.searchable(world, template))
			return null;
		const origin = [0, 0];
		for (const worker of world.workers)
		{
			origin[0] += worker.position[0] / world.workers.length;
			origin[1] += worker.position[1] / world.workers.length;
		}
		return this.settlementRequest(world, template, origin, FOUNDING_MAX_DISTANCE, priorities.values.founding);
	}

	settlementRequest(world, template, home, reach, value)
	{
		const spacing = this.catalog.spacing(template);
		const minimum = (spacing ? spacing.min : 0) + SETTLEMENT_SPACING_MARGIN + world.wealth.cellSize * Math.SQRT2;
		const spaced = spacing ? world.footprints.filter(footprint => footprint.classes.includes(spacing.fromClass)) : [];
		const grid = world.wealth;
		const candidates = [];
		for (let j = 0; j < grid.height; ++j)
			for (let i = 0; i < grid.width; ++i)
			{
				const position = [(i + 0.5) * grid.cellSize, (j + 0.5) * grid.cellSize];
				const fromHome = Math.sqrt(squareDistance(position, home));
				if (fromHome > reach ||
				    spaced.some(footprint => squareDistance(footprint.position, position) < minimum * minimum))
					continue;
				const fromEnemy = Math.min(Infinity, ...world.enemyCentres.map(centre => Math.sqrt(squareDistance(centre.position, position))));
				if (fromEnemy < SETTLEMENT_ENEMY_CLEARANCE || fromEnemy <= fromHome)
					continue;
				const owner = territoryAt(world.grids.territory, position[0], position[1]).owner;
				if (owner !== 0 && owner !== this.player)
					continue;
				let wealth = 0;
				for (const code of world.codes)
				{
					let total = 0;
					for (let dj = -1; dj <= 1; ++dj)
						for (let di = -1; di <= 1; ++di)
						{
							const ii = i + di;
							const jj = j + dj;
							if (ii >= 0 && jj >= 0 && ii < grid.width && jj < grid.height && grid.totals[code])
								total += grid.totals[code][ii + jj * grid.width];
						}
					wealth += Math.min(total, SETTLEMENT_WEALTH_CAP);
				}
				if (wealth > 0)
					candidates.push({ position, "score": wealth * (1 - fromHome / (2 * reach)), "index": i + j * grid.width });
			}
		candidates.sort((a, b) => b.score - a.score || a.index - b.index);
		const placement = new Placement(world, this.player);
		placement.allowNeutral(true);
		const zones = this.resourceZones(world, null);
		for (const candidate of candidates.slice(0, SETTLEMENT_TRIES))
		{
			const site = placement.around(candidate.position, 0, grid.cellSize, this.catalog.footprint(template), BUILDING_MARGIN,
				this.reservedBoxes(world), zones);
			if (site)
				return this.constructRequest(world, template, site, value, 1);
		}
		return this.noSite(world, template);
	}

	siegeWorkshopRequest(world, priorities, placement)
	{
		if (world.fighters.length < priorities.offense.minArmy ||
		    world.trainers.some(trainer => trainer.trainable.some(name => this.catalog.isBreaker(name))))
			return null;
		const trains = name => this.catalog.populationBonus(name) <= 0 && this.catalog.trainsBreakers(name);
		if (world.pendingConstructions.some(pending => trains(pending.template)) ||
		    world.foundations.some(foundation => trains(foundation.template)))
			return null;
		const template = this.cheapest(world, trains);
		return template ? this.nearCentreRequest(world, placement, template, priorities.values.siege) : null;
	}

	phaseBuildingRequest(world, priorities, placement)
	{
		if (!priorities.advancePhase)
			return null;
		for (const need of world.phaseNeeds)
		{
			const hasClass = name => this.catalog.template(name).hasClass(need.class);
			const coming = world.pendingConstructions.filter(pending => hasClass(pending.template)).length +
				world.foundations.filter(foundation => hasClass(foundation.template)).length;
			if (coming >= need.missing)
				continue;
			const eligible = name => hasClass(name) && this.catalog.populationBonus(name) <= 0 && !this.catalog.isFarm(name);
			const template = this.cheapest(world, name => eligible(name) && this.count(world, other => other === name) === 0) ||
				(need.check === "variants" ? null : this.cheapest(world, eligible));
			if (template)
				return this.nearCentreRequest(world, placement, template, priorities.values.phase);
		}
		return null;
	}

	marketRequest(world, priorities, placement)
	{
		const isMarket = name => this.catalog.isBarterMarket(name);
		if (world.barter.open || this.count(world, isMarket) > 0)
			return null;
		const { surplus, shortfall } = exchangeOutlook(world);
		if (!world.codes.some(code => shortfall[code] > 0) || !world.codes.some(code => surplus[code] >= MARKET_SURPLUS))
			return null;
		const template = this.cheapest(world, isMarket);
		if (!template)
			return null;
		return this.nearCentreRequest(world, placement, template, priorities.values.market);
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
			const half = this.halfSize(template);
			const zones = this.resourceZones(world, code).concat(this.farmBelts(world));
			const reserved = this.reservedBoxes(world);
			for (const centre of this.richestCells(world, code).concat([this.densest(sites).position]))
			{
				const site = placement.around(centre, half + SAME_TYPE_KEEP_AWAY, half + CLUSTER_RADIUS,
					this.catalog.footprint(template), BUILDING_MARGIN, reserved, zones);
				if (site)
					return this.constructRequest(world, template, site, priorities.values.dropsite, 1);
			}
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
		const home = world.centres[0].position;
		const served = world.anchors.filter(anchor => anchor.types.includes(code));
		const cells = [];
		for (let index = 0; index < totals.length; ++index)
		{
			const amount = totals[index];
			if (!(amount > 0))
				continue;
			const position = [weighted[2 * index] / amount, weighted[2 * index + 1] / amount];
			const distance = Math.sqrt(squareDistance(position, home));
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
			const missing = this.wantedBuilders(world, foundation.template) - (assigned.get(foundation.id) || 0);
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
