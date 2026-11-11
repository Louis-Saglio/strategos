# champion_infantry_trumpeter

Gaul-specific unit of 0 A.D. 0.28.0 — only the gauls can train it. See `docs/game_description/gaul/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/gaul/champion_infantry_trumpeter` (full gaul template chain).

## Guide

A support champion whose main value is its "Intimidating Sound" aura (`auras/units/carnyx.json`): enemy Soldiers within 20 m get −10% attack damage and capture strength, so it pays off when kept alive inside a melee blob rather than sent in alone. It still fights as a solid champion in its own right (200 HP, 5 hack / 5 pierce armor, 18 hack melee with `Unit+!Ship` preference); its 120 metal cost makes it a metal-heavy investment. Its capture attack (strength 5) is restricted to Field Palisade Walls, so it cannot help raze civic buildings.

## Basic stats

- **Generic name:** Champion Infantry Trumpeter
- **Health:** 200 HP
- **Armor:** 5 hack / 5 pierce / 20 crush
- **Attack:** Capture — strength 5 — range 4 m — repeat 1 s — restricted Field Palisade Wall
- **Attack:** Melee "Sword" — damage 18 hack — range 3 m — prepare 0.5 s — repeat 1 s — preferred Unit+!Ship
- **Speed:** walk 9.5 m/s, run 15.86 m/s
- **Vision:** 80 m
- **Cost:** 180 food, 120 metal
- **Build time:** 18 s
- **Population:** 1
- **Classes:** Unit Organic ConquestCritical Human
- **Visible classes:** Soldier Champion Infantry Melee Trumpeter

## Trained by

- **gaul** — `units/gaul/champion_infantry_trumpeter` (assembly)
