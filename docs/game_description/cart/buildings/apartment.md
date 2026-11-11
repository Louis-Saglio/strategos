# apartment

Carthaginian-specific building of 0 A.D. 0.28.0 — only the carthaginians can build it. See `docs/game_description/cart/buildings/README.md` for the method; shared buildings are documented in `docs/game_description/generic/buildings/`.

Stats resolved from `simulation/templates/structures/cart/apartment` (full cart template chain).

## Guide

The Apartment (Bet) is Carthage's big house. The civ's basic house already gives +10 population (double a generic house's +5, for 150 wood), and the apartment doubles that again to +20, with 1800 HP, 12 garrison slots and 1000 capture points. It is obtained two ways: built directly by any Carthaginian builder (the generic builder list contains `structures/{civ}/apartment`, which only resolves to a template for cart) for 175 wood + 50 stone at 90 s, or by upgrading an existing house ("Add a second story") for 50 wood + 50 stone over 55 s. The direct build is cheaper on build time per pop but the upgrade path reuses the existing house's 150 wood, so upgrading is the efficient route when houses are already standing. It is Carthage's population-density tool: fewer buildings, more pop, at the price of stone (the scarce resource) and a 15 × 15 m footprint.

## Basic stats

- **Generic name:** Apartment Building
- **Health:** 1800 HP
- **Armor:** 24 hack / 30 pierce / 3 crush
- **Cost:** 175 wood, 50 stone
- **Build time:** 90 s
- **Population bonus:** +20
- **Territory influence:** radius 20 m, weight 40000
- **Garrison:** 12 slots
- **Vision:** 20 m
- **Capture points:** 1000
- **Build territory:** own
- **Placement:** land
- **Requirements:** phase_village
- **Trains:** units/{civ}/support_civilian_house
- **Researches:** health_civilians_01 pop_house_01 pop_house_02 unlock_civilians_house_generic
- **Classes:** Structure ConquestCritical CivSpecific
- **Visible classes:** Civic Village House
- **Footprint:** Square 15 m × 15 m (height 5 m)
- **Obstruction:** Static 13 m × 13 m

## Built by

- **cart** — `structures/cart/apartment` (generic builder list; also the upgrade target of `structures/cart/house`)
