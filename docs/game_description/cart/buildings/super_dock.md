# super_dock

Carthaginian-specific building of 0 A.D. 0.28.0 — only the carthaginians can build it. See `docs/game_description/cart/buildings/README.md` for the method; shared buildings are documented in `docs/game_description/generic/buildings/`.

Stats resolved from `simulation/templates/structures/cart/super_dock` (full cart template chain).

## Guide

The Cothon (Naval Shipyard) is Carthage's second dock and its coastal expansion tool. Unlike the standard dock it is a **territory root** with a 200 m radius, and it is buildable on a shoreline in **own, neutral or allied territory** — so placing one projects a large territorial claim from a beachhead and gives the navy a forward base anywhere on the coast. It trains the warships (scout, arrow, ram and siege ships — no fishing or merchant ships, those stay at the dock), researches the warship technologies plus `exploration` and `dock_efficiency`, and repairs: garrisoned ships regenerate +10 HP/s (the "Dockyard Repairs" aura). It is big (42 × 58 m footprint), tough (5000 HP) and Town-phase. The catch is the cost — 300 wood + 200 stone and a long 500 s build — so each Cothon is an investment; build it to claim a distant shore, not as a fishing port.

## Basic stats

- **Generic name:** Naval Shipyard
- **Health:** 5000 HP
- **Armor:** 24 hack / 35 pierce / 3 crush
- **Cost:** 300 wood, 200 stone
- **Build time:** 500 s
- **Territory influence:** radius 200 m, weight 25000, territory root
- **Garrison:** 5 slots
- **Vision:** 100 m
- **Capture points:** 2000
- **Build territory:** own ally neutral
- **Placement:** shore
- **Requirements:** phase_town
- **Trains:** units/{civ}/ship_scout units/{civ}/ship_arrow units/{civ}/ship_ram units/{civ}/ship_siege
- **Researches:** dock_efficiency ship_vision exploration warship_ramming_attack warship_siege_attack warship_health
- **Classes:** Structure ConquestCritical CivSpecific
- **Visible classes:** Town Naval Shipyard
- **Footprint:** Square 42 m × 58 m (height 8 m)
- **Obstruction:** Static 42 m × 58 m

## Built by

- **cart** — `structures/cart/super_dock`
