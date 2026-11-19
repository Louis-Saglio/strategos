import { REPORT_MS } from "simulation/ai/strategos/cadence.js";
import { Bombardment } from "simulation/ai/strategos/naval-bombardment.js";
import { Convoys } from "simulation/ai/strategos/naval-convoys.js";
import { Crossings } from "simulation/ai/strategos/naval-crossings.js";
import { Fishing } from "simulation/ai/strategos/naval-fishing.js";
import { Hunt } from "simulation/ai/strategos/naval-hunt.js";
import { Raid } from "simulation/ai/strategos/naval-raid.js";
import { Rescue } from "simulation/ai/strategos/naval-rescue.js";
import { Stations } from "simulation/ai/strategos/naval-stations.js";
import { Operations } from "simulation/ai/strategos/operations.js";

class Commitments
{
	constructor(operations)
	{
		this.operations = operations;
	}

	holds(id)
	{
		return this.operations.list.some(operation => operation.members.includes(id));
	}

	underWay(kind)
	{
		return this.operations.list.filter(operation => operation.kind === kind);
	}
}

export class Naval
{
	constructor(catalog, telemetry)
	{
		this.telemetry = telemetry;
		this.operations = new Operations("naval", "NAVAL", telemetry);
		this.commitments = new Commitments(this.operations);
		this.fishing = new Fishing();
		this.convoys = new Convoys(this.operations);
		this.crossings = new Crossings(catalog, telemetry, this.convoys, this.commitments);
		this.rescue = new Rescue(this.commitments);
		this.bombardment = new Bombardment(catalog, telemetry, this.commitments);
		this.hunt = new Hunt(telemetry, this.commitments);
		this.raid = new Raid(catalog, telemetry, this.commitments);
		this.stations = new Stations(this.commitments);
	}

	save(context)
	{
		const operations = this.operations.save();
		operations.list = operations.list.map(convoy => this.convoys.saved(convoy, context));
		return { "operations": operations, "crossings": this.crossings.save(), "bombardment": this.bombardment.save(),
			"hunt": this.hunt.save(), "raid": this.raid.save(context), "stations": this.stations.save() };
	}

	restore(data, context)
	{
		this.operations.restore(data.operations);
		this.operations.list.forEach(convoy => this.convoys.restored(convoy, context));
		this.crossings.restore(data.crossings);
		this.bombardment.restore(data.bombardment);
		this.hunt.restore(data.hunt);
		this.raid.restore(data.raid, context);
		this.stations.restore(data.stations);
	}

	requests(world, plan, assessments)
	{
		if (!world.centres.length)
			return this.rescue.castaways(world, plan);
		if (!world.fleet.length && !world.docks.length)
			return [];
		const requests = this.fishing.requests(world, plan);
		const invasion = this.crossings.decide(world, plan, assessments);
		requests.push(...this.convoys.requests(world, plan));
		requests.push(...this.rescue.stranded(world, plan));
		const bombarding = this.bombardment.requests(world, plan);
		const hunting = this.hunt.requests(world, plan);
		requests.push(...bombarding, ...hunting, ...this.raid.requests(world, plan, hunting));
		this.report(world, assessments, invasion);
		return requests.concat(this.stations.requests(world, plan, requests));
	}

	settle(world, outcomes)
	{
		this.operations.settle(outcomes);
		this.stations.settle(world, outcomes);
	}

	report(world, assessments, invasion)
	{
		if (!this.telemetry.due("SEA", world.time, REPORT_MS))
			return;
		const kinds = {};
		for (const ship of world.fleet)
		{
			const kind = ship.fishing ? "fishing" : ship.bombard ? "bombard" : ship.capacity > 0 ? "transport" : ship.warship ? "warship" : "other";
			kinds[kind] = (kinds[kind] || 0) + 1;
		}
		this.telemetry.line("SEA", world.time, {
			"home": world.homeRegion,
			"fleet": kinds,
			"enemyWarships": world.enemyWarships,
			"fish": world.fish.length,
			"docks": world.docks.map(dock => dock.blocked ? -dock.region : dock.region),
			"regions": world.regions.filter(region => region.workers || region.settlers || region.anchors || region.fighters).map(region => ({
				"id": region.id, "area": Math.round(world.regionArea(region.id) / 1000), "workers": region.workers, "idle": region.idle,
				"settlers": region.settlers, "fighters": region.fighters, "anchors": region.anchors, "centres": region.centres,
				"wealth": world.codes.map(code => Math.round(world.regionWealth(region.id, code) / 100))
			})),
			"short": assessments.short,
			"colony": assessments.colony && { "region": assessments.colony.region, "kind": assessments.colony.kind },
			"ferry": assessments.ferry && { "to": assessments.ferry.to, "code": assessments.ferry.code, "count": assessments.ferry.count },
			"convoys": this.operations.list.map(convoy => convoy.kind + ":" + convoy.state),
			"invasion": invasion
		});
	}
}
