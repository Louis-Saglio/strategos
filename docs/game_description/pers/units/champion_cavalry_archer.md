# champion_cavalry_archer

Persian-specific unit of 0 A.D. 0.28.0 — only the persians can train it. See `docs/game_description/pers/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/pers/champion_cavalry_archer` (full pers template chain).

## Guide

The Bactrian Heavy Cavalry Archer (Asabāra Baxtriš) is the Persian
champion archer on horseback: 240 HP with 3/3/20 armor — as tanky as a
melee champion — while shooting 15 pierce arrows from 60 m at full cavalry
speed (walk 15.3 m/s). It kites melee infantry with impunity and shrugs
off return fire from other archers. It is trained at the stable from the
City phase (`unlock_champion_cavalry`), for 150 food + 80 wood + 100
metal, 25 s. Unlike the citizen cavalry it does not gather. It pairs with
the Bactrian Heavy Lancer (`champion_cavalry`, the melee counterpart) and
benefits from the "Nisean War Horses" tech only indirectly (that tech
affects the `Champion Cavalry Spearman` class — the lancer, not this
archer).

## Basic stats

- **Generic name:** Bactrian Heavy Cavalry Archer
- **Health:** 240 HP
- **Armor:** 3 hack / 3 pierce / 20 crush
- **Attack:** Capture — strength 3.5 — range 4 m — repeat 1 s — restricted Field Palisade Wall
- **Attack:** Ranged "Bow" — damage 15 pierce — range 60 m — prepare 0.8 s — repeat 1.25 s — preferred Human
- **Speed:** walk 15.3 m/s, run 21.42 m/s
- **Vision:** 80 m
- **Cost:** 150 food, 80 wood, 100 metal
- **Build time:** 25 s
- **Population:** 1
- **Classes:** Unit Organic ConquestCritical Human FastMoving
- **Visible classes:** Soldier Champion Cavalry Ranged Archer

## Trained by

- **pers** — `units/pers/champion_cavalry_archer` (stable)

