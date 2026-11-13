import { squareDistance } from "simulation/ai/strategos/world.js";

const RESISTANCE_BASE = 0.9;
const ARROW_HIT_SHARE = 0.5;

function histogram(units)
{
	const groups = new Map();
	for (const unit of units)
		groups.set(unit.template, (groups.get(unit.template) || 0) + 1);
	return groups;
}

function arrowRate(catalog, holder, opponents, total)
{
	if (!holder.fire.arrows || !total)
		return 0;
	let damage = 0;
	for (const [template, count] of opponents)
	{
		const resistance = catalog.combat(template).resistance;
		let hit = 0;
		for (const kind in holder.fire.damage)
			hit += holder.fire.damage[kind] * Math.pow(RESISTANCE_BASE, resistance[kind] || 0);
		damage += count * hit;
	}
	return ARROW_HIT_SHARE * holder.fire.arrows * damage / total / Math.max(0.1, holder.fire.repeat);
}

export function force(catalog, units, opponents, holders)
{
	const theirs = histogram(opponents);
	const total = opponents.length;
	let dps = 0;
	let hp = 0;
	for (const unit of units)
	{
		hp += unit.hitpoints;
		if (!total)
			continue;
		let rate = 0;
		for (const [template, count] of theirs)
			rate += count * catalog.hitRate(unit.template, template);
		dps += rate / total;
	}
	for (const holder of holders || [])
		dps += arrowRate(catalog, holder, theirs, total);
	return { "dps": dps, "hp": hp, "value": dps * hp };
}

export function balance(catalog, units, opponents, holders)
{
	const ours = force(catalog, units, opponents, holders);
	if (!units.length && !(ours.dps > 0))
		return 0;
	const theirs = force(catalog, opponents, units, []);
	return theirs.value > 0 ? ours.value / theirs.value : Infinity;
}

export function centroid(units)
{
	const centre = [0, 0];
	for (const unit of units)
	{
		centre[0] += unit.position[0] / units.length;
		centre[1] += unit.position[1] / units.length;
	}
	return centre;
}

export function coveringHolders(holders, position, margin)
{
	return holders.filter(holder => holder.fire.arrows > 0 &&
		squareDistance(holder.position, position) <= (holder.range + margin) * (holder.range + margin));
}

const FOCUS_HORIZON_S = 2;
const FOCUS_KEEP = 0.75;
const FOCUS_SLACK = 3;
const KITE_RADIUS = 9;
const KITE_STEP = 16;
const GUARD_RADIUS = 12;
const GUARD_REACH = 30;
const WOUNDED_SHARE = 0.3;
const WOUNDED_DANGER = 25;

function nearest(units, position, accept)
{
	let best = null;
	let bestDistance = Infinity;
	for (const unit of units)
	{
		if (accept && !accept(unit))
			continue;
		const distance = squareDistance(unit.position, position);
		if (distance < bestDistance || distance === bestDistance && best && unit.id < best.id)
		{
			best = unit;
			bestDistance = distance;
		}
	}
	return { "unit": best, "distance": Math.sqrt(bestDistance) };
}

export function skirmish(catalog, ours, enemies, retreat)
{
	const actions = new Map();
	if (!enemies.length)
		return actions;
	const ourTemplates = histogram(ours);
	const danger = new Map();
	for (const enemy of enemies)
	{
		let rate = 0;
		for (const [template, count] of ourTemplates)
			rate += count * catalog.hitRate(enemy.template, template);
		danger.set(enemy.id, ours.length ? rate / ours.length : 0);
	}
	const pending = new Map();
	const fighting = [];
	for (const unit of ours)
	{
		const near = nearest(enemies, unit.position);
		if (retreat && unit.hitpoints < WOUNDED_SHARE * unit.maxHitpoints && near.distance <= WOUNDED_DANGER)
		{
			actions.set(unit.id, retreat(unit));
			continue;
		}
		fighting.push(unit);
	}
	const ranged = fighting.filter(unit => catalog.combat(unit.template).ranged);
	const melee = fighting.filter(unit => !catalog.combat(unit.template).ranged);
	for (const unit of ranged)
	{
		const profile = catalog.combat(unit.template);
		const chaser = nearest(enemies, unit.position, enemy => !catalog.combat(enemy.template).ranged);
		if (chaser.unit && chaser.distance <= KITE_RADIUS && profile.speed > catalog.combat(chaser.unit.template).speed)
		{
			const dx = unit.position[0] - chaser.unit.position[0];
			const dz = unit.position[1] - chaser.unit.position[1];
			const length = Math.sqrt(dx * dx + dz * dz) || 1;
			actions.set(unit.id, { "type": "walk", "x": unit.position[0] + dx / length * KITE_STEP, "z": unit.position[1] + dz / length * KITE_STEP });
			continue;
		}
		const reach = (profile.range + FOCUS_SLACK) * (profile.range + FOCUS_SLACK);
		let best = null;
		let bestScore = 0;
		let current = 0;
		for (const enemy of enemies)
		{
			if (squareDistance(enemy.position, unit.position) > reach)
				continue;
			const left = enemy.hitpoints - (pending.get(enemy.id) || 0);
			const score = left > 0 ? danger.get(enemy.id) / left : 0;
			if (enemy.id === unit.target)
				current = score;
			if (score > bestScore || score === bestScore && best && enemy.id < best.id)
			{
				best = enemy;
				bestScore = score;
			}
		}
		const keep = unit.target !== undefined && current > 0 && current >= FOCUS_KEEP * bestScore;
		const chosen = keep ? enemies.find(enemy => enemy.id === unit.target) : best;
		if (!chosen)
		{
			const closest = nearest(enemies, unit.position).unit;
			actions.set(unit.id, unit.state.includes("COMBAT") ? { "type": "hold" } : { "type": "attack", "target": closest.id });
			continue;
		}
		pending.set(chosen.id, (pending.get(chosen.id) || 0) + FOCUS_HORIZON_S * catalog.hitRate(unit.template, chosen.template));
		actions.set(unit.id, chosen.id === unit.target ? { "type": "hold" } : { "type": "attack", "target": chosen.id });
	}
	const guarded = new Set();
	for (const unit of ranged)
	{
		const chaser = nearest(enemies, unit.position, enemy => !catalog.combat(enemy.template).ranged);
		if (!chaser.unit || chaser.distance > GUARD_RADIUS || guarded.has(chaser.unit.id))
			continue;
		const guard = nearest(melee, chaser.unit.position, candidate => !actions.has(candidate.id));
		if (!guard.unit || guard.distance > GUARD_REACH)
			continue;
		guarded.add(chaser.unit.id);
		actions.set(guard.unit.id, guard.unit.target === chaser.unit.id ? { "type": "hold" } : { "type": "attack", "target": chaser.unit.id });
	}
	for (const unit of melee)
	{
		if (actions.has(unit.id))
			continue;
		if (unit.state.includes("COMBAT"))
		{
			actions.set(unit.id, { "type": "hold" });
			continue;
		}
		actions.set(unit.id, { "type": "attack", "target": nearest(enemies, unit.position).unit.id });
	}
	return actions;
}
