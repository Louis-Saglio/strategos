# Summer — biome `persian_highlands/summer` — 0 A.D. 0.28.0

> "An arid, hostile land. The blistering heat has baked the ground to a sickly
> brown and the remaining trees struggle for survival."
> (`binaries/data/mods/public/maps/random/rmbiome/persian_highlands/summer.json:2-5`)

Only usable on `random/persian_highlands`. JSON-only; loaded over
`defaultbiome.json`. Same non-standard key set as `persian_highlands/spring`
(see there); tree counts are hardcoded in the map script
(`getTreeCounts(500, 2500, 0.7)`, `persian_highlands.js:173`) — this biome
does not control tree density.

## Bot-relevant summary

| Aspect | Value |
|---|---|
| Trees | `tree1` = `oak` (200 wood) — the only tree template |
| Fruit | `grapes` (200, regrows) |
| Huntable | camel (200) + sheep (100) + **goat (70)** — the only biome with three huntable species |
| Fish | inherited from `defaultbiome.json` (generic) — map has dried lakebeds, no real water |
| Stone / metal | `badlands_large` (5000) / `badlands_small` (1000); `sahara_01` large (5000) |
| Terrain | baked desert dirt (`desert_dirt_persia_1/2`, `grass_field_dry`) with stony lakebeds |

The arid half of the Persian highlands pair: same economy as
`persian_highlands/spring`, only the ground is dirt instead of grass and the
lakebeds are rockier. Purely visual difference for gameplay purposes.

## What it sets

`binaries/data/mods/public/maps/random/rmbiome/persian_highlands/summer.json`:

- **Environment**: same low golden sun as spring (elevation 0.524, rotation
  -1.865); warmer ambient; same warm fog and HDR postproc (contrast 1.25).
  No `SkySet` → random.
- **Terrains**: `lakebed1` `[desert_lakebed_dry_b, desert_lakebed_dry]`,
  `lakebed2` `[desert_lakebed_dry_b, desert_lakebed_dry, desert_shore_stones,
  desert_shore_stones]`; `mainTerrain` `desert_dirt_persia_1`/
  `desert_dirt_persia_2`/`grass_field_dry`; `forestFloor1`
  `medit_grass_field_dry`; `cliff` `desert_cliff_persia_1`/
  `desert_cliff_persia_crumbling`; `tier1Terrain`
  `desert_dirt_persia_rocky`; `tier2Terrain` `desert_dirt_persia_rocks`;
  `tier3Terrain` `grass_field_dry`; `road` `desert_city_tile_pers_dirt`.
- **Gaia**: identical to spring — oak (200), grapes (200), camel / sheep /
  goat, badlands rock actors (1000/5000), `sahara_01` large metal (5000).
- **Decoratives**: same four desert bush actors + `rockMedium`
  `stone_desert_med` (cosmetic).
- No `Heights` key.
