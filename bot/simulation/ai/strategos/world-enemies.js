import { captureRegen, capturePointsToTake, defensiveFire } from "simulation/ai/strategos/structures.js";
import { landRegionNear, seaNear, territoryAt } from "simulation/ai/strategos/terrain.js";
import { NO_STATE, stateOf } from "simulation/ai/strategos/unitstate.js";

const STRAGGLERS_KEPT = 24;
const THREAT_CLASSES = ["Soldier", "Siege", "Hero"];
const DEFAULT_DAMAGE_MIX = { "Hack": 0.5, "Pierce": 0.5 };
const CRITICAL_CLASS = "ConquestCritical";
const UNCAPTURABLE_CLASSES = ["Wall", "Palisade", "Field"];

function enemyTarget(gameState, catalog, ent, owner, player)
{
	const range = ent.get("BuildingAI") && ent.attackRange("Ranged");
	return Object.freeze({
		"id": ent.id(),
		"owner": owner,
		"position": ent.position(),
		"region": landRegionNear(gameState.sharedScript.accessibility, ent.position()),
		"regen": captureRegen(gameState, ent),
		"points": capturePointsToTake(ent, player),
		"fire": defensiveFire(gameState, ent),
		"range": range ? range.max : 0,
		"centre": ent.hasClass("CivCentre"),
		"value": catalog.costSum(ent.templateName())
	});
}

function enemyPlayers(gameState, catalog)
{
	const accessibility = gameState.sharedScript.accessibility;
	const territory = gameState.sharedScript.territoryMap;
	const player = gameState.getPlayerID();
	const threats = [];
	const enemyCentres = [];
	const enemyCritical = [];
	let enemyWarships = 0;
	const stragglers = [];
	const enemyShips = [];
	const enemyStructures = [];
	let enemySoldiers = 0;
	const enemyFighters = [];
	const enemyHidden = [];
	const enemyRoll = [];
	const enemyCivilians = [];
	let enemyGatherers = 0;
	const enemyDamage = {};
	const enemyTemplates = new Map();
	let enemyDamageTotal = 0;
	for (const enemy of gameState.getEnemies())
	{
		if (enemy === 0)
			continue;
		for (const ent of gameState.getEnemyStructures(enemy).values())
		{
			if (!ent.position())
				continue;
			const capturable = ent.foundationProgress() === undefined && !!ent.get("Capturable") &&
				!UNCAPTURABLE_CLASSES.some(cls => ent.hasClass(cls));
			const target = (capturable || ent.hasClass("CivCentre")) && enemyTarget(gameState, catalog, ent, enemy, player);
			if (capturable)
				enemyStructures.push(target);
			if (ent.hasClass("CivCentre"))
				enemyCentres.push(target);
			else if (ent.hasClass(CRITICAL_CLASS) && ent.foundationProgress() === undefined)
				enemyCritical.push(ent);
		}
		for (const ent of gameState.getEnemyUnits(enemy).values())
		{
			if (ent.hasClass("Warship") && ent.position())
				enemyWarships += 1;
			if (ent.hasClass("Ship") && ent.position())
				enemyShips.push(Object.freeze({
					"id": ent.id(),
					"position": ent.position(),
					"sea": seaNear(accessibility, ent.position()),
					"warship": ent.hasClass("Warship"),
					"hitpoints": ent.hitpoints()
				}));
			else if (ent.position() && stragglers.length < STRAGGLERS_KEPT)
				stragglers.push(ent);
			const state = stateOf(ent);
			if (state.gathering || state.returning)
				enemyGatherers += 1;
			if (ent.position() && catalog.isCivilian(ent.templateName()))
				enemyCivilians.push(Object.freeze({
					"id": ent.id(), "owner": enemy, "position": ent.position(), "template": ent.templateName(), "hitpoints": ent.hitpoints(),
					"state": state
				}));
			if (ent.hasClass("Soldier"))
			{
				enemySoldiers += 1;
				enemyRoll.push({ "id": ent.id(), "template": ent.templateName(), "owner": enemy });
				const kind = ent.templateName() + "|" + enemy;
				if (!enemyTemplates.has(kind))
					enemyTemplates.set(kind, { "kind": kind, "template": ent.templateName(), "owner": enemy, "count": 0 });
				enemyTemplates.get(kind).count += 1;
				if (ent.position())
				{
					const orders = ent.unitAIOrderData() || [];
					enemyFighters.push(Object.freeze({
						"id": ent.id(),
						"owner": enemy,
						"position": ent.position(),
						"template": ent.templateName(),
						"hitpoints": ent.hitpoints(),
						"state": state,
						"target": orders.length && orders[0] ? orders[0].target : undefined
					}));
				}
				else
					enemyHidden.push(Object.freeze({ "id": ent.id(), "owner": enemy, "template": ent.templateName(), "hitpoints": ent.hitpoints(), "state": NO_STATE }));
				const attacks = catalog.combat(ent.templateName(), enemy).attacks;
				for (const type in attacks)
					for (const kind in attacks[type].damage)
					{
						const rate = attacks[type].damage[kind] / attacks[type].repeat;
						enemyDamage[kind] = (enemyDamage[kind] || 0) + rate;
						enemyDamageTotal += rate;
					}
			}
			const position = ent.position();
			if (!position || !THREAT_CLASSES.some(cls => ent.hasClass(cls)) || territoryAt(territory, position[0], position[1]).owner !== player)
				continue;
			threats.push(Object.freeze({ "id": ent.id(), "position": position }));
		}
	}
	const enemyDamageMix = {};
	for (const kind in enemyDamage)
		enemyDamageMix[kind] = enemyDamage[kind] / enemyDamageTotal;
	if (!enemyDamageTotal)
		Object.assign(enemyDamageMix, DEFAULT_DAMAGE_MIX);
	return {
		threats, enemyCentres, enemyCritical, enemyWarships, stragglers, enemyShips, enemyStructures, enemySoldiers, enemyFighters,
		enemyHidden, enemyRoll, enemyCivilians, enemyGatherers, enemyDamageMix,
		"enemyArmy": [...enemyTemplates.values()].sort((a, b) => a.kind < b.kind ? -1 : 1).map(group => Object.freeze(group))
	};
}

