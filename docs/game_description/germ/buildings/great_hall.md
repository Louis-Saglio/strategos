# great_hall

Germanic-specific building of 0 A.D. 0.28.0 — only the germans can build it. See `docs/game_description/germ/buildings/README.md` for the method; shared buildings are documented in `docs/game_description/generic/buildings/`.

Stats resolved from `simulation/templates/structures/germ/great_hall` (full germ template chain).

## Guide

The Great Hall is germ's champion and light-siege building, available in the Town phase (the generic `unlock_champion_*` techs need the City phase) for 200 stone and 200 metal (150 s), both premium resources, so it is a real investment rather than something to mass. It trains the Cimbri Raider champion axeman (Town phase), the Cimbrian Noble Cavalry champion (City phase, no unlock technology needed) and the Log Ram (Town phase), with a ×0.7 batch time. It has 2000 HP and 24/30/3 armor but only 500 capture points and 10 garrison slots, so keep it behind the front and garrison it if it is threatened; it also adds a 38 m non-root territory influence (weight 40000). Build it early when a Town-phase champion-and-ram timing is wanted, since it is germ's only access to those units before the City phase.

## Basic stats

- **Generic name:** Great Hall
- **Specific name:** Kuningashallō
- **Health:** 2000 HP
- **Armor:** 24 hack / 30 pierce / 3 crush
- **Vision:** 40 m
- **Cost:** 200 stone, 200 metal
- **Build time:** 150 s
- **Territory influence:** radius 38 m, weight 40000
- **Garrison:** 10 slots
- **Capture points:** 500
- **Build territory:** own
- **Placement:** land
- **Requirements:** phase_town
- **Trains:** units/{civ}/champion_infantry_axeman units/{civ}/champion_cavalry units/{civ}/siege_ram
- **Train batch time:** ×0.7
- **Loot:** 40 stone, 40 metal
- **Classes:** Structure ConquestCritical CivSpecific
- **Visible classes:** City
- **Footprint:** Square 17 m × 24 m (height 12 m)
- **Obstruction:** Static 15 m × 22 m

## Built by

- **germ** — `structures/germ/great_hall`
