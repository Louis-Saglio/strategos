import { squareDistance } from "simulation/ai/strategos/geometry.js";
import { RESISTANCE_BASE } from "simulation/ai/strategos/rules.js";
import { ARROW_HIT_SHARE } from "simulation/ai/strategos/tactics.js";

export const TECH_HORIZON_S = 180;
export const GATHER_EFFICIENCY = 0.6;
const WALK_SHARE = 0.35;
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
		const cheapest = catalog.cheapest(trainer.trainable, wanted);
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
export const POPULATION_PRICE = 100;
export const HERO_EDGE = 2;
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
		const profile = catalog.combat(group.template, group.owner);
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

const SPEED_WEIGHT = 0.5;
const RANGE_WEIGHT = 1;
const SPREAD_WEIGHT = 0.3;
const POINT_BLANK_GAIN = 0.1;
const REGEN_WINDOW_S = 60;
const REGEN_WEIGHT = 0.5;
const PROMOTION_WEIGHT = 0.1;
const RANK_GAIN = 0.35;
const FIRE_LOSS_SCALE = 500;
const SHELTER_HEAL_GAIN = 0.05;
const BUILDER_RATE = 0.6;
const TRAINER_SECOND_VALUE = 0.8;
const HEAL_RANGE_WEIGHT = 0.3;
const MOBILE_AURA_RADIUS = 60;
const STUDY_PREFIX = "Researcher/TechCostMultiplier/";
const STUDY_SHARE = 0.5;
const FISH_KIND = "food.fish";
const FORGONE_GATHERERS = 5;
const FORGONE_RATE = 1;
const FORGONE_FISH_REACH = 300;
const COST_PREFIX = "Cost/Resources/";
const TRICKLE_PREFIX = "ResourceTrickle/Rates/";
const PLAYER_CLASS = "Player";
const PLAYER_TRICKLE_S = 1;
const DURABILITY_PATHS = ["Capturable/CapturePoints"];
const FIRE_PATHS = ["BuildingAI/DefaultArrowCount", "BuildingAI/GarrisonArrowMultiplier"];

const techBenefits = new WeakMap();

export function techBenefit(world, catalog, tech)
{
	if (!techBenefits.has(world))
		techBenefits.set(world, new Map());
	const known = techBenefits.get(world);
	if (!known.has(tech))
		known.set(tech, effectBenefit(world, catalog, catalog.technology(tech)) + grantedAuraBenefit(world, catalog, tech));
	return known.get(tech);
}

export function effectBenefit(world, catalog, info)
{
	return TECH_HORIZON_S * (gatherGain(world, catalog, info) + fishingGain(world, catalog, info) + trickleGain(world, catalog, info)) +
		militaryBenefit(world, catalog, info) + assetBenefit(world, catalog, info) + protectionBenefit(world, catalog, info) +
		flowBenefit(world, catalog, info) + housingBenefit(world, catalog, info) + capBenefit(world, catalog, info) +
		studyBenefit(world, catalog, info);
}

function grantedAuraBenefit(world, catalog, tech)
{
	let benefit = 0;
	for (const group of world.estate)
		for (const name of catalog.auras(group.template))
		{
			const aura = catalog.aura(name);
			if (aura.requiredTechnology === tech)
				benefit += group.count * aura.coverage * effectBenefit(world, catalog, aura);
		}
	return benefit;
}

export function heroWorth(world, catalog, name)
{
	return catalog.costSum(name) + catalog.auras(name).reduce((sum, aura) => sum + auraBenefit(world, catalog, aura, true), 0);
}

export function auraBenefit(world, catalog, name, mobile)
{
	const aura = catalog.aura(name);
	if (!aura.own || aura.requiredTechnology && !catalog.gameState.isResearched(aura.requiredTechnology))
		return 0;
	const coverage = mobile && aura.radius ? Math.min(1, aura.radius / MOBILE_AURA_RADIUS) : aura.coverage;
	return coverage * effectBenefit(world, catalog, aura);
}

