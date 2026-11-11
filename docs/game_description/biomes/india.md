# India — biome `generic/india` — 0 A.D. 0.28.0

> "Explore the mysterious tropics. An extremely green, but also extremely humid
> environment awaits. The tall Toona trees look on disapprovingly at this
> invasion of their privacy and ferocious tigers are determined to defend their
> territory at all costs." (`binaries/data/mods/public/maps/random/rmbiome/generic/india.json:2-5`)

Command line: `-autostart-biome=generic/india`. Supported by every map with
`SupportedBiomes: "generic/"`. No JS file → fully static.

## Bot-relevant summary

| Aspect | Value |
|---|---|
| Trees | `min 900 – max 1500`, **80 % in forests, 20 % stragglers** (`india.json:90-96`) |
| Wood per tree | **500-600** (banyan 600, strangler 500, teak 500); palms 200 — the richest per-tree wood |
| Fruit bushes | `date` (**400** `food.fruit`, regrows) |
| Huntable | peacock (50) main — weak hunting; **elephant_asian (650)** secondary; peacock (50) near base |
| Fish | `gaia/fish/generic` (1000 `food.fish`) — no water on mainland, unused there |
| Stone / metal | standard amounts (1000 / 5000); templates purely visual |
| Map special case | **decorations ×8** (`planetm = 8`, `mainland.js:156-159`) — cosmetic only |

Few trees (900-1500) but the best wood per tree in the game (500-600), so the
wood economy is roughly comparable to temperate. Hunting is peculiar: tiny
main animal (peacock 50) but elephants (650) as secondary — each elephant herd
is a huge meat windfall, but elephants are `passive-defensive`
(`template_unit_fauna_hunt_passive-defensive.xml`, stance set in `UnitAI`): they
do not attack unprovoked, yet hit back hard when hunted (25 hack + 10 pierce +
20 crush, `gaia/fauna_elephant_asian.xml`), so hunters take damage. Best fruit
(date palms at 400 each, same as sahara/nubia).

## Environment (visual only)

`india.json:6-30`. No `SkySet` → random. Sun 1.032/0.995/0.866 at the highest
elevation of all biomes (1.95, nearly overhead), rotation 0; pale blue water
(murkiness 0.45, waviness 1.5); no fog; HDR postproc, bloom 0.16.

## Terrains (visual only)

`india.json:31-62`. Main: random pick of `india_grass_01`, `india_grass_02`,
`india_grass_dirt_01`, `india_grass_dirt_02`; forest floors
`india_forestfloor_01/02`; cliffs `india_cliff_02/03`; tiers
`india_grass_02` → `india_mud_01` → `india_grass_dirt_01` →
`india_grass_dirt_02`; hills/dirt `india_dirt_*`; roads `india_paving_02`;
sandy shore (`india_sand_01`), water `india_mud_01`. No gameplay stats (see
README).

## Gaia templates

`india.json:63-78`:

- `tree1` banyan (600), `tree2` strangler (500), `tree3` teak (500,
  stragglers), `tree4` `palm_palmyra` (200), `tree5` `palm_tropical` (200).
- `fruitBush` `gaia/fruit/date` (400), `startingAnimal` peacock (50),
  `mainHuntableAnimal` peacock (50), `secondaryHuntableAnimal`
  `elephant_asian` (650), `fish` generic.
- `stoneLarge` `india_large` (5000), `stoneSmall` `india_small` (1000),
  `metalLarge` `india_01` (5000), `metalSmall` `india_small_01` (1000).

## On `random/mainland`

`mainland.js:156-159` sets `planetm = 8` for india, multiplying decorative
actors (grass/bushes/rocks) ×8 — cosmetic, no resources. At map size 192:
≈1000 trees → ≈800 in ~13 forests, ≈200 stragglers (teak, 500 wood each).
