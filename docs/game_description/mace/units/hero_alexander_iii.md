# hero_alexander_iii

Macedonian-specific unit of 0 A.D. 0.28.0 — only the macedonians can train it. See `docs/game_description/mace/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/mace/hero_alexander_iii` (full mace template chain).

## Guide

Alexander III is the Macedonian cavalry hero, trained at the fortress (City phase) for 300 food, 150 wood and 300 metal, 0 population — the most metal-expensive of mace's three heroes, and only one hero can be alive at a time. He is a fast (walk 18 m/s, run 25.2 m/s) and durable cavalry swordsman: 1200 HP, 11 hack / 9 pierce / 25 crush armor, a 26 hack sword every 0.75 s (about 35 damage per second, ×1.2 against heroes) and a strength-10 capture attack. His three auras make him a force multiplier for a moving army: soldiers within 60 m get +10% attack damage and +15% movement speed ("Rapid Conquest"), enemy soldiers and structures within 30 m deal −10% attack damage ("Undefeated"), and enemy civic centres within 60 m regenerate garrisoned capture points at half rate ("Conqueror"), which makes capturing a defended civic centre much easier. Keep him with the main army and out of the first line.

## Basic stats

- **Generic name:** Alexander III the Great
- **Specific name:** Alexandros ho Megas
- **Health:** 1200 HP
- **Armor:** 11 hack / 9 pierce / 25 crush
- **Attack:** Capture — strength 10 — range 4 m — repeat 1 s — restricted Field Palisade Wall
- **Attack:** Melee "Sword" — damage 26 hack — range 4 m — prepare 0.375 s — repeat 0.75 s — bonus 1.2× vs Hero — preferred Unit+!Ship
- **Speed:** walk 18 m/s, run 25.2 m/s
- **Vision:** 100 m
- **Cost:** 300 food, 150 wood, 300 metal
- **Build time:** 50 s
- **Population:** 0
- **Requirements:** phase_city
- **Auras:** units/heroes/hero_garrison units/heroes/mace_hero_alexander_iii_1 units/heroes/mace_hero_alexander_iii_2 units/heroes/mace_hero_alexander_iii_3
- **Loot:** 10 food, 25 metal, 400 xp
- **Classes:** Unit Organic ConquestCritical Human FastMoving
- **Visible classes:** Soldier Hero Cavalry Melee Swordsman

## Trained by

- **mace** — `units/mace/hero_alexander_iii` (fortress)
