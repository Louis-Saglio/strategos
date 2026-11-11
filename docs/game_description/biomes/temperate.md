# Temperate — biome `generic/temperate` — 0 A.D. 0.28.0

> "Lush grasslands carpet the land, in places giving way to magnificent and
> diverse broadleaf forests. Poplars, pines, beeches and oaks all vie for
> supremacy but this root-war is a never-ending struggle. Numerous apple trees
> dot the land, deer and sheep gorge themselves on this years fallen fruit."
> (`binaries/data/mods/public/maps/random/rmbiome/generic/temperate.json:2-5`)

Command line: `-autostart-biome=generic/temperate`. Supported by every map with
`SupportedBiomes: "generic/"` (e.g. `mainland.json:7`). This is the biome the
harness smoke test uses.

## Bot-relevant summary

| Aspect | Value |
|---|---|
| Trees | `min 1000 – max 3000`, scaled by map size; **70 % in forests, 30 % stragglers** (`temperate.json:73-79`) |
| Wood per tree | 200 (oak/pine species; maple 300) — see wood table in [README](README.md) |
| Stragglers (`tree3`) | **`gaia/fruit/apple` — food (400 `food.fruit`), not wood** (`temperate.json:60`, `mainland.js:206-207`) |
| Fruit bushes | `berry_01` (200, regrows) (`temperate.json:51`) |
| Huntable | deer (100 meat) + sheep (100); chicken (40) near base |
| Fish | `gaia/fish/generic` (1000 `food.fish`) — no water on mainland, unused there |
| Stone / metal | standard amounts (1000 / 5000); templates purely visual |

The densest wood biome together with `generic/autumn` (same counts), at a
moderate 200 wood/tree. Apple stragglers are a small bonus food source.

## Environment (visual only)

`temperate.json:6-30`. No `SkySet` → sky set stays random
(`randombiome.js:20`). Sun 1.032/0.99/0.866 at elevation 0.846, rotation
-0.488; water brownish, murkiness 0.97, waviness 5; almost no fog (thickness
0, factor 0.0024); HDR postproc, saturation 0.95, contrast 1.05, bloom 0.16.

## Terrains (visual only)

`temperate.json:31-49`, then randomized by `setupBiome_temperate`
(`temperate.js:3-22`): two ground variants — `temperate_grass_04` +
`temperate_forestfloor_01/02` + `temperate_grass_dirt_02`/`_03`/`_04`/`_01`
tiers, or `temperate_grass_05` + autumn forest floors
(`temperate_forestfloor_02_autumn`/`01_autumn`) + `temperate_grass_dirt_01`/
`_02`/`temperate_grass_mud_01`/`temperate_grass_02`. Cliffs
`temperate_cliff_01/02`, hills `temperate_rocks_dirt_01`/
`temperate_grass_dirt_03`, dirt `temperate_mud_01`/`temperate_grass_mud_01`,
roads `temperate_paving_03`, shore/water mud variants. Terrain textures have no
gameplay stats (see README).

## Gaia templates

`temperate.json:50-61` + JS picks (`temperate.js:24-52`):

- `tree1`/`tree2` (forests): random of `oak`+`oak_hungarian`, `oak_holly`+
  `maple`, `oak_hungarian`+`oak_holly` (200 each, maple 300).
- `tree4`/`tree5` (forests): random of `pine`+`pine_maritime`, `pine`+`pine`,
  `pine_maritime`+`pine_maritime` (200 each).
- `tree3` (stragglers only): `gaia/fruit/apple` (400 `food.fruit`).
- `fruitBush` `berry_01` (200), `startingAnimal` chicken (40),
  `mainHuntableAnimal` deer (100), `secondaryHuntableAnimal` sheep (100),
  `fish` generic.
- `stoneLarge` `temperate_large_02` (5000), `stoneSmall` `temperate_small`
  (1000), `metalLarge` `temperate_01` (5000), `metalSmall`
  `temperate_small_01` (1000).

## On `random/mainland`

No biome-specific branches (`currentBiome()` is never checked for temperate in
`mainland.js`). At map size 192: ≈1333 trees → ≈933 in ~13 forests, ≈400
stragglers, of which `tree3` apples appear at ~25 % of the straggler groups
(`mainland.js:206-207`). Fruit-bush groups: 3 per player × 5-7 bushes
(`mainland.js:194-202`). Total stone on the map: ~27–29k; total metal:
~39–43k (large mines 5000, small 1000).
