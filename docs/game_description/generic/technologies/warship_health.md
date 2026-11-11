# warship_health

Available to **5** civilisations. Generic (non-civ-specific) technology of 0 A.D. 0.28.0 — see `docs/game_description/generic/technologies/README.md` for the method.

Data file: `simulation/data/technologies/warship_health.json`.

## Basic stats

- **Name:** Undergirding Cables
- **Cost:** 400 metal
- **Research time:** 40 s
- **Requirements:** `{"all": [{"tech": "phase_city"},{"any": [{"civ": "athen"},{"civ": "cart"},{"civ": "mace"},{"civ": "rome"},{"civ": "spart"}]}]}` — Unlocked in City Phase.
- **Effect:** Arrow Ships and Ramming Ships +20% health.
- **Modifications:**
  - ×1.2 Health/Max
- **Affects:** ArrowShip NavalRam

## Civilisations

- **athen** — dock
- **cart** — super_dock
- **mace** — dock
- **rome** — dock
- **spart** — dock

## Notes

- **brit**, **gaul**, **germ**, **han**, **iber**, **kush**, **maur**, **pers**, **ptol**, **sele** cannot research this (forbidden by the tech's requirements)
