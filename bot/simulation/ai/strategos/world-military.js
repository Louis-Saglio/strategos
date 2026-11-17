import { captureRegen, captureStrength, defensiveFire } from "simulation/ai/strategos/structures.js";
import { stateOf } from "simulation/ai/strategos/unitstate.js";

function supportUnits(gameState, catalog)
{
	const accessibility = gameState.sharedScript.accessibility;
	const healers = [];
	const breakers = [];
	for (const ent of gameState.getOwnUnits().values())
	{
		const position = ent.position();
		if (!position)
			continue;
		if (catalog.isHealer(ent.templateName()))
			healers.push(Object.freeze({
				"id": ent.id(),
				"position": position,
				"region": accessibility.getAccessValue(position),
				"state": stateOf(ent)
			}));
		if (catalog.isBreaker(ent.templateName()))
		{
			const orders = ent.unitAIOrderData() || [];
			breakers.push(Object.freeze({
				"id": ent.id(),
				"position": position,
				"state": stateOf(ent),
				"target": orders.length && orders[0] ? orders[0].target : undefined
			}));
		}
	}
	return { healers, breakers };
}

function soldiers(gameState, catalog)
{
	const accessibility = gameState.sharedScript.accessibility;
	const fighters = [];
	const heroes = [];
	const regicide = gameState.getVictoryConditions().has("regicide");
	const army = new Map();
	for (const ent of gameState.getOwnEntitiesByClass("Hero", true).values())
		if (ent.position())
			heroes.push(Object.freeze({ "id": ent.id(), "position": ent.position(), "state": stateOf(ent) }));
	for (const ent of gameState.getOwnEntitiesByClass("Soldier", true).values())
	{
		const position = ent.position();
		if (!position || ent.hasClass("Hero") && regicide)
			continue;
		const orders = ent.unitAIOrderData() || [];
		fighters.push(Object.freeze({
			"id": ent.id(),
			"position": position,
			"region": accessibility.getAccessValue(position),
			"template": ent.templateName(),
			"state": stateOf(ent),
			"classes": ent.classes(),
			"capture": captureStrength(ent),
			"hitpoints": ent.hitpoints(),
			"maxHitpoints": ent.maxHitpoints(),
			"resistance": catalog.combat(ent.templateName()).resistance,
			"target": orders.length && orders[0] ? orders[0].target : undefined
		}));
		const name = ent.templateName();
		if (!army.has(name))
			army.set(name, { "template": name, "classes": ent.classes(), "count": 0, "value": 0 });
		const group = army.get(name);
		group.count += 1;
		group.value += catalog.costSum(name);
	}
	return {
		fighters,
		heroes,
		"army": [...army.values()].sort((a, b) => a.template < b.template ? -1 : 1).map(group => Object.freeze(group))
	};
}

function strongholds(gameState, catalog)
{
	const holders = [];
	const decaying = [];
	let garrisonedSoldiers = 0;
	for (const ent of gameState.getOwnStructures().values())
	{
		if (ent.foundationProgress() !== undefined)
			continue;
		const holder = ent.isGarrisonHolder();
		if (ent.position() && ent.decaying())
			decaying.push(Object.freeze({
				"id": ent.id(),
				"position": ent.position(),
				"decayRate": ent.territoryDecayRate(),
				"regen": captureRegen(gameState, ent),
				"garrisonRegenRate": ent.garrisonRegenRate(),
				"free": holder ? +(ent.garrisonMax() || 0) - ent.garrisonedSlots() : 0,
				"classes": holder ? ent.garrisonableClasses() || "" : "",
				"arrows": !!ent.get("BuildingAI")
			}));
		const capacity = +(ent.garrisonMax() || 0);
		if (capacity > 0 && ent.position())
		{
			const garrisoned = ent.garrisoned() || [];
			const sheltered = garrisoned.filter(id => {
				const unit = gameState.getEntityById(id);
				return !!unit && unit.hasClass("Soldier");
			});
			const hurt = garrisoned.filter(id => {
				const unit = gameState.getEntityById(id);
				return !!unit && unit.hitpoints() < unit.maxHitpoints();
			});
			garrisonedSoldiers += sheltered.length;
			const reach = ent.get("BuildingAI") && ent.attackRange("Ranged");
			const footprint = catalog.footprint(ent.templateName());
			holders.push(Object.freeze({
				"id": ent.id(),
				"position": ent.position(),
				"radius": Math.max(footprint.width, footprint.depth) / 2,
				"fire": defensiveFire(gameState, ent),
				"range": reach ? +reach.max || 0 : 0,
				"heal": +(ent.get("GarrisonHolder/BuffHeal") || 0),
				"free": capacity - ent.garrisonedSlots(),
				"garrisoned": garrisoned.length,
				"units": Object.freeze(garrisoned.slice()),
				"soldiers": Object.freeze(sheltered),
				"hurt": Object.freeze(hurt),
				"arrows": !!ent.get("BuildingAI"),
				"forward": !!ent.decaying(),
				"classes": ent.garrisonableClasses() || ""
			}));
		}
	}
	return { holders, decaying, garrisonedSoldiers };
}

export function militarySection(gameState, catalog, lossIndex)
{
	const support = supportUnits(gameState, catalog);
	const own = soldiers(gameState, catalog);
	const held = strongholds(gameState, catalog);
	return {
		"now": {
			"fighters": Object.freeze(own.fighters),
			"heroes": Object.freeze(own.heroes),
			"army": Object.freeze(own.army),
			"healers": Object.freeze(support.healers),
			"breakers": Object.freeze(support.breakers),
			"holders": Object.freeze(held.holders),
			"decaying": Object.freeze(held.decaying),
			"garrisonedSoldiers": held.garrisonedSoldiers,
			"losses": lossIndex.flush(gameState.getTimeElapsed())
		},
		"later": {}
	};
}
