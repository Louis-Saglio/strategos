# dock

Buildable by **15** civilisations. Generic (non-civ-specific) building of 0 A.D. 0.28.0 — see `docs/game_description/generic/buildings/README.md` for the method.

Generic stats resolved from the shared template `simulation/templates/template_structure_military_dock` (deepest template common to all civilisation variants; variants may override, see below).

## Guide

The Dock is the entry point to everything naval: for 200 wood, an abundant resource, it is easy to afford and must be placed on a shoreline, from where it trains the full ship roster — `ship_fishing` (food economy), `ship_merchant` (trade), and warships (`ship_scout`, `ship_arrow`, `ship_ram`, `ship_fire`, `ship_siege`). Per its template, it also serves as a trade destination (Market component), a dropsite for all four resources, and the researcher for ship and fishing technologies. Build it only on maps with usable water: its economy and military value depend entirely on ships.

## Basic stats

- **Generic name:** Dock
- **Health:** 2500 HP
- **Armor:** 24 hack / 35 pierce / 3 crush
- **Cost:** 200 wood
- **Build time:** 150 s
- **Vision:** 40 m
- **Capture points:** 500
- **Build territory:** own ally neutral
- **Placement:** shore
- **Trains:** units/{civ}/ship_fishing units/{civ}/ship_merchant units/{civ}/ship_scout units/{civ}/ship_arrow units/{civ}/ship_ram units/{civ}/ship_fire units/{civ}/ship_siege
- **Classes:** Structure ConquestCritical
- **Visible classes:** Military Economic Naval Trade Village Dock
- **Footprint:** Square 18 m × 18 m (height 8 m)
- **Obstruction:** Static 18 m × 18 m

## Civilisations that can build it

- **athen** — `structures/athen/dock`
- **brit** — `structures/brit/dock`
- **cart** — `structures/cart/dock`
- **gaul** — `structures/gaul/dock`
- **germ** — `structures/germ/dock`
- **han** — `structures/han/dock`
- **iber** — `structures/iber/dock`
- **kush** — `structures/kush/dock`
- **mace** — `structures/mace/dock`
- **maur** — `structures/maur/dock`
- **pers** — `structures/pers/dock`
- **ptol** — `structures/ptol/dock`
- **rome** — `structures/rome/dock`
- **sele** — `structures/sele/dock`
- **spart** — `structures/spart/dock`

## Civilisation-specific overrides

These civilisations override the generic stats above (only differing values are listed):

- **athen** — `structures/athen/dock`
  - trains units/{civ}/ship_fishing units/{civ}/ship_merchant units/{civ}/ship_scout units/{civ}/ship_arrow units/{civ}/ship_ram units/{civ}/champion_marine_dock units/{civ}/infantry_archer_b_dock
  - footprint Square 26 m × 30 m
- **brit** — `structures/brit/dock`
  - footprint Square 12 m × 24 m
- **cart** — `structures/cart/dock`
  - cost 150 wood
  - footprint Square 34 m × 23 m
- **gaul** — `structures/gaul/dock`
  - footprint Square 12 m × 24 m
- **germ** — `structures/germ/dock`
  - footprint Square 22 m × 22 m
- **han** — `structures/han/dock`
  - footprint Square 26 m × 32 m
- **iber** — `structures/iber/dock`
  - footprint Square 16 m × 26 m
- **kush** — `structures/kush/dock`
  - footprint Square 24 m × 22 m
- **mace** — `structures/mace/dock`
  - footprint Square 26 m × 30 m
- **maur** — `structures/maur/dock`
  - footprint Square 30 m × 25 m
- **pers** — `structures/pers/dock`
  - footprint Square 23.5 m × 16 m
- **ptol** — `structures/ptol/dock`
  - footprint Square 30 m × 34 m
- **rome** — `structures/rome/dock`
  - footprint Square 24 m × 28 m
- **sele** — `structures/sele/dock`
  - footprint Square 26 m × 30 m
- **spart** — `structures/spart/dock`
  - footprint Square 24 m × 30 m
