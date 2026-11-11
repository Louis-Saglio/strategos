# house

Buildable by **15** civilisations. Generic (non-civ-specific) building of 0 A.D. 0.28.0 — see `docs/game_description/generic/buildings/README.md` for the method.

Generic stats resolved from the shared template `simulation/templates/template_structure_civic_house` (deepest template common to all civilisation variants; variants may override, see below).

## Guide

The house is the basic population-support building: its +5 population bonus (75 wood, 30 s build time, available from phase_village) is what raises the population cap, so build houses whenever growth is blocked. Costing only wood, an abundant resource, it is cheap to mass. It also trains `support_civilian_house` units (female citizens) and offers 3 garrison slots to shelter nearby workers, while its radius-16 territory influence expands owned land.

## Basic stats

- **Generic name:** House
- **Health:** 800 HP
- **Armor:** 24 hack / 30 pierce / 3 crush
- **Cost:** 75 wood
- **Build time:** 30 s
- **Population bonus:** +5
- **Territory influence:** radius 16 m, weight 65535
- **Garrison:** 3 slots
- **Vision:** 20 m
- **Capture points:** 500
- **Build territory:** own
- **Placement:** land
- **Requirements:** phase_village
- **Trains:** units/{civ}/support_civilian_house
- **Classes:** Structure ConquestCritical
- **Visible classes:** Civic Village House
- **Footprint:** Square 13 m × 13 m (height 5 m)
- **Obstruction:** Static 11 m × 11 m

## Civilisations that can build it

- **athen** — `structures/athen/house`
- **brit** — `structures/brit/house`
- **cart** — `structures/cart/house`
- **gaul** — `structures/gaul/house`
- **germ** — `structures/germ/house`
- **han** — `structures/han/house`
- **iber** — `structures/iber/house`
- **kush** — `structures/kush/house`
- **mace** — `structures/mace/house`
- **maur** — `structures/maur/house`
- **pers** — `structures/pers/house`
- **ptol** — `structures/ptol/house`
- **rome** — `structures/rome/house`
- **sele** — `structures/sele/house`
- **spart** — `structures/spart/house`

## Civilisation-specific overrides

These civilisations override the generic stats above (only differing values are listed):

- **athen** — `structures/athen/house`
  - health 1200 HP
  - cost 150 wood
  - build time 50 s
  - population +10
  - territory radius 20 m, weight 40000
  - garrison 6 slots
  - footprint Square 16 m × 16 m
- **brit** — `structures/brit/house`
  - footprint Circle r 6 m (square footprint disabled)
- **cart** — `structures/cart/house`
  - health 1200 HP
  - cost 150 wood
  - build time 50 s
  - population +10
  - territory radius 20 m, weight 40000
  - garrison 6 slots
  - footprint Square 15 m × 15 m
- **germ** — `structures/germ/house`
  - health 1200 HP
  - cost 150 wood
  - build time 50 s
  - population +10
  - territory radius 20 m, weight 40000
  - garrison 6 slots
  - footprint Square 20 m × 20 m
- **han** — `structures/han/house`
  - health 1200 HP
  - cost 150 wood
  - build time 50 s
  - population +10
  - territory radius 20 m, weight 40000
  - garrison 6 slots
  - footprint Square 18 m × 18 m
- **kush** — `structures/kush/house`
  - health 1200 HP
  - cost 150 wood
  - build time 50 s
  - population +10
  - territory radius 20 m, weight 40000
  - garrison 6 slots
  - footprint Square 16 m × 16 m
- **mace** — `structures/mace/house`
  - health 1200 HP
  - cost 150 wood
  - build time 50 s
  - population +10
  - territory radius 20 m, weight 40000
  - garrison 6 slots
  - footprint Square 16 m × 16 m
- **maur** — `structures/maur/house`
  - footprint Square 11 m × 11 m
- **pers** — `structures/pers/house`
  - health 1200 HP
  - cost 150 wood
  - build time 50 s
  - population +10
  - territory radius 20 m, weight 40000
  - garrison 6 slots
  - footprint Square 15 m × 16 m
- **ptol** — `structures/ptol/house`
  - footprint Square 15 m × 14 m
- **rome** — `structures/rome/house`
  - health 1200 HP
  - cost 150 wood
  - build time 50 s
  - population +10
  - territory radius 20 m, weight 40000
  - garrison 6 slots
  - footprint Square 16 m × 16 m
- **sele** — `structures/sele/house`
  - health 1200 HP
  - cost 150 wood
  - build time 50 s
  - population +10
  - territory radius 20 m, weight 40000
  - garrison 6 slots
  - footprint Square 15 m × 16 m
- **spart** — `structures/spart/house`
  - health 1200 HP
  - cost 150 wood
  - build time 50 s
  - population +10
  - territory radius 20 m, weight 40000
  - garrison 6 slots
  - footprint Square 16 m × 16 m
