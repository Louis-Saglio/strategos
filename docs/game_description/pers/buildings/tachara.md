# tachara

Persian-specific building of 0 A.D. 0.28.0 — only the persians can build it. See `docs/game_description/pers/buildings/README.md` for the method; shared buildings are documented in `docs/game_description/generic/buildings/`.

Stats resolved from `simulation/templates/structures/pers/tachara` (full pers template chain).

## Guide

The Winter Palace (Taçara) is the Persian palace and late-game keystone:
one per player (`Palace` limit), City phase, 200 stone + 200 metal, 300 s.
It is a **territory root** (48 m radius — the largest root building after
the wonder), so planting one claims a large area outright. It has three
jobs. First, it is where the **three heroes** are trained (×0.8 batch
time) — the Persian fortress trains no heroes, so the palace is the only
source. Second, it researches `immortals` (Immortals −50% train time).
Third, the "Satrapy Tribute": a free 10 s in-place upgrade that switches
the palace's trickle to 10 of one chosen resource every 2 s (5/s — a
modest but permanent income; as food that is five women on a berry bush
at 1/s each; the
upgrade can be retaken to change resource, each switch costing 10 s). The
base trickle is all zeros, so an un-upgraded palace gives nothing. The
four upgrade forms (`tachara_food/wood/stone/metal`) only change the
trickle rate and the icon; everything else is inherited.

## Basic stats

- **Generic name:** Winter Palace
- **Health:** 3000 HP
- **Armor:** 24 hack / 30 pierce / 3 crush
- **Cost:** 200 stone, 200 metal
- **Build time:** 300 s
- **Territory influence:** radius 48 m, weight 40000, territory root
- **Garrison:** 10 slots
- **Vision:** 40 m
- **Capture points:** 500
- **Build territory:** own
- **Build category:** Palace (max 1 per player)
- **Placement:** land
- **Requirements:** phase_city
- **Trains:** units/{civ}/hero_cyrus_ii units/{civ}/hero_darius_i units/{civ}/hero_xerxes_i
- **Train batch time:** ×0.8
- **Researches:** immortals
- **Classes:** Structure ConquestCritical CivSpecific
- **Visible classes:** City Palace
- **Footprint:** Square 32 m × 32 m (height 8 m)
- **Obstruction:** Static 30 m × 30 m
- **Upgrade TributeFood:** entity=structures/pers/tachara_food cost=None time=10
- **Upgrade TributeWood:** entity=structures/pers/tachara_wood cost=None time=10
- **Upgrade TributeStone:** entity=structures/pers/tachara_stone cost=None time=10
- **Upgrade TributeMetal:** entity=structures/pers/tachara_metal cost=None time=10
- **Resource trickle:** 0 food, 0 wood, 0 stone, 0 metal per 2000 ms
- **Auras:** structures/satrapy_tribute

## Built by

- **pers** — `structures/pers/tachara` (builder)

