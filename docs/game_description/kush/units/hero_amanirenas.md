# hero_amanirenas

Kushite-specific unit of 0 A.D. 0.28.0 — only the kushites can train it. See `docs/game_description/kush/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/kush/hero_amanirenas` (full kush template chain).

## Guide

Amanirenas is kush's archer hero, a chariot-mounted bow-woman trained at the fortress in the City phase for 360 food, 250 wood and 300 metal (0 population; only one hero may be alive at a time). She has 1500 HP, a 28-pierce bow with 60 m range (0.5 spread, 1.25 s repeat) and cavalry-class mobility (walk 17, run 23.8 m/s), so she can kite, but her armor is low for a hero (6 hack / 8 pierce). Her "Warrior Queen" aura gives Champions within 60 m +2 capture strength and +20% melee and ranged damage, so she belongs with the Temple Guards, Noble Archers, champion cavalry and elephants rather than with citizen soldiers. If the Grand Temple of Amun stands, all heroes lose 5% health (about 1425 HP here); keep her behind the champion line.

## Basic stats

- **Generic name:** Amanirenas
- **Specific name:** Amnirense qore li kdwe li
- **Health:** 1500 HP
- **Armor:** 6 hack / 8 pierce / 25 crush
- **Attack:** Capture — strength 10 — range 4 m — repeat 1 s — restricted Field Palisade Wall
- **Attack:** Ranged "Bow" — damage 28 pierce — range 60 m — prepare 0.8 s — repeat 1.25 s — spread 0.5 — preferred Human
- **Speed:** walk 17 m/s, run 23.8 m/s
- **Vision:** 100 m
- **Cost:** 360 food, 250 wood, 300 metal
- **Build time:** 60 s
- **Population:** 0
- **Requirements:** phase_city
- **Auras:** units/heroes/hero_garrison units/heroes/kush_hero_amanirenas
- **Loot:** 12 food, 30 metal, 480 xp
- **Classes:** Unit Organic ConquestCritical Human FastMoving
- **Visible classes:** Soldier Hero Cavalry Ranged Archer Chariot

## Trained by

- **kush** — `units/kush/hero_amanirenas` (fortress)
