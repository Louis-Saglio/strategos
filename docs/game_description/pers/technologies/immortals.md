# immortals

Persian-specific technology of 0 A.D. 0.28.0 — only the persians can get it. See `docs/game_description/pers/technologies/README.md` for the method; shared technologies are documented in `docs/game_description/generic/technologies/`.

Data file: `simulation/data/technologies/immortals.json`.

## Basic stats

- **Name:** Immortals
- **Cost:** 200 food, 200 metal
- **Research time:** 60 s
- **Requirements:** `{"all": [{"tech": "phase_city"},{"civ": "pers"}]}` — Unlocked in City Phase.
- **Effect:** Immortals −50% training time.
- **Modifications:**
  - ×0.5 Cost/BuildTime
- **Affects:** Immortal

## Persian

- tachara

Note: halves the already-cheap training time of the two Persian Immortal
units (`champion_infantry` and `champion_infantry_archer_upgrade`) — 20 s
→ 10 s per unit. Researched at the Winter Palace, so it comes online
together with the heroes. It is the Persians' mass-production switch for
their only melee champion line.
