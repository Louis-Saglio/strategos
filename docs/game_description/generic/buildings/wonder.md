# wonder

Buildable by **15** civilisations. Generic (non-civ-specific) building of 0 A.D. 0.28.0 — see `docs/game_description/generic/buildings/README.md` for the method.

Generic stats resolved from the shared template `simulation/templates/template_structure_wonder` (deepest template common to all civilisation variants; variants may override, see below).

## Guide

The Wonder is a late-game prestige structure: it produces nothing and trains nothing, so a bot should only build it when its heavy cost — 1500 stone and 1000 metal, both scarce premium resources, plus 1000 wood — and 1000 s build time are spare after a city-phase economy and army are secured. Its payoff is territorial and defensive — it is a territory root with the maximum influence weight (radius 100 m, weight 65535), letting you plant a new stronghold far from your Civic Centre. It requires phase_city; its 5000 HP, high armor and 50-slot garrison with +5/s healing make it a durable last-stand anchor rather than an expansion tool.

## Basic stats

- **Generic name:** Wonder
- **Health:** 5000 HP
- **Armor:** 19 hack / 25 pierce / 3 crush
- **Cost:** 1000 wood, 1500 stone, 1000 metal
- **Build time:** 1000 s
- **Territory influence:** radius 100 m, weight 65535, territory root
- **Garrison:** 50 slots (+5/s heal)
- **Vision:** 72 m
- **Capture points:** 2000
- **Build territory:** own
- **Placement:** land
- **Requirements:** phase_city
- **Classes:** Structure ConquestCritical
- **Visible classes:** City Wonder
- **Footprint:** Square 34 m × 34 m (height 10 m)
- **Obstruction:** Static 30 m × 30 m

## Civilisations that can build it

- **athen** — `structures/athen/wonder`
- **brit** — `structures/brit/wonder`
- **cart** — `structures/cart/wonder`
- **gaul** — `structures/gaul/wonder`
- **germ** — `structures/germ/wonder`
- **han** — `structures/han/wonder`
- **iber** — `structures/iber/wonder`
- **kush** — `structures/kush/wonder`
- **mace** — `structures/mace/wonder`
- **maur** — `structures/maur/wonder`
- **pers** — `structures/pers/wonder`
- **ptol** — `structures/ptol/wonder`
- **rome** — `structures/rome/wonder`
- **sele** — `structures/sele/wonder`
- **spart** — `structures/spart/wonder`

## Civilisation-specific overrides

These civilisations override the generic stats above (only differing values are listed — every civilisation overrides the footprint):

- **athen** — `structures/athen/wonder`
  - footprint Square 28 m × 58 m (height 12 m)
- **brit** — `structures/brit/wonder`
  - footprint Circle r 30 m (height 20 m)
- **cart** — `structures/cart/wonder`
  - footprint Square 29 m × 59 m (height 12 m)
- **gaul** — `structures/gaul/wonder`
  - footprint Square 41 m × 42 m
- **germ** — `structures/germ/wonder`
  - footprint Circle r 20 m (height 20 m)
- **han** — `structures/han/wonder`
  - footprint Square 48 m × 43 m (height 14 m)
- **iber** — `structures/iber/wonder`
  - footprint Square 43 m × 43 m (height 14 m)
- **kush** — `structures/kush/wonder`
  - footprint Square 48 m × 66 m (height 20 m)
- **mace** — `structures/mace/wonder`
  - footprint Square 48 m × 58 m (height 12 m)
- **maur** — `structures/maur/wonder`
  - footprint Circle r 31 m
- **pers** — `structures/pers/wonder`
  - footprint Square 62 m × 62 m
- **ptol** — `structures/ptol/wonder`
  - footprint Square 48 m × 66 m (height 20 m)
- **rome** — `structures/rome/wonder`
  - footprint Square 38 m × 46 m (height 12 m)
- **sele** — `structures/sele/wonder`
  - footprint Square 29 m × 59 m (height 12 m)
- **spart** — `structures/spart/wonder`
  - footprint Square 35 m × 64 m (height 12 m)
