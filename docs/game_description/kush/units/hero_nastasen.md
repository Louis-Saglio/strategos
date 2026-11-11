# hero_nastasen

Kushite-specific unit of 0 A.D. 0.28.0 — only the kushites can train it. See `docs/game_description/kush/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/kush/hero_nastasen` (full kush template chain).

## Guide

Nastasen is kush's cavalry-speed spearman hero, trained at the fortress in the City phase for 300 food, 200 wood and 250 metal (0 population, one hero alive at a time). He has 1200 HP, 11 / 10 / 25 armor, walks at 18 m/s and fights with a 16 hack + 12 pierce spear at 4 m range with a 1.75× bonus against Cavalry. His "Savior of Kush" aura gives Soldiers and Elephants within 60 m +15% melee and ranged damage and +50% loot, so keep him with the main army, particularly one with elephants; the loot bonus pays off while raiding. His second aura is global: Kushite triremes (the arrow ship) cost 50 less wood and 50 less metal while he is alive, which halves their price. If the Temple of Amun is built he has 5% less health (1140 HP).

## Basic stats

- **Generic name:** Nastasen
- **Specific name:** N-ı͗-s-tȝ-s-nn Kȝ-ʿnḫ-Rʿ
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
- **Auras:** units/heroes/hero_garrison units/heroes/kush_hero_nastasen_1 units/heroes/kush_hero_nastasen_2
- **Loot:** 10 food, 25 metal, 400 xp
- **Classes:** Unit Organic ConquestCritical Human FastMoving
- **Visible classes:** Soldier Hero Cavalry Melee Spearman

## Trained by

- **kush** — `units/kush/hero_nastasen` (fortress)
