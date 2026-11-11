# embassy_iberian

Carthaginian-specific building of 0 A.D. 0.28.0 — only the carthaginians can build it. See `docs/game_description/cart/buildings/README.md` for the method; shared buildings are documented in `docs/game_description/generic/buildings/`.

Stats resolved from `simulation/templates/structures/cart/embassy_iberian` (full cart template chain).

## Guide

The Iberian Embassy is Carthage's ranged-mercenary building: from the Town phase it trains the Iberian Mercenary Skirmisher (80 metal, 17.6-pierce javelins at 30 m) and the Balearic Slinger (75 metal, 50 m range — outranged only by the Mauritanian archer among Carthage's infantry). Both are 7 s trains, hit +10% harder than citizen equivalents, auto-promote to Advanced at 0 XP and cannot gather — pure metal expenditure for fire support. Since Carthage's citizen ranged roster is only the Mauritanian archer (plus the Numidian cavalry javelineer), this embassy is where the civ gets its skirmish and sling line. It costs 100 wood + 100 stone — stone is scarce, so it is a real investment — and with 2000 HP it is the sturdiest of the three embassies. Built by Carthaginian women and infantry.

## Basic stats

- **Generic name:** Embassy
- **Health:** 2000 HP
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
- **Trains:** units/{native}/infantry_javelineer_iber_b units/{native}/infantry_slinger_iber_b
- **Classes:** Structure ConquestCritical CivSpecific
- **Visible classes:** Military Town Embassy
- **Footprint:** Square 16 m × 16 m (height 12 m)
- **Obstruction:** Static 16 m × 16 m

## Built by

- **cart** — `structures/cart/embassy_iberian`
