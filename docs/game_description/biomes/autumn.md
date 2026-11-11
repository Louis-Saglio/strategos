# Rhine Valley (Fall) — biome `generic/autumn` — 0 A.D. 0.28.0

> "The first leaves have fallen. The landscape is a dazzling dash of colors
> irrevocably intertwined. The native beech and oak trees of this temperate
> zone display a multi-colored foliage while animals try to prepare for the
> approaching winter." (`binaries/data/mods/public/maps/random/rmbiome/generic/autumn.json:2-5`)

Command line: `-autostart-biome=generic/autumn`. Supported by every map with
`SupportedBiomes: "generic/"`. No JS file → fully static.

## Bot-relevant summary

| Aspect | Value |
|---|---|
| Trees | `min 1000 – max 3000`, **70 % in forests, 30 % stragglers** (`autumn.json:95-100`) — same as temperate |
| Wood per tree | 200 (all five species) |
| Fruit bushes | `berry_01` (200, regrows) |
| Huntable | deer (100) + sheep (100); chicken (40) near base |
| Fish | `gaia/fish/tuna` (1000 `food.fish`) — no water on mainland, unused there |
| Stone / metal | standard amounts (1000 / 5000); templates purely visual |

Mechanically nearly identical to `generic/temperate` (same tree counts, same
animals, all trees 200 wood): the differences are the species actors, the fish
species, and the visuals.

## Environment (visual only)

`autumn.json:6-30`. No `SkySet` → random. Same sun as temperate
(1.032/0.99/0.866) but lower: elevation 0.446, rotation -0.488; water
murkiness 0.97, waviness 5; no fog; HDR postproc, saturation 0.95, contrast
1.05, bloom 0.16.

## Terrains (visual only)

`autumn.json:31-67`. Main `autumn_grass_02`; forest floors
`autumn_forestfloor_01/02`; temperate cliffs/hills; tiers
`autumn_grass_dirt_01` → `autumn_grass_01` → `autumn_grass_mud_01` →
`autumn_grass_04`; dirt `autumn_grass_dirt_01-04`; road `temperate_paving_03`,
wild road `temperate_rocks_dirt_01`; shore/water `autumn_grass_dirt_01`/
`autumn_grass_mud_01`/`autumn_mud_01`. No gameplay stats (see README).

## Gaia templates

`autumn.json:68-83`:

- `tree1`/`tree4` `oak_holly_autumn`, `tree2` `oak_hungarian_autumn`,
  `tree3` `poplar_dead` (stragglers), `tree5` `maple_autumn` — 200 wood each.
- `fruitBush` `berry_01` (200), deer (100), sheep (100), `fish` tuna.
- Quirk: the JSON sets `"chicken"` instead of `"startingAnimal"`
  (`autumn.json:75`). Map scripts read `startingAnimal`
  (`mainland.js` `placePlayerBases`), so the key is ignored and the chicken
  (40 meat) near the base comes from `defaultbiome.json:40` instead.
- `stoneLarge` `temperate_large` (5000), `stoneSmall` `temperate_small`
  (1000), `metalLarge` `temperate_01` (5000), `metalSmall`
  `temperate_small_01` (1000).

## On `random/mainland`

No biome-specific branches. At map size 192: ≈1333 trees → ≈933 in ~13
forests, ≈400 stragglers (`poplar_dead`).
