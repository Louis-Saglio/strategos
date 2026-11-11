# ship_movement_speed

Persian-specific technology of 0 A.D. 0.28.0 — only the persians can get it. See `docs/game_description/pers/technologies/README.md` for the method; shared technologies are documented in `docs/game_description/generic/technologies/`.

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

## Persian

- dock
