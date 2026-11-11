# market

Buildable by **15** civilisations. Generic (non-civ-specific) building of 0 A.D. 0.28.0 — see `docs/game_description/generic/buildings/README.md` for the method.

Generic stats resolved from the shared template `simulation/templates/template_structure_economic_market` (deepest template common to all civilisation variants; variants may override, see below).

## Guide

The market is the economy's resource-conversion and trade hub: its `Barter` class lets the bot exchange surplus resources, and it is the only building that trains `support_trader` units for establishing trade routes. Available from the Town phase (`phase_town`) for 300 wood, it is a mid-game investment rather than an early priority. Build one when resources are unbalanced or when trade income is wanted; its 1500 HP and 20 pierce armor make it reasonably durable but not a defensive structure.

## Basic stats

- **Generic name:** Market
- **Health:** 1500 HP
- **Armor:** 9 hack / 20 pierce / 1 crush
- **Cost:** 300 wood
- **Build time:** 150 s
- **Territory influence:** radius 40 m, weight 30000
- **Vision:** 32 m
- **Capture points:** 500
- **Build territory:** own
- **Placement:** land
- **Requirements:** phase_town
- **Trains:** units/{civ}/support_trader
- **Classes:** Structure Barter
- **Visible classes:** Economic Trade Town Market
- **Footprint:** Square 33 m × 29 m (height 8 m)
- **Obstruction:** Static 30 m × 26 m

## Civilisations that can build it

- **athen** — `structures/athen/market`
- **brit** — `structures/brit/market`
- **cart** — `structures/cart/market`
- **gaul** — `structures/gaul/market`
- **germ** — `structures/germ/market`
- **han** — `structures/han/market`
- **iber** — `structures/iber/market`
- **kush** — `structures/kush/market`
- **mace** — `structures/mace/market`
- **maur** — `structures/maur/market`
- **pers** — `structures/pers/market`
- **ptol** — `structures/ptol/market`
- **rome** — `structures/rome/market`
- **sele** — `structures/sele/market`
- **spart** — `structures/spart/market`

## Civilisation-specific overrides

These civilisations override the generic stats above (only differing values are listed):

- **brit** — `structures/brit/market`
  - footprint Square 26 m × 24 m
- **cart** — `structures/cart/market`
  - footprint Square 30 m × 28 m (height 10 m)
- **gaul** — `structures/gaul/market`
  - footprint Square 26 m × 24 m
- **germ** — `structures/germ/market`
  - footprint Square 30 m × 30 m
- **han** — `structures/han/market`
  - footprint Square 28 m × 28 m (height 10 m)
- **iber** — `structures/iber/market`
  - footprint Square 20 m × 24 m
- **kush** — `structures/kush/market`
  - footprint Square 32 m × 32 m
- **maur** — `structures/maur/market`
  - footprint Square 32 m × 32 m
- **pers** — `structures/pers/market`
  - footprint Square 26 m × 26 m
- **ptol** — `structures/ptol/market`
  - footprint Square 27 m × 27 m
- **rome** — `structures/rome/market`
  - footprint Square 36 m × 30 m
