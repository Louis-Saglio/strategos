# Spring — biome `persian_highlands/spring` — 0 A.D. 0.28.0

> "Spring in the highlands, yet the heat has already begun making itself felt.
> The short-lived green grasses are on the retreat, paving the way for
> scorching summer." (`binaries/data/mods/public/maps/random/rmbiome/persian_highlands/spring.json:2-5`)

Only usable on `random/persian_highlands`. JSON-only; loaded over
`defaultbiome.json`. The map reads non-standard terrain keys (`lakebed1`,
`lakebed2`, `forestFloor1`, `tier1-3Terrain`, `road`, `mainTerrain`, `cliff`),
`tree1` (the only tree), `fruitBush`, **three** huntable animals
(`mainHuntableAnimal`/`secondaryHuntableAnimal`/`thirdHuntableAnimal`), and
decorative bushes (`persian_highlands.js:9-32`). Tree counts are hardcoded in
the map script (`getTreeCounts(500, 2500, 0.7)`, `persian_highlands.js:173`) —
this biome does not control tree density.

## Bot-relevant summary

| Aspect | Value |
|---|---|
| Trees | `tree1` = `oak` (200 wood) — the only tree template |
| Fruit | `grapes` (200, regrows) |
| Huntable | camel (200) + sheep (100) + **goat (70)** — the only biome with three huntable species |
| Fish | inherited from `defaultbiome.json` (generic) — map has dried lakebeds, no real water |
| Stone / metal | `badlands_large` (5000) / `badlands_small` (1000); `sahara_01` large (5000) |
| Terrain | green highland grass (`desert_grass_a` variants) with dry lakebeds |

The greener half of the Persian highlands pair: spring grass terrains vs the
summer's baked dirt. Economy is otherwise identical to
`persian_highlands/summer` (same trees, animals, fruit, mines).

## What it sets

`binaries/data/mods/public/maps/random/rmbiome/persian_highlands/spring.json`:

- **Environment**: low golden sun (elevation 0.524, rotation -1.865); warm
  fog; HDR postproc with high contrast (1.25). No `SkySet` → random.
- **Terrains**: `lakebed1` `[desert_lakebed_dry_b, desert_lakebed_dry]`,
  `lakebed2` `desert_grass_a_sand` (painted in the dried lakes); `mainTerrain`
  `desert_grass_a` (×3 weight) + `desert_plants_a`; `forestFloor1`
  `desert_plants_b_persia`; `cliff` `desert_cliff_persia_1`/
  `desert_cliff_persia_crumbling`; `tier1Terrain` `desert_plants_b_persia`;
  `tier2Terrain` `desert_plants_a`; `tier3Terrain`
  `desert_dirt_persia_rocky`; `road` `desert_city_tile_pers_dirt`.
- **Gaia**: `tree1` oak (200); `fruitBush` grapes (200); camel / sheep /
  goat; `stoneLarge` `badlands_large` (5000), `stoneSmall` `badlands_small`
  (1000), `metalLarge` `sahara_01` (5000).
- **Decoratives**: four desert bush actors + `rockMedium`
  `stone_desert_med` (cosmetic).
- No `Heights` key (the map uses its own height constants).
