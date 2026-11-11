# Winter — biome `gulf_of_bothnia/winter` — 0 A.D. 0.28.0

> "Winter has set in, carpeting the land with its first snow, but the landscape
> is still dotted with colorful berry bushes."
> (`binaries/data/mods/public/maps/random/rmbiome/gulf_of_bothnia/winter.json:2-5`)

Only usable on `random/gulf_of_bothnia`. JSON-only; loaded over
`defaultbiome.json`. The gulf map reads the standard keys plus
`Environment.Water.Frozen`, `Heights.seaGround/shore/land` and the
`ResourceCounts` `fish`/`bush`/`hunt`/`berries` entries
(`gulf_of_bothnia.js:11-52`). Tree counts are hardcoded in the map script
(`getTreeCounts(500, 3000, 0.7)`, `gulf_of_bothnia.js:189`) — this biome does
not control tree density.

## Bot-relevant summary

| Aspect | Value |
|---|---|
| Lake | open water (`Frozen: false`) — normal water, fish placed in it |
| Trees | `fir` (200) + `temperate_winter` (200 wood) |
| Fruit | `berry_01` (200, regrows); **`berries {10,50}` — the most berry groups of the gulf family** |
| Huntable | deer (100) + **bear_brown (300, `defensive` stance — fights back when attacked, 20 hack + 20 crush)**; chicken (40) near base |
| Fish | `gaia/fish/generic` (1000 `food.fish`); counts `min 5 – max 30` |
| Animals/bushes | `hunt 2-30`, `bush 5-50` |
| Stone / metal | `polar_02` large (5000) / `alpine_small` (1000); `polar_01` large (5000) / `aegean_anatolian_small_01` (1000) |
| Heights | `seaGround -3`, `shore 1`, `land 3` |

Snowy land around an open gulf; the berry-heavy season of the family. Same
bear secondary (300 meat, `defensive` stance) as late spring; same heights,
only the terrain/lighting and counts differ from it.

## What it sets

`binaries/data/mods/public/maps/random/rmbiome/gulf_of_bothnia/winter.json`:

- **Environment**: `SkySet: "stormy"`; dim sun (0.749/0.750/0.673); `Frozen:
  false`, `Type: "lake"`, waviness 7; HDR postproc (no `Fog` key — inherits
  the defaultbiome fog).
- **Terrains**: `mainTerrain`/`tier1/3` `alpine_snow_01`; `forestFloor1`/
  `cliff`/`tier2`/`shore` `alpine_snow_02`; roads `aegean_paving_02`; `water`
  `aegean_cliff_01`.
- **Gaia**: `tree1/2/4` `fir`, `tree3/5` `temperate_winter`; `fruitBush`
  `berry_01`; deer / bear_brown; generic fish; polar rock/ore actors.
- **ResourceCounts**: `fish {5,30}`, `bush {5,50}`, `hunt {2,30}`,
  `berries {10,50}`.
- **Heights**: `seaGround -3`, `shore 1`, `land 3`.
