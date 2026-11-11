# cavalry_javelineer_b_trireme

Persian-specific unit of 0 A.D. 0.28.0 — only the persians can train it. See `docs/game_description/pers/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/pers/cavalry_javelineer_b_trireme` (full pers template chain).

## Guide

The ship-trained copy of the Persian Median Light Cavalry: same stats as the stable's javelin cavalry (100 HP, 18-pierce javelin at 30 m, 16.2 m/s walk, 100 food, 50 wood, 15 s), trained aboard Persian arrow ships and rams (`ship_arrow`, `ship_ram`) once the City-phase `equine_transports` tech is researched. Food and wood only, so it is cheap to mass from a fleet. Its role is mobile ranged harassment landed straight from the sea — against workers on an enemy coast or on islands — and it also hunts (5 food/s from meat) like other cavalry; on land maps the stable version is the same unit.

## Basic stats

- **Generic name:** Median Light Cavalry
- **Specific name:** Asabāra Māda
- **Health:** 100 HP
- **Armor:** 2 hack / 1 pierce / 15 crush
- **Attack:** Capture — strength 1.75 — range 4 m — repeat 1 s — restricted Field Palisade Wall
- **Attack:** Ranged "Javelin" — damage 18 pierce — range 30 m — prepare 0.4 s — repeat 1.5 s — spread 4 — preferred Human
- **Speed:** walk 16.2 m/s, run 22.68 m/s
- **Vision:** 80 m
- **Cost:** 100 food, 50 wood
- **Build time:** 15 s
- **Population:** 1
- **Gather:** rates: food: meat 5 /s
- **Gather:** capacity: 20 food
- **Requirements:** equine_transports
- **Loot:** 10 food, 5 wood, 130 xp
- **Classes:** Unit Organic ConquestCritical Human FastMoving CitizenSoldier
- **Visible classes:** Citizen Soldier Cavalry Ranged Javelineer
- **Rank:** Basic

## Ranks

### Advanced — `units/{civ}/cavalry_javelineer_a_trireme`
Requires 150 XP.
- Health: ×1.25 → 125 HP
- Capture strength: +0.7 → 2.45
- Build time: ×1.2 → 18 s
- Gather base speed: ×0.7 → 0.7
- Loot: ×1.2
- Ranged spread: ×0.8

### Elite — `units/{civ}/cavalry_javelineer_e_trireme`
Requires 150 XP.
- Health: ×1.25 (total ×1.56) → 156.25 HP
- Capture strength: +0.8 (total +1.5) → 3.25
- Build time: ×1.2 (total ×1.44) → 21.6 s
- Gather base speed: ×0.7 (total ×0.49) → 0.49
- Loot: ×1.2 (total ×1.44)
- Ranged spread: ×0.8 (total ×0.64)

## Trained by

- **pers** — `units/pers/cavalry_javelineer_b_trireme` (ship_arrow, ship_ram)
