# gather_farming_harvester

Gaul-specific technology of 0 A.D. 0.28.0 — only the gauls can get it. See `docs/game_description/gaul/technologies/README.md` for the method; shared technologies are documented in `docs/game_description/generic/technologies/`.

Data file: `simulation/data/technologies/gather_farming_harvester.json`.

## Basic stats

- **Name:** Harvesting Machine
- **Cost:** 200 wood, 100 metal
- **Research time:** 50 s
- **Requirements:** `{"all": [{"tech": "phase_town"},{"any": [{"civ": "gaul"}]}]}` — Unlocked in Town Phase.
- **Effect:** Workers +10% grain gather rate.
- **Modifications:**
  - ×1.1 ResourceGatherer/Rates/food.grain
- **Affects:** Worker

## Gaul

- farmstead
