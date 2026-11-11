# roman_roads

Roman-specific technology of 0 A.D. 0.28.0 — only the romans can get it. See `docs/game_description/rome/technologies/README.md` for the method; shared technologies are documented in `docs/game_description/generic/technologies/`.

Data file: `simulation/data/technologies/roman_roads.json`.

## Basic stats

- **Name:** Roman Roads
- **Cost:** 500 stone
- **Research time:** 60 s
- **Requirements:** `{"all": [{"tech": "phase_town"},{"civ": "rome"}]}` — Unlocked in Town Phase.
- **Effect:** All Land Units +5% movement speed.
- **Modifications:**
  - ×1.05 UnitMotion/WalkSpeed
- **Affects:** Unit !Ship

## Roman

- civil_centre
