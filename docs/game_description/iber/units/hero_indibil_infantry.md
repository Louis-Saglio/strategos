# hero_indibil_infantry

Iberian-specific unit of 0 A.D. 0.28.0 — only the iberians can train it. See `docs/game_description/iber/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/iber/hero_indibil_infantry` (full iber template chain).

## Guide

The unmounted Indibil — a vestigial twin template: an infantry spearman
hero (1000 HP, 15 + 12 spear with the full 2.5× vs Cavalry bonus) carrying
the same global "Mobilization" aura as the mounted version. Nothing
trains it (the fortress trains `hero_indibil`, the mounted one) and no
upgrade path links the two, so it is unreachable in ordinary skirmish
play — only a directly placed train command would produce it.

## Basic stats

- **Generic name:** Hero Spearman
- **Health:** 1000 HP
- **Armor:** 12 hack / 12 pierce / 25 crush
- **Attack:** Capture — strength 10 — range 4 m — repeat 1 s — restricted Field Palisade Wall
- **Attack:** Melee "Spear" — damage 15 hack + 12 pierce — range 4 m — prepare 0.45 s — repeat 1 s — bonus 2.5× vs Cavalry — preferred Unit+!Ship
- **Speed:** walk 9 m/s, run 15.03 m/s
- **Vision:** 100 m
- **Cost:** 200 food, 200 wood, 150 metal
- **Build time:** 50 s
- **Population:** 0
- **Classes:** Unit Organic ConquestCritical Human
- **Visible classes:** Soldier Hero Infantry Melee Spearman

## Trained by

- **iber** — `units/iber/hero_indibil_infantry` (not trained by anything; train directly only)

