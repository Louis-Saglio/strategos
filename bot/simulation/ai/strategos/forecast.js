import { RESISTANCE_BASE } from "simulation/ai/strategos/rules.js";

export const CONTACT_RADIUS = 60;
export const REACH_RADIUS = 150;
export const COVER_MARGIN = 5;
const WORKING_STATES = ["GATHER", "RETURNRESOURCE", "REPAIR", "GARRISON"];
const RECRUIT_WAVE_S = 20;

export const FORECAST = {
	"stepS": 1,
	"horizonS": 60,
	"marksS": [30, 60],
	"meleeEfficiency": 0.7,
	"rangedEfficiency": 1,
	"arrowHitShare": 0.3,
	"focus": 1,
	"meleeJoinS": 20,
	"rangedJoinS": 14,
	"joinScale": 1,
	"handicap": 1,
	"preyShare": 0.2,
	"arrivals": 0.25
};

function side(input, rules)
{
	return {
		"groups": input.groups.map(group => {
			const share = group.passive ? rules.preyShare : (group.at || 0) > 0 ? rules.arrivals : 1;
			const count = group.hitpoints > 0 ? group.count * share : 0;
			const hitpoints = Math.max(0, group.hitpoints) * share;
			return {
			"count": count,
			"initialCount": count,
			"hitpoints": hitpoints,
			"initialHitpoints": hitpoints,
			"ranged": group.ranged,
			"value": group.value,
			"at": group.at || 0,
			"engaged": group.engaged === undefined ? 1 : group.count > 0 ? group.engaged / group.count : 0,
			"rates": group.rates,
			"passive": !!group.passive
			};
		}),
		"fire": input.fire || []
	};
}

function active(groups, time)
{
	return groups.filter(group => group.at <= time && group.count > 0);
}

function strike(attackers, defenders, fire, time, rules, damage, handicap)
{
	const armed = defenders.filter(target => !target.passive);
	const targets = armed.length ? armed : defenders;
	let enemies = 0;
	for (const target of targets)
		enemies += target.count;
	if (!(enemies > 0))
		return;
	const fighting = attackers.map(group => {
		if (group.passive)
			return 0;
		const joinS = rules.joinScale * (group.ranged ? rules.rangedJoinS : rules.meleeJoinS);
		const joined = joinS > 0 ? Math.min(1, (time + rules.stepS) / joinS) : 1;
		return group.count * (group.at > 0 ? 1 : group.engaged + joined * (1 - group.engaged));
	});
	for (const target of targets)
	{
		const share = target.count / enemies;
		let dealt = 0;
		attackers.forEach((group, index) => {
			dealt += fighting[index] * (group.ranged ? rules.rangedEfficiency : rules.meleeEfficiency) * (group.rates[target.index] || 0);
		});
		dealt = dealt * handicap + rules.arrowHitShare * (fire[target.index] || 0);
		damage[target.index] = share * dealt * rules.stepS;
	}
}

function wound(groups, damage, rules)
{
	for (const group of groups)
	{
		const dealt = damage[group.index];
		if (!(dealt > 0))
			continue;
		group.hitpoints = Math.max(0, group.hitpoints - dealt);
		group.count = group.initialCount * Math.pow(group.hitpoints / group.initialHitpoints, rules.focus);
		if (group.count < 0.5)
		{
			group.count = 0;
			group.hitpoints = 0;
		}
	}
}

function toll(groups)
{
	let lost = 0;
	let value = 0;
	let left = 0;
	for (const group of groups)
	{
		lost += group.initialCount - group.count;
		value += (group.initialCount - group.count) * group.value;
		left += group.count;
	}
	return { "lost": lost, "value": value, "left": left };
}

function firing(force)
{
	return force.fire.some(rate => rate > 0);
}

