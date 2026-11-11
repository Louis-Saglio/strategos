# hero_teutobod

Germanic-specific unit of 0 A.D. 0.28.0 — only the germans can train it. See `docs/game_description/germ/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/germ/hero_teutobod` (full germ template chain).

## Guide

Teutobod is germ's infantry swordsman hero, trained at the fortress (City phase) for 200 food, 150 wood and 200 metal, 0 population and 50 s — the cheapest of germ's three heroes, though still a metal-heavy premium unit (one hero alive at a time). His template adds +500 HP (1500 total, the sturdiest germ hero) with 12/12/25 armor and a 26-hack sword (0.75 s repeat, 3 m range) plus a 10-strength Capture attack, and he walks 11.25 m/s (+25%, which the aura text advertises as +30%). "Furor Teutonicus" gives melee Citizen Infantry within 30 m +25% walk speed, so he works best at the head of a spearman/swordsman/clubman mass — a durable tank that helps that mass close on ranged units and reposition quickly. He also carries the Battering Team aura (+0.15 m/s to a ram he is garrisoned in) and the generic hero garrison aura (+1 capture regeneration to a structure he garrisons).

## Basic stats

- **Generic name:** Hero Swordsman
- **Specific name:** Teutobod
- **Health:** 1500 HP
- **Armor:** 12 hack / 12 pierce / 25 crush
- **Attack:** Capture — strength 10 — range 4 m — repeat 1 s — restricted Field Palisade Wall
- **Attack:** Melee "Sword" — damage 26 hack — range 3 m — prepare 0.375 s — repeat 0.75 s — preferred Unit+!Ship
- **Speed:** walk 11.25 m/s, run 18.79 m/s
- **Vision:** 100 m
- **Cost:** 200 food, 150 wood, 200 metal
- **Build time:** 50 s
- **Population:** 0
- **Requirements:** phase_city
- **Auras:** units/heroes/hero_garrison units/ram_garrison units/heroes/germ_hero_teutobod_1 units/heroes/germ_hero_teutobod_2
- **Loot:** 10 food, 25 metal, 400 xp
- **Classes:** Unit Organic ConquestCritical Human
- **Visible classes:** Soldier Hero Infantry Melee Swordsman

## Trained by

- **germ** — `units/germ/hero_teutobod` (fortress)
