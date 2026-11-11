# Arctic — biome `generic/arctic` — 0 A.D. 0.28.0

> "A region in the high snowy mountains. Biting winds sweep through the
> abundant conifer forests, making even the more resilient deer and mountain
> goats shiver." (`binaries/data/mods/public/maps/random/rmbiome/generic/arctic.json:2-5`)

Command line: `-autostart-biome=generic/arctic`. Supported by every map with
`SupportedBiomes: "generic/"`. No JS file → fully static.

## Bot-relevant summary

| Aspect | Value |
|---|---|
| Trees | `min 500 – max 2000`, **60 % in forests, 40 % stragglers** (`arctic.json:95-101`) |
| Wood per tree | 200 (fir_winter, pine_w) |
| Fruit bushes | `berry_02` (200, regrows) |
| Huntable | muskox (200) main + **walrus (300)** secondary; chicken (40) near base |
| Fish | `gaia/fish/tuna` (1000 `food.fish`) — no water on mainland, unused there |
| Stone / metal | standard amounts (1000 / 5000); templates purely visual |

The best hunting among the cold biomes: main animal at 200 meat and the
heaviest secondary in the game (walrus 300 — `passive-defensive`, it fights
back when hunted). Tree density is modest (500-2000, 60 % forested).

## Environment (visual only)

`arctic.json:6-32`. `SkySet: "stormy"`. Sun 0.98/1.01/1.045 at elevation 0.502,
rotation -0.626; cold blue ambient (0.294/0.392/0.494); water murkiness 0.88,
waviness 2; very thin fog (factor 0.004); HDR postproc, bloom 0.16.

## Terrains (visual only)

`arctic.json:33-67`. Snow biome: main `alpine_snow_01`/`alpine_snow_02`;
forest floors `alpine_forestfloor_02`; cliffs `alpine_rock_01/02`; tiers
`alpine_snow_01` → `alpine_snow_02` → `polar_snow_b` → `alpine_snow_02`;
hills `alpine_rock_01_snow`/`alpine_rock_02_snow`; dirt = snow; roads
`alpine_paving_stones_01`; shore/water `alpine_rock_01_snow`/
`alpine_rocks_dirt_01`. No gameplay stats (see README).

## Gaia templates

`arctic.json:68-83`:

- `tree1` `fir_winter`, `tree2`/`tree3` `pine_w`, `tree4`/`tree5` `fir_winter`
  (200 each) — all conifers.
- `fruitBush` `berry_02` (200), `startingAnimal` chicken (40),
  `mainHuntableAnimal` muskox (200), `secondaryHuntableAnimal` walrus (300),
  `fish` tuna.
- `stoneLarge` `temperate_large_03` (5000), `stoneSmall` `temperate_small`
  (1000), `metalLarge` `polar_01` (5000), `metalSmall`
  `aegean_anatolian_small_01` (1000).

## On `random/mainland`

No biome-specific branches in `mainland.js`. (Some water maps do branch on
arctic: `harbor.js:364`, `hells_pass.js:268`, `lions_den.js:448` adjust fish
placement — see [README](README.md).) At map size 192: ≈750 trees → ≈450 in
~13 forests, ≈300 stragglers.
