# units/heroes/sele_hero_antiochus_iii

Seleucid-specific aura of 0 A.D. 0.28.0 — only the seleucids can have it. See `docs/game_description/sele/auras/README.md` for the method; shared auras are documented in `docs/game_description/generic/auras/`.

Data file: `simulation/data/auras/units/heroes/sele_hero_antiochus_iii.json`.

## Basic stats

- **Name:** Ilarchès
- **Type:** range
- **Radius:** 45 m
- **Affects:** Cavalry
- **Description:** Cavalry +2 crush, hack, pierce resistance.
- **Modifications:**
  - +2 Resistance/Entity/Damage/Hack
  - +2 Resistance/Entity/Damage/Pierce
  - +2 Resistance/Entity/Damage/Crush

## Seleucids

- attached by `units/sele/hero_antiochus_iii`

Note: a flat +2 to all three armor types for every own cavalry unit
within 45 m — horse archers, javelineers, companion cavalry, cataphracts
and chariots alike. On light cavalry (the Dahae horse archer's 2/1/15
becomes 4/3/17) the relative gain is large; on the cataphract it pads an
already heavy 8/9/20. Antiochus III is a cavalry hero (1200 HP spear
cavalry), so he rides with the horse anyway — keep the cavalry blob
inside the 45 m bubble and it lasts noticeably longer against arrows.
