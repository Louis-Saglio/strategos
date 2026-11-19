import { contextSection } from "simulation/ai/strategos/world-context.js";
import { dropsites, economySection } from "simulation/ai/strategos/world-economy.js";
import { enemiesSection } from "simulation/ai/strategos/world-enemies.js";
import { mapSection, settledBases } from "simulation/ai/strategos/world-map.js";
import { militarySection } from "simulation/ai/strategos/world-military.js";
import { playersSection } from "simulation/ai/strategos/world-players.js";
import { productionSection } from "simulation/ai/strategos/world-production.js";
import { seaSection } from "simulation/ai/strategos/world-sea.js";

function once(gameState, stopwatch, section, name, read)
{
	const time = gameState.getTimeElapsed();
	let known = false;
	let value;
	return () => {
		if (!known)
		{
			if (gameState.getTimeElapsed() !== time)
				throw new Error(name + " is read after the decision it belongs to");
			value = stopwatch.section(section, read);
			known = true;
		}
		return value;
	};
}

function attach(target, name, parts, deferred)
{
	const claim = field => {
		if (field in target)
			throw new Error(name + "." + field + " is built twice");
	};
	for (const field in parts.now)
	{
		claim(field);
		target[field] = parts.now[field];
	}
	for (const field in parts.later)
	{
		claim(field);
		Object.defineProperty(target, field, { "enumerable": true, "get": deferred(name + "." + field, parts.later[field]) });
	}
	return target;
}

function assemble(gameState, stopwatch, sections)
{
	const world = {};
	for (const section in sections)
		attach(world, "world", sections[section], (name, read) => once(gameState, stopwatch, section, name, read));
	return Object.freeze(world);
}

export function buildWorld(gameState, catalog, resourceIndex, shoreIndex, lossIndex, musterIndex, pendingConstructions, demand, assignments, stopwatch)
{
	const anchors = stopwatch.section("economy", () => {
		const found = dropsites(gameState, catalog);
		resourceIndex.refresh(gameState, found);
		return found;
	});
	const production = stopwatch.section("production", () => productionSection(gameState, catalog));
	const settled = settledBases(gameState, production.now.centres);
	const sea = stopwatch.section("sea", () => seaSection(gameState, catalog, resourceIndex, shoreIndex, settled.homeRegion,
		() => enemies.now));
	const enemies = stopwatch.section("enemies", () => enemiesSection(gameState, catalog, musterIndex, assignments));
	const record = parts => Object.freeze(attach({}, "world.players", parts,
		(name, read) => once(gameState, stopwatch, "players", name, read)));
	const players = playersSection(gameState, catalog, enemies.holdings, enemies.muster, settled.homeRegion, record);
	const military = stopwatch.section("military", () => militarySection(gameState, catalog, lossIndex));
	const economy = stopwatch.section("economy",
		() => economySection(gameState, catalog, resourceIndex, anchors, enemies.now.batteries, sea.now.fishers));
	const map = stopwatch.section("map", () => mapSection(gameState, settled, {
		"workers": economy.now.workers,
		"settlers": economy.now.settlers,
		"anchors": anchors,
		"fighters": military.now.fighters,
		"docks": sea.now.docks,
		"enemyStructures": enemies.now.enemyStructures,
		"enemyCentres": enemies.now.enemyCentres,
		"enemyTargets": enemies.now.enemyTargets
	}));
	const context = stopwatch.section("context", () => contextSection(gameState, catalog, map.now.seas, pendingConstructions, demand, assignments));
	return assemble(gameState, stopwatch, { context, economy, production, military, enemies, players, sea, map });
}
