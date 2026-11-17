import { contextSection } from "simulation/ai/strategos/world-context.js";
import { dropsites, economySection } from "simulation/ai/strategos/world-economy.js";
import { enemiesSection } from "simulation/ai/strategos/world-enemies.js";
import { homeRegionOf, mapSection } from "simulation/ai/strategos/world-map.js";
import { militarySection } from "simulation/ai/strategos/world-military.js";
import { productionSection } from "simulation/ai/strategos/world-production.js";
import { seaSection } from "simulation/ai/strategos/world-sea.js";

function once(gameState, stopwatch, section, field, read)
{
	const time = gameState.getTimeElapsed();
	let known = false;
	let value;
	return () => {
		if (!known)
		{
			if (gameState.getTimeElapsed() !== time)
				throw new Error("world." + field + " is read after the decision it belongs to");
			value = stopwatch.section(section, read);
			known = true;
		}
		return value;
	};
}

function assemble(gameState, stopwatch, sections)
{
	const world = {};
	const claim = field => {
		if (field in world)
			throw new Error("world." + field + " is built by two sections");
	};
	for (const section in sections)
	{
		for (const field in sections[section].now)
		{
			claim(field);
			world[field] = sections[section].now[field];
		}
		for (const field in sections[section].later)
		{
			claim(field);
			Object.defineProperty(world, field,
				{ "enumerable": true, "get": once(gameState, stopwatch, section, field, sections[section].later[field]) });
		}
	}
	return Object.freeze(world);
}

export function buildWorld(gameState, catalog, resourceIndex, shoreIndex, lossIndex, musterIndex, pendingConstructions, demand, stopwatch)
{
	const anchors = stopwatch.section("economy", () => {
		const found = dropsites(gameState, catalog);
		resourceIndex.refresh(gameState, found);
		return found;
	});
	const production = stopwatch.section("production", () => productionSection(gameState, catalog));
	const homeRegion = homeRegionOf(gameState, production.now.centres);
	const sea = stopwatch.section("sea", () => seaSection(gameState, catalog, resourceIndex, shoreIndex, homeRegion));
	const enemies = stopwatch.section("enemies", () => enemiesSection(gameState, catalog, musterIndex));
	const military = stopwatch.section("military", () => militarySection(gameState, catalog, lossIndex));
	const economy = stopwatch.section("economy",
		() => economySection(gameState, catalog, resourceIndex, anchors, enemies.now.batteries, sea.now.fishers));
	const map = stopwatch.section("map", () => mapSection(gameState, homeRegion, {
		"workers": economy.now.workers,
		"settlers": economy.now.settlers,
		"anchors": anchors,
		"fighters": military.now.fighters,
		"docks": sea.now.docks,
		"centres": production.now.centres,
		"enemyStructures": enemies.now.enemyStructures,
		"enemyCentres": enemies.now.enemyCentres,
		"enemyTargets": enemies.now.enemyTargets
	}));
	const context = stopwatch.section("context", () => contextSection(gameState, catalog, map.now.seas, pendingConstructions, demand));
	return assemble(gameState, stopwatch, { context, economy, production, military, enemies, sea, map });
}
