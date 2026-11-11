# Eurasian Steppe — biome `generic/steppe` — 0 A.D. 0.28.0

> "Wide grasslands stretching to the horizon, without any trees blocking the
> view. The Steppe is home to large herds of wild horses, which graze
> peacefully on the empty land, but flee quickly if you try to catch them."
> (`binaries/data/mods/public/maps/random/rmbiome/generic/steppe.json:2-5`)

Command line: `-autostart-biome=generic/steppe`. Supported by every map with
`SupportedBiomes: "generic/"`. No JS file → fully static.

## Bot-relevant summary

| Aspect | Value |
|---|---|
| Trees | `min 800 – max 1400`, **70 % in forests, 30 % stragglers** (`steppe.json:92-98`) |
| Wood per tree | **~100 per "tree"** — all five templates are bushes (`bush_steppe_01/02/03`, bush mixin `mixins/bush.xml`, 4 gatherers) |
| Fruit bushes | `berry_01` (200, regrows) |
| Huntable | horse (200) main + horse (200) secondary; chicken (40) near base |
| Fish | `gaia/fish/tuna` (1000 `food.fish`) — no water on mainland, unused there |
| Stone / metal | standard amounts (1000 / 5000); templates purely visual |

**The weakest wood economy of all biomes**: the "trees" are steppe bushes at
~100 wood each (vs 200-600 for real trees), so despite a normal tree count
(800-1400) total wood is roughly a quarter of temperate's. "Forests" exist on
paper but are bush clumps. Good hunting (horses 200 meat, both slots) only
partly compensates. A bot must be far more wood-conservative on steppe.

## Environment (visual only)

`steppe.json:6-30`. `SkySet: "sunrise"`. Sun 0.859/0.851/0.733 at the lowest
elevation of all biomes (0.421), rotation -1.526; purplish ambient; water
murkiness 0.97, waviness 4.01; thick haze (fog thickness 0.26); HDR postproc,
saturation 0.95, contrast 1.05, bloom 0.211.

## Terrains (visual only)

`steppe.json:31-64`. Main `steppe_grass_03`; forest floors
`steppe_grass_dirt_01`/`aegean_grass_dirt_03`; cliffs `aegean_cliff_seaside_01`/
`steppe_rocks_dirt_01`; tiers `steppe_grass_02` → `steppe_grass_dirt_02/03` →
`steppe_grass_dirt_01`; hills `steppe_rocks_dirt_01`; dirt `steppe_grass_dirt_01`/
`india_grass_dirt_02`; roads `sahara_paving_stones_01`; shore `india_grass_dirt_02`,
water `steppe_grass_mud_01`. No gameplay stats (see README).

## Gaia templates

`steppe.json:65-80`:

- `tree1`/`tree3` `bush_steppe_01`, `tree2`/`tree5` `bush_steppe_02`,
  `tree4` `bush_steppe_03` — all bush templates (~100 wood, 4 gatherers).
- `fruitBush` `berry_01` (200), `startingAnimal` chicken (40),
  `mainHuntableAnimal` horse (200), `secondaryHuntableAnimal` horse (200),
  `fish` tuna.
- `stoneLarge` `temperate_large` (5000), `stoneSmall` `temperate_small`
  (1000), `metalLarge` `temperate_02` (5000), `metalSmall`
  `temperate_small_01` (1000).

## On `random/mainland`

No biome-specific branches. At map size 192: ≈900 "trees" → ≈630 in ~13
forests (bush clumps), ≈270 stragglers — total wood on the order of 90,000
(≈100/tree) vs ≈260,000 for temperate, at comparable counts.
