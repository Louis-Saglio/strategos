import { emptyHoldings, holdStructure, holdUnit, structureSeen } from "simulation/ai/strategos/holdings.js";
import { isHunt } from "simulation/ai/strategos/requests.js";
import { defensiveFire } from "simulation/ai/strategos/structures.js";
import { landRegionNear, seaNear, territoryAt } from "simulation/ai/strategos/terrain.js";
import { NO_STATE, stateOf } from "simulation/ai/strategos/unitstate.js";

const STRAGGLERS_KEPT = 24;
const THREAT_CLASSES = ["Soldier", "Siege", "Hero"];
const DEFAULT_DAMAGE_MIX = { "Hack": 0.5, "Pierce": 0.5 };
const CRITICAL_CLASS = "ConquestCritical";

function enemyPlayers(gameState, catalog)
{
	const accessibility = gameState.sharedScript.accessibility;
	const territory = gameState.sharedScript.territoryMap;
	const player = gameState.getPlayerID();
	const holdings = [];
	const threats = [];
	const enemyCritical = [];
	let enemyWarships = 0;
	const stragglers = [];
	const enemyShips = [];
	const enemyHidden = [];
	const enemyRoll = [];
	let enemyGatherers = 0;
	const enemyDamage = {};
	const enemyTemplates = new Map();
	let enemyDamageTotal = 0;
	for (const enemy of gameState.getEnemies())
	{
		if (enemy === 0)
			continue;
		const held = emptyHoldings();
		holdings.push({ "id": enemy, "held": held });
		for (const ent of gameState.getEnemyStructures(enemy).values())
		{
			holdStructure(gameState, catalog, held, ent, enemy, player);
			if (ent.position() && !ent.hasClass("CivCentre") && ent.hasClass(CRITICAL_CLASS) && ent.foundationProgress() === undefined)
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
			holdUnit(catalog, held, ent, enemy, state);
			if (ent.hasClass("Soldier"))
			{
				enemyRoll.push({ "id": ent.id(), "template": ent.templateName(), "owner": enemy });
				const kind = ent.templateName() + "|" + enemy;
				if (!enemyTemplates.has(kind))
					enemyTemplates.set(kind, { "kind": kind, "template": ent.templateName(), "owner": enemy, "count": 0 });
				enemyTemplates.get(kind).count += 1;
				if (!ent.position())
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
	const listed = field => [].concat(...holdings.map(entry => entry.held[field]));
	return {
		holdings, threats, enemyCritical, enemyWarships, stragglers, enemyShips, enemyHidden, enemyRoll, enemyGatherers, enemyDamageMix,
		"enemyCentres": listed("centres"),
		"enemyStructures": listed("structures"),
		"enemyFighters": listed("fighters"),
		"enemyCivilians": listed("civilians"),
		"enemySoldiers": holdings.reduce((sum, entry) => sum + entry.held.soldiers, 0),
		"enemyArmy": [...enemyTemplates.values()].sort((a, b) => a.kind < b.kind ? -1 : 1).map(group => Object.freeze(group))
	};
}

function wildAttackers(gameState, assignments)
{
	const assigned = assignments();
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
		const hunted = !!target && !!assigned[target.id()] && isHunt(assigned[target.id()].purpose);
		const attacksUs = state.fighting && !!target && target.owner() === player && !hunted;
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
		seen.enemyCritical.map(ent => structureSeen(gameState, catalog, ent, ent.owner(), player)) :
		seen.stragglers.map(ent => Object.freeze({
			"id": ent.id(), "owner": ent.owner(), "position": ent.position(), "region": landRegionNear(accessibility, ent.position()),
			"unit": true, "centre": false, "value": 0, "points": 0, "regen": 0, "range": 0,
			"fire": Object.freeze({ "arrows": 0, "repeat": 1, "damage": Object.freeze({}) })
		}));
}

export function enemiesSection(gameState, catalog, musterIndex, assignments)
{
	const seen = enemyPlayers(gameState, catalog);
	musterIndex.observe(gameState.getTimeElapsed(), seen.enemyRoll);
	let rates = null;
	const muster = () => rates || (rates = musterIndex.rates(gameState.getTimeElapsed()));
	return {
		"holdings": seen.holdings,
		"muster": muster,
		"now": {
			"threats": Object.freeze(seen.threats),
			"wild": Object.freeze(wildAttackers(gameState, assignments)),
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
			"enemyMuster": muster
		}
	};
}
