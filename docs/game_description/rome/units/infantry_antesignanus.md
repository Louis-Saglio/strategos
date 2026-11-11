# infantry_antesignanus

Roman-specific unit of 0 A.D. 0.28.0 — only the romans can train it. See `docs/game_description/rome/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/rome/infantry_antesignanus` (full roman template chain).

## Guide

The Legionary Skirmisher is the romans' elite ranged citizen-soldier, trained at the army camp. It fights at 30 m with a fast 16-pierce javelin attack (preferred target Human) while still gathering resources at CitizenSoldier rates, making it a flexible pick for an army camp producing both economy and combat units. Already Elite rank, it costs 50 food, 50 wood, 15 metal: the food and wood are abundant and easy to mass, but the 15 metal is a scarce premium resource, so massing it is a modest investment. Its 50 HP and 1 hack/pierce armor make it fragile in melee.

## Basic stats

- **Generic name:** Legionary Skirmisher
- **Health:** 50 HP
- **Armor:** 1 hack / 1 pierce / 10 crush
- **Attack:** Capture — strength 2.5 — range 4 m — repeat 1 s — restricted Field Palisade Wall
- **Attack:** Ranged "Javelin" — damage 16 pierce — range 30 m — prepare 0.4 s — repeat 1.5 s — preferred Human
- **Speed:** walk 11.4 m/s, run 19.04 m/s
- **Vision:** 80 m
- **Cost:** 50 food, 50 wood, 15 metal
- **Build time:** 10 s
- **Population:** 1
- **Gather:** rates: food: fruit 0.5, grain 0.25, meat 1; wood: tree 0.75, ruins 5; stone: rock 0.5, ruins 2; metal: ore 0.5, ruins 2 /s
- **Gather:** capacity: 10 food, 10 wood, 10 stone, 10 metal
- **Classes:** Unit Organic ConquestCritical Human CitizenSoldier
- **Visible classes:** Builder Citizen Worker Soldier Infantry Ranged Javelineer Legionary
- **Rank:** Elite

Note: this unit is already **Elite** rank — in game it also receives the auto-researched `unit_elite` tech modifications (see the Ranks sections in `docs/game_description/generic/units/`).

## Trained by

- **rome** — `units/rome/infantry_antesignanus` (army_camp)
