# champion_maiden

Mauryan-specific unit of 0 A.D. 0.28.0 — only the mauryas can train it. See `docs/game_description/maur/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/maur/champion_maiden` (full maur template chain).

## Guide

The Maiden Guard (Visha Kanya) is the Mauryan melee champion — a fast,
hard-hitting swordswoman: 160 HP with 8 hack armor (heavy for infantry),
a 16-hack sword on a 0.75 s repeat, and **walk 11.7 m/s** — as fast as
some cavalry, thanks to the `spec_champ` mixin (×0.75 build time and the
speed boost). For 100 food + 90 metal and a 15 s train time she is among
the cheapest champions to mass. She is trained at the **palace** (City
phase — the palace needs no champion-unlock tech, the building itself is
the gate). No gathering, like all champions. Use her to chase down
ranged units and raid, where her speed turns a champion into a skirmisher.

## Basic stats

- **Generic name:** Maiden Guard
- **Health:** 160 HP
- **Armor:** 8 hack / 4 pierce / 20 crush
- **Attack:** Capture — strength 5 — range 4 m — repeat 1 s — restricted Field Palisade Wall
- **Attack:** Melee "Sword" — damage 16 hack — range 3 m — prepare 0.375 s — repeat 0.75 s — preferred Unit+!Ship
- **Speed:** walk 11.7 m/s, run 19.54 m/s
- **Vision:** 80 m
- **Cost:** 100 food, 90 metal
- **Build time:** 15 s
- **Population:** 1
- **Classes:** Unit Organic ConquestCritical Human
- **Visible classes:** Soldier Champion Infantry Melee Swordsman

## Trained by

- **maur** — `units/maur/champion_maiden` (palace)

