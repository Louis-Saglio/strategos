# encampment

Germanic-specific building of 0 A.D. 0.28.0 — only the germans can build it. See `docs/game_description/germ/buildings/README.md` for the method; shared buildings are documented in `docs/game_description/generic/buildings/`.

Stats resolved from `simulation/templates/structures/germ/encampment` (full germ template chain).

## Guide

The Wagon Encampment is germ's forward base: for 350 wood and 150 stone (220 s, Town phase) it can be built in your own or neutral territory, as little as 1 m from a civil centre, and it neither projects territory nor decays. It is a dropsite for all four resources, gives +20 population, has 20 garrison slots (+1 HP/s healing), 1750 HP, 15/35/3 armor and 2500 capture points, and trains civilians, spearmen, slingers and supply wagons (batch ×0.8) — so it is a second production and economy hub without paying for a civil centre's 300 stone and 250 metal. It researches Wagon Trains (+10 population per encampment) and the shared-vision and espionage techs, nothing military. It is a soft target with no attack of its own, so garrison it or defend it. In the City phase it can be upgraded for 200 wood and 200 metal (30 s) into the fortified encampment.

## Basic stats

- **Generic name:** Wagon Encampment
- **Health:** 1750 HP
- **Armor:** 15 hack / 35 pierce / 3 crush
- **Vision:** 90 m
- **Cost:** 350 wood, 150 stone
- **Build time:** 220 s
- **Population bonus:** +20
- **Garrison:** 20 slots (+1/s heal)
- **Capture points:** 2500
- **Build territory:** own neutral
- **Placement:** land
- **Build distance:** min 1 m from CivilCentre
- **Requirements:** phase_town
- **Trains:** units/{native}/support_civilian units/{civ}/infantry_spearman_b units/{civ}/infantry_slinger_b units/{civ}/support_wagon
- **Train batch time:** ×0.8
- **Researches:** unlock_shared_los unlock_spies spy_counter wagon_trains
- **Upgrade:** Tower → `structures/germ/encampment_fortified` (200 wood, 200 metal, 30 s, requires phase_city)
- **Loot:** 40 wood, 40 stone, 30 metal
- **Classes:** Structure ConquestCritical CivSpecific
- **Visible classes:** Civic Defensive Colony Encampment
- **Footprint:** Circle r 20 m (height 8 m)
- **Obstruction:** Static 34 m × 34 m

## Built by

- **germ** — `structures/germ/encampment`
