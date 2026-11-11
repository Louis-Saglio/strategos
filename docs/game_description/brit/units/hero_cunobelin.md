# hero_cunobelin

British-specific unit of 0 A.D. 0.28.0 — only the britons can train it. See `docs/game_description/brit/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/brit/hero_cunobelin` (full british template chain).

## Guide

Cunobeline (Cunobelinos) is the British cavalry-swordsman hero — 1200 HP
with a 26-hack sword and cavalry speed (run 25.2 m/s). His aura,
"Britannorum Rex", regenerates **+0.8 HP/s for every own `Human` unit
within 30 m** — soldiers, workers and war dogs alike. It is a
slow-but-free heal that keeps a campaigning force topped up between
fights and gives the Britons sustain the civ otherwise lacks (no extra
healing techs beyond the generic temple line). The `Human` class means
the pop-free dog swarms regen too. Keep him embedded in the army — the
aura radius is small, and a hero left alone wastes the civ's only
passive healing. 0 population, City phase, trained at the **fortress**,
subject to the global limit of 1 hero alive at a time. A vestigial foot
variant (`hero_cunobelin_infantry`) exists but nothing trains it.

## Basic stats

- **Generic name:** Cunobeline
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

- **brit** — `units/brit/hero_cunobelin` (fortress)
