# infantry_maceman_merc_b

Kushite-specific unit of 0 A.D. 0.28.0 — only the kushites can train it. See `docs/game_description/kush/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/kush/infantry_maceman_merc_b` (full kush template chain).

## Guide

The Noba Maceman is kush's mercenary melee infantry, trained at the Noba Village from the Town phase for 60 metal and 7 s. Metal is the premium resource, so these are bought with surplus metal when a front line is needed fast, not massed. It has 100 HP, 2 / 3 / 15 armor and a mace doing 5.5 hack + 7.7 crush per second (crush-heavy, so it works better against heavily hack-armored targets and buildings than against light infantry), plus a 2.5-strength Capture attack. Mercenaries cannot gather, only fight and build; thanks to "Expertise in War" they are trained at Advanced rank (about 125 HP and +10% damage) and promote to Elite at 100 XP. It is kush's only mace unit.

## Basic stats

- **Generic name:** Noba Maceman
- **Specific name:** Nhw Noba
- **Health:** 100 HP
- **Armor:** 2 hack / 3 pierce / 15 crush
- **Attack:** Capture — strength 2.5 — range 4 m — repeat 1 s — restricted Field Palisade Wall
- **Attack:** Melee "Mace" — damage 5.5 hack + 7.7 crush — range 3 m — prepare 0.5 s — repeat 1 s — preferred !Ship
- **Speed:** walk 9.5 m/s, run 15.86 m/s
- **Vision:** 80 m
- **Cost:** 60 metal
- **Build time:** 7 s
- **Population:** 1
- **Builds:** civil_centre house pyramid_small storehouse farmstead field corral dock barracks stable elephant_stable forge temple market outpost sentry_tower defense_tower arsenal fortress wallset_palisade wallset_stone wonder pyramid_large temple_amun camp_blemmye camp_noba
- **Requirements:** phase_town
- **Auras:** units/ram_garrison
- **Loot:** 6 metal, 100 xp
- **Classes:** Unit Organic ConquestCritical Human CitizenSoldier
- **Visible classes:** Builder Citizen Worker Soldier Infantry Melee Maceman Mercenary
- **Rank:** Basic

## Ranks

### Advanced — `units/{civ}/infantry_maceman_merc_a`
Requires 0 XP (template 100; set by the auto-researched `upgrade_rank_advanced_mercenary`).
- Health: ×1.25 → 125 HP
- Melee attack damage: ×1.1 → hack 6.05 + crush 8.47
- Capture strength: +0.7 → 3.2
- Build time: ×1.2 → 8.4 s
- Loot: ×1.2

### Elite — `units/{civ}/infantry_maceman_merc_e`
Requires 100 XP.
- Health: ×1.25 (total ×1.56) → 156.25 HP
- Melee attack damage: ×1.1 (total ×1.21) → hack 6.65 + crush 9.32
- Capture strength: +0.8 (total +1.5) → 4
- Build time: ×1.2 (total ×1.44) → 10.08 s
- Loot: ×1.2 (total ×1.44)

## Trained by

- **kush** — `units/kush/infantry_maceman_merc_b` (camp_noba)
