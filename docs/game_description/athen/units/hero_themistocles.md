# hero_themistocles

Athenian-specific unit of 0 A.D. 0.28.0 — only the athenians can train it. See `docs/game_description/athen/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/athen/hero_themistocles` (full athen template chain).

## Guide

Themistocles is the Athenian swordsman hero (1000 HP, 26-hack sword on
0.75 s) and the naval-and-walls economy hero. His auras are both
**global**: "Naval Preparation" (ships −50% metal cost and build time,
+15% movement speed) and "Themistoclean Walls" (walls and palisades
−50% resource costs and −20% build time). Pick him when the game is
going naval or defensive: he halves the cost of the fleet and the
walls, which stacks with the `long_walls` tech for cheap
neutral-territory walling. Trained at the prytaneion (City phase). 0
population, 1 hero alive at a time.

## Basic stats

- **Generic name:** Themistocles
- **Health:** 1000 HP
- **Armor:** 12 hack / 12 pierce / 25 crush
- **Attack:** Capture — strength 10 — range 4 m — repeat 1 s — restricted Field Palisade Wall
- **Attack:** Melee "Sword" — damage 26 hack — range 3 m — prepare 0.375 s — repeat 0.75 s — preferred Unit+!Ship
- **Speed:** walk 9 m/s, run 15.03 m/s
- **Vision:** 100 m
- **Cost:** 200 food, 150 wood, 200 metal
- **Build time:** 50 s
- **Population:** 0
- **Classes:** Unit Organic ConquestCritical Human
- **Visible classes:** Soldier Hero Infantry Melee Swordsman

## Trained by

- **athen** — `units/athen/hero_themistocles` (prytaneion)

