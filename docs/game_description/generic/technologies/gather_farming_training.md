# gather_farming_training

Available to **13** civilisations. Generic (non-civ-specific) technology of 0 A.D. 0.28.0 — see `docs/game_description/generic/technologies/README.md` for the method.

Data file: `simulation/data/technologies/gather_farming_training.json`.

## Basic stats

- **Name:** Gather Training
- **Cost:** 300 wood, 200 metal
- **Research time:** 50 s
- **Requirements:** `{"all": [{"tech": "phase_town"},{"notciv": "han"},{"notciv": "ptol"}]}` — Unlocked in Town Phase.
- **Supersedes:** gather_farming_plows
- **Effect:** Workers +20% grain gather rate.
- **Modifications:**
  - ×1.2 ResourceGatherer/Rates/food.grain
- **Affects:** Worker

## Civilisations

- **athen** — farmstead
- **brit** — farmstead
- **cart** — farmstead
- **gaul** — farmstead
- **germ** — farmstead
- **iber** — farmstead
- **kush** — farmstead
- **mace** — farmstead
- **maur** — farmstead
- **pers** — farmstead
- **rome** — farmstead
- **sele** — farmstead
- **spart** — farmstead

## Notes

- **han**, **ptol** cannot research this (forbidden by the tech's requirements)
