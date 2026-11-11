# champion_infantry_swordsman_centurion

Roman-specific unit of 0 A.D. 0.28.0 — only the romans can train it. See `docs/game_description/rome/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/rome/champion_infantry_swordsman_centurion` (full roman template chain).

## Guide

The Centurion is the romans' champion support fighter: trained at the fortress (after the Marian Reforms technology) and limited by a training restriction category, it pairs a solid 16-hack melee sword attack and 200 HP with auras that boost nearby soldiers' attack damage and speed. Its real value is not raw fighting but the buff it brings to an army, so a bot should mix one into infantry groups rather than mass it, and should treat its capture attack as a secondary tool against structures. At 120 food / 60 wood / 100 metal, its 100 metal cost makes it a premium, hard-to-mass investment, justified mainly when escorting a large infantry force.

## Basic stats

- **Generic name:** Roman Centurion
- **Health:** 200 HP
- **Armor:** 6 hack / 6 pierce / 20 crush
- **Attack:** Capture — strength 5 — range 4 m — repeat 1 s — restricted Field Palisade Wall
- **Attack:** Melee "Sword" — damage 16 hack — range 3 m — prepare 0.375 s — repeat 0.75 s — preferred Unit+!Ship
- **Speed:** walk 9.5 m/s, run 15.86 m/s
- **Vision:** 80 m
- **Cost:** 120 food, 60 wood, 100 metal
- **Build time:** 25 s
- **Population:** 1
- **Classes:** Unit Organic ConquestCritical Human
- **Visible classes:** Soldier Champion Infantry Melee Swordsman Centurion

## Trained by

- **rome** — `units/rome/champion_infantry_swordsman_centurion` (fortress)
