# hero_caros

Iberian-specific unit of 0 A.D. 0.28.0 — only the iberians can train it. See `docs/game_description/iber/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/iber/hero_caros` (full iber template chain).

## Guide

Caros is the defensive Iberian hero — a 1000 HP infantry swordsman (26
hack, 0.75 s repeat) with **two** auras: "Battle Fervor" gives every own
soldier within 50 m **+1 hack, pierce and crush armor** — a meaningful
defense buff for the whole army — and "Valiant Defender" is unique among
heroes: a **garrison** aura — while Caros is garrisoned in a structure or
siege tower, that building's arrow count is +75% (both the garrison arrow
multiplier and the max arrow count). Park him in a frontier tower or
fortress to turn it into an arrow-spraying strongpoint, or march him with
the army for the armor aura. 0 population, 1 hero alive at a time,
trained at the fortress (City phase).

## Basic stats

- **Generic name:** Hero Swordsman
- **Health:** 1000 HP
- **Armor:** 12 hack / 12 pierce / 25 crush
- **Attack:** Capture — strength 10 — range 4 m — repeat 1 s — restricted Field Palisade Wall
- **Attack:** Melee "Sword" — damage 26 hack — range 3 m — prepare 0.375 s — repeat 0.75 s — preferred Unit+!Ship
- **Speed:** walk 9 m/s, run 15.03 m/s
- **Vision:** 100 m
- **Cost:** 200 food, 150 wood, 200 metal
- **Build time:** 50 s
- **Population:** 0
- **Classes:** Unit Organic ConquestCritical Human
- **Visible classes:** Soldier Hero Infantry Melee Swordsman

## Trained by

- **iber** — `units/iber/hero_caros` (fortress)

