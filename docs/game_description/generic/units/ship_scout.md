# ship_scout

Trained by **15** civilisations. Generic (non-civ-specific) unit of 0 A.D. 0.28.0 — see `docs/game_description/generic/units/README.md` for the method.

Generic stats resolved from the shared template `simulation/templates/template_unit_ship_warship_scout` (deepest template common to all civilisation variants; variants may override, see below).

## Guide

The Scout Ship is the cheap early naval unit trained at the dock (50 food, 50 wood, 12 s). Its role is coastal scouting — 80 m vision and fast movement (28.39 m/s run) — and light naval combat: its arrow attack carries a documented 3× bonus vs Ships, making it the counter to enemy warships rather than land units. It can also garrison up to 10 units, so it doubles as basic water transport. Build it when naval map control or water crossing matters; it is not a fighter against anything but ships.

## Basic stats

- **Generic name:** Scout Ship
- **Health:** 500 HP
- **Armor:** 4 hack / 3 pierce / 5 crush
- **Attack:** Ranged "Arrow" — damage 28 pierce — range 37 m — prepare 0.25 s — repeat 2 s — bonus 3× vs Ship — preferred Ship
- **Speed:** walk 17 m/s, run 28.39 m/s
- **Vision:** 80 m
- **Cost:** 50 food, 50 wood
- **Build time:** 12 s
- **Population:** 1
- **Classes:** Unit ConquestCritical Bireme
- **Visible classes:** Ship Warship ScoutShip Ranged

## Civilisations that can train it

- **athen** — `units/athen/ship_scout` (dock)
- **brit** — `units/brit/ship_scout` (crannog, dock)
- **cart** — `units/cart/ship_scout` (dock, super_dock)
- **gaul** — `units/gaul/ship_scout` (dock)
- **germ** — `units/germ/ship_scout` (dock)
- **han** — `units/han/ship_scout` (dock)
- **iber** — `units/iber/ship_scout` (dock)
- **kush** — `units/kush/ship_scout` (dock)
- **mace** — `units/mace/ship_scout` (dock)
- **maur** — `units/maur/ship_scout` (dock)
- **pers** — `units/pers/ship_scout` (dock)
- **ptol** — `units/ptol/ship_scout` (dock)
- **rome** — `units/rome/ship_scout` (dock)
- **sele** — `units/sele/ship_scout` (dock)
- **spart** — `units/spart/ship_scout` (dock)
