# encampment_fortified

Germanic-specific building of 0 A.D. 0.28.0 — only the germans can build it. See `docs/game_description/germ/buildings/README.md` for the method; shared buildings are documented in `docs/game_description/generic/buildings/`.

Stats resolved from `simulation/templates/structures/germ/encampment_fortified` (full germ template chain).

## Guide

The Fortified Wagon Encampment is the City-phase upgrade of the encampment (200 wood + 200 metal, 30 s, applied in place and not placeable directly), so all of the encampment's role carries over: a dropsite for all four resources, +20 population, 20 garrison slots, own-or-neutral placement and no territory influence. The upgrade raises health to 2625 HP (+50%), hack armor to 20 and capture points to 3000, making forward bases and neutral-land expansions much harder to take or burn. It also adds log rams (200 wood + 75 metal) to the training list next to civilians, spearmen, slingers and supply wagons, which turns a forward encampment into a siege base. It still has no ranged attack, so garrison or defend it; it keeps the encampment's research (Wagon Trains and the shared-vision and espionage techs). Upgrade encampments that sit near a front when wood and metal allow.

## Basic stats

- **Generic name:** Fortified Wagon Encampment
- **Health:** 2625 HP
- **Armor:** 20 hack / 35 pierce / 3 crush
- **Vision:** 90 m
- **Cost:** 350 wood, 150 stone
- **Build time:** 220 s
- **Population bonus:** +20
- **Garrison:** 20 slots (+1/s heal)
- **Capture points:** 3000
- **Build territory:** own neutral
- **Placement:** land
- **Build distance:** min 1 m from CivilCentre
- **Requirements:** phase_town
- **Trains:** units/{native}/support_civilian units/{civ}/infantry_spearman_b units/{civ}/infantry_slinger_b units/{civ}/support_wagon units/{civ}/siege_ram
- **Train batch time:** ×0.8
- **Researches:** unlock_shared_los unlock_spies spy_counter wagon_trains
- **Loot:** 40 wood, 40 stone, 30 metal
- **Classes:** Structure ConquestCritical CivSpecific
- **Visible classes:** Civic Defensive Colony Encampment Fortified
- **Footprint:** Circle r 20 m (height 8 m)
- **Obstruction:** Static 34 m × 34 m

## Built by

- **germ** — `structures/germ/encampment_fortified` (upgrade of `structures/germ/encampment`) — not placeable directly
