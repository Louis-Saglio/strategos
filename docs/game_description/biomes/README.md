# Biomes — 0 A.D. 0.28.0

What a biome is, how the engine applies it, and what it does (and does not)
change in a game. One file per biome follows in this folder. Written for an
agent implementing a bot: the focus is on what differs *mechanically* between
biomes (wood, food, animals), not on the visuals.

**Everything here was verified against the 0 A.D. source reference
(0.28.0, see `AGENTS.md`)** — biome data
(`binaries/data/mods/public/maps/random/rmbiome/**`), the map generator
(`binaries/data/mods/public/maps/random/rmgen/**`, `rmgen-common/**`, the `random/*.js` map
scripts), template data (`binaries/data/mods/public/simulation/templates/**`) and engine source
(`source/**`). Paths below are relative to its root;
every claim carries an inline `path:line` citation. If a statement looks wrong,
trust the source, not the doc — and fix the doc.

## What a biome is

A biome is a JSON file under `binaries/data/mods/public/maps/random/rmbiome/` plus an optional JS
file that randomizes a few entries. It selects **terrain textures** (visual),
**environment/sky settings** (visual), and the **gaia entity templates**
(trees, animals, fish, fruit bushes, rocks, ore) that the map generator places.
It does **not** control the heightmap, the amount of stone/metal, the number of
mines, animal group counts, or terrain passability — see *What biomes do not
control*.

The gamesetup dropdown lists every `*.json` under `rmbiome/` except
`defaultbiome.json` (`binaries/data/mods/public/gui/common/settings.js:202-212`): the 10 **generic**
biomes (`generic/*`, supported by all maps whose `SupportedBiomes` is
`"generic/"`, e.g. `binaries/data/mods/public/maps/random/mainland.json:7`) and 9 **sub-biomes**
tied to one specific map family each (see *Index*). Command line:
`-autostart-biome=generic/temperate`.

## How a biome is applied

`setBiome(biomeID)` is the entry point (`binaries/data/mods/public/maps/random/rmbiome/randombiome.js:14-32`):

1. `loadBiomeFile("defaultbiome")` — the baseline `rmbiome/defaultbiome.json`
   is merged into the globals first.
2. Sky set, sun rotation and sun elevation are randomized
   (`randombiome.js:20-22`; sky set picked from `default/cirrus/cumulus/sunny`).
   A biome that sets `SkySet`/`SunElevation`/`SunRotation`/`SunColor` overrides
   these random values; otherwise they stay random (visual only).
3. `loadBiomeFile(biomeID)` — the biome JSON is deep-merged **on top of** the
   baseline (`randombiome.js:37-74`). The `Description` key is skipped; any
   other unknown top-level key throws.
4. `setupBiome_<name>()` from `rmbiome/<dirname>.js` runs if present
   (`randombiome.js:28-31`). `Engine.LoadLibrary` on a missing directory is a
   silent no-op (`source/graphics/MapGenerator.cpp:149-189`), so biomes
   without a JS file (all sub-biomes) simply skip this step.

The merged state lands in six globals (declared `randombiome.js:3-7` plus
`g_Environment` from `binaries/data/mods/public/maps/random/rmgen/environment.js:5`):
`g_Environment`, `g_Terrains`, `g_Gaia`, `g_Decoratives`, `g_ResourceCounts`,
`g_Heights`. Map scripts then read these globals directly — the biome does not
decide *how many* of anything is placed, only *which template* and (for trees)
a density range.

### JSON schema

