# units/heroes/maur_hero_chanakya_1

Mauryan-specific aura of 0 A.D. 0.28.0 — only the mauryas can have it. See `docs/game_description/maur/auras/README.md` for the method; shared auras are documented in `docs/game_description/generic/auras/`.

Data file: `simulation/data/auras/units/heroes/maur_hero_chanakya_1.json`.

## Basic stats

- **Name:** Teacher
- **Type:** global
- **Affects:** Structure
- **Description:** All technologies have −20% resource cost and −30% research time.
- **Modifications:**
  - ×0.8 Researcher/TechCostMultiplier/food
  - ×0.8 Researcher/TechCostMultiplier/wood
  - ×0.8 Researcher/TechCostMultiplier/stone
  - ×0.8 Researcher/TechCostMultiplier/metal
  - ×0.7 Researcher/TechCostMultiplier/time

## Mauryan

- attached by `units/maur/hero_chanakya`

Note: Chanakya's economy aura — **every** technology (all structures, not
just temples) costs −20% resources and researches −30% faster while he
lives. The broadest research discount in the game; combined with the
temple halving from the teambonus, Mauryan temple techs cost ×0.4
resources and ×0.35 time with Chanakya alive.
