# units/heroes/athen_hero_hippocrates_1

Athenian-specific aura of 0 A.D. 0.28.0 — only the athenians can have it. See `docs/game_description/athen/auras/README.md` for the method; shared auras are documented in `docs/game_description/generic/auras/`.

Data file: `simulation/data/auras/units/heroes/athen_hero_hippocrates_1.json`.

## Basic stats

- **Name:** Father of Medicine
- **Type:** range
- **Radius:** 35 m
- **Affects:** Human
- **Description:** Humans +0.5 health regeneration rate.
- **Modifications:**
  - +0.5 Health/RegenRate

## Athenian

- attached by `units/athen/hero_hippocrates`

Note: Hippocrates' field aura — own Humans within 35 m regenerate +0.5
HP/s always (including in combat). On top of his own 7.5 HP/s targeted
healing, an army camped around Hippocrates recovers 0.5 HP/s per unit —
30 HP per minute per soldier before the heals.