function capBenefit(world, catalog, info)
{
	let benefit = 0;
	for (const modification of info.modifications)
		if (modification.value === "Player/MaxPopulation" && catalog.modificationApplies(info, modification, [PLAYER_CLASS]))
			benefit += (changed(modification, world.populationMax) - world.populationMax) * POPULATION_PRICE * populationPressure(world);
	return benefit;
}

function studyBenefit(world, catalog, info)
{
	const paths = info.modifications.filter(modification => modification.value.startsWith(STUDY_PREFIX) && !modification.value.endsWith("/time"));
	if (!paths.length)
		return 0;
	let benefit = 0;
	for (const researcher of world.researchers)
	{
		const classes = catalog.template(researcher.template).classes();
		for (const modification of paths)
		{
			if (!catalog.modificationApplies(info, modification, classes))
				continue;
			const code = modification.value.slice(STUDY_PREFIX.length);
			for (const tech of researcher.techs)
				benefit += STUDY_SHARE * (catalog.techCost(tech, researcher.template)[code] || 0) * (1 - (modification.multiply || 1));
		}
	}
	return benefit;
}

function isCombat(modification)
{
	return modification.value.startsWith(ATTACK_PREFIX + "Melee/Damage/") || modification.value.startsWith(ATTACK_PREFIX + "Ranged/Damage/") ||
		modification.value.endsWith("/RepeatTime") || modification.value.startsWith(RESISTANCE_PREFIX) || modification.value === HEALTH_KEY;
}

function changed(modification, base)
{
	return modification.replace !== undefined ? +modification.replace : base * (modification.multiply || 1) + (modification.add || 0);
}

function relative(modification, base)
{
	return base > 0 ? changed(modification, base) / base - 1 : 0;
}

function applying(catalog, info, group)
{
	return info.modifications.filter(modification => catalog.modificationApplies(info, modification, group.classes));
}

function traitGain(catalog, group, modification)
{
	const path = modification.value;
	const profile = catalog.combat(group.template);
	if (path === "UnitMotion/WalkSpeed")
		return SPEED_WEIGHT * relative(modification, profile.speed);
	if (path === "Attack/Ranged/MaxRange")
		return profile.ranged ? RANGE_WEIGHT * relative(modification, profile.range) : 0;
	if (path === "Attack/Ranged/Projectile/Spread")
		return profile.ranged ? -SPREAD_WEIGHT * relative(modification, 1) : 0;
	if (path === "Health/RegenRate" || path === "Health/IdleRegenRate")
		return profile.hp > 0 ? REGEN_WEIGHT * Math.min(1, REGEN_WINDOW_S * (modification.add || 0) / profile.hp) : 0;
	if (path === "Promotion/RequiredXp")
	{
		if (!catalog.template(group.template).get("Promotion"))
			return 0;
		return modification.replace !== undefined ? RANK_GAIN : PROMOTION_WEIGHT * (1 / Math.max(0.1, modification.multiply || 1) - 1);
	}
	return 0;
}

export function assetBenefit(world, catalog, info)
{
	if (!info.modifications.length)
		return 0;
	let benefit = 0;
	for (const group of world.roster)
	{
		if (!group.military && !group.healer && !group.trader)
			continue;
		const applied = applying(catalog, info, group);
		if (!applied.length)
			continue;
		let gain = 0;
		if (group.trader)
		{
			for (const modification of applied)
				if (modification.value === "Trader/GainMultiplier")
					gain += (modification.multiply || 1) - 1;
			benefit += group.value * gain;
			continue;
		}
		if (group.healer)
		{
			const template = catalog.template(group.template);
			for (const modification of applied)
				if (modification.value === "Heal/Interval")
					gain += 1 / Math.max(0.1, modification.multiply || 1) - 1;
				else if (modification.value === "Heal/Health")
					gain += relative(modification, +template.get("Heal/Health") || 0);
				else if (modification.value === "Heal/Range")
					gain += HEAL_RANGE_WEIGHT * relative(modification, +template.get("Heal/Range") || 0);
			benefit += group.value * gain;
			continue;
		}
		if (!group.soldier)
		{
			const combat = applied.filter(isCombat);
			const profile = catalog.combat(group.template);
			if (combat.length)
				gain += (1 + attackGain(profile, combat)) * (1 + durabilityGain(profile, combat, world.enemyDamageMix)) - 1;
		}
		for (const modification of applied)
			gain += traitGain(catalog, group, modification);
		benefit += group.value * gain;
	}
	return benefit;
}

