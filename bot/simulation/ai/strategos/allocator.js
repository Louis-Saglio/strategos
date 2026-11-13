const SPEND_SMOOTHING = 0.05;

export class Allocator
{
	constructor(codes)
	{
		this.codes = codes;
		this.ledger = new Map();
		this.spent = {};
		this.spendRate = {};
		this.unmet = {};
		for (const code of codes)
		{
			this.spent[code] = 0;
			this.spendRate[code] = 0;
			this.unmet[code] = 0;
		}
		this.lastTime = undefined;
		this.held = {};
		this.allocations = 0;
		for (const code of codes)
			this.held[code] = 0;
	}

	demand()
	{
		return Object.freeze({
			"observed": this.lastTime !== undefined,
			"spendRate": Object.freeze(Object.assign({}, this.spendRate)),
			"unmet": Object.freeze(Object.assign({}, this.unmet))
		});
	}

	observe(world, spent, unmet)
	{
		const seconds = this.lastTime === undefined ? 0 : (world.time - this.lastTime) / 1000;
		this.lastTime = world.time;
		for (const code of this.codes)
		{
			this.unmet[code] = unmet[code];
			if (seconds > 0)
				this.spendRate[code] += SPEND_SMOOTHING * (spent[code] / seconds - this.spendRate[code]);
		}
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
		this.allocations += 1;
		budget.earmark = {};
		for (const code of this.codes)
			budget.earmark[code] = 0;
		const earmarked = new Map();
		for (const { request } of ordered)
		{
			if (request.tier !== "production")
				continue;
			const claim = request.claims.resources || {};
			const short = this.codes.some(code => (claim[code] || 0) > budget.resources[code] - budget.earmark[code]);
			if (short && !request.reserve)
				continue;
			const part = {};
			for (const code of this.codes)
			{
				part[code] = Math.max(0, Math.min(claim[code] || 0, budget.resources[code] - budget.earmark[code]));
				budget.earmark[code] += part[code];
			}
			earmarked.set(request, part);
		}
		const grants = [];
		const spent = {};
		const unmet = {};
		for (const code of this.codes)
		{
			spent[code] = 0;
			unmet[code] = 0;
		}
		for (const { request } of ordered)
		{
			const own = earmarked.get(request);
			if (own)
				for (const code of this.codes)
					budget.earmark[code] -= own[code];
			const reason = this.denial(world, request, budget);
			this.record(request, reason || "granted");
			if (reason)
			{
				if (reason.startsWith("resources"))
				{
					for (const code of this.codes)
						unmet[code] += request.claims.resources[code] || 0;
					if (request.reserve)
						this.hold(request, budget);
				}
				continue;
			}
			if (!request.conversion)
				for (const code of this.codes)
					spent[code] += request.claims.resources && request.claims.resources[code] || 0;
			this.commit(request, budget);
			grants.push(request);
		}
		this.observe(world, spent, unmet);
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
			if ((claims.resources && claims.resources[code] || 0) > budget.resources[code] - budget.earmark[code])
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
			if (!request.conversion)
				this.spent[code] += amount;
		}
	}

	hold(request, budget)
	{
		for (const code of this.codes)
		{
			const held = Math.max(0, Math.min(budget.resources[code] - budget.earmark[code], request.claims.resources[code] || 0));
			this.held[code] += held;
			budget.resources[code] -= held;
		}
	}

	record(request, outcome)
	{
		const key = request.source + "/" + request.action.type + (request.tier === "production" ? "!" : "") + ":" + outcome;
		this.ledger.set(key, (this.ledger.get(key) || 0) + 1);
	}

	flushLedger()
	{
		const summary = {
			"outcomes": Object.fromEntries(this.ledger),
			"spentTotal": Object.assign({}, this.spent),
			"heldMean": Object.fromEntries(this.codes.map(code => [code, Math.round(this.held[code] / Math.max(1, this.allocations))]))
		};
		this.ledger.clear();
		for (const code of this.codes)
			this.held[code] = 0;
		this.allocations = 0;
		return summary;
	}
}
