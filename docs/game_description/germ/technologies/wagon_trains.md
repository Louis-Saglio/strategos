# wagon_trains

Germanic-specific technology of 0 A.D. 0.28.0 — only the germans can get it. See `docs/game_description/germ/technologies/README.md` for the method; shared technologies are documented in `docs/game_description/generic/technologies/`.

Data file: `simulation/data/technologies/wagon_trains.json`.

## Basic stats

- **Name:** Wagon Trains
- **Cost:** 400 wood, 100 metal
- **Research time:** 40 s
- **Requirements:** `{"all": [{"tech": "phase_town"},{"civ": "germ"}]}` — Unlocked in Town Phase.
- **Effect:** Supply Wagons +5 population space and Wagon Encampments +10 population space. Training Germanic Workers unlocked from the Supply Wagon as well.
- **Modifications:**
  - Promotion/RequiredXp = `0` (replace) — Wagon
  - +10 Population/Bonus — Colony

## Germanic

- encampment
- encampment_fortified
