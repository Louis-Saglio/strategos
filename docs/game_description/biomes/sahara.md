# Sahara — biome `generic/sahara` — 0 A.D. 0.28.0

> "A semi-desert area that boasts numerous clumps of date palms and acacia
> trees. Herds of camels roam the wild and the occasional gazelle jumps up in
> fright at being disturbed." (`binaries/data/mods/public/maps/random/rmbiome/generic/sahara.json:2-5`)

Command line: `-autostart-biome=generic/sahara`. Supported by every map with
`SupportedBiomes: "generic/"`.

## Bot-relevant summary

| Aspect | Value |
|---|---|
| Trees | `min 500 – max 1000`, **40 % in forests, 60 % stragglers** — sparse (`sahara.json:82-88`) |
| Wood per tree | date palms 200; `cretan_date_palm_short` 100, `cretan_date_palm_patch` 300, juniper 200 |
| Fruit bushes | `date` (**400** `food.fruit`, regrows) |
| Huntable | camel (200) main + gazelle (100) secondary; **goat (70) near base** |
| Fish | `gaia/fish/generic` (1000 `food.fish`) — no water on mainland, unused there |
| Stone / metal | standard amounts (1000 / 5000); templates purely visual |

Same sparse wood economy as nubia (500-1000 trees, 60 % stragglers) but
without nubia's giant baobabs — all species are 100-300 wood. Solid, safe
hunting (camels 200) and rich fruit (dates 400). Arguably the hardest wood
economy of the generic biomes.

## Environment (visual only)

`sahara.json:6-30`. No `SkySet` → random. Sun 0.976/0.859/0.749 at elevation
0.65, rotation -0.3; dark blue ambient (0.231/0.282/0.357); brown water
(murkiness 0.9, waviness 3); slight warm fog; HDR postproc, saturation 0.95,
contrast 1.02, bloom 0.12.

## Terrains (visual only)

`sahara.json:31-58`. Desert biome: main random pick of `sahara_sand_01`,
`sahara_sand_02`, `sahara_sand_05`; forest floors `sahara_forestfloor_01/02`;
cliff `sahara_rock_01`; tiers `sahara_rocks_dirt_01/02` → `sahara_sand_03/04`;
hill/dirt `sahara_dirt_*`; roads `sahara_paving_stones_01` (+sand variant);
dunes shore blend, shore `sahara_sand_02`, water `sahara_sand_04_wet`. No
gameplay stats (see README).

## Gaia templates

`sahara.json:59-70` + JS picks (`sahara.js:3-17`):

- `tree1`/`tree2` (forests): random of `cretan_date_palm_short` (100)+
  `date_palm` (200), or `date_palm` (200)+`cretan_date_palm_tall` (200).
- `tree3` (stragglers): `juniper_prickly` (200).
- `tree4`/`tree5` (forests): both the same random pick of `date_palm` (200) or
  `cretan_date_palm_patch` (300).
- `fruitBush` `gaia/fruit/date` (400), `startingAnimal` goat (70),
  `mainHuntableAnimal` camel (200), `secondaryHuntableAnimal` gazelle (100),
  `fish` generic.
- `stoneLarge` `desert_large` (5000), `stoneSmall` `desert_small` (1000),
  `metalLarge` `sahara_01` (5000), `metalSmall` `sahara_small_01` (1000).

## On `random/mainland`

No biome-specific branches in `mainland.js` (`island_stronghold.js:339` has a
sahara-specific fish tweak on its own map). At map size 192: ≈583 trees →
≈233 in ~13 forests, ≈350 stragglers (juniper, 200 wood).
