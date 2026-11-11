# temple

Buildable by **15** civilisations. Generic (non-civ-specific) building of 0 A.D. 0.28.0 — see `docs/game_description/generic/buildings/README.md` for the method.

Generic stats resolved from the shared template `simulation/templates/template_structure_civic_temple` (deepest template common to all civilisation variants; variants may override, see below).

## Guide

The temple is the healing hub: it trains healers (`units/{civ}/support_healer_b`) and heals garrisoned units at +3 HP/s, so build it to keep an army fighting without sending units home. It costs 300 stone, a scarce premium resource, and requires `phase_town`, making it a deliberate mid-game investment rather than an opener. For several civilisations (e.g. cart, gaul, germ, kush) it also trains champion units, doubling as an elite military production building.

## Basic stats

- **Generic name:** Temple
- **Health:** 2000 HP
- **Armor:** 24 hack / 30 pierce / 3 crush
- **Cost:** 300 stone
- **Build time:** 200 s
- **Territory influence:** radius 40 m, weight 30000
- **Garrison:** 20 slots (+3/s heal)
- **Vision:** 40 m
- **Capture points:** 500
- **Build territory:** own
- **Placement:** land
- **Requirements:** phase_town
- **Trains:** units/{civ}/support_healer_b
- **Classes:** Structure ConquestCritical
- **Visible classes:** Civic Town Temple
- **Footprint:** Square 19 m × 31.5 m (height 12 m)
- **Obstruction:** Static 17.5 m × 30 m

## Civilisations that can build it

- **athen** — `structures/athen/temple`
- **brit** — `structures/brit/temple`
- **cart** — `structures/cart/temple`
- **gaul** — `structures/gaul/temple`
- **germ** — `structures/germ/temple`
- **han** — `structures/han/temple`
- **iber** — `structures/iber/temple`
- **kush** — `structures/kush/temple`
- **mace** — `structures/mace/temple`
- **maur** — `structures/maur/temple`
- **pers** — `structures/pers/temple`
- **ptol** — `structures/ptol/temple`
- **rome** — `structures/rome/temple`
- **sele** — `structures/sele/temple`
- **spart** — `structures/spart/temple`

## Civilisation-specific overrides

These civilisations override the generic stats above (only differing values are listed):

- **athen** — `structures/athen/temple`
  - trains units/{civ}/support_healer_b units/{civ}/hero_hippocrates
  - footprint Square 19 m × 28 m
- **brit** — `structures/brit/temple`
  - cost 300 wood
  - footprint Square 24.5 m × 24.5 m (height 8 m)
- **cart** — `structures/cart/temple`
  - trains units/{civ}/support_healer_b units/{civ}/champion_infantry units/{civ}/champion_cavalry
  - footprint Square 19 m × 32 m
- **gaul** — `structures/gaul/temple`
  - cost 300 wood
  - trains units/{civ}/support_healer_b units/{civ}/champion_fanatic
  - footprint Square 24.5 m × 24.5 m (height 8 m)
- **germ** — `structures/germ/temple`
  - cost 150 wood, 150 stone
  - trains units/{civ}/support_healer_b units/{civ}/champion_healer
  - footprint Square 30 m × 24 m
- **han** — `structures/han/temple`
  - footprint Square 25 m × 28 m
- **iber** — `structures/iber/temple`
  - footprint Square 24 m × 24 m (height 10 m)
- **kush** — `structures/kush/temple`
  - trains units/{civ}/support_healer_b units/{civ}/champion_infantry_apedemak
  - footprint Square 24 m × 36 m
- **maur** — `structures/maur/temple`
  - footprint Square 16 m × 30.5 m
- **pers** — `structures/pers/temple`
  - footprint Square 19 m × 19 m
- **ptol** — `structures/ptol/temple`
  - footprint Square 19 m × 37 m
- **spart** — `structures/spart/temple`
  - footprint Square 19 m × 37 m
