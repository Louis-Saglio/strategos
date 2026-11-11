# hero_lugius

Germanic-specific unit of 0 A.D. 0.28.0 — only the germans can train it. See `docs/game_description/germ/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/germ/hero_lugius` (full germ template chain).

## Guide

Lugius is germ's cavalry spearman hero, trained at the fortress (City phase) for 300 food, 200 wood and 250 metal, 0 population and 50 s — premium metal, and only one hero may be alive at a time. He has 1200 HP, 11/10/25 armor, a 16 hack + 12 pierce spear (1.25 s repeat, 4 m range) with a 1.75× bonus against cavalry, and cavalry speed (walk 18, run 25.2 m/s), so he is a fast raider and cavalry counter rather than a line-holder. His auras suit raiding: "Plundering Raids" gives Humans, Siege Engines and Ships within 60 m +15 food and wood loot per kill, and "Terror Cimbricus" cuts vision by 20 m for enemy soldiers, rams, heroes and structures within 100 m, so the targets he approaches see him later. (The aura lists the class `Ships`, which does not exist — the ship class is `Ship` — so enemy ships are not affected.) Use him with a mobile raiding force against undefended economies and expansions.

## Basic stats

- **Generic name:** Hero Cavalry Spearman
- **Specific name:** Lugius
- **Health:** 1200 HP
- **Armor:** 11 hack / 10 pierce / 25 crush
- **Attack:** Capture — strength 10 — range 4 m — repeat 1 s — restricted Field Palisade Wall
- **Attack:** Melee "Spear" — damage 16 hack + 12 pierce — range 4 m — prepare 0.5 s — repeat 1.25 s — bonus 1.75× vs Cavalry — preferred Unit+!Ship
- **Speed:** walk 18 m/s, run 25.2 m/s
- **Vision:** 100 m
- **Cost:** 300 food, 200 wood, 250 metal
- **Build time:** 50 s
- **Population:** 0
- **Requirements:** phase_city
- **Auras:** units/heroes/hero_garrison units/heroes/germ_hero_lugius_1 units/heroes/germ_hero_lugius_2
- **Loot:** 10 food, 25 metal, 400 xp
- **Classes:** Unit Organic ConquestCritical Human FastMoving
- **Visible classes:** Soldier Hero Cavalry Melee Spearman

## Trained by

- **germ** — `units/germ/hero_lugius` (fortress)
