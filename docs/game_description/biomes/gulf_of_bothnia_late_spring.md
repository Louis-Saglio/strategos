# Spring — biome `gulf_of_bothnia/late_spring` — 0 A.D. 0.28.0

> "A late spring breeze ripples through the conifer forests of the Gulf of
> Bothnia. At this time of the year the gulf offers great fishing
> opportunities." (`binaries/data/mods/public/maps/random/rmbiome/gulf_of_bothnia/late_spring.json:2-5`)

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
| Trees | `fir` (200) + `euro_birch` (300 wood) |
| Fruit | `berry_01` (200, regrows) |
| Huntable | deer (100) + **bear_brown (300, `defensive` stance — fights back when attacked, 20 hack + 20 crush)**; chicken (40) near base |
| Fish | `gaia/fish/generic` (1000 `food.fish`); counts **`min 20 – max 100`** — the richest fishing of the gulf family |
| Animals/bushes/berries | `hunt 5-40`, `bush 5-50`, `berries 2-10` |
| Stone / metal | `alpine_large` (5000) / `alpine_small` (1000); `aegean_anatolian_01` large (5000) / `aegean_anatolian_small_01` (1000) |
| Heights | `seaGround -3`, `shore 1`, `land 3` |

The "great fishing" season: 20-100 fish (vs 6-25 frozen, 5-30 winter).
Secondary animal is a brown bear — 300 meat, but `defensive` stance (fights
back hard when hunted, unlike the fleeing deer).

## What it sets

`binaries/data/mods/public/maps/random/rmbiome/gulf_of_bothnia/late_spring.json`:

- **Environment**: `SkySet: "stormy"`; `Water.Frozen: false`,
  `WaterBody.Type: "lake"`, teal water, waviness 5; light fog; HDR postproc.
- **Terrains**: `mainTerrain` `sahara_grass_dirt_02`; `forestFloor1`
  `alpine_snow_01`; `cliff`/`tier3`/`water` `aegean_cliff_01`; `tier1`
  `sahara_grass_dirt_01`; `tier2` `steppe_grass_dirt_03`; roads
  `aegean_paving_02`; `shore` `aegean_grass_dirt_03`.
- **Gaia**: `tree1/2/4` `fir`, `tree3/5` `euro_birch`; `fruitBush` `berry_01`;
  deer / bear_brown; generic fish; alpine rock/ore actors.
- **ResourceCounts**: `fish {20,100}`, `bush {5,50}`, `hunt {5,40}`,
  `berries {2,10}`.
- **Heights**: `seaGround -3`, `shore 1`, `land 3`.
