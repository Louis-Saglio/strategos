# exploration

Available to **2** civilisations. Generic (non-civ-specific) technology of 0 A.D. 0.28.0 — see `docs/game_description/generic/technologies/README.md` for the method.

Data file: `simulation/data/technologies/exploration.json`.

## Basic stats

- **Name:** Exploration
- **Cost:** 100 food, 100 metal
- **Research time:** 40 s
- **Requirements:** `{"all": [{"tech": "phase_village"},{"any": [{"civ": "cart"},{"civ": "han"}]}]}` — Unlocked in Village Phase. Requires “Lookouts.”
- **Supersedes:** ship_vision
- **Effect:** Traders and Ships +20% vision range.
- **Modifications:**
  - ×1.2 Vision/Range
- **Affects:** Trader Ship

## Civilisations

- **cart** — dock, super_dock
- **han** — dock

## Notes

- **athen**, **brit**, **gaul**, **germ**, **iber**, **kush**, **mace**, **maur**, **pers**, **ptol**, **rome**, **sele**, **spart** cannot research this (forbidden by the tech's requirements)
