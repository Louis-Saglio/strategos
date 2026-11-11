# ship_ram

Trained by **8** civilisations. Generic (non-civ-specific) unit of 0 A.D. 0.28.0 — see `docs/game_description/generic/units/README.md` for the method.

Generic stats resolved from the shared template `simulation/templates/template_unit_ship_warship_ram` (deepest template common to all civilisation variants; variants may override, see below).

## Guide

A dedicated anti-ship melee warship: its "Naval Ram" attack (320 hack + 50 crush, preferred vs Warship) is restricted against Organic classes, so it is only useful against ships and siege, never against land units. Trained at docks (town phase required per the template) for 50 food / 100 wood plus 25 metal and 18 s, it is the counter to enemy warships once you contest the water — the metal makes it a premium investment rather than something to mass. It can also garrison up to 30 siege-class units for transport across water, per its tooltip. Requires the town phase, so plan it as a mid-game naval option rather than an opener.

## Basic stats

- **Generic name:** Ramming Ship
- **Health:** 800 HP
- **Armor:** 5 hack / 5 pierce / 1 crush
- **Attack:** Melee "Naval Ram" — damage 320 hack + 50 crush — range 12 m — prepare 0 s — repeat 3 s — preferred Warship — restricted Organic
- **Speed:** walk 16 m/s, run 26.72 m/s
- **Vision:** 80 m
- **Cost:** 50 food, 100 wood, 25 metal
- **Build time:** 18 s
- **Population:** 1
- **Classes:** Unit ConquestCritical Trireme
- **Visible classes:** Ship Warship NavalRam Melee

## Civilisations that can train it

- **athen** — `units/athen/ship_ram` (dock)
- **cart** — `units/cart/ship_ram` (dock, super_dock)
- **mace** — `units/mace/ship_ram` (dock)
- **pers** — `units/pers/ship_ram` (dock)
- **ptol** — `units/ptol/ship_ram` (dock)
- **rome** — `units/rome/ship_ram` (dock)
- **sele** — `units/sele/ship_ram` (dock)
- **spart** — `units/spart/ship_ram` (dock)
