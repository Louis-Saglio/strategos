import { Retry } from "simulation/ai/strategos/switches.js";

export class Stopwatch
{
	constructor()
	{
		this.started = Date.now();
		this.mark = this.started;
		this.stages = {};
		this.sections = {};
	}

	lap(stage)
	{
		const now = Date.now();
		this.stages[stage] = (this.stages[stage] || 0) + now - this.mark;
		this.mark = now;
	}

	section(name, read)
	{
		const outer = this.mark;
		const began = Date.now();
		this.mark = began;
		const value = read();
		const ended = Date.now();
		const spent = ended - this.mark;
		this.sections[name] = (this.sections[name] || 0) + spent;
		this.stages.world = (this.stages.world || 0) + spent;
		this.mark = outer + ended - began;
		return value;
	}

	total()
	{
		return this.mark - this.started;
	}
}

export class Telemetry
{
	constructor(player)
	{
		this.player = player;
		this.lastLine = new Retry();
		this.decisions = 0;
		this.totalMs = 0;
		this.maxMs = 0;
		this.stageMaxMs = {};
		this.stageTotalMs = {};
		this.worldMaxMs = {};
		this.worldTotalMs = {};
		this.production = new Map();
	}

	recordProduction(kind, idle)
	{
		const entry = this.production.get(kind) || { "decisions": 0, "idle": 0, "trainers": 0 };
		entry.trainers += 1;
		if (idle)
			entry.idle += 1;
		this.production.set(kind, entry);
	}

	flushProduction(timeMs)
	{
		const data = {};
		for (const [kind, entry] of this.production)
			data[kind] = { "trainers": Math.round(entry.trainers / Math.max(1, this.decisions) * 10) / 10, "idleShare": Math.round(entry.idle / entry.trainers * 100) / 100 };
		this.production.clear();
		this.line("PROD", timeMs, data);
	}

	line(tag, timeMs, data)
	{
		const head = { "p": this.player, "t": Math.round(timeMs / 100) / 10 };
		print("[" + tag + "] " + JSON.stringify(Object.assign(head, data)) + "\n");
	}

	due(tag, timeMs, periodMs)
	{
		return this.lastLine.attempt(timeMs, periodMs, tag);
	}

	recordDecision(stopwatch)
	{
		const ms = stopwatch.total();
		this.decisions += 1;
		this.totalMs += ms;
		this.maxMs = Math.max(this.maxMs, ms);
		for (const stage in stopwatch.stages)
		{
			this.stageMaxMs[stage] = Math.max(this.stageMaxMs[stage] || 0, stopwatch.stages[stage]);
			this.stageTotalMs[stage] = (this.stageTotalMs[stage] || 0) + stopwatch.stages[stage];
		}
		for (const section in stopwatch.sections)
		{
			this.worldMaxMs[section] = Math.max(this.worldMaxMs[section] || 0, stopwatch.sections[section]);
			this.worldTotalMs[section] = (this.worldTotalMs[section] || 0) + stopwatch.sections[section];
		}
	}

	flushDecisions(timeMs)
	{
		if (!this.decisions)
			return;
		this.line("PERF", timeMs, {
			"decisions": this.decisions,
			"meanMs": Math.round(this.totalMs / this.decisions * 100) / 100,
			"maxMs": this.maxMs,
			"stageMaxMs": this.stageMaxMs,
			"stageMeanMs": this.means(this.stageTotalMs),
			"worldMaxMs": this.worldMaxMs,
			"worldMeanMs": this.means(this.worldTotalMs)
		});
		this.decisions = 0;
		this.totalMs = 0;
		this.maxMs = 0;
		this.stageMaxMs = {};
		this.stageTotalMs = {};
		this.worldMaxMs = {};
		this.worldTotalMs = {};
	}

	means(totals)
	{
		return Object.fromEntries(Object.keys(totals).map(name => [name, Math.round(totals[name] / this.decisions * 100) / 100]));
	}
}
