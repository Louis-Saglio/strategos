# ship_siege

Trained by **5** civilisations. Generic (non-civ-specific) unit of 0 A.D. 0.28.0 — see `docs/game_description/generic/units/README.md` for the method.

Generic stats resolved from the shared template `simulation/templates/template_unit_ship_warship_siege` (deepest template common to all civilisation variants; variants may override, see below).

## Guide

The Siege Ship is the navy's artillery piece: its 220 crush ranged attack at 80 m range (with 100 crush splash) prefers Ships and Structures, making it the right choice for destroying coastal buildings and enemy fleets from a distance. It can also garrison up to 50 Siege-class units, doubling as the transport that carries land siege engines across water. It requires the City phase and is trained at the dock for 200 wood, 200 metal and 3 population — metal-intensive, so a premium late-game investment that is hard to mass rather than an early raider.

## Basic stats

- **Generic name:** Siege Ship
- **Health:** 1600 HP
- **Armor:** 2 hack / 5 pierce / 4 crush
- **Attack:** Ranged "Stone" — damage 220 crush — range 80 m — prepare 2 s — repeat 4 s — preferred Ship Human Structure
- **Speed:** walk 12 m/s, run 20.04 m/s
- **Vision:** 100 m
- **Cost:** 200 wood, 200 metal
- **Build time:** 28 s
- **Population:** 3
- **Classes:** Unit ConquestCritical Quinquereme
- **Visible classes:** Ship Warship NavalSiege Heavy

## Civilisations that can train it

- **cart** — `units/cart/ship_siege` (dock, super_dock)
- **han** — `units/han/ship_siege` (dock)
- **ptol** — `units/ptol/ship_siege` (dock)
- **rome** — `units/rome/ship_siege` (dock)
- **sele** — `units/sele/ship_siege` (dock)
