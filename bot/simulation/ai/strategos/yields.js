import { REPORT_MS } from "simulation/ai/strategos/cadence.js";

const MEAT = "food.meat";
const FOOD = "food";
const MEMORY = 0.5;
const MEASURED_S = 120;
const FISH = "food.fish";
const HOME_SOURCES = ["economy"];
const HOME_PURPOSES = ["fish"];

export function unitGroup(classes)
{
	if (classes.includes("Ship"))
		return "boat";
	if (classes.includes("Cavalry"))
		return "cavalry";
	return classes.includes("Soldier") ? "infantry" : "civilian";
}

export function foodWorth(rates, group, prior)
{
	if (group === "civilian")
		return 1;
	const own = rates && rates[group];
	const civilian = rates && rates.civilian;
	return own !== undefined && civilian ? own / civilian : prior;
}

function groupOutputs(kinds)
{
	const totals = {};
	for (const key of Object.keys(kinds).sort())
	{
		const [kind, group] = key.split("|");
		if (!totals[group])
			totals[group] = { "seconds": 0, "delivered": {} };
		const code = kind.split(".")[0];
		totals[group].seconds += kinds[key].seconds;
		totals[group].delivered[code] = (totals[group].delivered[code] || 0) + kinds[key].delivered;
	}
	const outputs = {};
	for (const group of Object.keys(totals))
		if (totals[group].seconds >= MEASURED_S)
			outputs[group] = Object.freeze(Object.fromEntries(Object.entries(totals[group].delivered)
				.map(([code, delivered]) => [code, delivered / totals[group].seconds])));
	return outputs;
}

export class YieldLedger
{
	constructor()
	{
		this.units = new Map();
		this.buckets = {};
		this.food = {};
		this.kinds = {};
		this.rates = Object.freeze({});
		this.lastTime = undefined;
		this.flushed = undefined;
	}

	save()
	{
		return { "units": this.units, "buckets": this.buckets, "food": this.food, "kinds": this.kinds, "rates": this.rates, "lastTime": this.lastTime,
			"flushed": this.flushed };
	}

	restore(data)
	{
		this.units = data.units;
		this.buckets = data.buckets;
		this.food = data.food;
		this.kinds = data.kinds;
		this.rates = data.rates;
		this.lastTime = data.lastTime;
		this.flushed = data.flushed;
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
		const units = world.workers.map(worker => ({ worker, "group": unitGroup(worker.classes), "kind": undefined }))
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
		if (this.flushed === undefined)
			this.flushed = world.time;
		if (world.time - this.flushed < REPORT_MS)
			return;
		this.flushed = world.time;
		for (const memory of [this.food, this.kinds])
			for (const key of Object.keys(memory))
			{
				memory[key].delivered *= MEMORY;
				memory[key].seconds *= MEMORY;
			}
		for (const key of Object.keys(this.buckets))
		{
			if (!this.kinds[key])
				this.kinds[key] = { "delivered": 0, "seconds": 0 };
			this.kinds[key].delivered += this.buckets[key].delivered;
			this.kinds[key].seconds += this.buckets[key].seconds;
			const [kind, group] = key.split("|");
			if (!kind.startsWith(FOOD + "."))
				continue;
			if (!this.food[group])
				this.food[group] = { "delivered": 0, "seconds": 0 };
			this.food[group].delivered += this.buckets[key].delivered;
			this.food[group].seconds += this.buckets[key].seconds;
		}
		const rates = {};
		for (const group of Object.keys(this.food).sort())
			if (this.food[group].seconds >= MEASURED_S && this.food[group].delivered > 0)
				rates[group] = this.food[group].delivered / this.food[group].seconds;
		const kinds = {};
		for (const key of Object.keys(this.kinds).sort())
			if (this.kinds[key].seconds >= MEASURED_S && this.kinds[key].delivered > 0)
				kinds[key] = this.kinds[key].delivered / this.kinds[key].seconds;
		rates.kinds = Object.freeze(kinds);
		rates.outputs = Object.freeze(groupOutputs(this.kinds));
		this.rates = Object.freeze(rates);
		const round = value => Math.round(value * 100) / 100;
		const data = {};
		for (const key of Object.keys(this.buckets).sort())
		{
			const ledger = this.buckets[key];
			data[key] = { "d": Math.round(ledger.delivered), "s": Math.round(ledger.seconds), "rate": ledger.seconds > 0 ? round(ledger.delivered / ledger.seconds) : null,
				"idle": Math.round(ledger.idle), "taken": Math.round(ledger.taken), "lost": Math.round(ledger.discarded) };
		}
		data.foodRates = Object.fromEntries(Object.entries(rates).filter(([group]) => group !== "kinds" && group !== "outputs").map(([group, rate]) => [group, round(rate)]));
		telemetry.line("YIELD", world.time, data);
		this.buckets = {};
	}
}
