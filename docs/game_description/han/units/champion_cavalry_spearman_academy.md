# champion_cavalry_spearman_academy

Han-specific unit of 0 A.D. 0.28.0 — only the han can train it. See `docs/game_description/han/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/han/champion_cavalry_spearman_academy` (full han template chain).

## Guide

The Youzhou Cavalry is han's champion cavalry spearman, trained at the Imperial Academy (not at the stable) in the City phase for 150 food, 80 wood and 100 metal (18.75 s, 1 population) with no unlock tech, since `unlock_champion_cavalry` is barred for han. With 260 HP, 5/6/20 armor, a 12 hack + 10 pierce spear (1.25 s repeat, 1.75× vs Cavalry) and a 25.2 m/s run speed it is a fast, durable raider, cavalry counter and capture unit (strength 3.5); like every champion it cannot gather or build. The 100 metal is the premium part of the price, so buy a compact strike force rather than a mass. Pair it with Liu Bang (cavalry within 40 m +20% attack) or Wei Qing (champions within 60 m +20% attack, +2 capture); only one hero can be alive at a time, so those auras cannot be stacked.

## Basic stats

- **Generic name:** Youzhou Cavalry
- **Specific name:** Yōuzhōu Tūqí
- **Health:** 260 HP
- **Armor:** 5 hack / 6 pierce / 20 crush
- **Attack:** Capture — strength 3.5 — range 4 m — repeat 1 s — restricted Field Palisade Wall
- **Attack:** Melee "Spear" — damage 12 hack + 10 pierce — range 4 m — prepare 0.5 s — repeat 1.25 s — bonus 1.75× vs Cavalry — preferred Unit+!Ship
- **Speed:** walk 18 m/s, run 25.2 m/s
- **Vision:** 80 m
- **Cost:** 150 food, 80 wood, 100 metal
- **Build time:** 18.75 s
- **Population:** 1
- **Requirements:** phase_city
- **Loot:** 15 food, 8 wood, 10 metal, 200 xp
- **Classes:** Unit Organic ConquestCritical Human FastMoving
- **Visible classes:** Soldier Champion Cavalry Melee Spearman

## Trained by

- **han** — `units/han/champion_cavalry_spearman_academy` (academy)
