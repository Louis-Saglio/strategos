export const TECH_HORIZON_S = 180;
const GATHER_EFFICIENCY = 0.6;
const WALK_SHARE = 0.35;
const RESISTANCE_BASE = 0.9;
const ARROW_HIT_SHARE = 0.5;
const CAPTURE_ENGAGED_SHARE = 0.9;
const RATE_PREFIX = "ResourceGatherer/Rates/";
const CAPACITY_PREFIX = "ResourceGatherer/Capacities/";
const SPEED_KEY = "ResourceGatherer/BaseSpeed";
const ATTACK_PREFIX = "Attack/";
const RESISTANCE_PREFIX = "Resistance/Entity/Damage/";
const HEALTH_KEY = "Health/Max";

export function captureOutlook(members, centre)
{
	let power = 0;
	let fragility = 0;
	for (const member of members)
	{
		power += CAPTURE_ENGAGED_SHARE * member.capture;
		for (const kind in centre.fire.damage)
			fragility += centre.fire.damage[kind] * Math.pow(RESISTANCE_BASE, member.resistance[kind] || 0) / member.hitpoints;
	}
	const net = power - centre.regen;
	const losses = members.length ? ARROW_HIT_SHARE * centre.fire.arrows / centre.fire.repeat * fragility / members.length : 0;
	const decay = members.length ? losses * power / members.length : 0;
	return {
		"power": power,
		"losses": losses,
		"reach": net <= 0 ? 0 : decay > 0 ? net * net / (2 * decay) : Infinity
	};
}

export function techBenefit(world, catalog, tech)
{
	return TECH_HORIZON_S * gatherGain(world, catalog, tech) + militaryBenefit(world, catalog, tech);
}

export function gatherGain(world, catalog, tech)
{
	const info = catalog.technology(tech);
	if (!info.modifications.some(modification => modification.value.startsWith("ResourceGatherer/")))
		return 0;
	let gain = 0;
	for (const worker of world.workers)
	{
		if (!worker.kind)
			continue;
		const rate = worker.profile.rates[worker.kind] || 0;
		if (!rate)
			continue;
		const capacity = worker.profile.capacities[worker.gathering] || 0;
		for (const modification of info.modifications)
		{
			if (!catalog.modificationApplies(info, modification, worker.classes))
				continue;
			if (modification.value === RATE_PREFIX + worker.kind || modification.value === SPEED_KEY)
				gain += rate * ((modification.multiply || 1) - 1);
			else if (modification.value === CAPACITY_PREFIX + worker.gathering && modification.add && capacity > 0)
				gain += rate * WALK_SHARE * modification.add / (capacity + modification.add);
		}
	}
	return gain * GATHER_EFFICIENCY;
}

export function militaryBenefit(world, catalog, tech)
{
	const info = catalog.technology(tech);
	const combat = info.modifications.filter(modification => modification.value.startsWith(ATTACK_PREFIX) ||
		modification.value.startsWith(RESISTANCE_PREFIX) || modification.value === HEALTH_KEY);
	if (!combat.length)
		return 0;
	let benefit = 0;
	for (const group of world.army)
	{
		const applying = combat.filter(modification => catalog.modificationApplies(info, modification, group.classes));
		if (!applying.length)
			continue;
		const profile = catalog.combat(group.template);
		const strength = (1 + attackGain(profile, applying)) * (1 + durabilityGain(profile, applying, world.enemyDamageMix)) - 1;
		benefit += group.value * strength;
	}
	return benefit;
}

function attackGain(profile, modifications)
{
	let before = 0;
	let after = 0;
	for (const type in profile.attacks)
	{
		const attack = profile.attacks[type];
		let repeat = attack.repeat;
		for (const modification of modifications)
			if (modification.value === ATTACK_PREFIX + type + "/RepeatTime")
				repeat = repeat * (modification.multiply || 1) + (modification.add || 0) / 1000;
		for (const kind in attack.damage)
		{
			let damage = attack.damage[kind];
			for (const modification of modifications)
				if (modification.value === ATTACK_PREFIX + type + "/Damage/" + kind)
					damage = damage * (modification.multiply || 1) + (modification.add || 0);
			before += attack.damage[kind] / attack.repeat;
			after += damage / Math.max(0.1, repeat);
		}
	}
	return before > 0 ? after / before - 1 : 0;
}

function durabilityGain(profile, modifications, mix)
{
	if (!(profile.hp > 0))
		return 0;
	let hp = profile.hp;
	for (const modification of modifications)
		if (modification.value === HEALTH_KEY)
			hp = hp * (modification.multiply || 1) + (modification.add || 0);
	let before = 0;
	let after = 0;
	for (const kind in mix)
	{
		const resistance = profile.resistance[kind] || 0;
		let added = 0;
		for (const modification of modifications)
			if (modification.value === RESISTANCE_PREFIX + kind)
				added += modification.add || 0;
		before += mix[kind] * Math.pow(RESISTANCE_BASE, resistance);
		after += mix[kind] * Math.pow(RESISTANCE_BASE, resistance + added);
	}
	const taken = after > 0 ? before / after : 1;
	return hp / profile.hp * taken - 1;
}
