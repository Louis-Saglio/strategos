# subterranean_aqueducts

Persian-specific technology of 0 A.D. 0.28.0 — only the persians can get it. See `docs/game_description/pers/technologies/README.md` for the method; shared technologies are documented in `docs/game_description/generic/technologies/`.

Data file: `simulation/data/technologies/subterranean_aqueducts.json`.

## Basic stats

- **Name:** Subterranean Aqueducts
- **Specific name:** Kārēz
- **Cost:** 300 wood, 300 stone
- **Research time:** 40 s
- **Requirements:** `{"all": [{"tech": "phase_city"},{"civ": "pers"}]}` — Unlocked in City Phase.
- **Effect:** Ice House +1 trickle food rate per second.
- **Modifications:**
  - +1 ResourceTrickle/Rates/food
- **Affects:** IceHouse

## Persian

- ice_house

Note: doubles the Ice House's food trickle from 1 per 2 s to 2 per 2 s
(0.5/s → 1/s). It costs more than the ice house itself (300 wood + 300
stone vs 100 + 100), so it only pays off once a city-phase economy makes
the extra 0.5 food/s per house worth the stone.
