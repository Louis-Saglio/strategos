# gymnasium

Athenian-specific building of 0 A.D. 0.28.0 — only the athenians can build it. See `docs/game_description/athen/buildings/README.md` for the method; shared buildings are documented in `docs/game_description/generic/buildings/`.

Stats resolved from `simulation/templates/structures/athen/gymnasium` (full athen template chain).

## Guide

The Gymnasium (Gymnasion) is Athens' champion factory — the earliest in
the game: **Town phase**, 150 stone + 100 metal, 200 s, 2000 HP, 30 ×
30 m, 10 garrison slots, 38 m territory influence (non-root). It trains
all three Athenian champions (Marine, City Guard spearman, Scythian
Archer) at ×0.7 batch time — no unlock tech needed, the building itself
is the gate — and researches `iphicratean_reforms`. Unlike most civs'
special buildings it has **no build limit**. Built by any Athenian unit
(the `civ/athen` mixin adds it to every builder's list). For a bot it is
the Town-phase power spike: a gymnasium at ~8 min puts 200 HP fast
champions on the field while opponents are still on citizen soldiers.

## Basic stats

- **Generic name:** Gymnasium
- **Health:** 2000 HP
- **Armor:** 24 hack / 30 pierce / 3 crush
- **Cost:** 150 stone, 100 metal
- **Build time:** 200 s
- **Territory influence:** radius 38 m, weight 40000
- **Garrison:** 10 slots
- **Vision:** 40 m
- **Capture points:** 500
- **Build territory:** own
- **Placement:** land
- **Requirements:** phase_town
- **Trains:** units/{civ}/champion_marine units/{civ}/champion_infantry units/{civ}/champion_ranged
- **Train batch time:** ×0.7
- **Researches:** iphicratean_reforms
- **Classes:** Structure ConquestCritical CivSpecific
- **Visible classes:** Gymnasium Town
- **Footprint:** Square 30 m × 30 m (height 8 m)
- **Obstruction:** Static 28 m × 28 m

## Built by

- **athen** — `structures/athen/gymnasium` (all athen units, via the civ/athen mixin)

