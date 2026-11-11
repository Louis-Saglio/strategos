# Late Spring — biome `alpine/late_spring` — 0 A.D. 0.28.0

> "A blend of lingering snow and emerging grass, marking a quiet transition
> from winter to summer." (`binaries/data/mods/public/maps/random/rmbiome/alpine/late_spring.json:2-5`)

Only usable on `random/alpine_lakes` (`SupportedBiomes: "alpine/"`,
`binaries/data/mods/public/maps/random/alpine_lakes.json:7`). JSON-only — no JS setup function;
loaded over `defaultbiome.json`, overriding the keys below. `alpine_lakes.js`
hardcodes its tree counts (`getTreeCounts(500, 3000, 0.7)`,
`alpine_lakes.js:106`) — this biome does not control tree density.

## Bot-relevant summary

| Aspect | Value |
|---|---|
| Trees | `tree1` = `pine` (200 wood) for forests and stragglers (`late_spring.json`, `alpine_lakes.js:21,224`) |
| Fruit | `berry_01` (200, regrows) |
| Huntable | deer (100) + rabbit (50); chicken (40) near base |
| Fish | `gaia/fish/generic` (1000 `food.fish`) — alpine_lakes has water, fish are placed (`alpine_lakes.js:213`) |
| Stone / metal | `aegean_large` (5000) / `aegean_small` (1000); `aegean_anatolian_02` large (5000) |
| Terrain | mixed grass/snow (`alpine_dirt_grass_50` main, rocky grass tier2) |

The thawed variant of the alpine-lakes family: economically identical to
`alpine/winter` (same animals, fruit, fish); only the ground textures and the
tree/rock actors differ.

## What it sets

`binaries/data/mods/public/maps/random/rmbiome/alpine/late_spring.json`:

- **Terrains**: `mainTerrain` `alpine_dirt_grass_50`; `forestFloor`
  `alpine_forrestfloor_snow`; `cliff` `alpine_cliff_a/b/c`; `tier2Terrain`
  `alpine_grass_rocky`; `halfSnow` `[alpine_grass_snow_50, alpine_dirt_snow]`
  (layered patches, `alpine_lakes.js:118`); `snowLimited` `[alpine_snow_rocky]`
  (painted above `scaleByMapSize(20,40)` height, `alpine_lakes.js:102`); `dirt`
  `alpine_dirt`; `road`/`roadWild` `new_alpine_citytile`; `water`
  `alpine_shore_rocks`; `shore` `alpine_shore_rocks_grass_50`.
- **Gaia**: `tree1` `pine` (200); `fruitBush` `berry_01`; deer / rabbit; fish
  generic; `stoneLarge` `aegean_large` (5000), `stoneSmall` `aegean_small`
  (1000), `metalLarge` `aegean_anatolian_02` (5000).
- **Decoratives**: soft grass, granite rocks, Mediterranean bushes (cosmetic).
- No `Environment`, `Heights` or `ResourceCounts` keys.
