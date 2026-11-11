# champion_infantry_pikeman

Trained by **2** civilisations. Generic (non-civ-specific) unit of 0 A.D. 0.28.0 — see `docs/game_description/generic/units/README.md` for the method.

Generic stats resolved from the shared template `simulation/templates/template_unit_champion_infantry_pikeman` (deepest template common to all civilisation variants; variants may override, see below).

## Guide

The Champion Pikeman is a late-game anti-cavalry specialist: its 2.5× attack bonus vs Cavalry and 8 m reach make it the go-to answer to enemy mounted units. Its 20 crush armor also lets it absorb siege damage while approaching, and its 8 hack + 15 pierce melee damage is respectable against Humans in general. At 80 food, 60 wood, 80 metal from the barracks (ptol and sele only), it is metal-intensive, so a premium unit: train it as a cavalry counter rather than a general-purpose line unit.

## Basic stats

- **Generic name:** Champion Pikeman
- **Health:** 200 HP
- **Armor:** 8 hack / 8 pierce / 20 crush
- **Attack:** Capture — strength 5 — range 4 m — repeat 1 s — restricted Field Palisade Wall
- **Attack:** Melee "Pike" — damage 8 hack + 15 pierce — range 8 m — prepare 1 s — repeat 2 s — bonus 2.5× vs Cavalry — preferred Human
- **Speed:** walk 8.55 m/s, run 14.28 m/s
- **Vision:** 80 m
- **Cost:** 80 food, 60 wood, 80 metal
- **Build time:** 20 s
- **Population:** 1
- **Classes:** Unit Organic ConquestCritical Human
- **Visible classes:** Soldier Champion Infantry Melee Pikeman

## Civilisations that can train it

- **ptol** — `units/ptol/champion_infantry_pikeman` (barracks)
- **sele** — `units/sele/champion_infantry_pikeman` (barracks)
