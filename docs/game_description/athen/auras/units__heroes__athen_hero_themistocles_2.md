# units/heroes/athen_hero_themistocles_2

Athenian-specific aura of 0 A.D. 0.28.0 — only the athenians can have it. See `docs/game_description/athen/auras/README.md` for the method; shared auras are documented in `docs/game_description/generic/auras/`.

Data file: `simulation/data/auras/units/heroes/athen_hero_themistocles_2.json`.

## Basic stats

- **Name:** Themistoclean Walls
- **Type:** global
- **Affects:** Wall, Palisade
- **Description:** Walls and Palisades −50% resource costs and −20% construction time.
- **Modifications:**
  - ×0.8 Cost/BuildTime
  - ×0.5 Cost/Resources/stone
  - ×0.5 Cost/Resources/wood

## Athenian

- attached by `units/athen/hero_themistocles`

Note: Themistocles' walling aura — every own wall and palisade segment
costs half its wood/stone and builds in 80% of the time, map-wide.
Stacked with the `long_walls` tech (walls buildable in neutral
territory), Athens can throw up forward stone walls for half price —
the fastest walling civ in the game while he lives.
