import { SECONDS_PER_BUILDER, crewOf, crewSize, crewWanted } from "simulation/ai/strategos/crews.js";
import { squareDistance } from "simulation/ai/strategos/geometry.js";
import { deleteRequest, noting, repairRequest } from "simulation/ai/strategos/requests.js";

const STALLED_MS = 150000;
const UNSTARTED_GRACE_MS = 30000;
const ABANDONED_MEMORY_MS = 600000;
const REPAIR_TIME_RATIO = 2;
const REPAIR_MAX_BUILDERS = 3;
const REPAIR_MIN_MISSING = 0.1;
const REPAIR_SAFE_RADIUS = 90;

export class Builders
{
	constructor(catalog, telemetry)
	{
		this.catalog = catalog;
		this.telemetry = telemetry;
		this.stalled = new Map();
		this.abandoned = [];
	}

	save()
	{
		return { "stalled": this.stalled, "abandoned": this.abandoned };
	}

	restore(data)
	{
		this.stalled = data.stalled;
		this.abandoned = data.abandoned;
	}

	wanted(world, template)
	{
		return crewWanted(world, this.catalog, template);
	}

	crew(world, template, site)
	{
		return this.pick(world, template, [site.x, site.z], crewSize(world, this.catalog, template));
	}

	pick(world, template, position, count, taken)
	{
		return crewOf(world, template, position, count, taken);
	}

	underWay(world, foundation)
	{
		const watch = this.stalled.get(foundation.id);
		return !watch || foundation.progress > 0 || world.time - watch.since < UNSTARTED_GRACE_MS;
	}

	assigned(world)
	{
		const assigned = new Map();
		for (const worker of world.workers)
			if (worker.state.repairing && worker.target !== undefined)
				assigned.set(worker.target, (assigned.get(worker.target) || 0) + 1);
		return assigned;
	}

	repairRequests(world, plan)
	{
		const requests = [];
		const assigned = this.assigned(world);
		const taken = new Set();
		for (const foundation of world.foundations)
		{
			const missing = this.wanted(world, foundation.template) - (assigned.get(foundation.id) || 0);
			if (missing <= 0)
				continue;
			for (const id of this.pick(world, foundation.template, foundation.position, missing, taken))
			{
				taken.add(id);
				requests.push(repairRequest("construction", "build", id, foundation.id, plan.values.build, 1));
			}
		}
		return requests;
	}

	mendRequests(world, plan)
	{
		if (!world.damaged.length)
			return [];
		const requests = [];
		const assigned = this.assigned(world);
		const hostiles = world.threats.concat(world.wild);
		const safe = REPAIR_SAFE_RADIUS * REPAIR_SAFE_RADIUS;
		const taken = new Set();
		const forward = new Set(world.decaying.map(structure => structure.id));
		const ordered = world.damaged
			.filter(structure => !forward.has(structure.id) && (structure.missing >= REPAIR_MIN_MISSING || assigned.has(structure.id)))
			.sort((a, b) => b.missing * b.value - a.missing * a.value || a.id - b.id);
		for (const structure of ordered)
		{
			if (hostiles.some(hostile => squareDistance(hostile.position, structure.position) <= safe))
				continue;
			const seconds = structure.missing * REPAIR_TIME_RATIO * this.catalog.buildTime(structure.template);
			const wanted = Math.max(1, Math.min(REPAIR_MAX_BUILDERS, Math.ceil(seconds / SECONDS_PER_BUILDER)));
			const missing = wanted - (assigned.get(structure.id) || 0);
			if (missing <= 0)
				continue;
			for (const id of this.pick(world, structure.template, structure.position, missing, taken))
			{
				taken.add(id);
				requests.push(repairRequest("construction", "mend", id, structure.id, plan.values.build, Math.min(1, structure.missing + 0.5)));
			}
		}
		return requests;
	}

	abandonRequests(world, plan)
	{
		const requests = [];
		const watched = new Map();
		for (const foundation of world.foundations)
		{
			const known = this.stalled.get(foundation.id);
			const entry = known && foundation.progress <= known.progress ? known : { "progress": foundation.progress, "since": world.time };
			watched.set(foundation.id, entry);
			if (world.time - entry.since < STALLED_MS)
				continue;
			const footprint = this.catalog.footprint(foundation.template);
			requests.push(noting(deleteRequest("construction", "abandon", foundation.id, plan.values.build, 1), { "abandoned": {
				"box": { "x": foundation.position[0], "z": foundation.position[1], "halfWidth": footprint.width / 2,
					"halfDepth": footprint.depth / 2, "until": world.time + ABANDONED_MEMORY_MS },
				"report": { "abandoned": foundation.template, "x": Math.round(foundation.position[0]), "z": Math.round(foundation.position[1]) }
			} }));
		}
		this.stalled = watched;
		this.abandoned = this.abandoned.filter(box => box.until > world.time);
		return requests;
	}

	settle(world, outcomes)
	{
		for (const { request, issued } of outcomes)
			if (issued && request.note && request.note.abandoned)
			{
				this.abandoned.push(request.note.abandoned.box);
				this.telemetry.line("BUILD", world.time, request.note.abandoned.report);
			}
	}
}
