# hero_scipio

Roman-specific unit of 0 A.D. 0.28.0 — only the romans can train it. See `docs/game_description/rome/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/rome/hero_scipio` (full roman template chain).

## Guide

Scipio is a hero cavalry swordsman trained at the fortress, meant to fight alongside the army rather than alone: his Triumph aura gives nearby Soldiers and Siege Engines +2 capture strength and +20% melee and ranged damage, so his value scales with the size of the force he accompanies. He is himself a durable, fast fighter (1200 HP, 25.2 m/s run, 26 hack damage against units, plus a capture attack) and costs 0 population, but the 300 food / 150 wood / 300 metal price — metal-intensive, so a premium unit — and 50 s train time make him an investment for a developed economy.

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

- **rome** — `units/rome/hero_scipio` (fortress)
