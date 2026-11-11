# infantry_spearman_conscript

Roman-specific unit of 0 A.D. 0.28.0 — only the romans can train it. See `docs/game_description/rome/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/rome/infantry_spearman_conscript` (full roman template chain).

## Guide

The Levy Auxiliary Spearman is Rome's cheap, early-game citizen-soldier: at 50 food / 50 wood and 10 s build time, it is trained at the civil centre from the start of a match. Its main combat role is countering cavalry, thanks to the 2.5× attack bonus vs Cavalry on its melee spear, while its crush armor of 15 gives it some resilience against ranged and siege damage. As a CitizenSoldier and Worker it doubles as a basic gatherer (all four resources) and builder, so it can grow the economy between fights. Its attack strength (4.5 hack + 4 pierce) is weak for the front line, so it is a defensive/economic stopgap rather than the backbone of an assault force.

## Basic stats

- **Generic name:** Levy Auxiliary Spearman
- **Health:** 100 HP
- **Armor:** 3 hack / 3 pierce / 15 crush
- **Attack:** Capture — strength 2.5 — range 4 m — repeat 1 s — restricted Field Palisade Wall
- **Attack:** Melee "Spear" — damage 4.5 hack + 4 pierce — range 4 m — prepare 0.5 s — repeat 1 s — bonus 2.5× vs Cavalry — preferred Unit+!Ship
- **Speed:** walk 9.5 m/s, run 15.86 m/s
- **Vision:** 80 m
- **Cost:** 50 food, 50 wood
- **Build time:** 10 s
- **Population:** 1
- **Gather:** rates: food: fruit 0.5, grain 0.25, meat 1; wood: tree 0.75, ruins 5; stone: rock 0.5, ruins 2; metal: ore 0.5, ruins 2 /s
- **Gather:** capacity: 10 food, 10 wood, 10 stone, 10 metal
- **Classes:** Unit Organic ConquestCritical Human CitizenSoldier
- **Visible classes:** Builder Citizen Worker Soldier Infantry Melee Spearman
- **Rank:** Basic

## Trained by

- **rome** — `units/rome/infantry_spearman_conscript` (civil_centre)
