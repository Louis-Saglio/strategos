# champion_infantry_archer

Kushite-specific unit of 0 A.D. 0.28.0 — only the kushites can train it. See `docs/game_description/kush/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/kush/champion_infantry_archer` (full kush template chain).

## Guide

The Noble Archer is kush's champion ranged infantry, trained at the barracks once `unlock_champion_infantry` (the City-phase barracks tech, 600 food) has been researched, for 80 food, 60 wood and 80 metal and 20 s. It out-damages the citizen archer by 2× (14.4 pierce per 1.25 s at 60 m range versus 7.2) but is far squishier than other champions: 120 HP and only 3 hack / 3 pierce armor, so it must be screened by melee units and kept out of enemy skirmisher and cavalry reach. As an Archer it benefits from `archery_tradition` (+10 range, researchable at the civil centre) and `archer_attack_spread`, and as a Champion it receives Amanirenas's +20% damage aura. Its metal cost makes it a late-game specialist; the cheap food/wood citizen archer remains the bulk ranged unit.

## Basic stats

- **Generic name:** Noble Archer
- **Specific name:** Hry pdty
- **Health:** 120 HP
- **Armor:** 3 hack / 3 pierce / 20 crush
- **Attack:** Capture — strength 5 — range 4 m — repeat 1 s — restricted Field Palisade Wall
- **Attack:** Ranged "Bow" — damage 14.4 pierce — range 60 m — prepare 0.8 s — repeat 1.25 s — spread 1 — preferred Human
- **Speed:** walk 10.3 m/s, run 17.2 m/s
- **Vision:** 80 m
- **Cost:** 80 food, 60 wood, 80 metal
- **Build time:** 20 s
- **Population:** 1
- **Requirements:** unlock_champion_infantry
- **Auras:** units/ram_garrison
- **Loot:** 8 food, 6 wood, 8 metal, 150 xp
- **Classes:** Unit Organic ConquestCritical Human
- **Visible classes:** Soldier Champion Infantry Ranged Archer

## Trained by

- **kush** — `units/kush/champion_infantry_archer` (barracks, range (only when pre-placed on a skirmish map))
