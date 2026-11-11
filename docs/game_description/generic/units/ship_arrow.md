# ship_arrow

Trained by **15** civilisations. Generic (non-civ-specific) unit of 0 A.D. 0.28.0 — see `docs/game_description/generic/units/README.md` for the method.

Generic stats resolved from the shared template `simulation/templates/template_unit_ship_warship_arrow` (deepest template common to all civilisation variants; variants may override, see below).

## Guide

The Arrow Ship is the standard light warship, trained at the dock, and exists to fight other ships: its attack carries a 3× bonus vs the Ship class and prefers Ship targets, making it the documented counter at sea. At 100 wood + 100 metal and 24 s build time it is metal-intensive, so a premium unit that is harder to mass; its 80 m vision suits scouting coastlines. Per its tooltip it can also garrison units for transport across water.

## Basic stats

- **Generic name:** Arrow Ship
- **Health:** 1000 HP
- **Armor:** 3 hack / 5 pierce / 1 crush
- **Attack:** Ranged "Arrow" — damage 32 pierce — range 56.25 m — prepare 0.25 s — repeat 1 s — bonus 3× vs Ship — preferred Ship Human
- **Speed:** walk 14 m/s, run 23.38 m/s
- **Vision:** 80 m
- **Cost:** 100 wood, 100 metal
- **Build time:** 24 s
- **Population:** 1
- **Classes:** Unit ConquestCritical Trireme
- **Visible classes:** Ship Warship ArrowShip Ranged

## Civilisations that can train it

- **athen** — `units/athen/ship_arrow` (dock)
- **brit** — `units/brit/ship_arrow` (crannog, dock)
- **cart** — `units/cart/ship_arrow` (dock, super_dock)
- **gaul** — `units/gaul/ship_arrow` (dock)
- **germ** — `units/germ/ship_arrow` (dock)
- **han** — `units/han/ship_arrow` (dock)
- **iber** — `units/iber/ship_arrow` (dock)
- **kush** — `units/kush/ship_arrow` (dock)
- **mace** — `units/mace/ship_arrow` (dock)
- **maur** — `units/maur/ship_arrow` (dock)
- **pers** — `units/pers/ship_arrow` (dock)
- **ptol** — `units/ptol/ship_arrow` (dock)
- **rome** — `units/rome/ship_arrow` (dock)
- **sele** — `units/sele/ship_arrow` (dock)
- **spart** — `units/spart/ship_arrow` (dock)

## Civilisation-specific overrides

These civilisations override the generic stats above (only differing values are listed):

- **brit** — `units/brit/ship_arrow`
  - health 1200 HP
  - walk 12.6 m/s
  - run 21.04 m/s
- **gaul** — `units/gaul/ship_arrow`
  - health 1200 HP
  - walk 12.6 m/s
  - run 21.04 m/s
- **iber** — `units/iber/ship_arrow`
  - health 1200 HP
  - walk 12.6 m/s
  - run 21.04 m/s
  - build time 40 s
- **maur** — `units/maur/ship_arrow`
  - health 1200 HP
  - walk 12.6 m/s
  - run 21.04 m/s
  - build time 40 s
