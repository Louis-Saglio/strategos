# camp_blemmye

Kushite-specific building of 0 A.D. 0.28.0 — only the kushites can build it. See `docs/game_description/kush/buildings/README.md` for the method; shared buildings are documented in `docs/game_description/generic/buildings/`.

Stats resolved from `simulation/templates/structures/kush/camp_blemmye` (full kush template chain).

## Guide

The Blemmye Camp is kush's mercenary cavalry camp: a Town-phase building (100 wood, 100 metal, 150 s) that trains only the Blemmye Desert Raider, a camel javelineer paid for with 20 food and 90 metal. It can be built in your own or neutral territory (it has no territory influence of its own), so it can serve as a forward production site. It has 1000 HP, 24 / 30 / 3 armor, 6 garrison slots and 500 capture points, and batches train at ×0.8 time. Raiders cannot gather, so the camp is only worth building when metal is available to spend on fast harassment cavalry.

## Basic stats

- **Generic name:** Blemmye Camp
- **Health:** 1000 HP
- **Armor:** 24 hack / 30 pierce / 3 crush
- **Vision:** 24 m
- **Cost:** 100 wood, 100 metal
- **Build time:** 150 s
- **Garrison:** 6 slots
- **Capture points:** 500
- **Build territory:** own neutral
- **Placement:** land
- **Requirements:** phase_town
- **Trains:** units/{native}/cavalry_javelineer_merc_b
- **Train batch time:** ×0.8
- **Loot:** 20 wood, 20 metal
- **Classes:** Structure ConquestCritical CivSpecific
- **Visible classes:** Military Town Embassy
- **Footprint:** Square 29 m × 29 m (height 12 m)
- **Obstruction:** Static 29 m × 29 m

## Built by

- **kush** — `structures/kush/camp_blemmye`
