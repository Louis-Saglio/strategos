# units/heroes/maur_hero_chanakya_2

Mauryan-specific aura of 0 A.D. 0.28.0 — only the mauryas can have it. See `docs/game_description/maur/auras/README.md` for the method; shared auras are documented in `docs/game_description/generic/auras/`.

Data file: `simulation/data/auras/units/heroes/maur_hero_chanakya_2.json`.

## Basic stats

- **Name:** Regeneration
- **Type:** range
- **Radius:** 35 m
- **Affects:** Human
- **Description:** Humans +0.8 health regeneration rate.
- **Modifications:**
  - +0.8 Health/RegenRate

## Mauryan

- attached by `units/maur/hero_chanakya`

Note: Chanakya's field aura — every own Human-class unit within 35 m
regenerates +0.8 HP/s, on top of his own 7.5 HP/s targeted healing.
`RegenRate` applies **always, including in combat** (unlike the separate
`IdleRegenRate`), so a Mauryan army fighting around Chanakya is
effectively 0.8 HP/s per unit harder to kill — 48 HP per minute per
soldier before his heals.
