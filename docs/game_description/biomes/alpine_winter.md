# Winter — biome `alpine/winter` — 0 A.D. 0.28.0

> "Snow-capped trees loom through the mist. The ground is blanketed in a layer
> of snow." (`binaries/data/mods/public/maps/random/rmbiome/alpine/winter.json:2-5`)

Only usable on `random/alpine_lakes` (`SupportedBiomes: "alpine/"`,
`binaries/data/mods/public/maps/random/alpine_lakes.json:7`). JSON-only — no JS setup function;
loaded over `defaultbiome.json`, overriding the keys below. Unlike the generic
biomes, `alpine_lakes.js` hardcodes its tree counts
(`getTreeCounts(500, 3000, 0.7)`, `alpine_lakes.js:106`) — this biome does not
control tree density.

## Bot-relevant summary

| Aspect | Value |
|---|---|
| Trees | `tree1` = `pine_w` (200 wood) for forests and stragglers (`winter.json`, `alpine_lakes.js:21,224`) |
| Fruit | `berry_01` (200, regrows) |
| Huntable | deer (100) + rabbit (50); chicken (40) near base |
| Fish | `gaia/fish/generic` (1000 `food.fish`) — alpine_lakes has water, fish are placed (`alpine_lakes.js:213`) |
| Stone / metal | `polar_01` large (5000) / `aegean_small` (1000); `aegean_anatolian_02` large (5000) |
| Terrain | full snow (`alpine_snow_a/b`, icy shore `alpine_shore_rocks_icy`) |

The frozen variant of the alpine-lakes family: same economy as its sibling
`alpine/late_spring`, only the visuals (snow, `pine_w`) and rock actors differ.

## What it sets

`binaries/data/mods/public/maps/random/rmbiome/alpine/winter.json`:

- **Terrains**: `mainTerrain` `alpine_snow_a/b`; `forestFloor`
  `alpine_forrestfloor_snow`; `cliff` `alpine_cliff_snow`; `tier2Terrain`
  `alpine_grass_snow_50`; `halfSnow` `[alpine_grass_snow_50, alpine_dirt_snow]`
  (used for layered patches, `alpine_lakes.js:118`); `snowLimited`
  `[alpine_snow_a/b]` (painted above `scaleByMapSize(20,40)` height,
  `alpine_lakes.js:102`); `dirt` `alpine_dirt`; `road`/`roadWild`
  `new_alpine_citytile`; `water` `alpine_shore_rocks`; `shore`
  `alpine_shore_rocks_icy`.
- **Gaia**: `tree1` `pine_w` (200); `fruitBush` `berry_01`; deer / rabbit;
  fish generic; `stoneLarge` `polar_01` (5000), `stoneSmall` `aegean_small`
  (1000), `metalLarge` `aegean_anatolian_02` (5000).
- **Decoratives**: dry grass, granite rocks, dry bushes (cosmetic).
- No `Environment`, `Heights` or `ResourceCounts` keys — those inherit the
  random sky (`randombiome.js:20`) and the map's own height constants
  (`alpine_lakes.js`).
