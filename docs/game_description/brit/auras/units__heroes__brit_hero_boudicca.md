# units/heroes/brit_hero_boudicca

British-specific aura of 0 A.D. 0.28.0 — only the britons can have it. See `docs/game_description/brit/auras/README.md` for the method; shared auras are documented in `docs/game_description/generic/auras/`.

Data file: `simulation/data/auras/units/heroes/brit_hero_boudicca.json`.

## Basic stats

- **Name:** Champion Army
- **Type:** range
- **Radius:** 40 m
- **Affects:** Champion
- **Description:** Champions +2 capture attack strength, +20% melee and ranged attack damage, +10% movement speed.
- **Modifications:**
  - +2 Attack/Capture/Capture
  - ×1.2 Attack/Melee/Damage/Hack
  - ×1.2 Attack/Melee/Damage/Pierce
  - ×1.2 Attack/Melee/Damage/Crush
  - ×1.2 Attack/Ranged/Damage/Hack
  - ×1.2 Attack/Ranged/Damage/Pierce
  - ×1.2 Attack/Ranged/Damage/Crush
  - ×1.1 UnitMotion/WalkSpeed

## Britons

- attached by `units/brit/hero_boudicca`

Note: Boudicca's assault aura — every own champion within 40 m hits 20%
harder, captures 2 points stronger and moves 10% faster. The British
champion pair (Brythonic swordsman, Celtic chariot) rides this into a
meaningfully stronger force: the chariot's 36-pierce javelins become
43.2 and the swordsman's 16 hack becomes 19.2. Keep her with the
champion corps when it charges — the aura is range-limited, so she must
be at the front, which her 1500 HP chariot body can afford.
