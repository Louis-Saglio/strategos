# prytaneion

Athenian-specific building of 0 A.D. 0.28.0 — only the athenians can build it. See `docs/game_description/athen/buildings/README.md` for the method; shared buildings are documented in `docs/game_description/generic/buildings/`.

Stats resolved from `simulation/templates/structures/athen/prytaneion` (full athen template chain).

## Guide

The Council Chamber (Prytaneion) is Athens' City-phase hero building:
100 stone + 200 metal, 200 s, 2000 HP, Circle r 16 m, 38 m territory
influence, **no build limit**. It trains three of the four heroes
(Themistocles, Pericles, Iphicrates — Hippocrates is at the temple) at
×0.7 batch time, and researches `long_walls` (walls buildable in neutral
territory) and `ostracism` (citizen soldiers +5% health, heroes −40%
health — a deliberate trade-off tech). Its "Officer Accommodation" aura
heals garrisoned heroes +6 HP/s — a hero repair bay: park a damaged
hero inside and it mends in seconds. Built by any Athenian unit (the
`civ/athen` mixin).

## Basic stats

- **Generic name:** Council Chamber
- **Health:** 2000 HP
- **Armor:** 24 hack / 30 pierce / 3 crush
- **Cost:** 100 stone, 200 metal
- **Build time:** 200 s
- **Territory influence:** radius 38 m, weight 40000
- **Garrison:** 5 slots
- **Vision:** 40 m
- **Capture points:** 500
- **Build territory:** own
- **Placement:** land
- **Requirements:** phase_city
- **Trains:** units/{civ}/hero_themistocles units/{civ}/hero_pericles units/{civ}/hero_iphicrates
- **Train batch time:** ×0.7
- **Researches:** long_walls ostracism
- **Classes:** Structure ConquestCritical CivSpecific
- **Visible classes:** City Council
- **Footprint:** Circle r 16 m (height 8 m)
- **Obstruction:** Static 24 m × 30 m
- **Auras:** structures/athen_prytaneion_hero_heal

## Built by

- **athen** — `structures/athen/prytaneion` (all athen units, via the civ/athen mixin)

