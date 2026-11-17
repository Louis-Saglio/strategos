const SPEND_SMOOTHING = 0.05;
const ORDER_MEMORY_S = 180;
const ORDER_TYPES = ["train", "construct"];
const RESERVATION = "reserve";

export const GRANTED = "granted";

export class Allocator
{
	constructor(codes)
	{
		this.codes = codes;
		this.ledger = new Map();
		this.spent = {};
		this.spendRate = {};
		this.income = {};
		this.unmet = {};
		for (const code of codes)
		{
			this.spent[code] = 0;
			this.spendRate[code] = 0;
			this.income[code] = 0;
			this.unmet[code] = 0;
		}
		this.stock = null;
		this.paid = null;
		this.lastTime = undefined;
		this.orders = new Map();
		this.ordered = new Map();
		this.held = {};
		this.assigned = [];
		this.allocations = 0;
		for (const code of codes)
			this.held[code] = 0;
	}

	demand()
	{
		return Object.freeze({
			"observed": this.lastTime !== undefined,
			"spendRate": Object.freeze(Object.assign({}, this.spendRate)),
			"income": Object.freeze(Object.assign({}, this.income)),
			"orders": Object.freeze(Object.fromEntries(this.orders)),
			"unmet": Object.freeze(Object.assign({}, this.unmet))
		});
	}

	assignments()
	{
		const assigned = this.assigned;
		return () => {
			const assignments = {};
			for (const request of assigned)
			{
				const assignment = Object.freeze({ "source": request.source, "purpose": request.purpose,
					"operation": "operation" in request ? request.operation : null, "value": request.value });
				for (const id of request.claims.units)
					assignments[id] = assignment;
			}
			return Object.freeze(assignments);
		};
	}

	observe(world, spent, unmet, paid)
	{
		const seconds = this.lastTime === undefined ? 0 : (world.time - this.lastTime) / 1000;
		this.lastTime = world.time;
		for (const code of this.codes)
		{
			this.unmet[code] = unmet[code];
			if (!(seconds > 0))
				continue;
			this.spendRate[code] += SPEND_SMOOTHING * (spent[code] / seconds - this.spendRate[code]);
			const earned = Math.max(0, world.resources[code] - this.stock[code] + this.paid[code]) / seconds;
			this.income[code] += SPEND_SMOOTHING * (earned - this.income[code]);
		}
		this.stock = Object.assign({}, world.resources);
		this.paid = paid;
		if (seconds > 0)
		{
			const blend = 1 - Math.exp(-seconds / ORDER_MEMORY_S);
			for (const template of this.ordered.keys())
				if (!this.orders.has(template))
					this.orders.set(template, 0);
			for (const [template, rate] of this.orders)
				this.orders.set(template, rate + blend * ((this.ordered.get(template) || 0) / seconds - rate));
		}
		this.ordered.clear();
	}

	allocate(world, requests)
	{
		const budget = {
			"resources": Object.assign({}, world.resources),
			"population": world.populationRoom,
			"slots": new Set(),
			"units": new Set()
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
		this.assigned = [];
		const outcomes = [];
		const spent = {};
		const unmet = {};
		const paid = {};
		for (const code of this.codes)
		{
			spent[code] = 0;
			unmet[code] = 0;
			paid[code] = 0;
		}
		for (const { request } of ordered)
		{
			const own = earmarked.get(request);
			if (own)
				for (const code of this.codes)
					budget.earmark[code] -= own[code];
			const reason = this.denial(request, budget);
			this.record(request, reason || GRANTED);
			outcomes.push({ "request": request, "outcome": reason || GRANTED, "issued": false });
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
			for (const code of this.codes)
			{
				const amount = request.claims.resources && request.claims.resources[code] || 0;
				paid[code] += amount;
				if (!request.conversion)
					spent[code] += amount;
			}
			this.commit(request, budget);
			if (request.action && ORDER_TYPES.includes(request.action.type))
				this.ordered.set(request.action.template, (this.ordered.get(request.action.template) || 0) + (request.action.count || 1));
		}
		this.observe(world, spent, unmet, paid);
		return outcomes;
	}

	denial(request, budget)
	{
		const claims = request.claims;
		for (const id of claims.units || [])
			if (budget.units.has(id))
				return "unit-taken";
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
		for (const id of claims.units || [])
			budget.units.add(id);
		if (claims.units && claims.units.length)
			this.assigned.push(request);
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
		const key = request.source + "/" + request.purpose + "/" + (request.action ? request.action.type : RESERVATION) +
			(request.tier === "production" ? "!" : "") + ":" + outcome;
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