function shieldGain(catalog, group, applied, mix)
{
	const template = catalog.template(group.template);
	const profile = catalog.combat(group.template);
	let gain = durabilityGain(profile, applied.filter(isCombat), mix);
	for (const modification of applied)
	{
		const path = modification.value;
		if (DURABILITY_PATHS.includes(path))
			gain += relative(modification, +template.get(path) || 0);
		else if (path === "GarrisonHolder/BuffHeal" && template.get("GarrisonHolder"))
			gain += SHELTER_HEAL_GAIN;
	}
	return gain;
}

function fireGain(catalog, group, applied)
{
	const template = catalog.template(group.template);
	const profile = catalog.combat(group.template);
	if (!template.get("BuildingAI") || !profile.ranged)
		return 0;
	let gain = 0;
	for (const modification of applied)
	{
		const path = modification.value;
		if (FIRE_PATHS.includes(path))
			gain += relative(modification, +template.get(path) || 0);
		else if (path === "Attack/Ranged/MaxRange")
			gain += relative(modification, profile.range);
		else if (path === "Attack/Ranged/MinRange")
			gain += POINT_BLANK_GAIN;
	}
	return gain;
}

function fireBenefit(world, catalog, info)
{
	const rate = world.losses.civilian + world.losses.structure;
	if (!(rate > 0))
		return 0;
	const need = Math.min(1, rate * TECH_HORIZON_S / FIRE_LOSS_SCALE);
	let benefit = 0;
	for (const group of world.estate)
	{
		const applied = applying(catalog, info, group);
		if (applied.length)
			benefit += group.value * fireGain(catalog, group, applied) * need;
	}
	return benefit;
}

export function protectionBenefit(world, catalog, info)
{
	if (!info.modifications.length)
		return 0;
	let benefit = 0;
	for (const [kind, groups] of [["structure", world.estate], ["civilian", world.roster.filter(group => !group.military)]])
	{
		if (!(world.losses[kind] > 0))
			continue;
		let total = 0;
		let gained = 0;
		for (const group of groups)
		{
			total += group.value;
			const applied = applying(catalog, info, group);
			if (applied.length)
				gained += group.value * shieldGain(catalog, group, applied, world.enemyDamageMix);
		}
		const gain = total > 0 ? gained / total : 0;
		if (gain > -1)
			benefit += world.losses[kind] * TECH_HORIZON_S * gain / (1 + gain);
	}
	return benefit + fireBenefit(world, catalog, info);
}

export function fishingGain(world, catalog, info)
{
	if (!info.modifications.some(modification => modification.value.startsWith("ResourceGatherer/")))
		return 0;
	let gain = 0;
	for (const ship of world.fleet)
	{
		if (!ship.profile)
			continue;
		const rate = ship.profile.rates[FISH_KIND] || 0;
		const capacity = ship.profile.capacities.food || 0;
		for (const modification of info.modifications)
		{
			if (!catalog.modificationApplies(info, modification, ship.classes))
				continue;
			if (modification.value === RATE_PREFIX + FISH_KIND || modification.value === SPEED_KEY)
				gain += rate * ((modification.multiply || 1) - 1);
			else if (modification.value === CAPACITY_PREFIX + "food" && modification.add && capacity > 0)
				gain += rate * WALK_SHARE * modification.add / (capacity + modification.add);
		}
	}
	return gain * GATHER_EFFICIENCY;
}

export function trickleGain(world, catalog, info)
{
	let gain = 0;
	for (const modification of info.modifications)
	{
		if (!modification.value.startsWith(TRICKLE_PREFIX) || !modification.add)
			continue;
		if (catalog.modificationApplies(info, modification, [PLAYER_CLASS]))
			gain += modification.add / PLAYER_TRICKLE_S;
		for (const group of world.estate)
		{
			const interval = +catalog.template(group.template).get("ResourceTrickle/Interval") || 0;
			if (interval > 0 && catalog.modificationApplies(info, modification, group.classes))
				gain += group.count * modification.add * 1000 / interval;
		}
	}
	return gain;
}

