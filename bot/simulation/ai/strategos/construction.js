import { centroid } from "simulation/ai/strategos/geometry.js";
import { Builders } from "simulation/ai/strategos/construction-builders.js";
import { COLONY, COLONY_DOCK, DROPSITES, FARMSTEAD, FIELDS, FOUNDING, NEEDS, SETTLEMENT_MAX_DISTANCE, SHORT_URGENCY, coming, hunger, isSettlement, landCheapest, landed, obtainable } from "simulation/ai/strategos/construction-needs.js";
import { HAUL_RETURN, Siting } from "simulation/ai/strategos/construction-siting.js";
import { Placement } from "simulation/ai/strategos/placement.js";
import { buildRequest, fundRequest, inTier, noting } from "simulation/ai/strategos/requests.js";
import { Change } from "simulation/ai/strategos/switches.js";

const DROPSITE_MIN_GATHERERS = 3;
const HAUL_MAX_URGENCY = 3;

export class Construction
{
	constructor(catalog, player, telemetry)
	{
		this.catalog = catalog;
		this.player = player;
		this.telemetry = telemetry;
		this.builders = new Builders(catalog, telemetry);
		this.siting = new Siting(catalog, player, telemetry, this.builders);
		this.reports = new Map();
		this.relieved = new Change();
		this.decisions = new Map([
			[FIELDS, context => this.fieldRequest(context)],
			[DROPSITES, context => this.dropsiteRequest(context)],
			[COLONY, context => this.colonyRequest(context)]
		]);
	}

	requests(world, plan, assessments)
	{
		const context = { "world": world, "plan": plan, "assessments": assessments, "catalog": this.catalog, "siting": this.siting,
			"builders": this.builders, "placement": world.centres.length ? new Placement(world, this.player) : null };
		if (!world.centres.length)
		{
			const founding = this.ask(FOUNDING, context);
			return (founding ? [founding] : []).concat(this.builders.repairRequests(world, plan));
		}
		const requests = [];
		for (const need of NEEDS)
		{
			const decide = this.decisions.get(need);
			const request = decide ? decide(context) : this.ask(need, context);
			if (request)
				requests.push(request);
		}
		return requests.concat(this.builders.repairRequests(world, plan), this.builders.mendRequests(world, plan),
			this.builders.abandonRequests(world, plan));
	}

	settle(world, outcomes)
	{
		this.siting.settle(outcomes);
		this.builders.settle(world, outcomes);
	}

	ask(need, context)
	{
		const world = context.world;
		if (need.wanted && !need.wanted(context))
			return null;
		if (need.coming ? need.coming(context) : need.fits && coming(world, name => need.fits(context, name)))
			return null;
		const template = need.template ? need.template(context) : landCheapest(context, name => need.fits(context, name));
		if (!template || need.ready && !need.ready(context, template))
			return null;
		if (need.report && this.reported(need).to(template))
			this.telemetry.line("BUILD", world.time, need.report(context, template));
		for (const place of need.places ? need.places(context, template) : [{ "key": template }])
		{
			const site = this.siting.sought(world, place.key, () => need.site(context, template, place));
			if (!site)
				continue;
			const builders = need.builders ? need.builders(context) : this.builders.crew(world, template, site);
			if (!builders.length)
				continue;
			const request = buildRequest("construction", need.purpose, template, site, builders, this.catalog.cost(template),
				context.plan.values[need.value], need.urgency ? need.urgency(context) : 1);
			if (site.note)
				noting(request, site.note);
			const tier = need.tier && need.tier(context);
			return tier ? inTier(request, tier) : request;
		}
		return null;
	}

	reported(need)
	{
		if (!this.reports.has(need))
			this.reports.set(need, new Change());
		return this.reports.get(need);
	}

	construct(world, purpose, template, site, value, urgency)
	{
		const builders = this.builders.crew(world, template, site);
		return builders.length ? buildRequest("construction", purpose, template, site, builders, this.catalog.cost(template), value, urgency) : null;
	}

	fieldRequest(context)
	{
		const { world, plan, placement } = context;
		const fields = hunger(context);
		if (!fields)
			return null;
		const farm = site => {
			const request = this.construct(world, "farm", fields.farm, site, plan.values.farm, fields.urgency);
			return request && inTier(request, "production");
		};
		const near = this.siting.field(world, placement, fields.farm, true);
		if (near)
			return farm(near);
		const farmstead = this.ask(FARMSTEAD, context);
		if (farmstead)
			return farmstead;
		const far = this.siting.field(world, placement, fields.farm, false);
		return far ? farm(far) : null;
	}

	dropsiteRequest(context)
	{
		const { world, plan, assessments, placement } = context;
		const total = world.workers.length;
		let best = null;
		for (const code of world.codes)
		{
			const serves = name => this.catalog.dropsiteTypes(name).includes(code) && !this.catalog.isFarm(name);
			if (coming(world, serves))
				continue;
			const template = landCheapest(context, serves);
			if (!template)
				continue;
			const relief = this.siting.relief(world, placement, code, template);
			if (relief && (!best || relief.payback > best.payback))
				best = relief;
			if (relief || assessments.gatherShares[code] * total < DROPSITE_MIN_GATHERERS)
				continue;
			const site = this.siting.cluster(world, placement, code, template);
			if (site)
				return this.construct(world, "dropsite", template, site, plan.values.investment, 1);
		}
		if (!best)
			return null;
		const request = this.construct(world, "haul-dropsite", best.template, best.site, plan.values.investment,
			Math.min(HAUL_MAX_URGENCY, best.payback / HAUL_RETURN));
		if (!request)
			return null;
		if (this.relieved.to(best.site.x + "," + best.site.z))
			this.telemetry.line("BUILD", world.time, { "haul": best.template, "x": Math.round(best.site.x), "z": Math.round(best.site.z),
				"gatherers": best.gatherers, "gain": Math.round(best.gain * 100) / 100, "payback": Math.round(best.payback * 100) / 100 });
		return inTier(request, "production");
	}

	colonyRequest(context)
	{
		const { world, plan, assessments } = context;
		const colony = assessments.colony;
		if (!colony || world.docks.some(dock => dock.region === colony.region))
			return null;
		const builders = landed(world, colony.region);
		if (!builders.length)
			return this.colonyHold(context, colony);
		const template = colony.kind === "centre" && this.catalog.cheapest(builders[0].buildable, name => isSettlement(context, name));
		if (template && obtainable(context, template))
		{
			if (coming(world, name => isSettlement(context, name)))
				return null;
			const site = this.siting.sought(world, template + "@" + colony.region, () => this.siting.settlement(world, plan, template,
				centroid(builders), SETTLEMENT_MAX_DISTANCE, colony.region));
			if (site)
				return buildRequest("construction", "colony-centre", template, site, builders.map(settler => settler.id),
					this.catalog.cost(template), plan.values.investment, 1);
		}
		return this.ask(COLONY_DOCK, context);
	}

	colonyHold(context, colony)
	{
		const { world, plan, assessments } = context;
		const isDock = name => this.catalog.isShoreStructure(name) && this.catalog.trainsTransports(name);
		if (!assessments.short.length || colony.kind !== "dock" || world.settlers.some(settler => settler.region === colony.region) ||
		    coming(world, isDock))
			return null;
		const template = this.catalog.cheapest(world.offered, isDock);
		if (!template)
			return null;
		return inTier(fundRequest("construction", "colony-fund", this.catalog.cost(template), plan.values.investment, SHORT_URGENCY),
			"production");
	}
}
