import { awayFrom, lowerId, nearest, squareDistance } from "simulation/ai/strategos/geometry.js";
import { attack, hold, walkTo } from "simulation/ai/strategos/requests.js";

function histogram(units)
{
	const groups = new Map();
	for (const unit of units)
	{
		const key = unit.template + "|" + unit.owner;
		if (!groups.has(key))
			groups.set(key, { "template": unit.template, "owner": unit.owner, "count": 0 });
		groups.get(key).count += 1;
	}
	return [...groups.values()];
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

function closest(units, position, accept)
{
	const found = nearest(units, position, lowerId, accept);
	return { "unit": found.item, "distance": Math.sqrt(found.squareDistance) };
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
		for (const { template, owner, count } of ourTemplates)
			rate += count * catalog.hitRate(enemy.template, template, enemy.owner, owner);
		danger.set(enemy.id, ours.length ? rate / ours.length : 0);
	}
	const pending = new Map();
	const fighting = [];
	for (const unit of ours)
	{
		const near = closest(enemies, unit.position);
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
		const chaser = closest(enemies, unit.position, enemy => !catalog.combat(enemy.template, enemy.owner).ranged);
		if (chaser.unit && chaser.distance <= KITE_RADIUS && profile.speed > catalog.combat(chaser.unit.template, chaser.unit.owner).speed)
		{
			const refuge = awayFrom(unit.position, chaser.unit.position, KITE_STEP);
			actions.set(unit.id, walkTo(refuge[0], refuge[1]));
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
			const foe = closest(enemies, unit.position).unit;
			actions.set(unit.id, unit.state.fighting ? hold() : attack(foe.id));
			continue;
		}
		pending.set(chosen.id, (pending.get(chosen.id) || 0) + FOCUS_HORIZON_S * catalog.hitRate(unit.template, chosen.template, unit.owner, chosen.owner));
		actions.set(unit.id, chosen.id === unit.target ? hold() : attack(chosen.id));
	}
	const guarded = new Set();
	for (const unit of ranged)
	{
		const chaser = closest(enemies, unit.position, enemy => !catalog.combat(enemy.template, enemy.owner).ranged);
		if (!chaser.unit || chaser.distance > GUARD_RADIUS || guarded.has(chaser.unit.id))
			continue;
		const guard = closest(melee, chaser.unit.position, candidate => !actions.has(candidate.id));
		if (!guard.unit || guard.distance > GUARD_REACH)
			continue;
		guarded.add(chaser.unit.id);
		actions.set(guard.unit.id, guard.unit.target === chaser.unit.id ? hold() : attack(chaser.unit.id));
	}
	for (const unit of melee)
	{
		if (actions.has(unit.id))
			continue;
		if (unit.state.fighting)
		{
			actions.set(unit.id, hold());
			continue;
		}
		actions.set(unit.id, attack(closest(enemies, unit.position).unit.id));
	}
	return actions;
}
