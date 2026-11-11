# hero_indibil

Iberian-specific unit of 0 A.D. 0.28.0 — only the iberians can train it. See `docs/game_description/iber/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/iber/hero_indibil` (full iber template chain).

## Guide

Indibil is the Iberian cavalry hero — a 1200 HP cavalry spearman (16 + 12,
1.75× vs Cavalry) at full cavalry speed. His "Mobilization" aura is
**global**: while he lives, every own soldier costs **−15% resources and
−20% training time** — the economic hero of the three, shaving costs on
the entire citizen and champion roster (it stacks with the team bonus on
javelineers and with monument auras on damage). Keep him alive behind the
lines; the discount applies map-wide, so he needs no frontline exposure.
0 population, 1 hero alive at a time, trained at the fortress (City
phase).

## Basic stats

- **Generic name:** Hero Cavalry Spearman
- **Health:** 1200 HP
- **Armor:** 11 hack / 10 pierce / 25 crush
- **Attack:** Capture — strength 10 — range 4 m — repeat 1 s — restricted Field Palisade Wall
- **Attack:** Melee "Spear" — damage 16 hack + 12 pierce — range 4 m — prepare 0.5 s — repeat 1.25 s — bonus 1.75× vs Cavalry — preferred Unit+!Ship
- **Speed:** walk 18 m/s, run 25.2 m/s
- **Vision:** 100 m
- **Cost:** 300 food, 200 wood, 250 metal
- **Build time:** 50 s
- **Population:** 0
- **Classes:** Unit Organic ConquestCritical Human FastMoving
- **Visible classes:** Soldier Hero Cavalry Melee Spearman

## Trained by

- **iber** — `units/iber/hero_indibil` (fortress)

