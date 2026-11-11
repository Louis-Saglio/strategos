# camp_noba

Kushite-specific building of 0 A.D. 0.28.0 — only the kushites can build it. See `docs/game_description/kush/buildings/README.md` for the method; shared buildings are documented in `docs/game_description/generic/buildings/`.

Stats resolved from `simulation/templates/structures/kush/camp_noba` (full kush template chain).

## Guide

The Noba Village is kush's mercenary infantry camp: a Town-phase building (100 wood, 100 metal, 150 s) that trains the Noba Maceman and Noba Skirmisher, both costing 60 metal and 7 s. It can be built in your own or neutral territory but has no territory influence of its own, so it works as a forward barracks that does not expand borders. It has 1000 HP, 24 / 30 / 3 armor, 6 garrison slots and 500 capture points, and batches train at ×0.8 time. Because the units cost only metal, which is scarce, build it when metal income or a surplus can sustain mercenaries; they provide fast, immediately-Advanced reinforcements without spending food or wood.

## Basic stats

- **Generic name:** Noba Village
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
- **Trains:** units/{native}/infantry_maceman_merc_b units/{native}/infantry_javelineer_merc_b
- **Train batch time:** ×0.8
- **Loot:** 20 wood, 20 metal
- **Classes:** Structure ConquestCritical CivSpecific
- **Visible classes:** Military Town Embassy
- **Footprint:** Square 35 m × 35 m (height 12 m)
- **Obstruction:** Static 35 m × 35 m

## Built by

- **kush** — `structures/kush/camp_noba`
