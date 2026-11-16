/**
 * Strategos scenario "duel": the map.
 *
 * Flat land of the chosen biome, nothing on it but the civic centre of
 * each of the two players, on the circle placement of the engine at 0.35
 * of the map: the duels are fought at the centre of the map, out of the
 * arrows and the sight of both centres.
 *
 * Everything else is spawned by strategos_duel_triggers.js.
 */

Engine.LoadLibrary("rmgen");
Engine.LoadLibrary("rmgen-common");
Engine.LoadLibrary("rmbiome");

export function* generateMap(mapSettings)
{
	setBiome(mapSettings.Biome);

	globalThis.g_Map = new RandomMap(3, g_Terrains.mainTerrain);

	const { playerIDs, playerPosition } =
		playerPlacementByPattern(mapSettings.PlayerPlacement, fractionToTiles(0.35), fractionToTiles(0.1));

	for (let i = 0; i < playerIDs.length; ++i)
		placeStartingEntities(playerPosition[i], playerIDs[i], [getStartingEntities(playerIDs[i])[0]]);

	yield 90;

	return g_Map;
}
