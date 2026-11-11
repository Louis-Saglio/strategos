# cavalry_archer_b

Trained by **4** civilisations. Generic (non-civ-specific) unit of 0 A.D. 0.28.0 — see `docs/game_description/generic/units/README.md` for the method.

Generic stats resolved from the shared template `simulation/templates/template_unit_cavalry_ranged_archer` (deepest template common to all civilisation variants; variants may override, see below).

## Guide

A fast mounted archer for hit-and-run combat: its 60 m ranged bow attack (7.5 pierce, preferred vs Human) combined with a 21.42 m/s run speed lets it harass and kite enemy infantry while staying out of melee reach. It costs 100 food, 50 wood, but is fragile against ranged fire with only 1 pierce armor, so it should avoid standing fights against archers or fortifications. Train it from the stable (also from the civil centre for `pers` and `ptol`) as a mobile damage dealer and skirmisher rather than a frontline unit.

## Basic stats

- **Generic name:** Cavalry Archer
- **Health:** 100 HP
- **Armor:** 2 hack / 1 pierce / 15 crush
- **Attack:** Capture — strength 1.75 — range 4 m — repeat 1 s — restricted Field Palisade Wall
- **Attack:** Ranged "Bow" — damage 7.5 pierce — range 60 m — prepare 0.8 s — repeat 1.25 s — preferred Human
- **Speed:** walk 15.3 m/s, run 21.42 m/s
- **Vision:** 80 m
- **Cost:** 100 food, 50 wood
- **Build time:** 15 s
- **Population:** 1
- **Gather:** rates: food: meat 5 /s
- **Gather:** capacity: 20 food
- **Classes:** Unit Organic ConquestCritical Human FastMoving CitizenSoldier
- **Visible classes:** Citizen Soldier Cavalry Ranged Archer
- **Rank:** Basic

## Civilisations that can train it

- **han** — `units/han/cavalry_archer_b` (stable)
- **pers** — `units/pers/cavalry_archer_b` (civil_centre, stable)
- **ptol** — `units/ptol/cavalry_archer_b` (civil_centre, stable)
- **sele** — `units/sele/cavalry_archer_b` (stable)

## Ranks

### Advanced — `units/{civ}/cavalry_archer_a`
Requires 150 XP.
- Health: ×1.25 → 125 HP
- Capture strength: +0.7 → 2.45
- Build time: ×1.2 → 18 s
- Gather base speed: ×0.7 → 0.7
- Loot: ×1.2
- Ranged spread: ×0.8

### Elite — `units/{civ}/cavalry_archer_e`
Requires 150 XP.
- Health: ×1.25 (total ×1.56) → 156.25 HP
- Capture strength: +0.8 (total +1.5) → 3.25
- Build time: ×1.2 (total ×1.44) → 21.6 s
- Gather base speed: ×0.7 (total ×0.49) → 0.49
- Loot: ×1.2 (total ×1.44)
- Ranged spread: ×0.8 (total ×0.64)


