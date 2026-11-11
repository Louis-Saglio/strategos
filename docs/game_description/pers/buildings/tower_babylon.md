# tower_babylon

Persian-specific building of 0 A.D. 0.28.0 — only the persians can build it. See `docs/game_description/pers/buildings/README.md` for the method; shared buildings are documented in `docs/game_description/generic/buildings/`.

Stats resolved from `simulation/templates/structures/pers/tower_babylon` (full pers template chain).

## Guide

The Pāyaud is the vestigial Persian stone tower variant — an
identity-only override of the standard stone tower (`template_structure_defensive_tower_stone`):
identical stats to the buildable `structures/pers/defense_tower` (1000
HP, 8 pierce arrows at 60 m, 5 garrison slots, the stone-tower techs) and
the same specific name; the two templates differ only in visual actor
(`babylonian_tower` here vs `scout_tower`). No builder lists it, so it is
not offered through the build UI. It is only relevant through a directly
placed construct command.

## Basic stats

- **Generic name:** Stone Tower
- **Health:** 1000 HP
- **Armor:** 29 hack / 35 pierce / 3 crush
- **Attack:** Ranged "Bow" — damage 8 pierce — range 60 m — min range 10 m — prepare 0.4 s — repeat 3.5 s — preferred Human
- **Cost:** 100 wood, 100 stone
- **Build time:** 150 s
- **Territory influence:** radius 32 m, weight 30000
- **Garrison:** 5 slots
- **Vision:** 80 m
- **Capture points:** 500
- **Build territory:** own
- **Placement:** land
- **Build distance:** min 60 m from Tower
- **Requirements:** phase_town
- **Researches:** tower_watch tower_crenellations tower_range tower_murderholes tower_health
- **Classes:** Structure
- **Visible classes:** Defensive Tower StoneTower
- **Footprint:** Square 10 m × 10 m (height 15 m)
- **Obstruction:** Static 7 m × 7 m

## Built by

- **pers** — `structures/pers/tower_babylon` (not listed by any builder; construct directly)

