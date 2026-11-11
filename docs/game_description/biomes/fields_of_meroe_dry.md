# Dry Season — biome `fields_of_meroe/dry` — 0 A.D. 0.28.0

> "The vitalizing waters of the Nile sustain life along its banks, while the
> long dry season scorches the land."
> (`binaries/data/mods/public/maps/random/rmbiome/fields_of_meroe/dry.json:2-5`)

Only usable on `random/fields_of_meroe`. JSON-only; loaded over
`defaultbiome.json`. This biome family uses **non-standard keys**: the
`fields_of_meroe.js` script reads `mainDirt`/`secondaryDirt`/`dirt`,
`Gaia.berry`, `Decoratives.bushA/bushB/rock/rain` and `Heights.seaGround`
(`fields_of_meroe.js:9-55`), not the usual `mainTerrain`/`Gaia.*` set. Tree
templates are hardcoded in the map script (baobab, acacia, date palms,
`fields_of_meroe.js:21-24`) with counts `getTreeCounts(400, 2000, 0.7)`
(`fields_of_meroe.js:270`) — this biome does not control trees.

## Bot-relevant summary

| Aspect | Value |
|---|---|
| Trees | map-hardcoded (baobab, acacia, date palms) — not affected by this biome |
| Fruit | `gaia/fruit/berry_05` (200, regrows) |
| Huntable / fish | inherited from `defaultbiome.json` (deer/sheep, generic fish) |
| Stone / metal | inherited from `defaultbiome.json` |
| Terrain | dry savanna dirt (`savanna_dirt_b`, `savanna_dirt_rocks_a`) |
| Heights | `seaGround: -4` — the Nile riverbed, the only height this map takes from the biome |

The dry-season look of the Meroe map: only the Nile banks are green
(hardcoded in the script), everything else is baked savanna dirt. Compared to
`fields_of_meroe/rainy`: dry dirt terrains, berry_05 instead of berry_01,
desert bushes, no rain particles, a slightly higher riverbed.

## What it sets

`binaries/data/mods/public/maps/random/rmbiome/fields_of_meroe/dry.json`:

- **Environment**: `SkySet: "sunny"`; water murkiness 0.83 (visual).
- **Terrains**: `mainDirt` `[savanna_dirt_b, savanna_dirt_rocks_a]`,
  `secondaryDirt` `savanna_dirt_a`, `dirt` `savanna_dirt_rocks_c`.
- **Gaia**: `berry` `gaia/fruit/berry_05` (200 food.fruit).
- **Decoratives**: `bushA`/`bushB` dry desert bushes, `rock`
  `stone_desert_med`, `rain: null` (no rain actor).
- **Heights**: `seaGround: -4` (read at `fields_of_meroe.js:55`).
