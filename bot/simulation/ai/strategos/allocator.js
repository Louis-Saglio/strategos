export class Allocator
{
	constructor(codes)
	{
		this.codes = codes;
		this.ledger = new Map();
		this.spent = {};
		for (const code of codes)
			this.spent[code] = 0;
	}

	allocate(world, requests)
	{
		const budget = {
			"resources": Object.assign({}, world.resources),
			"population": world.populationRoom,
			"slots": new Set(),
			"workers": new Set()
		};
		const ordered = requests
			.map((request, index) => ({ request, index, "priority": request.value * request.urgency }))
			.sort((a, b) => b.priority - a.priority || a.index - b.index);
		const grants = [];
		for (const { request } of ordered)
		{
			const reason = this.denial(world, request, budget);
			this.record(request, reason || "granted");
			if (reason)
			{
				if (request.reserve && reason.startsWith("resources"))
					this.hold(request, budget);
				continue;
			}
			this.commit(request, budget);
			grants.push(request);
		}
		return grants;
	}

	denial(world, request, budget)
	{
		if (request.deadline !== undefined && world.time > request.deadline)
			return "expired";
		const claims = request.claims;
		for (const id of claims.workers || [])
			if (budget.workers.has(id))
				return "worker-taken";
		for (const id of claims.slots || [])
			if (budget.slots.has(id))
				return "slot-taken";
		if ((claims.population || 0) > budget.population)
			return "population";
		for (const code of this.codes)
			if ((claims.resources && claims.resources[code] || 0) > budget.resources[code])
				return "resources-" + code;
		return null;
	}

	commit(request, budget)
	{
		const claims = request.claims;
		for (const id of claims.workers || [])
			budget.workers.add(id);
		for (const id of claims.slots || [])
			budget.slots.add(id);
		budget.population -= claims.population || 0;
		for (const code of this.codes)
		{
			const amount = claims.resources && claims.resources[code] || 0;
			budget.resources[code] -= amount;
			this.spent[code] += amount;
		}
	}

	hold(request, budget)
	{
		for (const code of this.codes)
			budget.resources[code] = Math.max(0, budget.resources[code] - (request.claims.resources[code] || 0));
	}

	record(request, outcome)
	{
		const key = request.source + "/" + request.action.type + ":" + outcome;
		this.ledger.set(key, (this.ledger.get(key) || 0) + 1);
	}

	flushLedger()
	{
		const summary = { "outcomes": Object.fromEntries(this.ledger), "spentTotal": Object.assign({}, this.spent) };
		this.ledger.clear();
		return summary;
	}
}