export function forecast(battle, options)
{
	const rules = options ? Object.assign({}, FORECAST, options) : FORECAST;
	const own = side(battle.ours, rules);
	const other = side(battle.theirs, rules);
	own.groups.forEach((group, index) => { group.index = index; });
	other.groups.forEach((group, index) => { group.index = index; });
	const marks = [];
	let seconds = 0;
	let pending = rules.marksS.slice();
	const arrivals = own.groups.concat(other.groups).reduce((latest, group) => Math.max(latest, group.at), 0);
	while (seconds < rules.horizonS)
	{
		const mine = active(own.groups, seconds);
		const foes = active(other.groups, seconds);
		if (seconds >= arrivals && (!mine.length && !foes.length || !mine.length && !firing(own) || !foes.length && !firing(other)))
			break;
		const onTheirs = [];
		const onOurs = [];
		strike(mine, foes, own.fire, seconds, rules, onTheirs, rules.handicap);
		strike(foes, mine, other.fire, seconds, rules, onOurs, 1);
		wound(foes, onTheirs, rules);
		wound(mine, onOurs, rules);
		seconds += rules.stepS;
		while (pending.length && seconds >= pending[0])
			marks.push({ "t": pending.shift(), "ours": toll(own.groups).lost, "theirs": toll(other.groups).lost });
	}
	const mine = toll(own.groups);
	const foes = toll(other.groups);
	for (const mark of pending)
		marks.push({ "t": mark, "ours": mine.lost, "theirs": foes.lost });
	return {
		"seconds": seconds,
		"ours": mine,
		"theirs": foes,
		"marks": marks,
		"edge": foes.value - mine.value,
		"winner": mine.left > 0 && !(foes.left > 0) ? 1 : foes.left > 0 && !(mine.left > 0) ? -1 : 0
	};
}

function grouped(units, opponents, arriving, committed, passive)
{
	const foes = new Set(opponents.map(unit => unit.id));
	const groups = new Map();
	const entry = (unit, wave) => {
		const prey = !!passive && passive.has(unit.id);
		const key = unit.template + "|" + wave + "|" + unit.owner + "|" + prey;
		if (!groups.has(key))
			groups.set(key, { "key": key, "template": unit.template, "owner": unit.owner, "passive": prey, "count": 0, "hitpoints": 0, "engaged": 0,
				"at": 0 });
		const group = groups.get(key);
		group.count += 1;
		group.hitpoints += unit.hitpoints;
		return group;
	};
	for (const unit of units)
		if (committed || unit.state.includes("ATTACKING") && foes.has(unit.target))
			entry(unit, 0).engaged += 1;
		else
			entry(unit, 0);
	for (const { unit, seconds, wave } of arriving || [])
		entry(unit, wave || 1).at += seconds;
	for (const group of groups.values())
		group.at = group.at > 0 ? Math.max(1, group.at / group.count) : 0;
	return [...groups.values()].sort((a, b) => a.key < b.key ? -1 : 1);
}

function arrowRates(catalog, structures, targets)
{
	return targets.map(target => {
		const resistance = catalog.combat(target.template, target.owner).resistance;
		let rate = 0;
		for (const structure of structures)
		{
			if (!structure.fire.arrows)
				continue;
			let hit = 0;
			for (const kind in structure.fire.damage)
				hit += structure.fire.damage[kind] * Math.pow(RESISTANCE_BASE, resistance[kind] || 0);
			rate += structure.fire.arrows * hit / Math.max(0.1, structure.fire.repeat);
		}
		return rate;
	});
}

function force(catalog, groups, opponents, structures)
{
	return {
		"groups": groups.map(group => ({
			"template": group.template,
			"count": group.count,
			"hitpoints": group.hitpoints,
			"engaged": group.engaged,
			"at": group.at,
			"passive": group.passive,
			"ranged": catalog.combat(group.template, group.owner).ranged,
			"value": catalog.costSum(group.template),
			"rates": opponents.map(target => catalog.hitRate(group.template, target.template, group.owner, target.owner))
		})),
		"fire": arrowRates(catalog, structures, opponents)
	};
}

export function engagement(catalog, units, opponents, cover, opposingCover, arriving, opposingArriving, committed, passive)
{
	const mine = grouped(units, opponents, arriving, committed);
	const foes = grouped(opponents, units, opposingArriving, false, passive);
	return {
		"ours": force(catalog, mine, foes, cover || []),
		"theirs": force(catalog, foes, mine, opposingCover || [])
	};
}

