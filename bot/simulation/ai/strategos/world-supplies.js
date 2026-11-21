import { halfSizeOf, loadCycle, reachOf } from "simulation/ai/strategos/gathering.js";
import { landRegionNear } from "simulation/ai/strategos/terrain.js";

const SUPPLY_CELL = 8;
const CELL_STRIDE = 4096;
export const HAUL_REACH = 160;
const REPORT_BANDS = [10, 20, 30];
const HAUL_QUANTILES = [0.5, 0.9];

function cellKey(i, j)
{
	return i * CELL_STRIDE + j;
}

function byHaul(a, b)
{
	return a.haul - b.haul || a.supply.id - b.supply.id;
}

function rankOf(order, entry)
{
	let low = 0;
	let high = order.length;
	while (low < high)
	{
		const middle = (low + high) >> 1;
		if (byHaul(order[middle], entry) < 0)
			low = middle + 1;
		else
			high = middle;
	}
	return low;
}

function nearestEntry(supply, anchors)
{
	let best = null;
	for (const anchor of anchors)
	{
		const haul = edgeDistance(anchor, supply.position);
		if (haul <= HAUL_REACH && (!best || haul < best.haul))
			best = { supply, haul, "anchor": anchor.id };
	}
	return best;
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
		this.rankings = new Map();
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
		this.rankings = new Map();
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
			"half": halfSizeOf(ent),
			"diminishing": +(ent.get("ResourceSupply/DiminishingReturns") || 0),
			"cell": cellKey(i, j)
		});
		this.supplies.set(id, supply);
		const key = supply.cell;
		if (!cells.has(key))
			cells.set(key, []);
		cells.get(key).push(id);
		this.rank(supply);
	}

	rank(supply)
	{
		const ranking = this.rankings.get(supply.code);
		const entry = ranking && nearestEntry(supply, ranking.anchors);
		if (!entry)
			return;
		ranking.byId.set(supply.id, entry);
		ranking.order.splice(rankOf(ranking.order, entry), 0, entry);
	}

	unrank(supply)
	{
		const ranking = this.rankings.get(supply.code);
		const entry = ranking && ranking.byId.get(supply.id);
		if (!entry)
			return;
		ranking.byId.delete(supply.id);
		ranking.order.splice(rankOf(ranking.order, entry), 1);
	}

	ranking(code, anchors)
	{
		const serving = anchors.filter(anchor => anchor.types.includes(code)).sort((a, b) => a.id - b.id);
		const key = serving.map(anchor => anchor.id).join(",");
		const known = this.rankings.get(code);
		if (known && known.key === key)
			return known.order;
		const byId = new Map();
		for (const anchor of serving)
			for (const supply of this.around(code, anchor.position, outerRadius(anchor) + HAUL_REACH))
			{
				const haul = edgeDistance(anchor, supply.position);
				const entry = byId.get(supply.id);
				if (haul <= HAUL_REACH && (!entry || haul < entry.haul))
					byId.set(supply.id, { supply, haul, "anchor": anchor.id });
			}
		const order = [...byId.values()].sort(byHaul);
		this.rankings.set(code, { key, "anchors": serving, byId, order });
		return order;
	}

	remove(id)
	{
		const supply = this.supplies.get(id);
		if (!supply)
			return;
		this.supplies.delete(id);
		this.unrank(supply);
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

function reader(gameState, player, index, anchors)
{
	const known = new Map();
	return (code, count, reach) => {
		let read = known.get(code);
		if (!read)
		{
			read = { "order": index.ranking(code, anchors), "next": 0, "live": [] };
			known.set(code, read);
		}
		while (read.next < read.order.length && (read.live.length < count || read.order[read.next].haul <= reach))
		{
			const entry = read.order[read.next++];
			const state = live(gameState, player, entry.supply);
			if (state)
				read.live.push(Object.freeze(Object.assign({}, entry.supply, state, { "haul": entry.haul, "anchor": entry.anchor })));
		}
		let end = read.live.length;
		while (end > count && read.live[end - 1].haul > reach)
			end -= 1;
		return read.live.slice(0, end);
	};
}

export function suppliesSection(gameState, index, anchors)
{
	const player = gameState.getPlayerID();
	const read = reader(gameState, player, index, anchors);
	return {
		"now": {
			"suppliesAround": (code, position, radius) => Object.freeze(index.around(code, position, radius)
				.map(supply => {
					const state = live(gameState, player, supply);
					return state && Object.freeze(Object.assign({}, supply, state));
				})
				.filter(supply => supply)),
			"hauled": (code, count) => read(code, count, -1),
			"hauledWithin": (code, reach) => read(code, 0, reach)
		},
		"later": {}
	};
}

function quantile(sorted, q)
{
	return sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))] : null;
}

