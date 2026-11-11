# hero_ashoka

Mauryan-specific unit of 0 A.D. 0.28.0 — only the mauryas can train it. See `docs/game_description/maur/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/maur/hero_ashoka` (full maur template chain).

## Guide

Ashoka the Great (Aśoka Devānāmpriya) is the Mauryan chariot hero — a
1500 HP, 6/8/25-armored chariot archer (28 pierce from 60 m) at chariot
speed. Two things make him the keystone hero. His "Buddhism" aura is
**global**: own temples −50% resource costs and build time, and temple
technology costs/research time −50% — cheap temples everywhere. And he
carries the `Ashoka` class, which is the gate on the Mauryan **Edict
Pillars**: the `Pillar` build limit is 0 by default and +5 while Ashoka
is owned — so pillars (traders +20% speed) can only be built while
Ashoka lives. Train Ashoka, build the palace, dot pillars along your
trade routes, and keep him alive. 0 population, 1 hero alive at a time,
trained at the palace (City phase).

## Basic stats

- **Generic name:** Ashoka the Great
- **Health:** 1500 HP
- **Armor:** 6 hack / 8 pierce / 25 crush
- **Attack:** Capture — strength 10 — range 4 m — repeat 1 s — restricted Field Palisade Wall
- **Attack:** Ranged "Bow" — damage 28 pierce — range 60 m — prepare 0.8 s — repeat 1.25 s — preferred Human
- **Speed:** walk 16.83 m/s, run 23.56 m/s
- **Vision:** 100 m
- **Cost:** 360 food, 250 wood, 300 metal
- **Build time:** 60 s
- **Population:** 0
- **Classes:** Unit Organic ConquestCritical Human FastMoving Ashoka
- **Visible classes:** Soldier Hero Cavalry Ranged Archer Chariot

## Trained by

- **maur** — `units/maur/hero_ashoka` (palace)

