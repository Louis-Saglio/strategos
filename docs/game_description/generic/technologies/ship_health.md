# ship_health

Available to **3** civilisations. Generic (non-civ-specific) technology of 0 A.D. 0.28.0 — see `docs/game_description/generic/technologies/README.md` for the method.

Data file: `simulation/data/technologies/ship_health.json`.

## Basic stats

- **Name:** Reinforced Hull
- **Cost:** 300 wood, 200 metal
- **Research time:** 50 s
- **Requirements:** `{"all": [{"tech": "phase_town"},{"any": [{"civ": "brit"},{"civ": "gaul"},{"civ": "iber"}]}]}` — Unlocked in Town Phase. Requires “Shipwrights.”
- **Supersedes:** dock_efficiency
- **Effect:** Ships +25% health, but −10% speed.
- **Modifications:**
  - ×1.25 Health/Max
  - ×0.9 UnitMotion/WalkSpeed
- **Affects:** Ship

## Civilisations

- **brit** — dock
- **gaul** — dock
- **iber** — dock

## Notes

- **athen**, **cart**, **germ**, **han**, **kush**, **mace**, **maur**, **pers**, **ptol**, **rome**, **sele**, **spart** cannot research this (forbidden by the tech's requirements)
