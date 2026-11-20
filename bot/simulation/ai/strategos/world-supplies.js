import { landRegionNear } from "simulation/ai/strategos/terrain.js";

const SUPPLY_CELL = 8;
export const COVERAGE_REACH = 30;
const REPORT_BANDS = [10, 20, 30];
const HAUL_QUANTILES = [0.5, 0.9];

function cellKey(i, j)
{
	return i + "," + j;
}

function eligible(ent, player)
{
	if (!ent || !ent.position() || ent.hasClass("SeaCreature") || ent.get("UnitAI"))
		return false;
	const owner = ent.owner();
	if (owner !== 0 && owner !== player)
		return false;
	const type = ent.resourceSupplyType();
	return !!type && ent.resourceSupplyMax() > 0;
}

export class SupplyIndex
{
	constructor(player, codes)
	{
		this.player = player;
		this.codes = codes;
		this.scanned = false;
		this.saved = null;
		this.supplies = new Map();
		this.cells = new Map(codes.map(code => [code, new Map()]));
	}

	save()
	{
		const ids = {};
		for (const code of this.codes)
			ids[code] = [];
		for (const [id, supply] of this.supplies)
			ids[supply.code].push(id);
		return { "scanned": this.scanned, "ids": this.saved || ids };
	}

	restore(data)
	{
		this.scanned = data.scanned;
		this.saved = data.ids;
		this.supplies = new Map();
		this.cells = new Map(this.codes.map(code => [code, new Map()]));
	}

	add(gameState, ent)
	{
		const id = ent.id();
		if (this.supplies.has(id) || !eligible(ent, this.player))
			return;
		const type = ent.resourceSupplyType();
		const code = type.generic;
		const cells = this.cells.get(code);
		if (!cells)
			return;
		const position = ent.position();
		const i = Math.floor(position[0] / SUPPLY_CELL);
		const j = Math.floor(position[1] / SUPPLY_CELL);
		const supply = Object.freeze({
			"id": id,
			"code": code,
			"kind": type.generic + "." + type.specific,
			"position": position,
			"region": landRegionNear(gameState.sharedScript.accessibility, position),
			"max": ent.resourceSupplyMax(),
			"capacity": ent.maxGatherers() || 1,
			"cell": cellKey(i, j)
		});
		this.supplies.set(id, supply);
		const key = supply.cell;
		if (!cells.has(key))
			cells.set(key, []);
		cells.get(key).push(id);
	}

	remove(id)
	{
		const supply = this.supplies.get(id);
		if (!supply)
			return;
		this.supplies.delete(id);
		const cells = this.cells.get(supply.code);
		const list = cells.get(supply.cell);
		const at = list.indexOf(id);
		if (at >= 0)
			list.splice(at, 1);
		if (!list.length)
			cells.delete(supply.cell);
	}

	update(gameState, events)
	{
		if (this.saved)
		{
			for (const code of this.codes)
				for (const id of this.saved[code] || [])
				{
					const ent = gameState.getEntityById(id);
					if (ent)
						this.add(gameState, ent);
				}
			this.saved = null;
		}
		else if (!this.scanned)
		{
			for (const code of this.codes)
				for (const ent of gameState.getResourceSupplies(code).values())
					this.add(gameState, ent);
			this.scanned = true;
		}
		for (const evt of events && events.Destroy || [])
			this.remove(evt.entity);
		for (const evt of events && events.Create || [])
		{
			const ent = gameState.getEntityById(evt.entity);
			if (ent)
				this.add(gameState, ent);
		}
	}

	around(code, position, radius)
	{
		const cells = this.cells.get(code);
		const found = [];
		if (!cells)
			return found;
		const i0 = Math.floor((position[0] - radius) / SUPPLY_CELL);
		const i1 = Math.floor((position[0] + radius) / SUPPLY_CELL);
		const j0 = Math.floor((position[1] - radius) / SUPPLY_CELL);
		const j1 = Math.floor((position[1] + radius) / SUPPLY_CELL);
		const limit = radius * radius;
		for (let j = j0; j <= j1; ++j)
			for (let i = i0; i <= i1; ++i)
			{
				const list = cells.get(cellKey(i, j));
				if (!list)
					continue;
				for (const id of list)
				{
					const supply = this.supplies.get(id);
					const dx = supply.position[0] - position[0];
					const dz = supply.position[1] - position[1];
					if (dx * dx + dz * dz <= limit)
						found.push(supply);
				}
			}
		return found.sort((a, b) => a.id - b.id);
	}
}

export function edgeDistance(anchor, position)
{
	const dx = position[0] - anchor.position[0];
	const dz = position[1] - anchor.position[1];
	const cos = Math.cos(anchor.angle);
	const sin = Math.sin(anchor.angle);
	const along = Math.abs(dx * cos - dz * sin) - anchor.shape.width / 2;
	const across = Math.abs(dx * sin + dz * cos) - anchor.shape.depth / 2;
	return Math.sqrt(Math.max(0, along) * Math.max(0, along) + Math.max(0, across) * Math.max(0, across));
}

