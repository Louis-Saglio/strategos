# celtic_auxiliaries

Carthaginian-specific technology of 0 A.D. 0.28.0 — only the carthaginians can get it. See `docs/game_description/cart/technologies/README.md` for the method; shared technologies are documented in `docs/game_description/generic/technologies/`.

Data file: `simulation/data/technologies/celtic_auxiliaries.json`.

## Basic stats

- **Name:** Celtic Auxiliaries
- **Cost:** 550 metal
- **Research time:** 45 s
- **Requirements:** `{"all": [{"tech": "phase_city"},{"civ": "cart"}]}` — Unlocked in City Phase.
- **Effect:** Mercenaries −50% metal cost but +50 food cost.
- **Modifications:**
  - ×0.5 Cost/Resources/metal
  - +50 Cost/Resources/food
  - ×0.5 Loot/metal
  - +5 Loot/food
- **Affects:** Mercenary Swordsman

## Carthaginian

- embassy_celtic

Note: affects the Gallic Mercenary Swordsman and the Gallic Mercenary Cavalry (both carry the `Mercenary` + `Swordsman` classes) — the infantry drops from 60 metal to 30 metal + 50 food, the cavalry from 90 metal + 20 food to 45 metal + 70 food. It shifts the mercenary sword line from metal to food, which is worth it in the City phase when farms are up and metal is tight. It does not affect the spearmen, skirmisher or slinger mercenaries.
