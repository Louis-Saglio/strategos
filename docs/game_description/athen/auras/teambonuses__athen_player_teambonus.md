# teambonuses/athen_player_teambonus

Athenian-specific aura of 0 A.D. 0.28.0 — only the athenians can have it. See `docs/game_description/athen/auras/README.md` for the method; shared auras are documented in `docs/game_description/generic/auras/`.

Data file: `simulation/data/auras/teambonuses/athen_player_teambonus.json`.

## Basic stats

- **Name:** Democracy
- **Type:** global
- **Affects:** CivilCentre
- **Affected players:** MutualAlly
- **Description:** Civic Center technologies −50% research time and −30% cost.
- **Modifications:**
  - ×0.7 Researcher/TechCostMultiplier/food
  - ×0.7 Researcher/TechCostMultiplier/wood
  - ×0.7 Researcher/TechCostMultiplier/stone
  - ×0.7 Researcher/TechCostMultiplier/metal
  - ×0.5 Researcher/TechCostMultiplier/time

## Athenian

- attached by `special/players/<civ>.xml` (the player's teambonus)

Note: every ally researches **at the civil centre** at −30% resource
cost and −50% time — the phase advances, shared-LOS, spies and counter
spies all come faster and cheaper. For the Athenians themselves it
stacks with Pericles' global "Scholarship and the Arts" aura (−10% cost,
−50% time): CC research then costs ×0.63 resources and ×0.25 time.
