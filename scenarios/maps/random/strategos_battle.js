/**
 * Strategos scenario "battle": the map.
 *
 * The map of the assault scenario (strategos_assault.js: flat land, player
 * 1 with the usual mainland start, player 2 a lone civic centre, players on
 * a circle at 0.2 of the map) plus a woodline for player 1: a clump of
 * trees BATTLE_WOODLINE metres from its civic centre toward the map centre,
 * hence toward player 2, with one of its storehouses BATTLE_STOREHOUSE
 * metres out on the same line. The wave of strategos_battle_triggers.js
 * attack-walks to player 1's civic centre through that woodline, so
 * soldiers working there meet it outside the centre's arrow range, as
 * outlying gatherers do in real games.
 */

Engine.LoadLibrary("rmgen");
Engine.LoadLibrary("rmgen-common");
Engine.LoadLibrary("rmbiome");

const BATTLE_WOODLINE = 115;
const BATTLE_STOREHOUSE = 100;
const BATTLE_TREES = 40;
const BATTLE_CLUMP = 16;
const METRES_PER_TILE = 4;

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

	const centre = g_Map.getCenter();
	const home = playerPosition[playerIDs.indexOf(1)];
	const direction = Vector2D.sub(centre, home).normalize();
	const along = metres => Vector2D.add(home, Vector2D.mult(direction, metres / METRES_PER_TILE));
	const woodline = along(BATTLE_WOODLINE);
	for (let i = 0; i < BATTLE_TREES; ++i)
	{
		const radius = BATTLE_CLUMP * Math.sqrt((i + 0.5) / BATTLE_TREES) / METRES_PER_TILE;
		const angle = i * 2.39996;
		const offset = new Vector2D(radius * Math.cos(angle), radius * Math.sin(angle));
		g_Map.placeEntityPassable(g_Gaia.tree1, 0, Vector2D.add(woodline, offset), randomAngle());
	}
	g_Map.placeEntityPassable("structures/" + getCivCode(1) + "/storehouse", 1, along(BATTLE_STOREHOUSE), BUILDING_ORIENTATION);

	yield 90;

	return g_Map;
}
