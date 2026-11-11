# forge

Buildable by **15** civilisations. Generic (non-civ-specific) building of 0 A.D. 0.28.0 — see `docs/game_description/generic/buildings/README.md` for the method.

Generic stats resolved from the shared template `simulation/templates/template_structure_military_forge` (deepest template common to all civilisation variants; variants may override, see below).

## Guide

The Forge is the research building for military upgrade technologies: its production queue researches the soldier attack (melee and ranged), soldier resistance (hack and pierce) and archer accuracy technologies, strengthening your existing army. Build it once you reach the town phase — its only requirement — and you field enough soldiers for the upgrades to pay off; at 200 wood and 120 s build time it is a mid-game investment, not an opener. It must be placed in your own territory and its 38 m territory influence expands your borders; it can garrison 1 infantry or healer.

## Basic stats

- **Generic name:** Forge
- **Health:** 2000 HP
- **Armor:** 24 hack / 35 pierce / 3 crush
- **Cost:** 200 wood
- **Build time:** 120 s
- **Territory influence:** radius 38 m, weight 30000
- **Garrison:** 1 slots
- **Vision:** 32 m
- **Capture points:** 500
- **Build territory:** own
- **Placement:** land
- **Requirements:** phase_town
- **Classes:** Structure
- **Visible classes:** Military Town Forge
- **Footprint:** Square 22 m × 22 m (height 12 m)
- **Obstruction:** Static 17 m × 17 m

## Civilisations that can build it

- **athen** — `structures/athen/forge`
- **brit** — `structures/brit/forge`
- **cart** — `structures/cart/forge`
- **gaul** — `structures/gaul/forge`
- **germ** — `structures/germ/forge`
- **han** — `structures/han/forge`
- **iber** — `structures/iber/forge`
- **kush** — `structures/kush/forge`
- **mace** — `structures/mace/forge`
- **maur** — `structures/maur/forge`
- **pers** — `structures/pers/forge`
- **ptol** — `structures/ptol/forge`
- **rome** — `structures/rome/forge`
- **sele** — `structures/sele/forge`
- **spart** — `structures/spart/forge`

## Civilisation-specific overrides

These civilisations override the generic stats above (only differing values are listed):

- **han** — `structures/han/forge`
  - footprint Square 24 m × 24 m (height 8 m)
