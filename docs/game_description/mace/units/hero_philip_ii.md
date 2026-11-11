# hero_philip_ii

Macedonian-specific unit of 0 A.D. 0.28.0 — only the macedonians can train it. See `docs/game_description/mace/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/mace/hero_philip_ii` (full mace template chain).

## Guide

Philip II is the Macedonian champion-support hero, a fast spear cavalryman trained at the fortress (City phase) for 300 food, 200 wood and 250 metal, 0 population, subject to the one-hero-alive limit. He has 1200 HP, 11 hack / 10 pierce / 25 crush armor, a 16 hack + 12 pierce spear every 1.25 s with 1.75× against cavalry, a strength-10 capture attack and cavalry speed (walk 18 m/s). His "Rise of Macedon" aura gives all champions within 60 m +2 capture attack strength and +20% melee and ranged damage, so he is only worth his metal when paired with an army of Shield Bearers, rhomphaia swordsmen, crossbowmen or champion cavalry. Keep him close to that champion core rather than raiding alone.

## Basic stats

- **Generic name:** Philip II of Macedon
- **Specific name:** Philippos B' ho Makedōn
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
- **Auras:** units/heroes/hero_garrison units/heroes/mace_hero_philip_ii
- **Loot:** 10 food, 25 metal, 400 xp
- **Classes:** Unit Organic ConquestCritical Human FastMoving
- **Visible classes:** Soldier Hero Cavalry Melee Spearman

## Trained by

- **mace** — `units/mace/hero_philip_ii` (fortress)
