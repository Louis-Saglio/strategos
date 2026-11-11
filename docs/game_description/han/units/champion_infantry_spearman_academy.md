# champion_infantry_spearman_academy

Han-specific unit of 0 A.D. 0.28.0 — only the han can train it. See `docs/game_description/han/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/han/champion_infantry_spearman_academy` (full han template chain).

## Guide

The Tiger Guard Spearman is han's champion melee infantry and front-line anchor, trained at the Imperial Academy in the City phase for 80 food, 60 wood and 80 metal (15 s, 1 population) with no unlock tech, since `unlock_champion_infantry` is barred for han. It has 200 HP, 6/6/20 armor and a 10 hack + 8.5 pierce spear (1 s repeat, 2.5× vs Cavalry), the generic champion-spearman stats at 15 s instead of 20 s, so it holds a line against infantry and counters cavalry. The 80 metal is the premium part, so buy a moderate number to screen the crossbow lines and rely on food/wood-only spearmen and Halberdiers for bulk. Capture strength is 5 (range 4 m), raised by Wei Qing's champion aura (+2 capture, +20% attack within 60 m).

## Basic stats

- **Generic name:** Tiger Guard Spearman
- **Specific name:** Hǔ Bēn
- **Health:** 200 HP
- **Armor:** 6 hack / 6 pierce / 20 crush
- **Attack:** Capture — strength 5 — range 4 m — repeat 1 s — restricted Field Palisade Wall
- **Attack:** Melee "Spear" — damage 10 hack + 8.5 pierce — range 4 m — prepare 0.5 s — repeat 1 s — bonus 2.5× vs Cavalry — preferred Unit+!Ship
- **Speed:** walk 9.5 m/s, run 15.86 m/s
- **Vision:** 80 m
- **Cost:** 80 food, 60 wood, 80 metal
- **Build time:** 15 s
- **Population:** 1
- **Requirements:** phase_city
- **Auras:** units/ram_garrison
- **Loot:** 8 food, 6 wood, 8 metal, 150 xp
- **Classes:** Unit Organic ConquestCritical Human
- **Visible classes:** Soldier Champion Infantry Melee Spearman

## Trained by

- **han** — `units/han/champion_infantry_spearman_academy` (academy)