| Section | Keys | Consumed by | Gameplay effect |
|---|---|---|---|
| `Environment` | `SkySet`, `SunColor`, `SunElevation`, `SunRotation`, `AmbientColor`, `Water` (`WaterBody`, `Frozen`), `Fog`, `Postproc` | merged into `g_Environment`; emitted in the map settings JSON by `RandomMap.js:484-497` | **none** (rendering only) |
| `Terrains` | `mainTerrain`, `forestFloor1/2`, `cliff`, `tier1-4Terrain`, `hill`, `dirt`, `road`, `roadWild`, `shoreBlend`, `shore`, `water` | `mainland.js:9-19` uses main/forestFloor/cliff/tier1-4/hill/road/roadWild; maps with water also use `shore`, `water`, `dirt` (e.g. `unknown.js:22-23`) | **none** — see *Terrain textures have no gameplay stats* |
| `Gaia` | `tree1-5`, `fruitBush`, `startingAnimal`, `mainHuntableAnimal`, `secondaryHuntableAnimal`, `fish`, `stoneLarge/Small`, `metalLarge/Small` | `mainland.js:21-32` (and equivalents in every random map) | **yes** — which resources spawn (wood per tree species, meat per animal species, fish, fruit) |
| `Decoratives` | `grass`, `grassShort`, `reeds`, `lillies`, `rockLarge/Medium`, `bushMedium/Small`, `tree` | `mainland.js:35-39` (`createDecoration`) | none (purely cosmetic actors) |
| `ResourceCounts` | `trees {min, max, forestProbability}` (generic biomes), or `fish`/`bush`/`hunt`/`berries` (gulf_of_bothnia sub-biomes) | `rBiomeTreeCount` (`randombiome.js:76-83`) → `mainland.js:111`; gulf_of_bothnia reads its counts at `gulf_of_bothnia.js:49-52` | **yes** — tree/forest density (wood); gulf fish/animal counts |
| `Heights` | `seaGround`, `shore`, `land` | only `fields_of_meroe.js:55` and `gulf_of_bothnia.js:45-47` | only on those two maps |

### Tree count math (wood density)

`rBiomeTreeCount` returns `[min, max, forestProbability]`
(`randombiome.js:76-83`). `getTreeCounts` scales the min/max by map size
(`scaleByMapSize`, linear between 128 and 512 tiles,
`rmgen/library.js:78-81`) and splits the result into forest trees
(`forestProbability` share) and straggler trees (the rest)
(`rmgen-common/gaia_entities.js:8-12`). On mainland:
`const [forestTrees, stragglerTrees] = getTreeCounts(...rBiomeTreeCount(1))`
(`mainland.js:111`), then `createDefaultForests` (`mainland.js:112`) spreads
`forestTrees` over `scaleByMapSize(8, 36)` forests
(`rmgen-common/gaia_entities.js:73-88`). Example at map size 192 (scale factor
64/384 ≈ 0.167): temperate `[1000, 3000]` → 1333 trees, 933 in ~13 forests,
400 stragglers.

Forests use `tree1`/`tree2` (floor `forestFloor2`) and `tree4`/`tree5` (floor
`forestFloor1`) (`mainland.js:41-50`); `tree3` appears only as a straggler
(`mainland.js:206-207`) — in `generic/temperate` `tree3` is an **apple tree**
(food, not wood).

## What biomes do NOT control

- **Heightmap / elevation.** Map scripts set their own height constants
  (e.g. `mainland.js:52` `heightLand = 3`). `g_Heights` is only consumed by
  `fields_of_meroe.js:55` and `gulf_of_bothnia.js:45-47`.
- **Terrain passability and movement speed.** Terrain textures carry no
  gameplay stats: the terrain XML only defines textures, props and material
  (e.g. `binaries/data/mods/public/art/terrains/biome-temperate-europe/temperate_grass_02.xml`).
  Terrain-dependent passability is computed from **water depth, slope and
  distance to shore**, not from the texture
  (`source/simulation2/components/CCmpPathfinder.cpp:661-693`). Two
  biomes with different ground textures are mechanically identical for
  movement.
- **Stone and metal amounts.** The biome only picks the rock/ore *actor*.
  Amounts are uniform across all biomes: small = 1000 (`template_gaia_rock.xml:24-27`,
  `template_gaia_ore.xml:24-27`), large = 5000 (`template_gaia_rock_large.xml:11-12`,
  `template_gaia_ore_large.xml:11-12`). How many mines spawn is decided by the
  map script (`mainland.js:138-148`), not the biome.
- **Animal and fruit-bush group counts.** `mainland.js:180-202` places
  `3 * numPlayers` groups of main-huntable animals (5-7 each), `3 * numPlayers`
  of secondary (2-3 each) and `3 * numPlayers` fruit-bush groups (5-7 each)
  for every biome. The biome changes only the species.
- **Water level.** Set by the map script (e.g. `unknown.js:64`), defaulted to
  `SEA_LEVEL - 0.1` if the biome JSON leaves it unset (`rmgen/RandomMap.js:484-485`).

