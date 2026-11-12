import { Placement } from "simulation/ai/strategos/placement.js";
import { squareDistance } from "simulation/ai/strategos/world.js";

const BUILDING_MARGIN = 3;
const RING_WIDTH = 60;
const CENTRE_CLEARANCE = 8;
const SECONDS_PER_BUILDER = 25;
const MAX_BUILDERS = 6;
const KEEP_AWAY = { "food": 10, "wood": 6, "stone": 14, "metal": 14 };

export class Construction
{
	constructor(catalog, player)
	{
		this.catalog = catalog;
		this.player = player;
	}

	requests(world, priorities)
	{
		const requests = [];
		const housing = this.housingRequest(world, priorities);
		if (housing)
			requests.push(housing);
		return requests.concat(this.repairRequests(world, priorities));
	}

	wantedBuilders(template)
	{
		return Math.max(1, Math.min(MAX_BUILDERS, Math.ceil(this.catalog.buildTime(template) / SECONDS_PER_BUILDER)));
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

	housingRequest(world, priorities)
	{
		const { capacity, headroom } = this.populationHeadroom(world);
		const need = priorities.housing.base + priorities.housing.perTrainer * world.trainers.length;
		if (headroom >= need || capacity >= world.populationMax || !world.centres.length)
			return null;
		const template = this.bestHouse(world);
		if (!template)
			return null;
		const site = this.siteNearCentre(world, template);
		if (!site)
			return null;
		const builders = this.pickBuilders(world, template, [site.x, site.z], this.wantedBuilders(template));
		if (!builders.length)
			return null;
		return {
			"source": "construction",
			"action": { "type": "construct", "template": template, "x": site.x, "z": site.z, "angle": site.angle, "builders": builders },
			"claims": { "resources": this.catalog.cost(template), "workers": builders },
			"value": priorities.values.house,
			"urgency": 1 + Math.max(0, need - headroom) / need,
			"reserve": true
		};
	}

	bestHouse(world)
	{
		const offered = new Set();
		for (const worker of world.workers)
			for (const name of worker.buildable)
				offered.add(name);
		let best = null;
		let bestRate = 0;
		for (const name of offered)
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

	siteNearCentre(world, template)
	{
		const footprint = this.catalog.footprint(template);
		const centre = world.centres[0];
		const minRadius = centre.radius + CENTRE_CLEARANCE + Math.max(footprint.width, footprint.depth) / 2;
		const placement = new Placement(world, this.player);
		return placement.around(centre.position, minRadius, minRadius + RING_WIDTH, footprint, BUILDING_MARGIN,
			this.reservedBoxes(world), this.keepAway(world));
	}

	reservedBoxes(world)
	{
		return world.pendingConstructions.map(pending => {
			const footprint = this.catalog.footprint(pending.template);
			return { "x": pending.x, "z": pending.z, "halfWidth": footprint.width / 2, "halfDepth": footprint.depth / 2 };
		});
	}

	keepAway(world)
	{
		const zones = [];
		for (const code of world.codes)
			for (const site of world.sites[code])
				zones.push({ "position": site.position, "radius": KEEP_AWAY[code] || 0 });
		return zones;
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
