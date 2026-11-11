# hero_marcellus

Roman-specific unit of 0 A.D. 0.28.0 — only the romans can train it. See `docs/game_description/rome/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/rome/hero_marcellus` (full roman template chain).

## Guide

Marcellus is the roman hero cavalry swordsman, trained at the fortress for 300 food, 150 wood and 300 metal, costing 0 population — metal-intensive, so a premium unit that is hard to mass. He is a durable front-line fighter (1200 HP, 26 hack damage at 0.75 s repeat) whose real value is his auras: within 60 m he boosts the attack damage of all own cavalry by 15 %, and within 30 m he cuts enemy infantry damage by 10 % — so he belongs embedded in a cavalry strike force rather than fighting alone. His 18 m/s walk / 25.2 m/s run speed and Capture attack (strength 10) also make him suited to fast raids and capturing buildings. Train one as a force multiplier once a fortress is up and cavalry production is running.

## Basic stats

- **Generic name:** Hero Cavalry Swordsman
- **Health:** 1200 HP
- **Armor:** 11 hack / 9 pierce / 25 crush
- **Attack:** Capture — strength 10 — range 4 m — repeat 1 s — restricted Field Palisade Wall
- **Attack:** Melee "Sword" — damage 26 hack — range 4 m — prepare 0.375 s — repeat 0.75 s — preferred Unit+!Ship
- **Speed:** walk 18 m/s, run 25.2 m/s
- **Vision:** 100 m
- **Cost:** 300 food, 150 wood, 300 metal
- **Build time:** 50 s
- **Population:** 0
- **Classes:** Unit Organic ConquestCritical Human FastMoving
- **Visible classes:** Soldier Hero Cavalry Melee Swordsman

## Trained by

- **rome** — `units/rome/hero_marcellus` (fortress)
