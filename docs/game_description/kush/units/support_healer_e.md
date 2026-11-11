# support_healer_e

Kushite-specific unit of 0 A.D. 0.28.0 — only the kushites can train it. See `docs/game_description/kush/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/kush/support_healer_e` (full kush template chain).

## Guide

The Priest (elite) is the healer trained at the Grand Temple of Amun in place of the ordinary temple's basic healer, for the same 100 food and 30 metal and 15 s base build time; the metal makes healers an investment rather than a mass unit. The listed stats are the template values — as an Elite-rank unit it also receives the automatic Advanced and Elite rank bonuses, so in play it has about 132.8 HP, heals about 15 HP per 2 s at about 18 m range and trains in about 21.6 s (see the Ranks section of the generic healer), a far better healer than a basic one without needing XP. It has no attack and 1 / 1 / 1 armor, so keep it behind the line. The Grand Temple of Amun also gives all Humans within 70 m +1 HP/s regeneration.

## Basic stats

- **Generic name:** Priest
- **Specific name:** Wʿb nsw
- **Health:** 85 HP
- **Armor:** 1 hack / 1 pierce / 1 crush
- **Speed:** walk 9 m/s, run 15.03 m/s
- **Vision:** 30 m
- **Cost:** 100 food, 30 metal
- **Build time:** 15 s
- **Population:** 1
- **Heal:** 5 HP per 2 s, range 12 m
- **Requirements:** phase_town
- **Loot:** 10 food, 3 metal, 8 xp
- **Classes:** Unit Organic Human
- **Visible classes:** Support Healer
- **Rank:** Elite

## Trained by

- **kush** — `units/kush/support_healer_e` (temple_amun)
