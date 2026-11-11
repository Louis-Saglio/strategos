# ministry

Han-specific building of 0 A.D. 0.28.0 — only the han can build it. See `docs/game_description/han/buildings/README.md` for the method; shared buildings are documented in `docs/game_description/generic/buildings/`.

Stats resolved from `simulation/templates/structures/han/ministry` (full han template chain).

## Guide

The Imperial Ministry (Gōngdiàn) is han's administrative centre: it trains the Imperial Ministers (the gather/build-aura units, limit 9) and researches the Civil Engineering and Civil Service tech pairs plus the spy techs, which han's civil centre does not offer. It is available from the Village phase for 50 wood, 200 stone and 50 metal (200 s, 3000 HP, 24/30/3 armor) — a heavy early stone commitment — and limited to one per player. It also gives +20 population, holds 9 garrison slots (+1 HP/s healing) and is a territory root (60 m, weight 30000), so its territory stays connected if the civil centre falls. It counts as a Village-class structure toward the five needed for the Town phase. Build it early: ministers' auras compound with every worker trained, and one minister is already in the starting group.

## Basic stats

- **Generic name:** Imperial Ministry
- **Specific name:** Gōngdiàn
- **Health:** 3000 HP
- **Armor:** 24 hack / 30 pierce / 3 crush
- **Vision:** 80 m
- **Cost:** 50 wood, 200 stone, 50 metal
- **Build time:** 200 s
- **Population bonus:** +20
- **Territory influence:** radius 60 m, weight 30000, territory root
- **Garrison:** 9 slots (+1/s heal) — accepts Support Minister Infantry
- **Capture points:** 3000
- **Build territory:** own
- **Placement:** land
- **Build category:** ImperialMinistry (one per player)
- **Requirements:** phase_village
- **Trains:** units/{civ}/support_minister
- **Train batch time:** ×0.8
- **Researches:** pair_unlock_civil_engineering_han pair_unlock_civil_service_han unlock_spies spy_counter
- **Loot:** 10 wood, 40 stone, 10 metal, 200 xp
- **Classes:** Structure ConquestCritical CivSpecific
- **Visible classes:** Civic ImperialMinistry Village
- **Footprint:** Square 32 m × 36 m (height 8 m)
- **Obstruction:** Static 28 m × 32 m

## Built by

- **han** — `structures/han/ministry`
