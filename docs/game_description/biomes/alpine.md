# Subalpine — biome `generic/alpine` — 0 A.D. 0.28.0

> "Between the high summits of the Alps, the valleys are filled with fog in
> the early morning. The ground is full of gravel and rocks, but silver fir and
> spruce trees grow between them and provide shelter for deer and mountain
> goats." (`binaries/data/mods/public/maps/random/rmbiome/generic/alpine.json:2-5`)

Command line: `-autostart-biome=generic/alpine`. Supported by every map with
`SupportedBiomes: "generic/"`. No JS file → fully static (no random picks).

## Bot-relevant summary

| Aspect | Value |
|---|---|
| Trees | `min 1000 – max 2000`, **85 % in forests, 15 % stragglers** — the highest forest share (`alpine.json:93-99`) |
| Wood per tree | 200 (pine, fir, elm, oak_hungarian_autumn); `fir_sapling` 50 |
| Fruit bushes | `berry_01` (200, regrows) |
| Huntable | goat (70) main + deer (100) secondary; chicken (40) near base |
| Fish | `gaia/fish/tuna` (1000 `food.fish`) — no water on mainland, unused there |
| Stone / metal | standard amounts (1000 / 5000); templates purely visual |

Dense, mostly-forested wood economy at 200 wood/tree; slightly weaker hunting
than temperate (goat 70 vs deer 100 as the main animal).

## Environment (visual only)

`alpine.json:6-33`. `SkySet: "cloudless"` (overrides the random pick). Sun
1.019/1.040/0.973 at elevation 0.589, rotation -1.443; bluish ambient; water
`Type: "clap"`, murkiness 0.88, waviness 2; thin bluish fog; HDR postproc,
bloom 0.14.

## Terrains (visual only)

`alpine.json:34-65`. Notable: the main terrain is **steppe grass**
(`steppe_grass_02`); forest floors `alpine_forestfloor_01`; cliff
`alpine_rock_02`; tiers `steppe_grass_dirt_02` → `alpine_forestfloor_02` →
`steppe_rocks_dirt_01` → `aegean_grass_dirt_03`; hills `alpine_rock_01/02`;
dirt `alpine_forestfloor_01`; roads `alpine_paving_stones_02`; shore/water
`aegean_grass_dirt_03`/`steppe_rocks_dirt_01`. No gameplay stats (see README).

## Gaia templates

`alpine.json:66-81` (no JS):

- `tree1` pine, `tree2` fir, `tree3` `oak_hungarian_autumn` (stragglers),
  `tree4` `fir_sapling` (50), `tree5` elm — forests are pine/fir/elm/sapling.
- `fruitBush` `berry_01` (200), `startingAnimal` chicken (40),
  `mainHuntableAnimal` goat (70), `secondaryHuntableAnimal` deer (100),
  `fish` tuna.
- `stoneLarge` `temperate_large_02` (5000), `stoneSmall` `temperate_small`
  (1000), `metalLarge` `temperate_02` (5000), `metalSmall`
  `temperate_small_01` (1000).

## On `random/mainland`

No biome-specific branches. At map size 192: ≈1167 trees → ≈992 in ~13 forests
(very full forests), ≈175 stragglers (mostly `oak_hungarian_autumn` and
`fir_sapling`).
