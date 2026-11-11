# units/heroes/athen_hero_pericles_2

Athenian-specific aura of 0 A.D. 0.28.0 — only the athenians can have it. See `docs/game_description/athen/auras/README.md` for the method; shared auras are documented in `docs/game_description/generic/auras/`.

Data file: `simulation/data/auras/units/heroes/athen_hero_pericles_2.json`.

## Basic stats

- **Name:** Scholarship and the Arts
- **Type:** global
- **Affects:** Structure
- **Description:** Technologies −10% resource costs, −50% research time.
- **Modifications:**
  - ×0.9 Researcher/TechCostMultiplier/food
  - ×0.9 Researcher/TechCostMultiplier/wood
  - ×0.9 Researcher/TechCostMultiplier/stone
  - ×0.9 Researcher/TechCostMultiplier/metal
  - ×0.5 Researcher/TechCostMultiplier/time

## Athenian

- attached by `units/athen/hero_pericles`

Note: Pericles' economy aura — **every** technology researches at −50%
time and −10% resource cost while he lives. The largest research-time
reduction in the game (Chanakya's "Teacher" gives −30%); combined with
the "Democracy" teambonus, civil-centre research drops to ×0.25 time.
Pericles is the boom pick: half-time tech everywhere.
