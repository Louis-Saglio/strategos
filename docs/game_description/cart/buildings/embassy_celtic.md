# embassy_celtic

Carthaginian-specific building of 0 A.D. 0.28.0 — only the carthaginians can build it. See `docs/game_description/cart/buildings/README.md` for the method; shared buildings are documented in `docs/game_description/generic/buildings/`.

Stats resolved from `simulation/templates/structures/cart/embassy_celtic` (full cart template chain).

## Guide

The Celtic Embassy is Carthage's mercenary recruitment building for Gallic troops: from the Town phase it trains the Gallic Mercenary Swordsman (60 metal, 7 s) and the Gallic Mercenary Cavalry (20 food + 90 metal, 10.5 s) — Carthage's only citizen-grade sword infantry and sword cavalry, since the civ has no citizen swordsmen of its own. It is the cheapest embassy at 200 wood, and the only one that researches a tech: the City-phase "Celtic Auxiliaries" (550 metal), which halves the metal cost of mercenary swordsmen while adding 50 food each. With the team bonus ("Mercenary Transports", −50% train time for mercenary infantry) the swordsman line is Carthage's fastest way to field melee infantry. It is a small, fragile building (1200 HP) — protect it, as losing it cuts off the sword line entirely. Built by Carthaginian women and infantry.

## Basic stats

- **Generic name:** Embassy
- **Health:** 1200 HP
- **Armor:** 24 hack / 30 pierce / 3 crush
- **Cost:** 200 wood
- **Build time:** 150 s
- **Territory influence:** radius 25 m, weight 40000
- **Garrison:** 6 slots
- **Vision:** 24 m
- **Capture points:** 500
- **Build territory:** own
- **Placement:** land
- **Requirements:** phase_town
- **Trains:** units/{native}/infantry_swordsman_gaul_b units/{native}/cavalry_swordsman_gaul_b
- **Researches:** celtic_auxiliaries
- **Classes:** Structure ConquestCritical CivSpecific
- **Visible classes:** Military Town Embassy
- **Footprint:** Square 16 m × 13 m (height 11 m)
- **Obstruction:** Static 15 m × 12 m

## Built by

- **cart** — `structures/cart/embassy_celtic`
