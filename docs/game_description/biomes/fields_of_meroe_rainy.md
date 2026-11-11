# Rainy Season — biome `fields_of_meroe/rainy` — 0 A.D. 0.28.0

> "Revelling in the much awaited rain, the baked land transforms into a lush
> haven for both man and beast."
> (`binaries/data/mods/public/maps/random/rmbiome/fields_of_meroe/rainy.json:2-5`)

Only usable on `random/fields_of_meroe`. JSON-only; loaded over
`defaultbiome.json`. Same non-standard key set as `fields_of_meroe/dry` — the
map script reads `mainDirt`/`secondaryDirt`/`dirt`, `Gaia.berry`,
`Decoratives.bushA/bushB/rock/rain` and `Heights.seaGround`
(`fields_of_meroe.js:9-55`). Trees are hardcoded in the map script
(`fields_of_meroe.js:21-24,270`) — this biome does not control them.

## Bot-relevant summary

| Aspect | Value |
|---|---|
| Trees | map-hardcoded (baobab, acacia, date palms) — not affected by this biome |
| Fruit | `gaia/fruit/berry_01` (200, regrows) |
| Huntable / fish | inherited from `defaultbiome.json` (deer/sheep, generic fish) |
| Stone / metal | inherited from `defaultbiome.json` |
| Terrain | lush wet-season savanna (`savanna_grass_b_wetseason`, …) |
| Heights | `seaGround: -5` — the Nile riverbed (one metre lower than the dry season) |

The wet-season look of the Meroe map: green savanna everywhere, rain
particles, berry_01 bushes, and a deeper riverbed than
`fields_of_meroe/dry`.

## What it sets

`binaries/data/mods/public/maps/random/rmbiome/fields_of_meroe/rainy.json`:

- **Environment**: `SkySet: "stormy"`; water murkiness 0.75 (visual).
- **Terrains**: `mainDirt` `[savanna_grass_b_wetseason,
  savanna_shrubs_a_wetseason]`, `secondaryDirt` `savanna_grass_a_wetseason`,
  `dirt` `savanna_shrubs_a`.
- **Gaia**: `berry` `gaia/fruit/berry_01` (200 food.fruit).
- **Decoratives**: `bushA`/`bushB` lush desert bushes, `rock`
  `stone_granite_greek_med`, `rain` `actor|particle/rain_shower.xml` (rain
  particles over the map).
- **Heights**: `seaGround: -5` (read at `fields_of_meroe.js:55`).
