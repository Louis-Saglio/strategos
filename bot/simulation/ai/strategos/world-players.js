import { holdingsOf } from "simulation/ai/strategos/holdings.js";

const HELD = ["centres", "structures", "fighters", "civilians", "soldiers"];

function sealed(held)
{
	return {
		"centres": Object.freeze(held.centres),
		"structures": Object.freeze(held.structures),
		"fighters": Object.freeze(held.fighters),
		"civilians": Object.freeze(held.civilians),
		"soldiers": held.soldiers,
		"homeRegion": held.standing.length ? held.standing[0].region : 0
	};
}

function enemyParts(id, defeated, held, muster)
{
	return {
		"now": Object.assign({ "id": id, "relation": "enemy", "mutual": false, "defeated": defeated }, sealed(held)),
		"later": { "muster": () => Object.freeze(muster().filter(rate => rate.owner === id)) }
	};
}

function friendParts(gameState, catalog, id, relation, mutual, defeated, homeRegionOf)
{
	let held = null;
	const read = () => held || (held = sealed(holdingsOf(gameState, catalog, id)));
	const later = { "homeRegion": () => homeRegionOf(read) };
	for (const field of HELD)
		later[field] = () => read()[field];
	return { "now": { "id": id, "relation": relation, "mutual": mutual, "defeated": defeated, "muster": null }, "later": later };
}

function records(gameState, catalog, enemies, muster, homeRegion, record)
{
	const self = gameState.getPlayerID();
	const partners = new Set(gameState.getMutualAllies());
	const defeated = id => gameState.sharedScript.playersData[id].state === "defeated";
	const players = enemies.map(enemy => record(enemyParts(enemy.id, defeated(enemy.id), enemy.held, muster)));
	players.push(record(friendParts(gameState, catalog, self, "self", true, defeated(self), () => homeRegion)));
	for (const ally of gameState.getExclusiveAllies())
		if (ally !== 0)
			players.push(record(friendParts(gameState, catalog, ally, "ally", partners.has(ally), defeated(ally), read => read().homeRegion)));
	return Object.freeze(players.sort((a, b) => a.id - b.id));
}

export function playersSection(gameState, catalog, enemies, muster, homeRegion, record)
{
	return { "now": {}, "later": { "players": () => records(gameState, catalog, enemies, muster, homeRegion, record) } };
}
