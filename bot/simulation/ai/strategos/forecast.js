const RESISTANCE_BASE = 0.9;

export const FORECAST = {
	"stepS": 1,
	"horizonS": 60,
	"marksS": [30, 60],
	"meleeContact": 1.5,
	"rangedContact": 0.75,
	"meleeEfficiency": 0.2,
	"rangedEfficiency": 0.3,
	"arrowHitShare": 0.3,
	"focus": 1.3,
	"joinS": 20,
	"joinShare": 1,
	"arrivals": 0.25
};

function side(input)
{
	return {
		"groups": input.groups.map(group => ({
			"count": group.hitpoints > 0 ? group.count : 0,
			"initialCount": group.hitpoints > 0 ? group.count : 0,
			"hitpoints": Math.max(0, group.hitpoints),
			"initialHitpoints": Math.max(0, group.hitpoints),
			"ranged": group.ranged,
			"value": group.value,
			"at": group.at || 0,
			"engaged": group.engaged === undefined ? 1 : group.count > 0 ? group.engaged / group.count : 0,
			"arriving": (group.at || 0) > 0,
			"rates": group.rates
		})),
		"fire": input.fire || []
	};
}

function active(groups, time)
{
	return groups.filter(group => group.at <= time && group.count > 0);
}

function strike(attackers, defenders, fire, time, rules, damage)
{
	let enemies = 0;
	for (const target of defenders)
		enemies += target.count;
	if (!(enemies > 0))
		return;
	let melee = 0;
	let ranged = 0;
	const fighting = [];
	for (const group of attackers)
	{
		const strength = group.count * (group.arriving ? rules.arrivals :
			group.engaged + (time < rules.joinS ? 0 : rules.joinShare) * (1 - group.engaged));
		fighting.push(strength);
		if (group.ranged)
			ranged += strength;
		else
			melee += strength;
	}
	const meleeShare = melee > 0 ? rules.meleeEfficiency * Math.min(1, rules.meleeContact * enemies / melee) : 0;
	const rangedShare = ranged > 0 ? rules.rangedEfficiency * Math.min(1, rules.rangedContact * enemies / ranged) : 0;
	for (const target of defenders)
	{
		const share = target.count / enemies;
		let dealt = 0;
		attackers.forEach((group, index) => {
			dealt += fighting[index] * (group.ranged ? rangedShare : meleeShare) * (group.rates[target.index] || 0);
		});
		dealt += rules.arrowHitShare * (fire[target.index] || 0);
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

export function forecast(battle, options)
{
	const rules = options ? Object.assign({}, FORECAST, options) : FORECAST;
	const own = side(battle.ours);
	const other = side(battle.theirs);
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
		if ((!mine.length || !foes.length) && seconds >= arrivals)
			break;
		const onTheirs = [];
		const onOurs = [];
		strike(mine, foes, own.fire, seconds, rules, onTheirs);
		strike(foes, mine, other.fire, seconds, rules, onOurs);
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

function grouped(units, opponents, arriving)
{
	const foes = new Set(opponents.map(unit => unit.id));
	const groups = new Map();
	const entry = (unit, wave) => {
		const key = unit.template + "|" + wave;
		if (!groups.has(key))
			groups.set(key, { "key": key, "template": unit.template, "count": 0, "hitpoints": 0, "engaged": 0, "at": 0 });
		const group = groups.get(key);
		group.count += 1;
		group.hitpoints += unit.hitpoints;
		return group;
	};
	for (const unit of units)
		if (unit.state.includes("COMBAT") && foes.has(unit.target))
			entry(unit, 0).engaged += 1;
		else
			entry(unit, 0);
	for (const { unit, seconds } of arriving || [])
		entry(unit, 1).at += seconds;
	for (const group of groups.values())
		group.at = group.at > 0 ? Math.max(1, group.at / group.count) : 0;
	return [...groups.values()].sort((a, b) => a.key < b.key ? -1 : 1);
}

function arrowRates(catalog, structures, targets)
{
	return targets.map(target => {
		const resistance = catalog.combat(target.template).resistance;
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
			"ranged": catalog.combat(group.template).ranged,
			"value": catalog.costSum(group.template),
			"rates": opponents.map(target => catalog.hitRate(group.template, target.template))
		})),
		"fire": arrowRates(catalog, structures, opponents)
	};
}

export function engagement(catalog, units, opponents, cover, opposingCover, arriving, opposingArriving)
{
	const mine = grouped(units, opponents, arriving);
	const foes = grouped(opponents, units, opposingArriving);
	return {
		"ours": force(catalog, mine, foes, cover || []),
		"theirs": force(catalog, foes, mine, opposingCover || [])
	};
}
