# siege_lithobolos_packed

Trained by **4** civilisations. Generic (non-civ-specific) unit of 0 A.D. 0.28.0 — see `docs/game_description/generic/units/README.md` for the method.

Generic stats resolved from the shared template `simulation/templates/template_unit_siege_stonethrower` (deepest template common to all civilisation variants; variants may override, see below).

## Guide

Heavy anti-building artillery: its 230 crush damage per shot at 85 m range, with Structure as the preferred target class, makes it the dedicated tool for demolishing enemy structures. This is the packed (mobile) form — it must be unpacked before it can fire and re-packed (5 s) to move. Expensive (400 wood, 250 stone, 3 population) and trained only at the arsenal by athen, mace, ptol and sele; stone is a scarce premium resource, so it is a late investment that is hard to mass and best escorted rather than sent alone. A bot should queue it once it has a secure economy and a target civic centre or fortress to destroy.

## Basic stats

- **Generic name:** Siege Catapult
- **Health:** 375 HP
- **Armor:** 6 hack / 25 pierce / 5 crush
- **Attack:** Ranged "Stone" — damage 230 crush — range 85 m — prepare 3 s — repeat 7 s — preferred Structure
- **Speed:** walk 7.2 m/s, run 7.2 m/s
- **Vision:** 120 m
- **Cost:** 400 wood, 250 stone
- **Build time:** 25 s
- **Population:** 3
- **Classes:** Unit ConquestCritical
- **Visible classes:** Siege Ranged StoneThrower

## Civilisations that can train it

- **athen** — `units/athen/siege_lithobolos_packed` (arsenal)
- **mace** — `units/mace/siege_lithobolos_packed` (arsenal)
- **ptol** — `units/ptol/siege_lithobolos_packed` (arsenal)
- **sele** — `units/sele/siege_lithobolos_packed` (arsenal)
