import { REPORT_MS } from "simulation/ai/strategos/cadence.js";

const MEAT = "food.meat";
const FISH = "food.fish";
const HOME_SOURCES = ["economy"];
const HOME_PURPOSES = ["fish"];

function category(classes)
{
	if (classes.includes("Ship"))
		return "boat";
	if (classes.includes("Cavalry"))
		return "cavalry";
	return classes.includes("Soldier") ? "infantry" : "civilian";
}

export class YieldLedger
{
	constructor()
	{
		this.units = new Map();
		this.buckets = {};
		this.lastTime = undefined;
	}

	save()
	{
		return { "units": this.units, "buckets": this.buckets, "lastTime": this.lastTime };
	}

	restore(data)
	{
		this.units = data.units;
		this.buckets = data.buckets;
		this.lastTime = data.lastTime;
	}

	bucket(kind, group)
	{
		const key = kind + "|" + group;
		if (!this.buckets[key])
			this.buckets[key] = { "delivered": 0, "seconds": 0, "idle": 0, "taken": 0, "discarded": 0 };
		return this.buckets[key];
	}

	source(worker, game, previous)
	{
		const prey = game.get(worker.target);
		if (prey)
			return MEAT + (prey.domestic ? ".domestic" : ".wild");
		if (worker.kind === MEAT)
			return previous && previous.kind && previous.kind.startsWith(MEAT) ? previous.kind : MEAT;
		return worker.kind || previous && previous.kind || null;
	}

	observe(world)
	{
		const gap = this.lastTime === undefined ? 0 : (world.time - this.lastTime) / 1000;
		this.lastTime = world.time;
		const game = new Map(world.game.map(prey => [prey.id, prey]));
		const assignments = world.assignments;
		const seen = new Map();
		const units = world.workers.map(worker => ({ worker, "group": category(worker.classes), "kind": undefined }))
			.concat(world.fleet.filter(boat => boat.fishing).map(boat => ({ "worker": boat, "group": "boat", "kind": FISH })));
		for (const { worker, group, kind } of units)
		{
			const previous = this.units.get(worker.id);
			const current = {
				"kind": kind || this.source(worker, game, previous),
				"carried": worker.carried,
				"carriedType": worker.carriedType,
				"returning": !!worker.state.returning,
				"pending": previous ? previous.pending : 0
			};
			const assignment = assignments[worker.id];
			const away = assignment && !HOME_SOURCES.includes(assignment.source) && !HOME_PURPOSES.includes(assignment.purpose);
			if (previous && previous.kind)
			{
				const ledger = this.bucket(previous.kind, group);
				if (worker.idle)
					ledger.idle += gap;
				else if (away)
					ledger.taken += gap;
				else
					current.pending += gap;
				const switched = worker.carriedType && previous.carriedType && worker.carriedType !== previous.carriedType;
				if (switched)
				{
					ledger.discarded += previous.carried;
					ledger.seconds += current.pending;
					current.pending = 0;
				}
				else if (previous.carried > 0 && worker.carried < previous.carried)
				{
					const capacity = worker.profile && worker.profile.capacities[previous.carriedType.split(".")[0]] || previous.carried;
					ledger.delivered += previous.returning ? previous.carried : Math.max(previous.carried, capacity);
					ledger.seconds += current.pending;
					current.pending = 0;
				}
			}
			if (current.kind !== (previous && previous.kind) && previous && previous.kind && current.pending > 0 && !worker.carried)
			{
				this.bucket(previous.kind, group).seconds += current.pending;
				current.pending = 0;
			}
			seen.set(worker.id, current);
		}
		this.units = seen;
	}

	report(world, telemetry)
	{
		if (!Object.keys(this.buckets).length || !telemetry.due("YIELD", world.time, REPORT_MS))
			return;
		const round = value => Math.round(value * 10) / 10;
		const data = {};
		for (const key of Object.keys(this.buckets).sort())
		{
			const ledger = this.buckets[key];
			data[key] = { "d": Math.round(ledger.delivered), "s": Math.round(ledger.seconds), "rate": ledger.seconds > 0 ? round(ledger.delivered / ledger.seconds) : null,
				"idle": Math.round(ledger.idle), "taken": Math.round(ledger.taken), "lost": Math.round(ledger.discarded) };
		}
		telemetry.line("YIELD", world.time, data);
		this.buckets = {};
	}
}
