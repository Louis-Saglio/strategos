# hero_boiorix

Germanic-specific unit of 0 A.D. 0.28.0 — only the germans can train it. See `docs/game_description/germ/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/germ/hero_boiorix` (full germ template chain).

## Guide

Boiorix is germ's cavalry swordsman hero, trained at the fortress (City phase) for 300 food, 150 wood and 300 metal, 0 population and 50 s — the most metal-expensive of the three heroes, so he is a deliberate investment (only one hero can be alive at a time). His 1200 HP, 11/9/25 armor, 26-hack sword (0.75 s repeat, 4 m range), 10-strength Capture attack and cavalry speed (walk 18, run 25.2 m/s) make him a durable fast striker. The reason to buy him is his auras: "Hero of Arausio" is global — every soldier you own, anywhere on the map, gets +10% melee hack/pierce and ranged pierce/crush damage while he lives (melee crush, such as the axeman's 6 crush, is not boosted) — and "High Ground" gives soldiers within 60 m +5 range for ranged units and +2 for melee. Since the global buff does not need him near the fight, keep him alive and out of harm's way rather than spending him as a front-line cavalryman.

## Basic stats

- **Generic name:** Hero Cavalry Swordsman
- **Specific name:** Boiorix
- **Health:** 1200 HP
- **Armor:** 11 hack / 9 pierce / 25 crush
- **Attack:** Capture — strength 10 — range 4 m — repeat 1 s — restricted Field Palisade Wall
- **Attack:** Melee "Sword" — damage 26 hack — range 4 m — prepare 0.375 s — repeat 0.75 s — preferred Unit+!Ship
- **Speed:** walk 18 m/s, run 25.2 m/s
- **Vision:** 100 m
- **Cost:** 300 food, 150 wood, 300 metal
- **Build time:** 50 s
- **Population:** 0
- **Requirements:** phase_city
- **Auras:** units/heroes/hero_garrison units/heroes/germ_hero_boiorix_1 units/heroes/germ_hero_boiorix_2
- **Loot:** 10 food, 25 metal, 400 xp
- **Classes:** Unit Organic ConquestCritical Human FastMoving
- **Visible classes:** Soldier Hero Cavalry Melee Swordsman

## Trained by

- **germ** — `units/germ/hero_boiorix` (fortress)
