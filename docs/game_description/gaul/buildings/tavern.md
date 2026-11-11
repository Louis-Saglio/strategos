# tavern

Gaul-specific building of 0 A.D. 0.28.0 — only the gauls can build it. See `docs/game_description/gaul/buildings/README.md` for the method; shared buildings are documented in `docs/game_description/generic/buildings/`.

Stats resolved from `simulation/templates/structures/gaul/tavern` (parent `template_structure_civic_house`).

## Guide

The Tavern (Taberna) is a gaul phase-town structure that doubles as a house: it inherits the house's `House` class, its female-citizen trainer and its house-technology researcher, while carrying a +10 population bonus — double a house's +5 — for 100 wood + 100 stone and a 200 s build time. It is the cheapest Town-class structure, so it is the natural third member of the city-phase "3 Town-class structures" requirement. No builder template lists it (vestigial, like the archery range), so it is not offered through the normal build UI — but a construct command placed directly still works, because construction does not validate the builder's `Builder/Entities` list.

## Basic stats

- **Generic name:** Tavern
- **Health:** 1500 HP
- **Armor:** 24 hack / 30 pierce / 3 crush
- **Cost:** 100 wood, 100 stone
- **Build time:** 200 s
- **Population bonus:** +10
- **Territory influence:** radius 30 m, weight 65535
- **Garrison:** 3 slots
- **Vision:** 20 m
- **Capture points:** 500
- **Build territory:** own
- **Placement:** land
- **Requirements:** phase_town
- **Trains:** units/{civ}/support_civilian_house
- **Classes:** Structure ConquestCritical
- **Visible classes:** Civic House Town
- **Footprint:** Square 20 m × 20 m (height 5 m)
- **Obstruction:** Static 20 m × 20 m

## Built by

- **gaul** — `structures/gaul/tavern` (not listed by any builder; construct directly)
