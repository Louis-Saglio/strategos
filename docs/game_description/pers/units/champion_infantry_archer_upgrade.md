# champion_infantry_archer_upgrade

Persian-specific unit of 0 A.D. 0.28.0 — only the persians can train it. See `docs/game_description/pers/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/pers/champion_infantry_archer_upgrade` (full pers template chain).

## Guide

The Persian Immortal in bow mode (Anušiya) — the barracks champion,
unlocked in the City phase by `unlock_champion_infantry`. It is a ranged
champion at 12.24 pierce per arrow from 60 m with 120 HP, and — unlike
most champions — it is not a metal hog: 50 food + 30 wood + 50 metal and a
20 s train time, cheap enough to mass, and the `immortals` tech (at the
Winter Palace) halves that to 10 s. It shares the `Immortal` class with
its spear counterpart, so both benefit from the tech. Each Immortal can
switch between bow and spear mode (a free 4 s in-place upgrade, both
directions), so a Persian barracks can re-spec its champions at any time
without retraining. Note the low armor for a champion (2 hack / 3 pierce):
keep it behind a front line, or switch it to spear mode when melee is
coming.

## Basic stats

- **Generic name:** Persian Immortal
- **Health:** 120 HP
- **Armor:** 2 hack / 3 pierce / 20 crush
- **Attack:** Capture — strength 5 — range 4 m — repeat 1 s — restricted Field Palisade Wall
- **Attack:** Ranged "Bow" — damage 12.24 pierce — range 60 m — prepare 0.8 s — repeat 1.25 s — preferred Human
- **Speed:** walk 9.06 m/s, run 15.14 m/s
- **Vision:** 80 m
- **Cost:** 50 food, 30 wood, 50 metal
- **Build time:** 20 s
- **Population:** 1
- **Classes:** Unit Organic ConquestCritical Human
- **Visible classes:** Soldier Champion Infantry Ranged Archer Immortal

## Trained by

- **pers** — `units/pers/champion_infantry_archer_upgrade` (barracks)

