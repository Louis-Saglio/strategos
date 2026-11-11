# ship_fire

Trained by **4** civilisations. Generic (non-civ-specific) unit of 0 A.D. 0.28.0 — see `docs/game_description/generic/units/README.md` for the method.

Generic stats resolved from the shared template `simulation/templates/template_unit_ship_fire` (deepest template common to all civilisation variants; variants may override, see below).

## Guide

The Fire Ship is a cheap naval counter unit: train it at the dock once the Town phase is reached when the enemy fields ships (especially Ram Ships) or coastal buildings, since its flames deal a 3× bonus against both. At 100 wood / 50 metal it is cheap to field, though the metal cost is premium and makes it harder to mass; its low pierce armor (1) means it relies on its high speed (16 m/s walk) to close the 15 m gap before being shot down. It can be ignited mid-battle to cause area damage, after which it cannot be repaired — treat it as a one-way weapon rather than a fleet unit to preserve.

## Basic stats

- **Generic name:** Fire Ship
- **Health:** 800 HP
- **Armor:** 5 hack / 1 pierce / 3 crush
- **Attack:** Melee "Flames" — range 15 m — prepare 0.1 s — repeat 0.8 s — bonus 3× vs Ship Building — preferred Ship
- **Speed:** walk 16 m/s, run 26.72 m/s
- **Vision:** 80 m
- **Cost:** 100 wood, 50 metal
- **Build time:** 18 s
- **Population:** 1
- **Classes:** Unit ConquestCritical
- **Visible classes:** Ship Warship Fireship Melee

## Civilisations that can train it

- **brit** — `units/brit/ship_fire` (crannog, dock)
- **gaul** — `units/gaul/ship_fire` (dock)
- **germ** — `units/germ/ship_fire` (dock)
- **iber** — `units/iber/ship_fire` (dock)
