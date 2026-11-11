# mercenary_camp

Ptolemaic-specific building of 0 A.D. 0.28.0 — only the ptolemies can build it. See `docs/game_description/ptol/buildings/README.md` for the method; shared buildings are documented in `docs/game_description/generic/buildings/`.

Stats resolved from `simulation/templates/structures/ptol/mercenary_camp` (full ptol template chain).

## Guide

The Mercenary Camp (Stratopedeia Misthophorōn) is the Ptolemaic barracks
for hirelings — a Town-phase barracks variant (100 wood + 100 stone + 100
metal, 300 s, 1200 HP) buildable in **own or neutral territory** with no
territory influence, that trains the four mercenary types (the Thureos
Spearman, Gallic Swordsman, Macedonian Settler Cavalry and Tarantine
Cavalry — the last three shared with the Seleucids) on top of the
inherited citizen barracks roster, and researches the barracks techs.
**In 0.28.0 no builder lists it**, so it is not offered through the build
UI (a construct command placed directly still works) — and it is largely
redundant anyway, because the military colony (buildable by anyone, Town
phase, own+neutral territory) trains the exact same four mercenaries.
For a bot the practical route to mercenaries is the military colony; the
camp matters only through direct placement.

## Basic stats

- **Generic name:** Mercenary Camp
- **Health:** 1200 HP
- **Armor:** 24 hack / 35 pierce / 3 crush
- **Cost:** 100 wood, 100 stone, 100 metal
- **Build time:** 300 s
- **Garrison:** 10 slots
- **Vision:** 32 m
- **Capture points:** 500
- **Build territory:** own neutral
- **Placement:** land
- **Build distance:** min 100 m from MercenaryCamp
- **Requirements:** phase_town
- **Trains:** units/{civ}/infantry_pikeman_b units/{civ}/infantry_javelineer_b units/{civ}/infantry_slinger_b units/{civ}/infantry_archer_b units/{civ}/champion_infantry_pikeman units/{civ}/infantry_spearman_merc_b units/{civ}/infantry_swordsman_merc_b units/{civ}/cavalry_spearman_merc_b units/{civ}/cavalry_javelineer_merc_b
- **Train batch time:** ×0.8
- **Researches:** barracks_batch_training unlock_champion_infantry
- **Classes:** Structure ConquestCritical MercenaryCamp
- **Visible classes:** Military Village Barracks
- **Footprint:** Square 25.5 m × 25.5 m (height 12 m)
- **Obstruction:** Static 23.5 m × 23.5 m
- **Auras:** structures/xp_trickle

## Built by

- **ptol** — `structures/ptol/mercenary_camp` (not listed by any builder; construct directly)

