# champion_fanatic

Gaul-specific unit of 0 A.D. 0.28.0 — only the gauls can train it. See `docs/game_description/gaul/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/gaul/champion_fanatic` (full gaul template chain).

## Guide

The Naked Fanatic is the Gaul champion spearman, trained at the temple from the Town phase. Its 2.5× attack bonus vs Cavalry makes it a dedicated anti-cavalry fighter, and its cost of only abundant resources (120 food, 100 wood) makes it cheap and easy to mass for a champion. With very high speed (walk 13.3 m/s, run 22.21 m/s) it can chase down mounted units, but its low hack/pierce armor (3/2) means it trades poorly in straight melee against other infantry. Train it when the enemy fields cavalry; prefer cheaper citizen-soldiers for general fighting.

## Basic stats

- **Generic name:** Naked Fanatic
- **Health:** 200 HP
- **Armor:** 3 hack / 2 pierce / 20 crush
- **Attack:** Capture — strength 5 — range 4 m — repeat 1 s — restricted Field Palisade Wall
- **Attack:** Melee "Spear" — damage 10 hack + 8.5 pierce — range 4 m — prepare 0.5 s — repeat 1 s — bonus 2.5× vs Cavalry — preferred Unit+!Ship
- **Speed:** walk 13.3 m/s, run 22.21 m/s
- **Vision:** 80 m
- **Cost:** 120 food, 100 wood
- **Build time:** 15 s
- **Population:** 1
- **Classes:** Unit Organic ConquestCritical Human
- **Visible classes:** Soldier Champion Infantry Melee Spearman

## Trained by

- **gaul** — `units/gaul/champion_fanatic` (temple)
