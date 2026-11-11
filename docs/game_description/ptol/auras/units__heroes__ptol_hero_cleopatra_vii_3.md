# units/heroes/ptol_hero_cleopatra_vii_3

Ptolemaic-specific aura of 0 A.D. 0.28.0 — only the ptolemies can have it. See `docs/game_description/ptol/auras/README.md` for the method; shared auras are documented in `docs/game_description/generic/auras/`.

Data file: `simulation/data/auras/units/heroes/ptol_hero_cleopatra_vii_3.json`.

## Basic stats

- **Name:** Consort
- **Type:** range
- **Radius:** 30 m
- **Affects:** Hero
- **Affected players:** Enemy
- **Description:** Enemy Heroes −10% health.
- **Modifications:**
  - ×0.9 Health/Max

## Ptolemaic

- attached by `units/ptol/hero_cleopatra_vii`

Note: the hostile half of Cleopatra's "Consort" aura — every **enemy**
hero within 30 m loses 10% of its health (scaled down at the moment the
debuff applies, and restored when out of range). Useful in hero duels:
walk Cleopatra near an enemy hero before the fight and the enemy's 1200
HP drops to 1080. A small, situational effect compared to "Patriot".
