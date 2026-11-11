# ice_house

Persian-specific building of 0 A.D. 0.28.0 — only the persians can build it. See `docs/game_description/pers/buildings/README.md` for the method; shared buildings are documented in `docs/game_description/generic/buildings/`.

Stats resolved from `simulation/templates/structures/pers/ice_house` (full pers template chain).

## Guide

The Ice House (Yakhchāl) is the Persians' cheap economy building: 100 wood
+ 100 stone, 60 s, available from the **Village phase** — passive income
from the first minute of the game. Each one trickles 1 food every 2 s
(0.5 food/s) for free, forever, occupying only a 16 × 16 m obstruction.
Up to **5 per player** (`Yakhchal` limit), so a Persian player can stack
2.5 food/s of passive income for 500 wood + 500 stone — a solid hedge on
maps where food is scarce. It also researches `subterranean_aqueducts` in
the City phase (300 wood + 300 stone) to double each trickle to 1 food/s.
It is fragile (800 HP) and grants little territory (radius 20 m) — place
it behind your lines, not on the frontier.

## Basic stats

- **Generic name:** Ice House
- **Health:** 800 HP
- **Armor:** 24 hack / 30 pierce / 3 crush
- **Cost:** 100 wood, 100 stone
- **Build time:** 60 s
- **Territory influence:** radius 20 m, weight 30000
- **Vision:** 20 m
- **Capture points:** 500
- **Build territory:** own
- **Build category:** Yakhchal (max 5 per player)
- **Placement:** land
- **Requirements:** phase_village
- **Researches:** subterranean_aqueducts
- **Classes:** Structure CivSpecific
- **Visible classes:** Village IceHouse
- **Footprint:** Circle r 10 m (height 12 m)
- **Obstruction:** Static 16 m × 16 m
- **Resource trickle:** 1 food per 2000 ms

## Built by

- **pers** — `structures/pers/ice_house` (builder)

