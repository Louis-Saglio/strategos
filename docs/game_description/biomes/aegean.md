# Aegean-Anatolian — biome `generic/aegean` — 0 A.D. 0.28.0

> "Start in a region blessed with the Mediterranean climate, a warm and
> inviting land. The cypresses are in a perpetual struggle with the dominant
> fan palms while deer graze in their shadows, blissfully unaware."
> (`binaries/data/mods/public/maps/random/rmbiome/generic/aegean.json:2-5`)

Command line: `-autostart-biome=generic/aegean`. Supported by every map with
`SupportedBiomes: "generic/"`.

## Bot-relevant summary

| Aspect | Value |
|---|---|
| Trees | `min 500 – max 2000`, **60 % in forests, 40 % stragglers** (`aegean.json:82-88`) |
| Wood per tree | 200 for most species; `olive` 400, `cretan_date_palm_short` 100 — see [README](README.md) |
| Fruit bushes | `berry_01` (200) **or** `grapes` (200), picked at random (`aegean.js:24-27`) |
| Huntable | deer (100) + sheep (100); chicken (40) near base |
| Fish | `gaia/fish/generic` (1000 `food.fish`) — no water on mainland, unused there |
| Stone / metal | standard amounts (1000 / 5000); templates purely visual |

Below-average tree density (500-2000) and only 60 % of it in forests — more
stragglers, smaller forests than temperate.

## Environment (visual only)

`aegean.json:6-30`. No `SkySet` → random. Sun 1.023/0.923/0.714 at elevation
0.8, rotation -0.909; teal-tinted water (tint 0.133/0.725/0.855), murkiness
0.8, waviness 3; light fog (thickness 0.25, factor 0.003); HDR postproc, bloom
0.16.

## Terrains (visual only)

`aegean.json:31-60`. Ground: random pick of `aegean_grass_02`,
`aegean_grass_dirt_01`, `aegean_grass_01`; forest floors
`aegean_forestfloor_01`/`aegean_grass_01`; cliffs `aegean_cliff_01/02`; tiers
`aegean_grass_dirt_01`→`aegean_grass_01`→`aegean_grass_03`→`aegean_grass_02`;
hills `aegean_mountain_01`/`aegean_dirt_rocks_01`; dirt `aegean_dirt_01`/
`aegean_rocks_grass_01`; roads `aegean_paving_02`; sandy shore/water
(`aegean_sand_01`, `aegean_sand_02_wet`). No gameplay stats (see README).

## Gaia templates

`aegean.json:61-70` + JS picks (`aegean.js:3-27`):

- `tree1`/`tree2` (forests): random of `cypress_wild`, `pine_maritime_short`,
  `cretan_date_palm_tall` (200 each).
- `tree3` (stragglers): random of `olive` (400), `juniper_prickly` (200),
  `date_palm` (200), `cretan_date_palm_short` (100), `medit_fan_palm` (200).
- `tree4`/`tree5` (forests): random of `poplar_lombardy`, `carob`,
  `medit_fan_palm`, `cretan_date_palm_tall` (200 each).
- `fruitBush`: `berry_01` (200) or `grapes` (200), random.
- deer (100), sheep (100), chicken (40), `gaia/fish/generic`.
- `stoneLarge` `aegean_large` (5000), `stoneSmall` `aegean_small` (1000),
  `metalLarge` `aegean_anatolian_01` (5000), `metalSmall`
  `aegean_anatolian_small_01` (1000).

## On `random/mainland`

No biome-specific branches. At map size 192: ≈750 trees → ≈450 in ~13 forests,
≈300 stragglers (40 % straggler share — the `tree3` olive/juniper/palm mix is
more common here than on other biomes).
