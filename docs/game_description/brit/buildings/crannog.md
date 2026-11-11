# crannog

British-specific building of 0 A.D. 0.28.0 — only the britons can build it. See `docs/game_description/brit/buildings/README.md` for the method; shared buildings are documented in `docs/game_description/generic/buildings/`.

Stats resolved from `simulation/templates/structures/brit/crannog` (full british template chain).

## Guide

The Crannog (Cranogion, "Island Settlement") is the British **water civic
centre** — a floating CC variant built on shorelines in own, allied or
neutral territory (Town phase). It is a full civic centre: 3000 HP,
+20 population, a 140 m **territory root**, 20 garrison slots (+1/s
heal), 6 default arrows, and the same women + spearman + slinger +
cavalry-javelineer trainer as the CC — plus the **dock roster** (fishing,
merchant, scout, arrow and fire ships). Its researcher also covers
`phase_city` and the shared-LOS/spies techs (the Town-phase and
Hellenistic-Metropolis entries are removed), so a crannog can age the
Britons up just like a civic centre. It counts as a `CivilCentre`
(category and class): it must be placed ≥200 m from any CC or crannog,
and it is subject to the CC entity limit — which the generic `phase_town`
LimitRemover has already lifted by the time a crannog can be built. The
upshot: the Britons expand onto water — plant a crannog on a lake or
coastline to claim territory, fish, and build a navy without sacrificing
a CC. It is the civ's answer to map-control on watery maps.

## Basic stats

- **Generic name:** Island Settlement
- **Health:** 3000 HP
- **Armor:** 29 hack / 35 pierce / 3 crush
- **Attack:** Ranged "Bow" — damage 8 pierce — range 60 m — prepare 0.4 s — repeat 4 s — preferred Human
- **Cost:** 300 wood, 300 stone, 250 metal
- **Build time:** 500 s
- **Population bonus:** +20
- **Territory influence:** radius 140 m, weight 10000, territory root
- **Garrison:** 20 slots (+1/s heal)
- **Vision:** 90 m
- **Capture points:** 2500
- **Build territory:** own ally neutral
- **Build category:** CivilCentre (one per player)
- **Placement:** shore
- **Build distance:** min 200 m from CivilCentre
- **Requirements:** phase_town
- **Trains:** units/{native}/support_civilian units/{civ}/infantry_spearman_b units/{civ}/infantry_slinger_b units/{civ}/cavalry_javelineer_b units/{civ}/ship_fishing units/{civ}/ship_merchant units/{civ}/ship_scout units/{civ}/ship_arrow units/{civ}/ship_fire
- **Train batch time:** ×0.8
- **Researches:** phase_city_{civ} unlock_shared_los archery_tradition hoplite_tradition roman_roads unlock_spies spy_counter
- **Classes:** Structure ConquestCritical CivCentre CivSpecific
- **Visible classes:** Civic Defensive CivilCentre Naval
- **Footprint:** Circle r 17 m (height 8 m)
- **Obstruction:** Static 29 m × 29 m

## Built by

- **brit** — `structures/brit/crannog` (generic builder list; brit-only template)
