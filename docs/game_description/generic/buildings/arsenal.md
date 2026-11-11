# arsenal

Buildable by **15** civilisations. Generic (non-civ-specific) building of 0 A.D. 0.28.0 — see `docs/game_description/generic/buildings/README.md` for the method.

Generic stats resolved from the shared template `simulation/templates/template_structure_military_arsenal` (deepest template common to all civilisation variants; variants may override, see below).

## Guide

The Arsenal is the City-phase production building for siege engines: rams, towers and packed artillery (ballista, onager, lithobolos, scorpio, oxybeles, polybolos), plus the Champion Infantry Crossbowman for civilisations that have one. Build it when the strategy calls for anti-building firepower, since rams and stone throwers are what break enemy fortifications; at 300 wood (an abundant resource) it is easy to afford, gated behind `phase_city` with a 180 s build time. Civilisation overrides matter: germ gets a covered ram, han gets the mangonel instead of most bolt shooters.

## Basic stats

- **Generic name:** Arsenal
- **Health:** 2000 HP
- **Armor:** 24 hack / 35 pierce / 3 crush
- **Cost:** 300 wood
- **Build time:** 180 s
- **Territory influence:** radius 38 m, weight 40000
- **Garrison:** 5 slots
- **Vision:** 40 m
- **Capture points:** 500
- **Build territory:** own
- **Placement:** land
- **Requirements:** phase_city
- **Trains:** units/{civ}/champion_infantry_crossbowman units/{civ}/siege_scorpio_packed units/{civ}/siege_polybolos_packed units/{civ}/siege_oxybeles_packed units/{civ}/siege_onager_packed units/{civ}/siege_lithobolos_packed units/{civ}/siege_ballista_packed units/{civ}/siege_ram units/{civ}/siege_tower
- **Classes:** Structure ConquestCritical
- **Visible classes:** Military City Arsenal
- **Footprint:** Square 30 m × 30 m (height 12 m)
- **Obstruction:** Static 29 m × 29 m

## Civilisations that can build it

- **athen** — `structures/athen/arsenal`
- **brit** — `structures/brit/arsenal`
- **cart** — `structures/cart/arsenal`
- **gaul** — `structures/gaul/arsenal`
- **germ** — `structures/germ/arsenal`
- **han** — `structures/han/arsenal`
- **iber** — `structures/iber/arsenal`
- **kush** — `structures/kush/arsenal`
- **mace** — `structures/mace/arsenal`
- **maur** — `structures/maur/arsenal`
- **pers** — `structures/pers/arsenal`
- **ptol** — `structures/ptol/arsenal`
- **rome** — `structures/rome/arsenal`
- **sele** — `structures/sele/arsenal`
- **spart** — `structures/spart/arsenal`

## Civilisation-specific overrides

These civilisations override the generic stats above (only differing values are listed):

- **germ** — `structures/germ/arsenal`
  - trains units/{civ}/siege_ram units/germ/siege_ram_covered
- **han** — `structures/han/arsenal`
  - trains units/{civ}/siege_ram units/{civ}/siege_tower units/{civ}/siege_mangonel_packed
