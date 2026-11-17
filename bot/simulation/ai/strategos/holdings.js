import { byOwner } from "simulation/ai/common-api/filters.js";
import { captureRegen, capturePointsToTake, defensiveFire } from "simulation/ai/strategos/structures.js";
import { landRegionNear } from "simulation/ai/strategos/terrain.js";
import { stateOf } from "simulation/ai/strategos/unitstate.js";

const UNCAPTURABLE_CLASSES = ["Wall", "Palisade", "Field"];

export function structureSeen(gameState, catalog, ent, owner, viewer)
{
	const range = ent.get("BuildingAI") && ent.attackRange("Ranged");
	return Object.freeze({
		"id": ent.id(),
		"owner": owner,
		"position": ent.position(),
		"region": landRegionNear(gameState.sharedScript.accessibility, ent.position()),
		"regen": captureRegen(gameState, ent),
		"points": capturePointsToTake(ent, viewer),
		"fire": defensiveFire(gameState, ent),
		"range": range ? range.max : 0,
		"centre": ent.hasClass("CivCentre"),
		"value": catalog.costSum(ent.templateName())
	});
}

export function emptyHoldings()
{
	return { "centres": [], "standing": [], "structures": [], "fighters": [], "civilians": [], "soldiers": 0 };
}

export function holdStructure(gameState, catalog, holdings, ent, owner, viewer)
{
	if (!ent.position())
		return;
	const centre = ent.hasClass("CivCentre");
	const standing = ent.foundationProgress() === undefined;
	const capturable = standing && !!ent.get("Capturable") && !UNCAPTURABLE_CLASSES.some(cls => ent.hasClass(cls));
	if (!capturable && !centre)
		return;
	const seen = structureSeen(gameState, catalog, ent, owner, viewer);
	if (capturable)
		holdings.structures.push(seen);
	if (centre)
		holdings.centres.push(seen);
	if (centre && standing)
		holdings.standing.push(seen);
}

export function holdUnit(catalog, holdings, ent, owner, state)
{
	if (ent.position() && catalog.isCivilian(ent.templateName()))
		holdings.civilians.push(Object.freeze({
			"id": ent.id(), "owner": owner, "position": ent.position(), "template": ent.templateName(), "hitpoints": ent.hitpoints(),
			"state": state
		}));
	if (!ent.hasClass("Soldier"))
		return;
	holdings.soldiers += 1;
	if (!ent.position())
		return;
	const orders = ent.unitAIOrderData() || [];
	holdings.fighters.push(Object.freeze({
		"id": ent.id(),
		"owner": owner,
		"position": ent.position(),
		"template": ent.templateName(),
		"hitpoints": ent.hitpoints(),
		"state": state,
		"target": orders.length && orders[0] ? orders[0].target : undefined
	}));
}

function ownedBy(gameState, id)
{
	return id === gameState.getPlayerID() ? gameState.getOwnEntities() :
		gameState.updatingGlobalCollection("strategos-owned-" + id, byOwner(id));
}

export function holdingsOf(gameState, catalog, id)
{
	const viewer = gameState.getPlayerID();
	const holdings = emptyHoldings();
	for (const ent of ownedBy(gameState, id).toEntityArray().sort((a, b) => a.id() - b.id()))
		if (ent.hasClass("Structure"))
			holdStructure(gameState, catalog, holdings, ent, id, viewer);
		else if (ent.hasClass("Unit"))
			holdUnit(catalog, holdings, ent, id, stateOf(ent));
	return holdings;
}