## Food values (uniform across biomes)

Meat (per animal, `food.meat`; base `Max=100`, `MaxGatherers=8`,
`KillBeforeGather=true` at `template_unit_fauna_hunt.xml:7-10`):

| Species | Meat | Citation |
|---|---|---|
| deer, gazelle (default) | 100 | inherit `template_unit_fauna_hunt.xml:8` |
| bear (brown) | 300 | `template_unit_fauna_hunt_defensive_bear.xml` |
| chicken | 40 | `gaia/fauna_chicken.xml:22` |
| peacock | 50 | `gaia/fauna_peacock.xml:22` |
| rabbit | 50 | `gaia/fauna_rabbit.xml:22` |
| goat | 70 | `gaia/fauna_goat.xml:28` |
| sheep | 100 | `gaia/fauna_sheep.xml:28` |
| wildebeest, zebra | 150 | `gaia/fauna_wildebeest.xml:19`, `gaia/fauna_zebra.xml:19` |
| camel, horse, muskox | 200 | `gaia/fauna_camel.xml:22`, `gaia/fauna_horse.xml:22`, `gaia/fauna_muskox.xml:19` |
| walrus | 300 | `gaia/fauna_walrus.xml:32` |
| giraffe | 350 | `gaia/fauna_giraffe.xml:19` |
| elephant (asian) | 650 | `gaia/fauna_elephant_asian.xml:33` |
| elephant (african bush) | 800 | `gaia/fauna_elephant_african_bush.xml:33` |

Fish: both species used by biomes (`generic`, `tuna`) have `Max=1000
food.fish`, `MaxGatherers=4`, and respawn
(`template_gaia_fish.xml:28-37`; `gaia/fish/tuna.xml` only changes the actor). Fruit bushes: `food.fruit`, `MaxGatherers=8`, regrows 1 per
6 s (`template_gaia_fruit.xml:22-30`); berry bushes = 200
(`gaia/fruit/berry_01.xml:7`, `berry_02.xml:7`, `berry_05.xml:7`), grapes = 200
(`gaia/fruit/grapes.xml:7`), apple and date palms = 400
(`gaia/fruit/apple.xml:10`, `gaia/fruit/date.xml:11`).

## Wood per tree species

All trees are `wood.tree` (`template_gaia_tree.xml`). The species used by
biomes (explicit `Max`, gathered at 8 gatherers unless noted):

| Wood | Species (biome) |
|---|---|
| 50 | fir_sapling (alpine), bush_tropic (nubia, savanna) |
| 100 | cretan_date_palm_short (aegean, sahara), bush_steppe_01/02/03 and bush_temperate (steppe, savanna — bush mixin `mixins/bush.xml`, 4 gatherers) |
| 200 | oak/oak_holly/oak_hungarian/pine/pine_black/pine_maritime (temperate, alpine, arctic pine_w/fir_winter, autumn), cypress_wild, cretan_date_palm_tall, juniper_prickly, date_palm, medit_fan_palm, poplar_lombardy, carob, elm, acacia, palm_doum, palm_palmyra, palm_tropical, temperate_winter |
| 300 | maple, euro_birch, cretan_date_palm_patch (sahara tree4/5) |
| 400 | olive (aegean tree3) |
| 500 | teak, strangler (india) |
| 600 | banyan (india), baobab (savanna) |
| 1000 | baobab_4_dead (nubia tree3) |
| 1200 | baobab_3_mature (nubia tree3/4/5) |

Note the outlier: the steppe's five "tree" templates are bush templates at
~100 wood each, so `generic/steppe` forests are worth an order of magnitude
less wood per tree than `generic/india` (500-600 per tree) at a similar tree
count.

## Per-biome special cases hardcoded in map scripts

Some map scripts branch on `currentBiome()` beyond the biome JSON:

- **`generic/india`**: decorations ×8 (`planetm = 8`) on most random maps —
  `mainland.js:156-159`, `unknown.js:1071`, `islands.js:352`, `continent.js:215`,
  `flood.js:294`, `rivers.js:22,225`, and others. Purely decorative.
