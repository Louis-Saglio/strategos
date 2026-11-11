# farmstead

Buildable by **15** civilisations. Generic (non-civ-specific) building of 0 A.D. 0.28.0 — see `docs/game_description/generic/buildings/README.md` for the method.

Generic stats resolved from the shared template `simulation/templates/template_structure_economic_farmstead` (deepest template common to all civilisation variants; variants may override, see below).

## Guide

The Farmstead is the food-economy building: its `DropsiteFood` class lets gatherers deposit food closer to fields and bushes, and its tooltip states it is where food-gathering technologies are researched (the `gather_farming_*` tech line). At 100 wood and 45 s build time in `phase_village`, it is the cheap early investment a bot should place near farms as soon as food gathering starts. Its 20 m territory influence also helps expand buildable territory into farming areas.

## Basic stats

- **Generic name:** Farmstead
- **Health:** 900 HP
- **Armor:** 9 hack / 20 pierce / 1 crush
- **Cost:** 100 wood
- **Build time:** 45 s
- **Territory influence:** radius 20 m, weight 30000
- **Vision:** 20 m
- **Capture points:** 300
- **Build territory:** own
- **Placement:** land
- **Requirements:** phase_village
- **Classes:** Structure DropsiteFood
- **Visible classes:** Economic Village Farmstead
- **Footprint:** no shape at the generic level — every civilisation defines its own footprint (see overrides)

## Civilisations that can build it

- **athen** — `structures/athen/farmstead`
- **brit** — `structures/brit/farmstead`
- **cart** — `structures/cart/farmstead`
- **gaul** — `structures/gaul/farmstead`
- **germ** — `structures/germ/farmstead`
- **han** — `structures/han/farmstead`
- **iber** — `structures/iber/farmstead`
- **kush** — `structures/kush/farmstead`
- **mace** — `structures/mace/farmstead`
- **maur** — `structures/maur/farmstead`
- **pers** — `structures/pers/farmstead`
- **ptol** — `structures/ptol/farmstead`
- **rome** — `structures/rome/farmstead`
- **sele** — `structures/sele/farmstead`
- **spart** — `structures/spart/farmstead`

## Civilisation-specific overrides

These civilisations override the generic stats above (only differing values are listed):

- **athen** — `structures/athen/farmstead`
  - footprint Square 18 m × 13 m
- **brit** — `structures/brit/farmstead`
  - footprint Square 12 m × 12 m
- **cart** — `structures/cart/farmstead`
  - footprint Square 17 m × 19 m
- **gaul** — `structures/gaul/farmstead`
  - footprint Square 19 m × 18 m
- **germ** — `structures/germ/farmstead`
  - footprint Square 17 m × 14 m
- **han** — `structures/han/farmstead`
  - garrison 1 slots
  - footprint Square 18 m × 18 m (height 5 m)
- **iber** — `structures/iber/farmstead`
  - footprint Square 12 m × 13 m
- **kush** — `structures/kush/farmstead`
  - footprint Square 18 m × 18 m
- **mace** — `structures/mace/farmstead`
  - footprint Square 18 m × 13 m
- **maur** — `structures/maur/farmstead`
  - footprint Square 12 m × 16 m
- **pers** — `structures/pers/farmstead`
  - footprint Square 20 m × 20 m
- **ptol** — `structures/ptol/farmstead`
  - footprint Square 20 m × 18 m
- **rome** — `structures/rome/farmstead`
  - footprint Square 22 m × 18 m
- **sele** — `structures/sele/farmstead`
  - footprint Square 20 m × 17 m
- **spart** — `structures/spart/farmstead`
  - footprint Square 18 m × 13 m
