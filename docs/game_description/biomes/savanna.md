# Sudanian Savanna — biome `generic/savanna` — 0 A.D. 0.28.0

> "The transition between the dry Sahara to the north and the tropical forests
> to the south. The sunlight floods through the open canopy and lights the
> grassland between the trees, where herds of zebras, wildebeest, giraffes and
> elephants roam." (`binaries/data/mods/public/maps/random/rmbiome/generic/savanna.json:2-5`)

Command line: `-autostart-biome=generic/savanna`. Supported by every map with
`SupportedBiomes: "generic/"`.

## Bot-relevant summary

| Aspect | Value |
|---|---|
| Trees | `min 500 – max 1500`, **30 % in forests, 70 % stragglers** — the lowest forest share (`savanna.json:84-90`) |
| Wood per tree | baobab 600 (tree1), acacia 200, `bush_tropic` 50, `bush_temperate` ~100 |
| Fruit bushes | `berry_01` (200, regrows) |
| Huntable | main: random of wildebeest (150) / zebra (150) / giraffe (350) / gazelle (100); secondary: **elephant_african_bush (800)**; chicken (40) near base |
| Fish | `gaia/fish/generic` (1000 `food.fish`) — no water on mainland, unused there |
| Stone / metal | standard amounts (1000 / 5000); templates purely visual |

The "open woodland" biome: trees are mostly lone stragglers, forests barely
exist (30 % share). Total wood is modest — baobab tree1 (600) appears in
forests and as the first straggler entry, but `tree4`/`tree5` are bushes (50 /
~100 wood). Hunting is the compensation: elephants (800 meat, passive-defensive
— see india.md) as the guaranteed secondary animal.

## Environment (visual only)

`savanna.json:6-32`. `SkySet: "cloudless"`. Sun 1.246/1.109/0.989 at elevation
0.6, rotation -0.45; greenish-brown water (murkiness 0.92, waviness 1.5); light
warm fog; HDR postproc, bloom 0.132.

## Terrains (visual only)

`savanna.json:33-57`. Main `savanna_grass_01`; forest floors
`sahara_dirt_cracks_01`/`sahara_dirt_02`; cliff `sahara_rock_01`; tiers
`aegean_grass_01` → `savanna_grass_03` → `aegean_grass_01` →
`aegean_grass_02`; hill `sahara_rock_01`; dirt `aegean_grass_02`; roads
`sahara_paving_stones_02`; shore `steppe_grass_04`, water `india_sand_01`. No
gameplay stats (see README).

## Gaia templates

`savanna.json:58-72` + JS pick (`savanna.js:3-8`):

- `tree1` baobab (600), `tree2`/`tree3` acacia (200), `tree4` `bush_tropic`
  (50), `tree5` `bush_temperate` (~100, bush mixin).
- `mainHuntableAnimal`: random of wildebeest (150), zebra (150), giraffe
  (350), gazelle (100).
- `fruitBush` `berry_01` (200), `startingAnimal` chicken (40),
  `secondaryHuntableAnimal` `elephant_african_bush` (800), `fish` generic.
- `stoneLarge` `savanna_large` (5000), `stoneSmall` `savanna_small` (1000),
  `metalLarge` `savanna_01` (5000), `metalSmall` `savanna_small_01` (1000).

## On `random/mainland`

No branch in `mainland.js`, but several other maps multiply savanna's dirt/
grass patch count ×2 or ×3 (`unknown.js:930`, `islands.js:200,218`,
`migration.js:198,275,324`, `flood.js:238`, `island_stronghold.js:357`,
`snowflake_searocks.js:303`, `land_grab.js:204`) — cosmetic terrain painting,
no resources. At map size 192: ≈667 trees → ≈200 in ~13 forests, ≈467
stragglers (baobab first in the straggler list, `mainland.js:207`).
