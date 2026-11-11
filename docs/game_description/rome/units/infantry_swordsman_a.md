# infantry_swordsman_a

Roman-specific unit of 0 A.D. 0.28.0 — only the romans can train it. See `docs/game_description/rome/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/rome/infantry_swordsman_a` (full roman template chain).

## Guide

The Roman Swordsman is Rome's core melee infantry, trained at the Army Camp (`structures/rome/army_camp`) and starting directly at Advanced rank. At 50 food / 40 wood / 10 metal it is mostly paid in abundant food and wood, so easy to mass, though the metal is a scarce resource: it fights with an 8-hack sword attack, can capture buildings (strength 2.5), and doubles as an economic worker that gathers all resources and builds roman structures — but its gather rate degrades as it ranks up (×0.7 per promotion), so veteran swordsmen are best kept fighting. With experience it promotes for free to Elite and eventually to the champion-grade Legionary (195 HP, hack 10.65), making long-lived swordsman squads the backbone of a roman army.

## Basic stats

- **Generic name:** Roman Swordsman
- **Health:** 100 HP
- **Armor:** 3 hack / 3 pierce / 15 crush
- **Attack:** Capture — strength 2.5 — range 4 m — repeat 1 s — restricted Field Palisade Wall
- **Attack:** Melee "Sword" — damage 8 hack — range 3 m — prepare 0.375 s — repeat 0.75 s — preferred Unit+!Ship
- **Speed:** walk 9.5 m/s, run 15.86 m/s
- **Vision:** 80 m
- **Cost:** 50 food, 40 wood, 10 metal
- **Build time:** 10 s
- **Population:** 1
- **Gather:** rates: food: fruit 0.5, grain 0.25, meat 1; wood: tree 0.75, ruins 5; stone: rock 0.5, ruins 2; metal: ore 0.5, ruins 2 /s
- **Gather:** capacity: 10 food, 10 wood, 10 stone, 10 metal
- **Classes:** Unit Organic ConquestCritical Human CitizenSoldier
- **Visible classes:** Builder Citizen Worker Soldier Infantry Melee Swordsman
- **Rank:** Advanced

## Ranks

### Elite — `units/rome/infantry_swordsman_e`
Requires 100 XP.
- Health: ×1.25 (total ×1.56) → 156.25 HP
- Melee attack damage: ×1.1 (total ×1.21) → hack 9.68
- Capture strength: +0.8 (total +1.5) → 4
- Build time: ×1.2 (total ×1.44) → 14.4 s
- Gather base speed: ×0.7 (total ×0.49) → 0.49
- Loot: ×1.2 (total ×1.44)

### Elite — `units/rome/infantry_legionary`
Requires 2000 XP.
- cost 50 food, 50 wood, 15 metal
- Health: ×1.25 (total ×1.95) → 195.31 HP
- Melee attack damage: ×1.1 (total ×1.33) → hack 10.65
- Capture strength: +0.8 (total +2.3) → 4.8
- Build time: ×1.2 (total ×1.73) → 17.28 s
- Gather base speed: ×0.7 (total ×0.34) → 0.34
- Loot: ×1.2 (total ×1.73)

Note: this unit is already **Advanced** rank — in game it also receives the auto-researched `unit_advanced` tech modifications (see the Ranks sections in `docs/game_description/generic/units/`).

## Trained by

- **rome** — `units/rome/infantry_swordsman_a` (army_camp)
