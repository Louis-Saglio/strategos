# ship_movement_speed

Available to **2** civilisations. Generic (non-civ-specific) technology of 0 A.D. 0.28.0 — see `docs/game_description/generic/technologies/README.md` for the method.

Data file: `simulation/data/technologies/ship_movement_speed.json`.

## Basic stats

- **Name:** Phoenician Naval Tradition
- **Cost:** 200 food, 200 wood
- **Research time:** 40 s
- **Requirements:** `{"all": [{"tech": "phase_town"},{"any": [{"civ": "cart"},{"civ": "pers"}]}]}` — Unlocked in Town Phase. Requires “Shipwrights.”
- **Supersedes:** dock_efficiency
- **Effect:** Ships +10% movement speed.
- **Modifications:**
  - ×1.1 UnitMotion/WalkSpeed
- **Affects:** Ship

## Civilisations

- **cart** — dock
- **pers** — dock

## Notes

- **athen**, **brit**, **gaul**, **germ**, **han**, **iber**, **kush**, **mace**, **maur**, **ptol**, **rome**, **sele**, **spart** cannot research this (forbidden by the tech's requirements)
