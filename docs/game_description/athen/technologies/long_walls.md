# long_walls

Athenian-specific technology of 0 A.D. 0.28.0 — only the athenians can get it. See `docs/game_description/athen/technologies/README.md` for the method; shared technologies are documented in `docs/game_description/generic/technologies/`.

Data file: `simulation/data/technologies/long_walls.json`.

## Basic stats

- **Name:** Athenian Long Walls
- **Cost:** 400 stone
- **Research time:** 60 s
- **Requirements:** `{"all": [{"tech": "phase_city"},{"civ": "athen"}]}`
- **Effect:** Build Walls in own or neutral territory.
- **Modifications:**
  - BuildRestrictions/Territory = `own neutral` (replace)
- **Affects:** Wall

## Athenian

- prytaneion

Note: the defining Athenian wall tech — `Wall`-class structures (the
stone wall set's segments, gates and towers) become buildable in
**neutral territory** too, so Athens can wall off map chokepoints,
forward mines or the enemy's approach outside its own borders. The
palisade already builds in own+neutral; this extends the privilege to
the stone set. Combines with Themistocles' "Themistoclean Walls" aura
(−50% resource costs, −20% build time) for cheap forward walls.
