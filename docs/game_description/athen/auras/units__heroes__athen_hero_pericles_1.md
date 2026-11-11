# units/heroes/athen_hero_pericles_1

Athenian-specific aura of 0 A.D. 0.28.0 — only the athenians can have it. See `docs/game_description/athen/auras/README.md` for the method; shared auras are documented in `docs/game_description/generic/auras/`.

Data file: `simulation/data/auras/units/heroes/athen_hero_pericles_1.json`.

## Basic stats

- **Name:** Periclean Defensive Strategy
- **Type:** range
- **Radius:** 60 m
- **Affects:** Soldier, Ship, Siege, Structure
- **Description:** Soldiers, Ships, Siege Engines and Structures do not give loot, +50% Structure capture points.
- **Modifications:**
  - Loot/xp = 0 (replace)
  - Loot/food = 0 (replace)
  - Loot/wood = 0 (replace)
  - Loot/stone = 0 (replace)
  - Loot/metal = 0 (replace)
  - ×1.5 Capturable/CapturePoints

## Athenian

- attached by `units/athen/hero_pericles`

Note: Pericles' defensive aura — everything Athenian within 60 m of him
(soldiers, ships, siege and buildings) yields **zero loot** when
destroyed, starving enemy raiders of the plunder economy (Viriato's
"Swag" doubles zero), while own structures in range take +50% more
capture points to flip. Keep him with the defended front — it is a
pure defense aura, no offensive value.
