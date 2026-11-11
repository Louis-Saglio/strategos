# tophet

Carthaginian-specific building of 0 A.D. 0.28.0 — only the carthaginians can build it. See `docs/game_description/cart/buildings/README.md` for the method; shared buildings are documented in `docs/game_description/generic/buildings/`.

Stats resolved from `simulation/templates/structures/cart/tophet` (full cart template chain).

## Guide

The Tophet (Sacrificial Temple) is Carthage's second, vestigial temple: a town-phase temple variant that costs 200 stone + 100 metal instead of the standard temple's 300 stone, trains the same healers, researches the same healing technologies, heals garrisoned units at +3 HP/s, and — uniquely — has **no territory decay** (`TerritoryDecay disable`), so its territory influence persists without a civic centre or hero nearby. No builder lists it (the buildable temple is `structures/cart/temple`), so it is not offered through the build UI, but a construct command placed directly still works. For a bot it is only relevant through such direct placement; in ordinary skirmish play the standard temple covers the same role at a slightly higher stone cost.

## Basic stats

- **Generic name:** Sacrificial Temple
- **Health:** 2000 HP
- **Armor:** 24 hack / 30 pierce / 3 crush
- **Cost:** 200 stone, 100 metal
- **Build time:** 200 s
- **Territory influence:** radius 40 m, weight 30000
- **Garrison:** 20 slots (+3/s heal)
- **Vision:** 40 m
- **Capture points:** 500
- **Build territory:** own
- **Placement:** land
- **Requirements:** phase_town
- **Trains:** units/{civ}/support_healer_b
- **Researches:** cost_healer heal_range heal_range_2 heal_rate heal_rate_2 garrison_heal health_regen_units
- **Classes:** Structure ConquestCritical
- **Visible classes:** Civic Town Temple
- **Footprint:** Square 24 m × 26 m (height 8 m)
- **Obstruction:** Static 22 m × 24 m

## Built by

- **cart** — `structures/cart/tophet` (not listed by any builder; construct directly)
