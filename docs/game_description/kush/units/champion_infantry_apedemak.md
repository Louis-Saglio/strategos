# champion_infantry_apedemak

Kushite-specific unit of 0 A.D. 0.28.0 — only the kushites can train it. See `docs/game_description/kush/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/kush/champion_infantry_apedemak` (full kush template chain).

## Guide

The Meroitic Temple Guard is kush's champion axeman, trained at the ordinary Temple (the Temple of Apedemak, a Town-phase building) once the City phase is reached, for 80 food, 60 wood and 80 metal and 15 s. It trades some armor for damage compared with the Napatan Guard: 200 HP, 5 hack / 6 pierce / 20 crush armor, and an axe doing 18 hack + 6 crush per second (24 damage/s against the sword's 21.3), so it hits buildings and heavily armored targets harder while still being a front-line fighter. It has a 5-strength Capture attack (not usable on fields, palisades or walls) and no class bonuses. Metal is the scarce part of the price, so train it in proportion to metal income. The hero Arakamani discounts it by 30% (cost and training time) while he is alive.

## Basic stats

- **Generic name:** Meroitic Temple Guard
- **Specific name:** Rs ʿIprmk
- **Health:** 200 HP
- **Armor:** 5 hack / 6 pierce / 20 crush
- **Attack:** Capture — strength 5 — range 4 m — repeat 1 s — restricted Field Palisade Wall
- **Attack:** Melee "Axe" — damage 18 hack + 6 crush — range 3 m — prepare 0.5 s — repeat 1 s — preferred Unit+!Ship
- **Speed:** walk 9.5 m/s, run 15.86 m/s
- **Vision:** 80 m
- **Cost:** 80 food, 60 wood, 80 metal
- **Build time:** 15 s
- **Population:** 1
- **Requirements:** phase_city
- **Auras:** units/ram_garrison
- **Loot:** 8 food, 6 wood, 8 metal, 150 xp
- **Classes:** Unit Organic ConquestCritical Human ApedemakGuard
- **Visible classes:** Soldier Champion Infantry Melee Axeman

## Trained by

- **kush** — `units/kush/champion_infantry_apedemak` (temple)
