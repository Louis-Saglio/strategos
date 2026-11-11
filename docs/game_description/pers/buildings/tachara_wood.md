# tachara_wood

Persian-specific building of 0 A.D. 0.28.0 — only the persians can build it. See `docs/game_description/pers/buildings/README.md` for the method; shared buildings are documented in `docs/game_description/generic/buildings/`.

Stats resolved from `simulation/templates/structures/pers/tachara_wood` (full pers template chain).

## Guide

One of the four tribute forms of the Persian Winter Palace (Tachara): not placed directly, it is what the palace becomes after its free, 10 s **TributeWood** upgrade, and it can be switched at any time to the food, stone or metal form the same way. Every form keeps the palace's role — City-phase territory root (48 m), 3000 HP, hero production (Cyrus II, Darius I, Xerxes I) and the `immortals` tech — and adds a passive trickle of 10 wood every 2 s (5 wood/s). Wood is abundant on most maps, so this form mainly helps on wood-poor maps or biomes, or once nearby forests are cut down.

## Basic stats

- **Generic name:** Winter Palace
- **Specific name:** Taçara
- **Health:** 3000 HP
- **Armor:** 24 hack / 30 pierce / 3 crush
- **Vision:** 40 m
- **Cost:** 200 stone, 200 metal
- **Build time:** 300 s
- **Territory influence:** radius 48 m, weight 40000, territory root
- **Garrison:** 10 slots
- **Capture points:** 500
- **Build territory:** own
- **Placement:** land
- **Build category:** Palace (one per player)
- **Requirements:** phase_city
- **Trains:** units/{civ}/hero_cyrus_ii units/{civ}/hero_darius_i units/{civ}/hero_xerxes_i
- **Train batch time:** ×0.8
- **Researches:** immortals
- **Auras:** structures/satrapy_tribute
- **Resource trickle:** 10 wood per 2000 ms
- **Upgrade:** TributeFood → `structures/pers/tachara_food` (free, 10 s)
- **Upgrade:** TributeStone → `structures/pers/tachara_stone` (free, 10 s)
- **Upgrade:** TributeMetal → `structures/pers/tachara_metal` (free, 10 s)
- **Loot:** 40 stone, 40 metal
- **Classes:** Structure ConquestCritical CivSpecific
- **Visible classes:** City Palace
- **Footprint:** Square 32 m × 32 m (height 8 m)
- **Obstruction:** Static 30 m × 30 m

## Built by

- **pers** — `structures/pers/tachara_wood` (upgrade of `structures/pers/tachara`, `structures/pers/tachara_food`, `structures/pers/tachara_metal`, `structures/pers/tachara_stone`) — not placeable directly