function outerRadius(anchor)
{
	return Math.sqrt(anchor.shape.width * anchor.shape.width + anchor.shape.depth * anchor.shape.depth) / 2;
}

function live(gameState, player, supply)
{
	const ent = gameState.getEntityById(supply.id);
	if (!ent)
		return null;
	const owner = ent.owner();
	const amount = ent.resourceSupplyAmount();
	if (owner !== 0 && owner !== player || !(amount > 0))
		return null;
	return { "amount": amount, "gatherers": ent.resourceSupplyNumGatherers() || 0 };
}

function coverage(gameState, player, index, anchors, reach)
{
	const covered = [];
	for (const anchor of anchors)
		for (const code of anchor.types)
		{
			const supplies = [];
			let stock = 0;
			let slots = 0;
			for (const supply of index.around(code, anchor.position, outerRadius(anchor) + reach))
			{
				const distance = edgeDistance(anchor, supply.position);
				if (distance > reach)
					continue;
				const state = live(gameState, player, supply);
				if (!state)
					continue;
				supplies.push(Object.freeze({ "id": supply.id, "kind": supply.kind, "position": supply.position, "region": supply.region,
					"distance": distance, "amount": state.amount, "gatherers": state.gatherers, "capacity": supply.capacity }));
				if (isFinite(state.amount))
					stock += state.amount;
				slots += supply.capacity;
			}
			supplies.sort((a, b) => a.distance - b.distance || a.id - b.id);
			covered.push(Object.freeze({ "anchor": anchor.id, "template": anchor.template, "code": code, "position": anchor.position,
				"supplies": Object.freeze(supplies), "stock": stock, "slots": slots }));
		}
	return Object.freeze(covered);
}

export function suppliesSection(gameState, index, anchors)
{
	const player = gameState.getPlayerID();
	return {
		"now": {
			"suppliesAround": (code, position, radius) => Object.freeze(index.around(code, position, radius)
				.map(supply => {
					const state = live(gameState, player, supply);
					return state && Object.freeze(Object.assign({}, supply, state));
				})
				.filter(supply => supply))
		},
		"later": {
			"coverage": () => coverage(gameState, player, index, anchors, COVERAGE_REACH)
		}
	};
}

function quantile(sorted, q)
{
	return sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))] : null;
}

export function siteReport(world)
{
	const report = {};
	for (const code of world.codes)
	{
		const entries = world.coverage.filter(entry => entry.code === code);
		if (!entries.length)
			continue;
		const anchors = world.anchors.filter(anchor => anchor.types.includes(code));
		const nearestOf = new Map();
		for (const entry of entries)
			for (const supply of entry.supplies)
				if (!nearestOf.has(supply.id) || supply.distance < nearestOf.get(supply.id).distance)
					nearestOf.set(supply.id, { "anchor": entry.anchor, "distance": supply.distance, "amount": supply.amount });
		const stock = REPORT_BANDS.map(() => 0);
		for (const { distance, amount } of nearestOf.values())
			if (isFinite(amount))
				REPORT_BANDS.forEach((band, index) => {
					if (distance < band)
						stock[index] += amount;
				});
		const hauls = [];
		const crowd = new Map();
		for (const worker of world.workers)
		{
			if (worker.gathering !== code || !worker.targetPosition)
				continue;
			let best = null;
			let bestDistance = Infinity;
			for (const anchor of anchors)
			{
				const distance = edgeDistance(anchor, worker.targetPosition);
				if (distance < bestDistance || distance === bestDistance && best && anchor.id < best.id)
				{
					best = anchor;
					bestDistance = distance;
				}
			}
			if (!best)
				continue;
			hauls.push(bestDistance);
			crowd.set(best.id, (crowd.get(best.id) || 0) + 1);
		}
		hauls.sort((a, b) => a - b);
		let busiest = null;
		for (const [anchor, count] of crowd)
			if (!busiest || count > busiest.count || count === busiest.count && anchor < busiest.anchor)
				busiest = { anchor, count };
		const busiestStock = busiest ? [...nearestOf.values()].filter(entry => entry.anchor === busiest.anchor && entry.distance < REPORT_BANDS[1] &&
			isFinite(entry.amount)).reduce((sum, entry) => sum + entry.amount, 0) : 0;
		report[code] = {
			"anchors": anchors.length,
			"stock": stock.map(Math.round),
			"gatherers": hauls.length,
			"haul": HAUL_QUANTILES.map(q => quantile(hauls, q)).map(value => value === null ? null : Math.round(value)),
			"busiest": busiest ? [busiest.count, Math.round(busiestStock)] : null
		};
	}
	return report;
}
