# assembly

Gaul-specific building of 0 A.D. 0.28.0 — only the gauls can build it. See `docs/game_description/gaul/buildings/README.md` for the method; shared buildings are documented in `docs/game_description/generic/buildings/`.

Stats resolved from `simulation/templates/structures/gaul/assembly` (full gaul template chain).

## Guide

The Assembly of Princes is the gauls' city-phase elite structure: once phase_city is reached, it is the only place to train the champion infantry trumpeter and the three gaul heroes (Brennus, Viridomarus, Vercingetorix). At 400 wood and a 200 s build time it is a cheap, wood-only building that is easy to afford and mass, and its 40 m territory influence with weight 40000 also helps expand or hold territory. Its 20 garrison slots let it shelter units. Build it when pushing for champions or heroes.

## Basic stats

- **Generic name:** Assembly of Princes
- **Health:** 2000 HP
- **Armor:** 20 hack / 30 pierce / 3 crush
- **Cost:** 400 wood
- **Build time:** 200 s
- **Territory influence:** radius 40 m, weight 40000
- **Garrison:** 20 slots
- **Vision:** 40 m
- **Capture points:** 500
- **Build territory:** own
- **Placement:** land
- **Requirements:** phase_city
- **Trains:** units/{civ}/champion_infantry_trumpeter units/{civ}/hero_brennus units/{civ}/hero_viridomarus units/{civ}/hero_vercingetorix
- **Classes:** Structure ConquestCritical CivSpecific
- **Visible classes:** City Council
- **Footprint:** Circle r 15 m (height 10 m)
- **Obstruction:** Static 25 m × 25 m

## Built by

- **gaul** — `structures/gaul/assembly`
