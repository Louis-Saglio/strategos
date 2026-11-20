import { centroid } from "simulation/ai/strategos/geometry.js";
import { Builders } from "simulation/ai/strategos/construction-builders.js";
import { COLONY, COLONY_DOCK, FOUNDING, NEEDS, PLAN_NEEDS, SETTLEMENT_MAX_DISTANCE, SHORT_URGENCY, coming, isSettlement, landCheapest, landed, obtainable } from "simulation/ai/strategos/construction-needs.js";
import { Siting } from "simulation/ai/strategos/construction-siting.js";
import { Placement } from "simulation/ai/strategos/placement.js";
import { buildRequest, fundRequest, inTier, noting, returning } from "simulation/ai/strategos/requests.js";
import { Change } from "simulation/ai/strategos/switches.js";


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
		this.decisions = new Map([
			[COLONY, context => this.colonyRequest(context)]
		]);
	}

	save()
	{
		return { "builders": this.builders.save(), "siting": this.siting.save(),
			"reports": [...this.reports].map(([need, change]) => [need.purpose, change.save()]) };
	}

	restore(data, context)
	{
		this.builders.restore(data.builders);
		this.siting.restore(data.siting);
		const known = new Map(NEEDS.concat(context.needs, [COLONY_DOCK, FOUNDING]).filter(need => need.purpose).map(need => [need.purpose, need]));
		this.reports = new Map(data.reports.map(([key, value]) => {
			const change = new Change();
			change.restore(value);
			return [known.get(key), change];
		}));
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
		for (const need of NEEDS.flatMap(need => need === PLAN_NEEDS ? plan.needs : [need]))
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
			if (need.returns)
				returning(request, need.returns(context, template));
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
