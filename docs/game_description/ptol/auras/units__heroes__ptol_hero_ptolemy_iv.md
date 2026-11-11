# units/heroes/ptol_hero_ptolemy_iv

Ptolemaic-specific aura of 0 A.D. 0.28.0 — only the ptolemies can have it. See `docs/game_description/ptol/auras/README.md` for the method; shared auras are documented in `docs/game_description/generic/auras/`.

Data file: `simulation/data/auras/units/heroes/ptol_hero_ptolemy_iv.json`.

## Basic stats

- **Name:** Raphia
- **Type:** range
- **Radius:** 60 m
- **Affects:** Pikeman
- **Description:** Pikemen +40% health.
- **Modifications:**
  - ×1.4 Health/Max

## Ptolemaic

- attached by `units/ptol/hero_ptolemy_iv`

Note: Ptolemy IV's phalanx aura — every own `Pikeman`-class unit within
60 m gets +40% health (Egyptian Pikeman 100 → 140 HP, Royal Guard 200 →
280). The biggest single-unit-class health boost in the game; combined
with the pikemen's 2.5× vs Cavalry bonus it makes a Ptolemaic phalanx
around Ptolemy IV nearly unbreakable by cavalry and hard to grind down
by anything.
