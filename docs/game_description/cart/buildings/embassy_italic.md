# embassy_italic

Carthaginian-specific building of 0 A.D. 0.28.0 — only the carthaginians can build it. See `docs/game_description/cart/buildings/README.md` for the method; shared buildings are documented in `docs/game_description/generic/buildings/`.

Stats resolved from `simulation/templates/structures/cart/embassy_italic` (full cart template chain).

## Guide

The Italic Embassy is Carthage's anti-cavalry mercenary building: from the Town phase it trains the Samnite Spearman (60 metal, 2.5× vs Cavalry) and the Italic Cavalry (20 food + 90 metal, 1.75× vs Cavalry) — the mercenary answers to enemy horse. Both train fast (7 s / 10.5 s), hit +10% harder than citizen equivalents, auto-promote to Advanced at 0 XP and cannot gather. At 100 wood + 100 stone it is the same cost as the Iberian embassy but with only 1500 HP, so it is the flimsier of the two; build it when the opponent fields cavalry. Built by Carthaginian women and infantry.

## Basic stats

- **Generic name:** Embassy
- **Health:** 1500 HP
- **Armor:** 24 hack / 30 pierce / 3 crush
- **Cost:** 100 wood, 100 stone
- **Build time:** 150 s
- **Territory influence:** radius 25 m, weight 40000
- **Garrison:** 6 slots
- **Vision:** 24 m
- **Capture points:** 500
- **Build territory:** own
- **Placement:** land
- **Requirements:** phase_town
- **Trains:** units/{native}/infantry_spearman_ital_b units/{native}/cavalry_spearman_ital_b
- **Classes:** Structure ConquestCritical CivSpecific
- **Visible classes:** Military Town Embassy
- **Footprint:** Square 13 m × 15.5 m (height 12 m)
- **Obstruction:** Static 11 m × 14 m

## Built by

- **cart** — `structures/cart/embassy_italic`
