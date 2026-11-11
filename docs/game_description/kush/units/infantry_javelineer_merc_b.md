# infantry_javelineer_merc_b

Kushite-specific unit of 0 A.D. 0.28.0 — only the kushites can train it. See `docs/game_description/kush/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/kush/infantry_javelineer_merc_b` (full kush template chain).

## Guide

The Noba Skirmisher is kush's mercenary javelin infantry, trained at the Noba Village from the Town phase for 60 metal and nothing else — a metal-only price, so it is a premium purchase that converts surplus metal into a fast army (7 s train time versus 10 s for a citizen unit). It has 50 HP and 1 / 1 / 10 armor, with a 17.6-pierce javelin at 30 m (1.5 s repeat), and is kush's only infantry javelineer. Mercenaries cannot gather, only fight and build; because the auto-researched "Expertise in War" tech sets their promotion XP to 0, they are trained at Advanced rank (about 62.5 HP, tighter spread) and reach Elite at 100 XP. Keep it behind melee troops; kush's food/wood-based ranged infantry is the 60 m archer.

## Basic stats

- **Generic name:** Noba Skirmisher
- **Specific name:** Nhw ʿhȝw Noba
- **Health:** 50 HP
- **Armor:** 1 hack / 1 pierce / 10 crush
- **Attack:** Capture — strength 2.5 — range 4 m — repeat 1 s — restricted Field Palisade Wall
- **Attack:** Ranged "Javelin" — damage 17.6 pierce — range 30 m — prepare 0.4 s — repeat 1.5 s — spread 4 — preferred Human
- **Speed:** walk 11.4 m/s, run 19.04 m/s
- **Vision:** 80 m
- **Cost:** 60 metal
- **Build time:** 7 s
- **Population:** 1
- **Builds:** civil_centre house pyramid_small storehouse farmstead field corral dock barracks stable elephant_stable forge temple market outpost sentry_tower defense_tower arsenal fortress wallset_palisade wallset_stone wonder pyramid_large temple_amun camp_blemmye camp_noba
- **Requirements:** phase_town
- **Auras:** units/ram_garrison
- **Loot:** 6 metal, 100 xp
- **Classes:** Unit Organic ConquestCritical Human CitizenSoldier
- **Visible classes:** Builder Citizen Worker Soldier Infantry Ranged Javelineer Mercenary
- **Rank:** Basic

## Ranks

### Advanced — `units/{civ}/infantry_javelineer_merc_a`
Requires 0 XP (template 100; set by the auto-researched `upgrade_rank_advanced_mercenary`).
- Health: ×1.25 → 62.5 HP
- Capture strength: +0.7 → 3.2
- Build time: ×1.2 → 8.4 s
- Loot: ×1.2
- Ranged spread: ×0.8

### Elite — `units/{civ}/infantry_javelineer_merc_e`
Requires 100 XP.
- Health: ×1.25 (total ×1.56) → 78.13 HP
- Capture strength: +0.8 (total +1.5) → 4
- Build time: ×1.2 (total ×1.44) → 10.08 s
- Loot: ×1.2 (total ×1.44)
- Ranged spread: ×0.8 (total ×0.64)

## Trained by

- **kush** — `units/kush/infantry_javelineer_merc_b` (camp_noba)
