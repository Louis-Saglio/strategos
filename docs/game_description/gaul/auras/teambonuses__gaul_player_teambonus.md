# teambonuses/gaul_player_teambonus

Gaul-specific aura of 0 A.D. 0.28.0 — only the gauls can have it. See `docs/game_description/gaul/auras/README.md` for the method; shared auras are documented in `docs/game_description/generic/auras/`.

Data file: `simulation/data/auras/teambonuses/gaul_player_teambonus.json`.

## Basic stats

- **Name:** Products from Gaul
- **Type:** global
- **Affects:** Forge
- **Affected players:** MutualAlly
- **Description:** Forges −15% technology resource costs and research time.
- **Modifications:**
  - ×0.85 Researcher/TechCostMultiplier/food
  - ×0.85 Researcher/TechCostMultiplier/wood
  - ×0.85 Researcher/TechCostMultiplier/stone
  - ×0.85 Researcher/TechCostMultiplier/metal
  - ×0.85 Researcher/TechCostMultiplier/time

## Gaul

- attached by `special/players/<civ>.xml` (the player's teambonus)
