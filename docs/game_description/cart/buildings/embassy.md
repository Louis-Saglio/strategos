# embassy

Carthaginian-specific building of 0 A.D. 0.28.0 — only the carthaginians can build it. See `docs/game_description/cart/buildings/README.md` for the method; shared buildings are documented in `docs/game_description/generic/buildings/`.

Stats resolved from `simulation/templates/structures/cart/embassy` (full cart template chain).

## Guide

The all-in-one Embassy is a vestigial Carthaginian template: one Town-phase building that trains **all seven** mercenary types — the Gallic swordsman and cavalry, the Iberian skirmisher and Balearic slinger, the Samnite swordsman and spearman, and the Italic cavalry — for 400 wood + 200 stone. No builder template lists it (the buildable embassies are the three specialised ones: `embassy_celtic`, `embassy_iberian`, `embassy_italic`), so it is not offered through the normal build UI — but a construct command placed directly still works, because construction does not validate the builder's `Builder/Entities` list. Its one practical consequence in skirmish play: the two mercenary types that only this building trains (the Samnite Swordsman and the Iberian Heavy Cavalry) are effectively unreachable through the UI.

## Basic stats

- **Generic name:** Embassy
- **Health:** 2000 HP
- **Armor:** 24 hack / 30 pierce / 3 crush
- **Cost:** 400 wood, 200 stone
- **Build time:** 150 s
- **Territory influence:** radius 25 m, weight 40000
- **Garrison:** 6 slots
- **Vision:** 24 m
- **Capture points:** 500
- **Build territory:** own
- **Placement:** land
- **Requirements:** phase_town
- **Trains:** units/{native}/infantry_swordsman_gaul_b units/{native}/cavalry_swordsman_gaul_b units/{native}/infantry_javelineer_iber_b units/{native}/infantry_slinger_iber_b units/{native}/cavalry_swordsman_iber_b units/{native}/infantry_swordsman_ital_b units/{native}/cavalry_spearman_ital_b
- **Classes:** Structure ConquestCritical
- **Visible classes:** Military Town Embassy
- **Footprint:** Square 28 m × 28 m (height 15 m)
- **Obstruction:** Static 28 m × 28 m

## Built by

- **cart** — `structures/cart/embassy` (not listed by any builder; construct directly)
