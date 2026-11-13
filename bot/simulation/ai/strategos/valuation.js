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
const EXCHANGE_HORIZON_S = 60;
const EXCHANGE_BUFFER = 100;
const EXCHANGE_KEEP = 200;
const PRICE_FLOOR = 0.1;

export const TRAINING_BATCH = 5;

export function productionFlow(world, catalog, civilianTarget)
{
	const flow = {};
	for (const code of world.codes)
		flow[code] = 0;
	const civilians = world.workers.filter(worker => !worker.soldier).length < civilianTarget;
	for (const trainer of world.trainers)
	{
		const settlement = catalog.isSettlement(trainer.template);
		const civilian = settlement && civilians && trainer.trainable.some(name => catalog.isCivilian(name));
		const wanted = name => civilian ? catalog.isCivilian(name) : catalog.isFighter(name);
		let cheapest = null;
		for (const name of trainer.trainable)
			if (wanted(name) && (!cheapest || catalog.costSum(name) < catalog.costSum(cheapest) ||
				(catalog.costSum(name) === catalog.costSum(cheapest) && name < cheapest)))
				cheapest = name;
		if (!cheapest)
			continue;
		const seconds = catalog.buildTime(cheapest) * Math.pow(TRAINING_BATCH, trainer.batchTimeModifier) / TRAINING_BATCH;
		if (!(seconds > 0))
			continue;
		const cost = catalog.cost(cheapest);
		for (const code of world.codes)
			flow[code] += cost[code] / seconds;
	}
	return flow;
}

export function exchangeOutlook(world)
{
	const surplus = {};
	const shortfall = {};
	for (const code of world.codes)
	{
		const stock = world.resources[code];
		const unmet = world.demand.unmet[code];
		shortfall[code] = Math.max(0, unmet + EXCHANGE_BUFFER - stock);
		surplus[code] = Math.max(0, stock - unmet - world.demand.spendRate[code] * EXCHANGE_HORIZON_S - EXCHANGE_KEEP);
	}
	return { surplus, shortfall };
}

export function resourcePrices(world)
{
	const prices = {};
	for (const code of world.codes)
	{
		const stock = world.resources[code];
		const need = world.demand.unmet[code] + world.demand.spendRate[code] * EXCHANGE_HORIZON_S + EXCHANGE_KEEP;
		prices[code] = stock <= need ? 1 : Math.max(PRICE_FLOOR, need / stock);
	}
	return prices;
}

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

const COMBAT_KINDS = ["Hack", "Pierce", "Crush"];
const POPULATION_PRICE = 100;
const POPULATION_PRESSURE_FROM = 0.7;
const POPULATION_PRESSURE_SPAN = 0.25;
const DIVERSITY_WEIGHT = 2;
const ROLE_DIVERSITY_WEIGHT = 2;
const GATHER_CREDIT = 0.5;

export function populationPressure(world)
{
	const share = world.population / Math.max(1, world.populationMax);
	return Math.min(1, Math.max(0, (share - POPULATION_PRESSURE_FROM) / POPULATION_PRESSURE_SPAN));
}

export function enemyProfile(world, catalog)
{
	let total = 0;
	const softness = {};
	for (const kind of COMBAT_KINDS)
		softness[kind] = 0;
	const groups = [];
	let dps = 0;
	for (const group of world.enemyArmy)
	{
		const profile = catalog.combat(group.template);
		total += group.count;
		for (const kind of COMBAT_KINDS)
			softness[kind] += group.count * Math.pow(RESISTANCE_BASE, profile.resistance[kind] || 0);
		const rate = attackRate(profile);
		dps += group.count * rate;
		groups.push({ "count": group.count, "classes": profile.classes, "rate": rate, "bonuses": allBonuses(profile) });
	}
	for (const kind of COMBAT_KINDS)
		softness[kind] = total ? softness[kind] / total : 1;
	return { total, softness, groups, dps };
}

export function combatRole(profile)
{
	let best = null;
	let bestRate = 0;
	for (const type in profile.attacks)
	{
		const attack = profile.attacks[type];
		let sum = 0;
		for (const kind in attack.damage)
			sum += attack.damage[kind];
		if (sum / Math.max(0.1, attack.repeat) > bestRate)
		{
			best = type;
			bestRate = sum / Math.max(0.1, attack.repeat);
		}
	}
	return best;
}

function attackRate(profile)
{
	let best = 0;
	for (const type in profile.attacks)
	{
		const attack = profile.attacks[type];
		let sum = 0;
		for (const kind in attack.damage)
			sum += attack.damage[kind];
		best = Math.max(best, sum / Math.max(0.1, attack.repeat));
	}
	return best;
}

function allBonuses(profile)
{
	const bonuses = [];
	for (const type in profile.attacks)
		bonuses.push(...profile.attacks[type].bonuses);
	return bonuses;
}

export function unitStrength(world, catalog, name, enemy)
{
	const profile = catalog.combat(name);
	let dps = 0;
	for (const type in profile.attacks)
	{
		const attack = profile.attacks[type];
		let damage = 0;
		for (const kind in attack.damage)
			damage += attack.damage[kind] * (enemy.softness[kind] === undefined ? 1 : enemy.softness[kind]);
		let multiplier = 1;
		if (enemy.total)
			for (const bonus of attack.bonuses)
			{
				let matched = 0;
				for (const group of enemy.groups)
					if (MatchesClassList(group.classes, bonus.classes))
						matched += group.count;
				multiplier += matched / enemy.total * (bonus.multiplier - 1);
			}
		dps = Math.max(dps, damage * multiplier / Math.max(0.1, attack.repeat));
	}
	let taken = 0;
	for (const kind in world.enemyDamageMix)
		taken += world.enemyDamageMix[kind] * Math.pow(RESISTANCE_BASE, profile.resistance[kind] || 0);
	let exposure = 1;
	if (enemy.dps > 0)
	{
		exposure = 0;
		for (const group of enemy.groups)
		{
			let multiplier = 1;
			for (const bonus of group.bonuses)
				if (MatchesClassList(profile.classes, bonus.classes))
					multiplier = Math.max(multiplier, bonus.multiplier);
			exposure += group.count * group.rate / enemy.dps * multiplier;
		}
	}
	return dps * (profile.hp || 0) / Math.max(0.01, taken * exposure);
}

export function unitScore(world, catalog, name, context)
{
	const cost = catalog.cost(name);
	let price = POPULATION_PRICE * catalog.population(name) * context.pressure;
	for (const code of world.codes)
		price += cost[code] * context.prices[code];
	const share = context.counts.get(name) || 0;
	const roleShare = context.roles.get(combatRole(catalog.combat(name))) || 0;
	const gathers = catalog.template(name).isGatherer() ? 1 + GATHER_CREDIT * (1 - context.pressure) : 1;
	const size = Math.max(1, context.armySize);
	return unitStrength(world, catalog, name, context.enemy) * gathers / Math.max(1, price) /
		(1 + DIVERSITY_WEIGHT * share / size) / (1 + ROLE_DIVERSITY_WEIGHT * roleShare / size);
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
