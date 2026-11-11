# Frozen Lake — biome `gulf_of_bothnia/frozen_lake` — 0 A.D. 0.28.0

> "Thick ice has formed on the gulf which is capable of withstanding any
> weight. All plants are covered in snow, but there are large herds of
> migrating deer who try to find some food under the snow."
> (`binaries/data/mods/public/maps/random/rmbiome/gulf_of_bothnia/frozen_lake.json:2-5`)

Only usable on `random/gulf_of_bothnia`. JSON-only; loaded over
`defaultbiome.json`. The gulf map reads the standard keys plus
`Environment.Water.Frozen`, `Heights.seaGround/shore/land` and the
`ResourceCounts` `fish`/`bush`/`hunt`/`berries` entries
(`gulf_of_bothnia.js:11-52`). Tree counts are hardcoded in the map script
(`getTreeCounts(500, 3000, 0.7)`, `gulf_of_bothnia.js:189`) — this biome does
not control tree density.

## The frozen gulf

`Water.Frozen: true` is read at `gulf_of_bothnia.js:11` (`isLakeFrozen`): the
map swaps the lake tile class for a plain water class (`:73`), paints
decoration areas on the ice (`:144`), and instead of open-water fish it places
fish **in holes cut in the ice** (`:271-281`). The lake is a walkable, solid
ice surface — units cross the gulf directly.

## Bot-relevant summary

| Aspect | Value |
|---|---|
| Lake | frozen solid → walkable; fish only at ice holes |
| Trees | `fir_winter` + `temperate_winter` (200 wood each) |
| Fruit | `berry_02` (200, regrows) |
| Huntable | deer (100) + deer (100); chicken (40) near base |
| Fish | `gaia/fish/generic` (1000 `food.fish`); counts `min 6 – max 25` |
| Animals/bushes/berries | `hunt 10-80`, `bush 13-50`, `berries 2-10` (map-scaled, `gulf_of_bothnia.js:49-52`) |
| Stone / metal | `polar_02` large (5000) / `alpine_small` (1000); `polar_01` large (5000) / `aegean_anatolian_small_01` (1000) |
| Heights | `seaGround 0.05`, `shore 0.4`, `land 0.6` (the map's height levels) |

## What it sets

`binaries/data/mods/public/maps/random/rmbiome/gulf_of_bothnia/frozen_lake.json`:

- **Environment**: `SkySet: "stormy"`; cold sun; `Water.Frozen: true`,
  `WaterBody.Type: "lake"`, murkiness 0.97; thin fog; HDR postproc.
- **Terrains**: snow everywhere — `mainTerrain`/`tier1/3` `alpine_snow_01`,
  `forestFloor1`/`cliff`/`tier2`/`roadWild`/`shore` `alpine_snow_02`, roads
  snow, `water` `alpine_ice_01`.
- **Gaia**: `tree1/2/4` `fir_winter`, `tree3/5` `temperate_winter`; `fruitBush`
  `berry_02`; deer/deer; generic fish; polar rock/ore actors.
- **ResourceCounts**: `fish {6,25}`, `bush {13,50}`, `hunt {10,80}`,
  `berries {2,10}`.
- **Heights**: `seaGround 0.05`, `shore 0.4`, `land 0.6`.
