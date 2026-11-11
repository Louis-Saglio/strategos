# kennel

British-specific building of 0 A.D. 0.28.0 — only the britons can build it. See `docs/game_description/brit/buildings/README.md` for the method; shared buildings are documented in `docs/game_description/generic/buildings/`.

Stats resolved from `simulation/templates/structures/brit/kennel` (full british template chain).

## Guide

The Kennel (Cunattegia) is the British war-dog factory — the only
building in the game that trains a **0-population combat unit**. For 100
wood and 50 s (Village phase) it trains war dogs at 100 food each in 15 s
(×0.7 batch time), and the player may own up to **2 kennels** (the
player template's `EntityLimits` sets `<Kennel>2</Kennel>`, keyed on the
building's `Kennel` category). Each **completed** kennel also raises the
war-dog training cap by 10 — the player's `WarDog` limit is 0 at base
with `LimitChangers/WarDog/Kennel = 10`, so a finished kennel means 10
dogs, two mean 20, and a foundation counts for nothing until it
completes. It is cheap enough to place in the first minutes, and the
dogs it produces are food-only, pop-free chasers — the Britons' way to
turn surplus food into army size that no other civ can match. It also
carries a surprisingly large 20 m territory influence (weight 30000)
for its price, so a forward kennel doubles as a mini-landgrab. Only
`Dog`-class units can garrison its 10 slots. Build it early when food is
abundant and population cap is the constraint — its value is the dogs,
not the building.

## Basic stats

- **Generic name:** Kennel
- **Health:** 500 HP
- **Armor:** 24 hack / 35 pierce / 3 crush
- **Cost:** 100 wood
- **Build time:** 50 s
- **Territory influence:** radius 20 m, weight 30000
- **Garrison:** 10 slots (dogs only)
- **Vision:** 20 m
- **Capture points:** 500
- **Build territory:** own
- **Build category:** Kennel (max 2 per player — `<Kennel>2</Kennel>` in the player's `EntityLimits`)
- **Placement:** land
- **Requirements:** phase_village
- **Trains:** units/{civ}/war_dog
- **Train batch time:** ×0.7
- **Classes:** Structure ConquestCritical CivSpecific
- **Visible classes:** Military Village Kennel
- **Footprint:** Square 8 m × 7 m (height 5 m)
- **Obstruction:** Static 7.5 m × 6.75 m

## Built by

- **brit** — `structures/brit/kennel` (generic builder list; brit-only template)
