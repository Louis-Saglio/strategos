export class Telemetry
{
	constructor(player)
	{
		this.player = player;
		this.lastLine = new Map();
		this.decisions = 0;
		this.totalMs = 0;
		this.maxMs = 0;
		this.stageMaxMs = {};
	}

	line(tag, timeMs, data)
	{
		const head = { "p": this.player, "t": Math.round(timeMs / 100) / 10 };
		print("[" + tag + "] " + JSON.stringify(Object.assign(head, data)) + "\n");
	}

	due(tag, timeMs, periodMs)
	{
		const last = this.lastLine.get(tag);
		if (last !== undefined && timeMs - last < periodMs)
			return false;
		this.lastLine.set(tag, timeMs);
		return true;
	}

	recordDecision(ms, stages)
	{
		this.decisions += 1;
		this.totalMs += ms;
		this.maxMs = Math.max(this.maxMs, ms);
		for (const stage in stages)
			this.stageMaxMs[stage] = Math.max(this.stageMaxMs[stage] || 0, stages[stage]);
	}

	flushDecisions(timeMs)
	{
		if (!this.decisions)
			return;
		this.line("PERF", timeMs, {
			"decisions": this.decisions,
			"meanMs": Math.round(this.totalMs / this.decisions * 100) / 100,
			"maxMs": this.maxMs,
			"stageMaxMs": this.stageMaxMs
		});
		this.decisions = 0;
		this.totalMs = 0;
		this.maxMs = 0;
		this.stageMaxMs = {};
	}
}
