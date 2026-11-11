# hero_liu_bang_horse

Han-specific unit of 0 A.D. 0.28.0 — only the han can train it. See `docs/game_description/han/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/han/hero_liu_bang_horse` (full han template chain).

## Guide

Liu Bang is han's cavalry-swordsman hero, trained at the Imperial Court or the fortress in the City phase for 300 food, 150 wood and 300 metal (0 population, 50 s); only one hero may be alive at a time. With 1200 HP, 11/9/25 armor and a 26 hack sword at 0.75 s repeat (about 34.7 damage/s) on a 25.2 m/s mount he has the highest melee damage of han's heroes, and he captures at strength 10. His "Confucian Reforms" auras give own cavalry within 40 m +20% attack damage (melee and ranged, so chariots and cavalry archers count) and, globally, +10 health regeneration to all of your walls — a natural partner for han's +50% wall health. Pick him for a cavalry-centred army (cavalry swordsmen/spearmen, Youzhou, chariots) or a wall-based defence; the 300 metal is a premium cost, so time him for when champions are already flowing.

## Basic stats

- **Generic name:** Hero Cavalry Swordsman
- **Specific name:** Liú Bāng
- **Health:** 1200 HP
- **Armor:** 11 hack / 9 pierce / 25 crush
- **Attack:** Capture — strength 10 — range 4 m — repeat 1 s — restricted Field Palisade Wall
- **Attack:** Melee "Sword" — damage 26 hack — range 4 m — prepare 0.375 s — repeat 0.75 s — preferred Unit+!Ship
- **Speed:** walk 18 m/s, run 25.2 m/s
- **Vision:** 100 m
- **Cost:** 300 food, 150 wood, 300 metal
- **Build time:** 50 s
- **Population:** 0
- **Requirements:** phase_city
- **Auras:** units/heroes/hero_garrison units/heroes/han_hero_liu_bang_1 units/heroes/han_hero_liu_bang_2
- **Loot:** 10 food, 25 metal, 400 xp
- **Classes:** Unit Organic ConquestCritical Human FastMoving
- **Visible classes:** Soldier Hero Cavalry Melee Swordsman

## Trained by

- **han** — `units/han/hero_liu_bang_horse` (civil_centre_court, fortress)