export function flowBenefit(world, catalog, info)
{
	const paths = info.modifications.filter(modification => modification.value.startsWith(COST_PREFIX) || modification.value === "Cost/BuildTime");
	let benefit = 0;
	if (paths.length)
		for (const name in world.demand.orders)
		{
			const rate = world.demand.orders[name];
			const template = catalog.template(name);
			if (!(rate > 0) || !template)
				continue;
			const classes = template.classes();
			const structure = classes.includes("Structure");
			for (const modification of paths)
			{
				if (!catalog.modificationApplies(info, modification, classes))
					continue;
				if (modification.value === "Cost/BuildTime")
				{
					const time = catalog.buildTime(name);
					benefit += rate * TECH_HORIZON_S * (time - changed(modification, time)) * (structure ? BUILDER_RATE : TRAINER_SECOND_VALUE);
					continue;
				}
				const base = catalog.cost(name)[modification.value.slice(COST_PREFIX.length)] || 0;
				benefit += rate * TECH_HORIZON_S * (base - Math.max(0, changed(modification, base)));
			}
		}
	for (const modification of info.modifications)
	{
		if (modification.value !== "Trainer/BatchTimeModifier" || !modification.add)
			continue;
		const saved = 1 - Math.pow(TRAINING_BATCH, modification.add);
		for (const trainer of world.trainers)
			if (trainer.queueLength > 0 && catalog.modificationApplies(info, modification, catalog.template(trainer.template).classes()))
				benefit += TECH_HORIZON_S * TRAINER_SECOND_VALUE * saved;
	}
	return benefit;
}

export function housingBenefit(world, catalog, info)
{
	const paths = info.modifications.filter(modification => modification.value === "Population/Bonus");
	if (!paths.length)
		return 0;
	let extra = 0;
	let price = Infinity;
	for (const group of world.estate)
	{
		const bonus = catalog.populationBonus(group.template);
		if (!(bonus > 0))
			continue;
		price = Math.min(price, group.value / group.count / bonus);
		for (const modification of paths)
			if (catalog.modificationApplies(info, modification, group.classes))
				extra += group.count * (changed(modification, bonus) - bonus);
	}
	const room = Math.max(0, world.populationMax - world.populationLimit);
	return isFinite(price) ? Math.min(extra, room) * price : 0;
}

export function gatherGain(world, catalog, info)
{
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
	return (gain + forgoneGain(world, catalog, info)) * GATHER_EFFICIENCY;
}

function forgoneGain(world, catalog, info)
{
	let gain = 0;
	for (const modification of info.modifications)
	{
		if (!modification.value.startsWith(RATE_PREFIX) || !(modification.multiply < 1))
			continue;
		const kind = modification.value.slice(RATE_PREFIX.length);
		const code = kind.split(".")[0];
		let places = 0;
		for (const site of world.sites[code] || [])
			if (site.kind === kind && isFinite(site.amount))
				places += Math.max(0, site.capacity - site.gatherers);
		if (kind === FISH_KIND && world.centres.length)
			for (const school of world.schools)
				if (squareDistance(school, world.home.position) <= FORGONE_FISH_REACH * FORGONE_FISH_REACH)
					places += 1;
		if (!places)
			continue;
		let rate = 0;
		for (const worker of world.workers)
			if (catalog.modificationApplies(info, modification, worker.classes))
				rate = Math.max(rate, worker.profile.rates[kind] || 0);
		for (const ship of world.fleet)
			if (ship.profile && catalog.modificationApplies(info, modification, ship.classes))
				rate = Math.max(rate, ship.profile.rates[kind] || 0);
		gain += Math.min(places, FORGONE_GATHERERS) * (rate || FORGONE_RATE) * (modification.multiply - 1);
	}
	return gain;
}

export function militaryBenefit(world, catalog, info)
{
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
