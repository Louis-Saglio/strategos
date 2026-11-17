function phaseNeeds(gameState, tech)
{
	const template = tech && gameState.getTemplate(tech);
	const alternatives = template && template.requirements(gameState.getPlayerCiv());
	if (!alternatives || !alternatives.length)
		return [];
	const counts = gameState.playerData.classCounts || {};
	const variants = gameState.playerData.typeCountsByClass || {};
	const needs = [];
	for (const spec of alternatives[0].entities || [])
	{
		const have = spec.check === "variants" ? Object.keys(variants[spec.class] || {}).length : counts[spec.class] || 0;
		if (have < spec.number)
			needs.push(Object.freeze({ "class": spec.class, "check": spec.check, "missing": spec.number - have }));
	}
	return needs;
}

function techCost(gameState, codes, tech)
{
	const template = tech && gameState.getTemplate(tech);
	const raw = template && template.cost() || {};
	const cost = {};
	for (const code of codes)
		cost[code] = raw[code] || 0;
	return Object.freeze(cost);
}

export function contextSection(gameState, catalog, seas, pendingConstructions, demand)
{
	const accessibility = gameState.sharedScript.accessibility;
	const victory = Object.freeze(Array.from(gameState.getVictoryConditions()).sort());
	const nextPhase = gameState.getPhaseName(gameState.currentPhase() + 1);
	return {
		"now": {
			"time": gameState.getTimeElapsed(),
			"player": gameState.getPlayerID(),
			"civ": catalog.civ,
			"codes": catalog.codes,
			"victory": victory,
			"context": Object.freeze({
				"victory": victory,
				"populationMax": gameState.getPopulationMax(),
				"mapSize": accessibility.width * accessibility.cellSize,
				"enemies": gameState.getNumPlayerEnemies(),
				"allies": gameState.getExclusiveAllies().filter(ally => gameState.sharedScript.playersData[ally].state !== "defeated").length,
				"sea": seas.length > 0
			}),
			"phase": gameState.currentPhase(),
			"nextPhaseTech": nextPhase || null,
			"population": gameState.getPopulation(),
			"populationLimit": gameState.getPopulationLimit(),
			"populationMax": gameState.getPopulationMax(),
			"pendingConstructions": Object.freeze(pendingConstructions),
			"demand": demand
		},
		"later": {
			"nextPhaseCost": () => techCost(gameState, catalog.codes, nextPhase),
			"phaseNeeds": () => Object.freeze(phaseNeeds(gameState, nextPhase))
		}
	};
}
