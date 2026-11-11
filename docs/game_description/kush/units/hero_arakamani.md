# hero_arakamani

Kushite-specific unit of 0 A.D. 0.28.0 — only the kushites can train it. See `docs/game_description/kush/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/kush/hero_arakamani` (full kush template chain).

## Guide

Arakamani is kush's elephant hero, trained at the fortress in the City phase for 600 food and 400 metal (no wood, 0 population; only one hero may be alive at a time). He is a heavy melee bruiser: 1500 HP, 10 / 10 / 25 armor and a trunk attack of 60 hack + 90 crush with a 2 m, 45-hack splash every 1.5 s at 5 m range (preferred non-ship targets), but he walks at only 9 m/s. His auras: while he lives, your Temples of Apedemak and Apedemak Temple Guards cost 30% less and build/train in 30% less time, and enemy Healers within 60 m heal nothing. Being an Elephant, he also receives Nastasen's damage aura and the kush team bonus (Elephants −20% cost and training time). Use him with temple guards and war elephants to push through defences; he loses 5% health if the Grand Temple of Amun is built.

## Basic stats

- **Generic name:** Arakamani
- **Specific name:** I͗rk-k-I͗mn H̱nm-ı͗-Rʿ
- **Health:** 1500 HP
- **Armor:** 10 hack / 10 pierce / 25 crush
- **Attack:** Melee "Trunk" — damage 60 hack + 90 crush — range 5 m — prepare 0.75 s — repeat 1.5 s — splash Circular 2 m 45 hack — preferred !Ship
- **Speed:** walk 9 m/s, run 15.03 m/s
- **Vision:** 100 m
- **Cost:** 600 food, 400 metal
- **Build time:** 50 s
- **Population:** 0
- **Requirements:** phase_city
- **Auras:** units/heroes/hero_garrison units/heroes/kush_hero_arakamani_1 units/heroes/kush_hero_arakamani_2
- **Loot:** 60 food, 40 metal, 400 xp
- **Classes:** Unit Organic ConquestCritical Human
- **Visible classes:** Soldier Hero Elephant Melee

## Trained by

- **kush** — `units/kush/hero_arakamani` (fortress)
