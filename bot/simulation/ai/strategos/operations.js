import { GRANTED } from "simulation/ai/strategos/allocator.js";

export class Operations
{
	constructor(source, tag, telemetry)
	{
		this.source = source;
		this.tag = tag;
		this.telemetry = telemetry;
		this.serial = 0;
		this.list = [];
	}

	open(kind)
	{
		const operation = { "id": ++this.serial, "kind": kind, "state": null, "since": null, "objective": null, "members": [], "granted": [] };
		this.list.push(operation);
		return operation;
	}

	close(operation)
	{
		this.list = this.list.filter(other => other.id !== operation.id);
	}

	enter(operation, time, state, report)
	{
		operation.state = state;
		operation.since = time;
		this.telemetry.line(this.tag, time, report);
	}

	serving(request, operation)
	{
		if (request.source !== this.source)
			throw new Error("a request of " + request.source + " cannot serve an operation of " + this.source);
		return Object.assign(request, { "operation": operation.id });
	}

	settle(outcomes)
	{
		const granted = new Map(this.list.map(operation => [operation.id, []]));
		for (const { request, outcome } of outcomes)
			if (outcome === GRANTED && request.source === this.source && granted.has(request.operation))
				granted.get(request.operation).push(...request.claims.units || []);
		for (const operation of this.list)
			operation.granted = granted.get(operation.id);
	}
}
