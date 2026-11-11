# hero_ptolemy_iv

Ptolemaic-specific unit of 0 A.D. 0.28.0 — only the ptolemies can train it. See `docs/game_description/ptol/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/ptol/hero_ptolemy_iv` (full ptol template chain).

## Guide

Ptolemy IV Philopator (Ptolemaios D' Philopatōr) is the Ptolemaic cavalry
swordsman hero: 1200 HP with 11/9/25 armor, a fast 26-hack sword (0.75 s
repeat) and full cavalry speed (walk 18 m/s) — the best pure fighter of
the three. His "Raphia" aura gives every own pikeman within 60 m **+40%
health** — a large boost to the Egyptian Pikeman line (100 → 140 HP) and
the Royal Guard pikemen, so Ptolemy IV turns a phalanx front into a wall
of meat. He also carries the hidden `PtolemyIV` class, which raises the
Juggernaut limit by 4 while he lives (irrelevant in practice, see the
Juggernaut entry). 0 population, 1 hero alive at a time, trained at the
Temple of Isis (City phase).

## Basic stats

- **Generic name:** Ptolemy IV
- **Health:** 1200 HP
- **Armor:** 11 hack / 9 pierce / 25 crush
- **Attack:** Capture — strength 10 — range 4 m — repeat 1 s — restricted Field Palisade Wall
- **Attack:** Melee "Sword" — damage 26 hack — range 4 m — prepare 0.375 s — repeat 0.75 s — preferred Unit+!Ship
- **Speed:** walk 18 m/s, run 25.2 m/s
- **Vision:** 100 m
- **Cost:** 300 food, 150 wood, 300 metal
- **Build time:** 50 s
- **Population:** 0
- **Classes:** Unit Organic ConquestCritical Human FastMoving PtolemyIV
- **Visible classes:** Soldier Hero Cavalry Melee Swordsman

## Trained by

- **ptol** — `units/ptol/hero_ptolemy_iv` (temple_2)

