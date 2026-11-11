# champion_chariot_academy

Han-specific unit of 0 A.D. 0.28.0 — only the han can train it. See `docs/game_description/han/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/han/champion_chariot_academy` (full han template chain).

## Guide

The Han War Chariot is a ranged champion cavalry unit (classes Cavalry, Ranged, Archer, Chariot) trained at the Imperial Academy in the City phase for 180 food, 100 wood and 120 metal (22.5 s, 1 population) — the priciest academy champion, and metal is the premium resource. It shoots a 15 pierce bow at 60 m every 1.25 s (12 pierce/s) at 17 m/s walk / 23.8 m/s run, making it a mobile harasser and fire-support platform. With 300 HP but only 1 hack / 5 pierce / 20 crush armor it dies fast if caught in melee, and as a Chariot it turns slowly (turn rate 5, `large` passability class), so keep it behind a melee line. It carries the Archer class, so `archer_attack_spread` applies, and as Cavalry/Champion it benefits from Liu Bang's and Wei Qing's auras (one hero alive at a time).

## Basic stats

- **Generic name:** Han War Chariot
- **Specific name:** Zhanche
- **Health:** 300 HP
- **Armor:** 1 hack / 5 pierce / 20 crush
- **Attack:** Capture — strength 3.5 — range 4 m — repeat 1 s — restricted Field Palisade Wall
- **Attack:** Ranged "Bow" — damage 15 pierce — range 60 m — prepare 0.8 s — repeat 1.25 s — spread 1 — preferred Human
- **Speed:** walk 17 m/s, run 23.8 m/s
- **Vision:** 80 m
- **Cost:** 180 food, 100 wood, 120 metal
- **Build time:** 22.5 s
- **Population:** 1
- **Requirements:** phase_city
- **Loot:** 18 food, 10 wood, 12 metal, 240 xp
- **Classes:** Unit Organic ConquestCritical Human FastMoving
- **Visible classes:** Soldier Champion Cavalry Ranged Archer Chariot

## Trained by

- **han** — `units/han/champion_chariot_academy` (academy)