- **`generic/savanna`**: dirt/grass patch count ×2 or ×3 on several maps —
  `unknown.js:930`, `islands.js:200,218`, `migration.js:198,275,324`,
  `flood.js:238`, `island_stronghold.js:357`, `snowflake_searocks.js:303`,
  `land_grab.js:204`. Cosmetic terrain painting.
- **Fish tweaks per biome** on `harbor.js:364-370`, `hells_pass.js:268-274`,
  `lions_den.js:448-475` (arctic/alpine/savanna/autumn/aegean/india variants);
  `island_stronghold.js:339` for sahara; `flood.js:24` for temperate.
- **`generic/india` bush count** in `foothills.js:197` (cosmetic).

None of these change resource amounts; they adjust decorative density or fish
placement on those specific maps.

## Determinism

`-autostart-biome` defaults to the string `"random"`
(`binaries/data/mods/public/autostart/cmd_line_args.js:124`), which is resolved at launch by
`GameSettings.pickRandomItems()` via the unseeded GUI `pickRandom`
(`binaries/data/mods/public/gamesettings/attributes/Biome.js:82-88`), outside the seeded map RNG.
Same seed + biome left random ⇒ different biomes across runs. Always pin it —
see `docs/pyrogenesis_cli.md` §4.

## Index

Generic biomes (usable on every `SupportedBiomes: "generic/"` map):

| ID | Title | One-liner |
|---|---|---|
| `generic/temperate` | Temperate | Dense oak/pine forests (200 wood/tree), deer+sheep, apple stragglers |
| `generic/aegean` | Aegean-Anatolian | Mediterranean mix: olive (400) possible, deer+sheep, grapes or berries |
| `generic/alpine` | Subalpine | Rocky conifer slopes, goats (70) + deer, dense forests (85 % in forests) |
| `generic/arctic` | Arctic | Snow terrain, muskox (200) + walrus (300), 60 % forested |
| `generic/autumn` | Rhine Valley (Fall) | Temperate-like density with autumn species, deer+sheep |
| `generic/india` | India | Few trees but banyan/teak/strangler (500-600 wood), peacocks (50), elephants (650), date palms (400 fruit) |
| `generic/nubia` | Nubia | Sparse acacia + huge baobabs (1000-1200), zebra/wildebeest/giraffe/elephant herds, date palms |
| `generic/sahara` | Sahara | Semi-desert date-palm clumps, camels (200), dates (400 fruit) |
| `generic/savanna` | Sudanian Savanna | Baobab (600) + acacia, elephant secondary (800), berries |
| `generic/steppe` | Eurasian Steppe | No real trees — bushes at ~100 wood, horses (200), fewest wood |

Sub-biomes (each only on its own map family; JSON-only, no JS):

| ID | Map (`SupportedBiomes`) | File |
|---|---|---|
| `alpine/winter`, `alpine/late_spring` | `random/alpine_lakes` (`"alpine/"`, `alpine_lakes.json`) | [alpine_winter](alpine_winter.md), [alpine_late_spring](alpine_late_spring.md) |
| `fields_of_meroe/dry`, `fields_of_meroe/rainy` | `random/fields_of_meroe` | [fields_of_meroe_dry](fields_of_meroe_dry.md), [fields_of_meroe_rainy](fields_of_meroe_rainy.md) |
| `gulf_of_bothnia/frozen_lake`, `gulf_of_bothnia/late_spring`, `gulf_of_bothnia/winter` | `random/gulf_of_bothnia` | [gulf_of_bothnia_frozen_lake](gulf_of_bothnia_frozen_lake.md), [gulf_of_bothnia_late_spring](gulf_of_bothnia_late_spring.md), [gulf_of_bothnia_winter](gulf_of_bothnia_winter.md) |
| `persian_highlands/spring`, `persian_highlands/summer` | `random/persian_highlands` | [persian_highlands_spring](persian_highlands_spring.md), [persian_highlands_summer](persian_highlands_summer.md) |

## Related docs

- `docs/pyrogenesis_cli.md` — command line, incl. the `-autostart-biome`
  determinism note (§4).
- `docs/game_description/mechanics/resources_and_gathering.md` — gather
  rates, dropsites, food subtypes.
- `docs/game_description/generic/` — entity data for units/buildings (gaia
  entities are covered by the tables above instead).
