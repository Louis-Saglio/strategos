import { squareDistance } from "simulation/ai/strategos/geometry.js";
import { landRegionNear, seaNear } from "simulation/ai/strategos/terrain.js";
import { stateOf } from "simulation/ai/strategos/unitstate.js";
import { FISH_RADIUS } from "simulation/ai/strategos/world-memory.js";
import { foodWorth } from "simulation/ai/strategos/yields.js";

const FISHER_WORTH = 3;

function harbours(gameState, catalog, shoreIndex, homeRegion)
{
	const accessibility = gameState.sharedScript.accessibility;
	const docks = [];
	for (const ent of gameState.getOwnStructures().values())
		if (ent.foundationProgress() === undefined && ent.position() && catalog.isShoreStructure(ent.templateName()))
			docks.push(Object.freeze({ "id": ent.id(), "position": ent.position(), "region": landRegionNear(accessibility, ent.position()),
				"sea": seaNear(accessibility, ent.position()),
				"blocked": shoreIndex.watch(ent.id(), (ent.trainingQueue() || []).length, gameState.getTimeElapsed()) }));
	return docks.sort((a, b) => (b.region === homeRegion) - (a.region === homeRegion) || a.id - b.id);
}

function ownShips(gameState, catalog)
{
	const accessibility = gameState.sharedScript.accessibility;
	const fleet = [];
	for (const ent of gameState.getOwnEntitiesByClass("Ship", true).values())
	{
		if (!ent.position())
			continue;
		const orders = ent.unitAIOrderData() || [];
		const state = stateOf(ent);
		const load = ent.resourceCarrying() || [];
		fleet.push(Object.freeze({
			"carried": load.reduce((sum, item) => sum + item.amount, 0),
			"carriedType": load.length ? load[0].type : null,
			"id": ent.id(),
			"position": ent.position(),
			"sea": seaNear(accessibility, ent.position()),
			"template": ent.templateName(),
			"capacity": catalog.transportCapacity(ent.templateName()),
			"cargo": Object.freeze((ent.garrisoned() || []).slice()),
			"state": state,
			"idle": ent.isIdle(),
			"fishing": ent.hasClass("FishingBoat"),
			"classes": ent.classes(),
			"profile": ent.hasClass("FishingBoat") ? catalog.gathering(ent) : null,
			"bombard": catalog.isBombardShip(ent.templateName()),
			"gathering": state.gathering || state.returning,
			"warship": ent.hasClass("Warship"),
			"hitpoints": ent.hitpoints(),
			"maxHitpoints": ent.maxHitpoints(),
			"target": orders.length && orders[0] ? orders[0].target : undefined
		}));
	}
	return fleet.sort((a, b) => a.id - b.id);
}

function fishingGrounds(liveFish, enemies, clearance)
{
	const foes = enemies.enemyFighters.concat(enemies.enemyShips.filter(enemy => enemy.warship));
	const hostile = position => foes.some(enemy =>
		squareDistance(enemy.position, position) <= clearance.soldier * clearance.soldier);
	const waters = liveFish.filter(fish =>
		!enemies.batteries.some(structure => squareDistance(structure.position, fish.position) <=
			(structure.range + clearance.battery) * (structure.range + clearance.battery)) &&
		!enemies.enemyStructures.some(structure => squareDistance(structure.position, fish.position) <= clearance.structure * clearance.structure) &&
		!hostile(fish.position));
	return Object.freeze({ "foes": Object.freeze(foes), hostile, "waters": Object.freeze(waters) });
}

export function seaSection(gameState, catalog, resourceIndex, shoreIndex, homeRegion, enemies, yieldRates)
{
	const accessibility = gameState.sharedScript.accessibility;
	const fleet = ownShips(gameState, catalog);
	const fish = resourceIndex.liveFish(gameState);
	const grounds = new Map();
	return {
		"now": {
			"docks": Object.freeze(harbours(gameState, catalog, shoreIndex, homeRegion)),
			"fleet": Object.freeze(fleet),
			"ships": Object.freeze(fleet.filter(ship => ship.capacity > 0 || ship.cargo.length)),
			"fishers": foodWorth(yieldRates, "boat", FISHER_WORTH) * fleet.filter(ship => ship.fishing && ship.gathering).length,
			"fish": fish,
			"schools": resourceIndex.schools,
			"fishRadius": FISH_RADIUS,
			"shores": shoreIndex.all(gameState),
			"fishingGrounds": clearance => {
				const key = [clearance.battery, clearance.structure, clearance.soldier].join(",");
				if (!grounds.has(key))
					grounds.set(key, fishingGrounds(fish, enemies(), clearance));
				return grounds.get(key);
			},
			"seaOf": position => accessibility.getAccessValue(position, true),
			"openWater": (point, sea, reach) => {
				const size = accessibility.width * accessibility.cellSize;
				for (const [dx, dz] of [[0, 0], [reach, 0], [-reach, 0], [0, reach], [0, -reach]])
				{
					const x = point[0] + dx;
					const z = point[1] + dz;
					if (x < 0 || z < 0 || x >= size || z >= size || accessibility.getAccessValue([x, z], true) !== sea)
						return false;
				}
				return true;
			}
		},
		"later": {}
	};
}
