# stable

Buildable by **15** civilisations. Generic (non-civ-specific) building of 0 A.D. 0.28.0 — see `docs/game_description/generic/buildings/README.md` for the method.

Generic stats resolved from the shared template `simulation/templates/template_structure_military_stable` (deepest template common to all civilisation variants; variants may override, see below).

## Guide

The Stable is the cavalry production building: it trains all basic cavalry types (axeman, swordsman, spearman, javelineer, archer) and, per its tooltip, researches cavalry technologies. Build it when a strategy calls for cavalry — for most civilisations it is the only source of mounted units, and some variants (e.g. cart, germ) are restricted to a subset of cavalry types (see overrides below). It is available from the Village phase, costs 200 wood plus 50 stone, a scarce premium resource (250 wood for brit, gaul, maur), and takes 120 s to build, so it is an early-to-mid game investment. With only 500 capture points it is easy to capture, so protect it or garrison up to 10 units inside.

## Basic stats

- **Generic name:** Stable
- **Health:** 2000 HP
- **Armor:** 24 hack / 35 pierce / 3 crush
- **Cost:** 200 wood, 50 stone
- **Build time:** 120 s
- **Territory influence:** radius 50 m, weight 40000
- **Garrison:** 10 slots
- **Vision:** 32 m
- **Capture points:** 500
- **Build territory:** own
- **Placement:** land
- **Requirements:** phase_village
- **Trains:** units/{civ}/cavalry_axeman_b units/{civ}/cavalry_swordsman_b units/{civ}/cavalry_spearman_b units/{civ}/cavalry_javelineer_b units/{civ}/cavalry_archer_b units/{civ}/champion_cavalry units/{civ}/champion_cavalry_spearman units/{civ}/champion_cavalry_swordsman units/{civ}/champion_cavalry_javelineer units/{civ}/champion_cavalry_archer units/{civ}/champion_chariot
- **Classes:** Structure ConquestCritical
- **Visible classes:** Military Village Stable
- **Footprint:** Square 25 m × 25 m (height 12 m)
- **Obstruction:** Static 20 m × 20 m

## Civilisations that can build it

- **athen** — `structures/athen/stable`
- **brit** — `structures/brit/stable`
- **cart** — `structures/cart/stable`
- **gaul** — `structures/gaul/stable`
- **germ** — `structures/germ/stable`
- **han** — `structures/han/stable`
- **iber** — `structures/iber/stable`
- **kush** — `structures/kush/stable`
- **mace** — `structures/mace/stable`
- **maur** — `structures/maur/stable`
- **pers** — `structures/pers/stable`
- **ptol** — `structures/ptol/stable`
- **rome** — `structures/rome/stable`
- **sele** — `structures/sele/stable`
- **spart** — `structures/spart/stable`

## Civilisation-specific overrides

These civilisations override the generic stats above (only differing values are listed):

- **brit** — `structures/brit/stable`
  - cost 250 wood
- **cart** — `structures/cart/stable`
  - trains units/{civ}/cavalry_javelineer_b
- **gaul** — `structures/gaul/stable`
  - cost 250 wood
- **germ** — `structures/germ/stable`
  - trains units/{civ}/cavalry_spearman_b units/{civ}/cavalry_javelineer_b
- **kush** — `structures/kush/stable`
  - footprint Square 24 m × 26 m (height 10 m)
- **maur** — `structures/maur/stable`
  - cost 250 wood
- **pers** — `structures/pers/stable`
  - footprint Square 22 m × 20 m (height 5 m)
