# warehouse

Persian-specific building of 0 A.D. 0.28.0 — only the persians can build it. See `docs/game_description/pers/buildings/README.md` for the method; shared buildings are documented in `docs/game_description/generic/buildings/`.

Stats resolved from `simulation/templates/structures/pers/warehouse` (full pers template chain).

## Guide

A vestigial Persian house variant: a bulky 2000 HP house (+5 pop, 75
wood, 30 s) on a 26 × 26 m footprint with a wide 30 m territory radius.
No builder lists it, so it is not offered through the build UI; a
construct command placed directly still works. Only relevant for a bot
that builds directly by template name.

## Basic stats

- **Generic name:** House
- **Health:** 2000 HP
- **Armor:** 24 hack / 30 pierce / 3 crush
- **Cost:** 75 wood
- **Build time:** 30 s
- **Population bonus:** +5
- **Territory influence:** radius 30 m, weight 65535
- **Garrison:** 3 slots
- **Vision:** 20 m
- **Capture points:** 500
- **Build territory:** own
- **Placement:** land
- **Requirements:** phase_village
- **Trains:** units/{civ}/support_civilian_house
- **Researches:** health_civilians_01 pop_house_01 pop_house_02 unlock_civilians_house_generic
- **Classes:** Structure ConquestCritical
- **Visible classes:** Civic Village House
- **Footprint:** Square 26 m × 26 m (height 12 m)
- **Obstruction:** Static 24 m × 24 m

## Built by

- **pers** — `structures/pers/warehouse` (not listed by any builder; construct directly)