function nearestAnchor(anchors, code, position)
{
	let best = null;
	let bestDistance = Infinity;
	for (const anchor of anchors)
	{
		if (!anchor.types.includes(code))
			continue;
		const distance = edgeDistance(anchor, position);
		if (distance < bestDistance || distance === bestDistance && best && anchor.id < best.id)
		{
			best = anchor;
			bestDistance = distance;
		}
	}
	return best && { "anchor": best, "distance": bestDistance };
}

export function siteReport(world)
{
	const placed = [];
	const crowd = new Map();
	for (const worker of world.workers)
	{
		if (!worker.gathering || !worker.targetPosition)
			continue;
		const found = nearestAnchor(world.anchors, worker.gathering, worker.targetPosition);
		if (!found)
			continue;
		placed.push({ worker, "anchor": found.anchor, "haul": found.distance });
		const front = found.anchor.id + ":" + worker.gathering;
		crowd.set(front, (crowd.get(front) || 0) + 1);
	}
	const report = {};
	for (const code of world.codes)
	{
		if (!world.anchors.some(anchor => anchor.types.includes(code)))
			continue;
		const near = world.hauledWithin(code, REPORT_BANDS[REPORT_BANDS.length - 1]).filter(supply => isFinite(supply.amount));
		const stock = REPORT_BANDS.map(band => near.reduce((sum, supply) => sum + (supply.haul < band ? supply.amount : 0), 0));
		const hauls = [];
		const busy = new Map();
		let output = 0;
		let share = 0;
		let modelled = 0;
		for (const { worker, anchor, haul } of placed)
		{
			if (worker.gathering !== code)
				continue;
			hauls.push(haul);
			busy.set(anchor.id, (busy.get(anchor.id) || 0) + 1);
			const rate = worker.profile.rates[worker.kind] || 0;
			const capacity = worker.profile.capacities[code] || 0;
			const cycle = loadCycle(rate, capacity, worker.profile.speed, haul, reachOf(worker.profile.range, worker.targetHalf),
				crowd.get(anchor.id + ":" + code));
			if (!isFinite(cycle))
				continue;
			output += capacity / cycle;
			share += capacity / rate / cycle;
			modelled += 1;
		}
		hauls.sort((a, b) => a - b);
		let busiest = null;
		for (const [anchor, count] of busy)
			if (!busiest || count > busiest.count || count === busiest.count && anchor < busiest.anchor)
				busiest = { anchor, count };
		const busiestStock = busiest ? near.filter(supply => supply.anchor === busiest.anchor && supply.haul < REPORT_BANDS[1])
			.reduce((sum, supply) => sum + supply.amount, 0) : 0;
		const round = value => Math.round(value * 1000) / 1000;
		report[code] = {
			"anchors": world.anchors.filter(anchor => anchor.types.includes(code)).length,
			"stock": stock.map(Math.round),
			"gatherers": hauls.length,
			"haul": HAUL_QUANTILES.map(q => quantile(hauls, q)).map(value => value === null ? null : Math.round(value)),
			"busiest": busiest ? [busiest.count, Math.round(busiestStock)] : null,
			"model": modelled ? [round(output / modelled), round(share / modelled)] : null
		};
	}
	return report;
}
