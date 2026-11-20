/**
 * Strategos scenario "woodline": the map.
 *
 * Flat land of the chosen biome with up to eight players on a circle at
 * 0.3 of the map, each with its civic centre and nothing else. Everything a
 * case differs by (the forest, the storehouse and its distance to the
 * forest, the gatherers) is spawned by strategos_woodline_triggers.js, one
 * case per player, far enough apart not to meet.
 */

Engine.LoadLibrary("rmgen");
Engine.LoadLibrary("rmgen-common");
Engine.LoadLibrary("rmbiome");

export function* generateMap(mapSettings)
{
	setBiome(mapSettings.Biome);

	globalThis.g_Map = new RandomMap(3, g_Terrains.mainTerrain);

	const { playerIDs, playerPosition } =
		playerPlacementByPattern(mapSettings.PlayerPlacement, fractionToTiles(0.3), fractionToTiles(0.1));

	for (let i = 0; i < playerIDs.length; ++i)
		placeStartingEntities(playerPosition[i], playerIDs[i], [getStartingEntities(playerIDs[i])[0]]);

	yield 90;

	return g_Map;
}
