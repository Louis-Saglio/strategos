# cavalry_axeman_b_trireme

Persian-specific unit of 0 A.D. 0.28.0 — only the persians can train it. See `docs/game_description/pers/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/pers/cavalry_axeman_b_trireme` (full pers template chain).

## Guide

The ship-trained copy of the Persian Hyrcanian Cavalry: same stats as the stable's axe cavalry (160 HP, 10 hack + 3.5 crush axe, 18 m/s walk, 100 food, 40 wood, 10 metal, 15 s), but trained aboard Persian arrow ships and rams (`ship_arrow`, `ship_ram`) once the City-phase `equine_transports` tech is researched. Its value is positional rather than statistical: a warship can deliver melee cavalry directly onto an enemy shore, an island or a coastline far from the Persian stables, without a separate transport trip. A bot should use it on water and island maps to land raiders or reinforce a beachhead; on land maps the stable version is the same unit.

## Basic stats

- **Generic name:** Hyrcanian Cavalry
- **Specific name:** Asabāra Varkaniya
- **Health:** 160 HP
- **Armor:** 3 hack / 2 pierce / 15 crush
- **Attack:** Capture — strength 1.75 — range 4 m — repeat 1 s — restricted Field Palisade Wall
- **Attack:** Melee "Axe" — damage 10 hack + 3.5 crush — range 4 m — prepare 0.5 s — repeat 1 s — preferred Unit+!Ship
- **Speed:** walk 18 m/s, run 25.2 m/s
- **Vision:** 80 m
- **Cost:** 100 food, 40 wood, 10 metal
- **Build time:** 15 s
- **Population:** 1
- **Gather:** rates: food: meat 5 /s
- **Gather:** capacity: 20 food
- **Requirements:** equine_transports
- **Loot:** 10 food, 4 wood, 1 metal, 130 xp
- **Classes:** Unit Organic ConquestCritical Human FastMoving CitizenSoldier
- **Visible classes:** Citizen Soldier Cavalry Melee Axeman
- **Rank:** Basic

## Ranks

### Advanced — `units/{civ}/cavalry_axeman_a_trireme`
Requires 150 XP.
- Health: ×1.25 → 200 HP
- Melee attack damage: ×1.1 → hack 11 + crush 3.85
- Capture strength: +0.7 → 2.45
- Build time: ×1.2 → 18 s
- Gather base speed: ×0.7 → 0.7
- Loot: ×1.2

### Elite — `units/{civ}/cavalry_axeman_e_trireme`
Requires 150 XP.
- Health: ×1.25 (total ×1.56) → 250 HP
- Melee attack damage: ×1.1 (total ×1.21) → hack 12.1 + crush 4.24
- Capture strength: +0.8 (total +1.5) → 3.25
- Build time: ×1.2 (total ×1.44) → 21.6 s
- Gather base speed: ×0.7 (total ×0.49) → 0.49
- Loot: ×1.2 (total ×1.44)

## Trained by

- **pers** — `units/pers/cavalry_axeman_b_trireme` (ship_arrow, ship_ram)
