/**
 * Strategos scenario "assault": the map.
 *
 * Flat land of the chosen biome with two players facing each other on a
 * circle (the circle placement of the engine, at 0.2 of the map instead of
 * mainland's 0.35, so the walk is short). Player 1, the attacker, gets the
 * usual mainland start (civic centre, starting units, berries, mines,
 * trees), so the bot runs its normal opening beside the assault. Player 2,
 * the defender, gets its civic centre and nothing else.
 *
 * Everything the cases differ by (army, garrison, defenders) is spawned by
 * strategos_assault_triggers.js.
 */

Engine.LoadLibrary("rmgen");
Engine.LoadLibrary("rmgen-common");
Engine.LoadLibrary("rmbiome");

export function* generateMap(mapSettings)
{
	setBiome(mapSettings.Biome);

	globalThis.g_Map = new RandomMap(3, g_Terrains.mainTerrain);

	const clPlayer = g_Map.createTileClass();
	const clBaseResource = g_Map.createTileClass();

	const { playerIDs, playerPosition } =
		playerPlacementByPattern(mapSettings.PlayerPlacement, fractionToTiles(0.2), fractionToTiles(0.1));

	for (let i = 0; i < playerIDs.length; ++i)
	{
		if (playerIDs[i] != 1)
		{
			placeStartingEntities(playerPosition[i], playerIDs[i], [getStartingEntities(playerIDs[i])[0]]);
			continue;
		}
		placePlayerBase({
			"playerID": playerIDs[i],
			"playerPosition": playerPosition[i],
			"PlayerTileClass": clPlayer,
			"BaseResourceClass": clBaseResource,
			"CityPatch": {
				"outerTerrain": g_Terrains.roadWild,
				"innerTerrain": g_Terrains.road
			},
			"StartingAnimal": {
			},
			"Berries": {
				"template": g_Gaia.fruitBush
			},
			"Mines": {
				"types": [
					{ "template": g_Gaia.metalLarge },
					{ "template": g_Gaia.stoneLarge }
				]
			},
			"Trees": {
				"template": g_Gaia.tree1,
				"count": 5
			}
		});
	}

	yield 90;

	return g_Map;
}
