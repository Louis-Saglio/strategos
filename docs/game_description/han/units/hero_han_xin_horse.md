# hero_han_xin_horse

Han-specific unit of 0 A.D. 0.28.0 — only the han can train it. See `docs/game_description/han/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/han/hero_han_xin_horse` (full han template chain).

## Guide

Han Xin is han's cavalry-spearman hero, trained at the Imperial Court or the fortress in the City phase for 300 food, 200 wood and 250 metal (0 population, 50 s); only one hero may be alive at a time. With 1200 HP, 11/10/25 armor, a 16 hack + 12 pierce spear (1.25 s repeat, 1.75× vs Cavalry) and a 25.2 m/s run speed he is a durable fast fighter and capture unit (strength 10). His auras are about leveling and scouting rather than damage: "Northern Army" gives citizen soldiers within 30 m −20% promotion XP, and "Southern Army" is global and gives own and allied soldiers +25% vision range. He is the cheapest hero in metal (250), so he suits a citizen-soldier army that should reach Advanced/Elite quickly; Liu Bang or Wei Qing add more raw fighting power. Garrisoned in a structure he adds +1 capture-point regeneration.

## Basic stats

- **Generic name:** Hero Cavalry Spearman
- **Specific name:** Hán Xìn
- **Health:** 1200 HP
- **Armor:** 11 hack / 10 pierce / 25 crush
- **Attack:** Capture — strength 10 — range 4 m — repeat 1 s — restricted Field Palisade Wall
- **Attack:** Melee "Spear" — damage 16 hack + 12 pierce — range 4 m — prepare 0.5 s — repeat 1.25 s — bonus 1.75× vs Cavalry — preferred Unit+!Ship
- **Speed:** walk 18 m/s, run 25.2 m/s
- **Vision:** 100 m
- **Cost:** 300 food, 200 wood, 250 metal
- **Build time:** 50 s
- **Population:** 0
- **Requirements:** phase_city
- **Auras:** units/heroes/hero_garrison units/heroes/han_hero_han_xin_1 units/heroes/han_hero_han_xin_2
- **Loot:** 10 food, 25 metal, 400 xp
- **Classes:** Unit Organic ConquestCritical Human FastMoving
- **Visible classes:** Soldier Hero Cavalry Melee Spearman

## Trained by

- **han** — `units/han/hero_han_xin_horse` (civil_centre_court, fortress)