function wildAttackers(gameState)
{
	const territory = gameState.sharedScript.territoryMap;
	const player = gameState.getPlayerID();
	const wild = [];
	const armedGaia = gameState.updatingGlobalCollection("strategos-gaia-armed",
		{ "func": ent => ent.hasClass("Unit") && !!ent.get("Attack"), "dynamicProperties": [] }, gameState.getEntities(0));
	for (const ent of armedGaia.values())
	{
		const position = ent.position();
		if (!position)
			continue;
		const state = stateOf(ent);
		const orders = ent.unitAIOrderData() || [];
		const target = orders.length && orders[0] && orders[0].target !== undefined ? gameState.getEntityById(orders[0].target) : null;
		const attacksUs = state.fighting && !!target && target.owner() === player;
		const trespasses = THREAT_CLASSES.some(cls => ent.hasClass(cls)) && territoryAt(territory, position[0], position[1]).owner === player;
		if (!attacksUs && !trespasses)
			continue;
		wild.push(Object.freeze({
			"id": ent.id(),
			"owner": 0,
			"position": position,
			"template": ent.templateName(),
			"hitpoints": ent.hitpoints(),
			"state": state,
			"target": target ? target.id() : undefined
		}));
	}
	return wild;
}

function firingStructures(gameState, enemyStructures)
{
	const batteries = enemyStructures.slice();
	const armedGaiaStructures = gameState.updatingGlobalCollection("strategos-gaia-batteries",
		{ "func": ent => ent.hasClass("Structure") && !!ent.get("BuildingAI"), "dynamicProperties": [] }, gameState.getEntities(0));
	for (const ent of armedGaiaStructures.values())
	{
		const range = ent.position() && ent.attackRange("Ranged");
		const fire = range && defensiveFire(gameState, ent);
		if (fire && fire.arrows)
			batteries.push(Object.freeze({ "position": ent.position(), "fire": fire, "range": range.max }));
	}
	return batteries.filter(structure => structure.fire.arrows > 0);
}

function objectives(gameState, catalog, seen)
{
	const accessibility = gameState.sharedScript.accessibility;
	const player = gameState.getPlayerID();
	return seen.enemyCentres.length ? seen.enemyCentres : seen.enemyCritical.length || seen.enemyStructures.length ?
		seen.enemyCritical.map(ent => enemyTarget(gameState, catalog, ent, ent.owner(), player)) :
		seen.stragglers.map(ent => Object.freeze({
			"id": ent.id(), "owner": ent.owner(), "position": ent.position(), "region": landRegionNear(accessibility, ent.position()),
			"unit": true, "centre": false, "value": 0, "points": 0, "regen": 0, "range": 0,
			"fire": Object.freeze({ "arrows": 0, "repeat": 1, "damage": Object.freeze({}) })
		}));
}

export function enemiesSection(gameState, catalog, musterIndex)
{
	const seen = enemyPlayers(gameState, catalog);
	musterIndex.observe(gameState.getTimeElapsed(), seen.enemyRoll);
	return {
		"now": {
			"threats": Object.freeze(seen.threats),
			"wild": Object.freeze(wildAttackers(gameState)),
			"enemySoldiers": seen.enemySoldiers,
			"enemyFighters": Object.freeze(seen.enemyFighters),
			"enemyHidden": Object.freeze(seen.enemyHidden),
			"enemyCivilians": Object.freeze(seen.enemyCivilians),
			"enemyGatherers": seen.enemyGatherers,
			"enemyArmy": Object.freeze(seen.enemyArmy),
			"enemyDamageMix": Object.freeze(seen.enemyDamageMix),
			"enemyCentres": Object.freeze(seen.enemyCentres),
			"enemyStructures": Object.freeze(seen.enemyStructures),
			"enemyTargets": Object.freeze(objectives(gameState, catalog, seen)),
			"batteries": Object.freeze(firingStructures(gameState, seen.enemyStructures)),
			"enemyWarships": seen.enemyWarships,
			"enemyShips": Object.freeze(seen.enemyShips.sort((a, b) => a.id - b.id))
		},
		"later": {
			"enemyMuster": () => musterIndex.rates(gameState.getTimeElapsed())
		}
	};
}