function apart(a, b)
{
	return (a[0] - b[0]) * (a[0] - b[0]) + (a[1] - b[1]) * (a[1] - b[1]);
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

export function within(units, centre, taken)
{
	const limit = CONTACT_RADIUS * CONTACT_RADIUS;
	return units.filter(unit => !(taken && taken.has(unit.id)) && apart(unit.position, centre) <= limit);
}

export function atWork(unit)
{
	return WORKING_STATES.some(state => unit.state.includes(state));
}

export function arriving(catalog, units, centre, present, working, reach, fighting)
{
	const limit = (reach || REACH_RADIUS) * (reach || REACH_RADIUS);
	const coming = [];
	for (const unit of units)
	{
		if (present.has(unit.id) || !fighting && unit.state.includes("COMBAT") ||
		    working && atWork(unit))
			continue;
		const distance = apart(unit.position, centre);
		if (distance > limit)
			continue;
		coming.push({ "unit": unit, "seconds": Math.max(1, (Math.sqrt(distance) - CONTACT_RADIUS / 2) / Math.max(1, catalog.combat(unit.template, unit.owner).speed)) });
	}
	return coming;
}

export function covering(structures, centre, side)
{
	const stand = side.length ? centroid(side) : centre;
	return structures.filter(structure => {
		if (!(structure.fire.arrows > 0))
			return false;
		const reach = (structure.range + COVER_MARGIN) * (structure.range + COVER_MARGIN);
		return apart(structure.position, centre) <= reach || apart(structure.position, stand) <= reach;
	});
}

export function prospect(catalog, members, centre, enemies, structures, plan)
{
	const seen = within(enemies, centre);
	const preyReach = plan.preyReach || plan.reach;
	const prey = (plan.prey || []).filter(unit => apart(unit.position, centre) <= preyReach * preyReach);
	const lead = plan.lead || 0;
	const mustered = [];
	const recruited = [];
	for (const group of plan.muster || [])
	{
		const hitpoints = catalog.combat(group.template, group.owner).hp;
		const count = Math.floor(group.rate * (lead + (plan.horizonS || FORECAST.horizonS)));
		for (let k = 1; k <= count; ++k)
		{
			const unit = { "id": -(mustered.length + recruited.length + 1), "template": group.template, "owner": group.owner, "hitpoints": hitpoints,
				"state": "" };
			if (k / group.rate <= lead)
				mustered.push(unit);
			else
				recruited.push({ "unit": unit, "seconds": k / group.rate - lead, "wave": 2 + Math.floor((k / group.rate - lead) / RECRUIT_WAVE_S) });
		}
	}
	const present = seen.concat(plan.hidden || [], mustered, prey);
	const coming = arriving(catalog, enemies, centre, new Set(seen.map(unit => unit.id)), false, plan.reach, true)
		.map(entry => ({ "unit": entry.unit, "seconds": plan.massed ? 1 : Math.max(1, entry.seconds - lead) }))
		.concat(recruited);
	const outlook = forecast(engagement(catalog, members, present, [], covering(structures, centre, seen), [], coming, true,
		new Set(prey.map(unit => unit.id))),
		Object.assign({ "arrivals": plan.response, "joinScale": plan.reaction, "handicap": plan.handicap || 1 },
			plan.horizonS ? { "horizonS": plan.horizonS } : {}));
	let opposing = 0;
	for (const unit of present)
		opposing += catalog.costSum(unit.template);
	for (const entry of coming)
		opposing += catalog.costSum(entry.unit.template);
	return {
		"cost": outlook.ours.value,
		"gain": outlook.theirs.value,
		"lost": outlook.ours.lost,
		"killed": outlook.theirs.lost,
		"defenders": present.length - prey.length - mustered.length,
		"prey": prey.length,
		"coming": coming.length - recruited.length,
		"recruits": mustered.length + recruited.length,
		"opposing": opposing
	};
}
