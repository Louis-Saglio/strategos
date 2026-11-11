# champion_infantry_amun

Kushite-specific unit of 0 A.D. 0.28.0 — only the kushites can train it. See `docs/game_description/kush/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/kush/champion_infantry_amun` (full kush template chain).

## Guide

The Napatan Temple Guard is kush's champion swordsman, trained only at the Grand Temple of Amun (one per player) from the City phase for 80 food, 60 wood and 80 metal — the standard champion price, where the 80 metal makes it a premium unit rather than something to mass. It is a line-holder: 200 HP, 6 hack / 6 pierce / 20 crush armor and a 16-hack sword every 0.75 s against Units (not Ships), plus a 5-strength Capture attack that cannot target fields, palisades or walls. It trains in 15 s (the generic champion swordsman takes 20 s) and, unlike the barracks champions, needs no unlock tech beyond the City phase. It is a Champion, so it is buffed by Amanirenas's aura (+20% damage, +2 capture) and, like every soldier, by the Large Pyramid's 100 m aura (+10% damage, +1 armor); it has no bonus against any class.

## Basic stats

- **Generic name:** Napatan Temple Guard
- **Specific name:** Rs ʿImn
- **Health:** 200 HP
- **Armor:** 6 hack / 6 pierce / 20 crush
- **Attack:** Capture — strength 5 — range 4 m — repeat 1 s — restricted Field Palisade Wall
- **Attack:** Melee "Sword" — damage 16 hack — range 3 m — prepare 0.375 s — repeat 0.75 s — preferred Unit+!Ship
- **Speed:** walk 9.5 m/s, run 15.86 m/s
- **Vision:** 80 m
- **Cost:** 80 food, 60 wood, 80 metal
- **Build time:** 15 s
- **Population:** 1
- **Requirements:** phase_city
- **Auras:** units/ram_garrison
- **Loot:** 8 food, 6 wood, 8 metal, 150 xp
- **Classes:** Unit Organic ConquestCritical Human AmunGuard
- **Visible classes:** Soldier Champion Infantry Melee Swordsman

## Trained by

- **kush** — `units/kush/champion_infantry_amun` (temple_amun)
