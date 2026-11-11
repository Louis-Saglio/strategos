# Nubia — biome `generic/nubia` — 0 A.D. 0.28.0

> "Nubia, a dry climate in which only the hardy Baobab trees thrive. Solitary
> gazelles graze the sparse grass, while herds of zebras, wildebeest, giraffes
> or elephants roam the wild in search of food."
> (`binaries/data/mods/public/maps/random/rmbiome/generic/nubia.json:2-5`)

Command line: `-autostart-biome=generic/nubia`. Supported by every map with
`SupportedBiomes: "generic/"`.

## Bot-relevant summary

| Aspect | Value |
|---|---|
| Trees | `min 500 – max 1000`, **40 % in forests, 60 % stragglers** — sparse (`nubia.json:86-92`) |
| Wood per tree | acacia/date_palm/palm_doum 200; **baobabs 1000-1200** (see below) |
| Fruit bushes | `date` (**400** `food.fruit`, regrows) |
| Huntable | main: random of wildebeest (150) / zebra (150) / giraffe (350) / **elephant_african_bush (800)** / gazelle (100); secondary: gazelle (100); chicken (40) near base |
| Fish | `gaia/fish/generic` (1000 `food.fish`) — no water on mainland, unused there |
| Stone / metal | standard amounts (1000 / 5000); templates purely visual |

The driest wood economy of the generic biomes (tied with sahara): only 500-1000
trees and 60 % of them as lone stragglers — forests are rare and small. The
baobabs (1000-1200 wood) partly compensate, but only as stragglers/`tree3-5`.
Excellent hunting if the main-animal roll lands on giraffe or elephant (350 /
800 meat, the latter `passive-defensive`, see india.md), and 400-food date
palms as fruit.

## Environment (visual only)

`nubia.json:6-30`. No `SkySet` → random. Sun 1.100/1.060/0.992 (brightest) at
elevation 0.7, rotation -1.7; brown water (murkiness 0.96, waviness 5); slight
warm fog; HDR postproc, contrast 1.04, saturation 0.95, bloom 0.143.

## Terrains (visual only)

`nubia.json:31-62`. Sand biome: main random pick of `nubia_sand_01`,
`nubia_sand_ripples`, `nubia_sand_dunes_01`; forest floor
`nubia_forestfloor_01` (both); cliffs `nubia_rock_02/01`; tiers
`nubia_sand_03` → `nubia_rocks_dirt_01/02/03`; hills/dirt `nubia_dirt_*`;
roads `nubia_paving_stones_01` (+sand variant); shore `nubia_sand_02`, water
`nubia_sand_02_wet`. No gameplay stats (see README).

## Gaia templates

`nubia.json:63-74` + JS picks (`nubia.js:3-29`):

- `tree1`/`tree2` acacia (200, forests).
- `tree3` (stragglers): random of `baobab_4_dead` (1000) or `baobab_3_mature`
  (1200).
- `tree4`/`tree5` (forests): random of `date_palm`+`acacia`, `date_palm`+
  `palm_doum` (200 each), or `baobab_3_mature` (1200)+`bush_tropic` (50).
- `mainHuntableAnimal`: random of wildebeest (150), zebra (150), giraffe
  (350), `elephant_african_bush` (800), gazelle (100).
- `fruitBush` `gaia/fruit/date` (400), `secondaryHuntableAnimal` gazelle (100),
  `startingAnimal` chicken (40), `fish` generic.
- `stoneLarge` `savanna_large` (5000), `stoneSmall` `savanna_small` (1000),
  `metalLarge` `savanna_01` (5000), `metalSmall` `savanna_small_01` (1000).

## On `random/mainland`

No biome-specific branches. At map size 192: ≈583 trees → ≈233 in ~13 forests
(tiny forests), ≈350 stragglers — of which `tree3` baobabs are the most
valuable wood on the map.
