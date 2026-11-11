# tower_double

Mauryan-specific building of 0 A.D. 0.28.0 — only the mauryas can build it. See `docs/game_description/maur/buildings/README.md` for the method; shared buildings are documented in `docs/game_description/generic/buildings/`.

Stats resolved from `simulation/templates/structures/maur/tower_double` (full maur template chain).

## Guide

The Rampart Tower (Udarka) is a vestigial Mauryan stone-tower variant —
a City-phase upgrade of the stone tower concept: 1200 HP, 100 wood + 200
stone, **2 default arrows** (max 7) and 16 visible turret points for
garrisoned archers. **No builder lists it** (the buildable Mauryan stone
tower is the standard `structures/maur/defense_tower`), so it is
unreachable through the build UI — only a directly placed construct
command produces it. Its tooltip ("up to 16 archers", "only archers can
garrison") is stale: the template inherits the standard 5 garrison slots
with no unit-class restriction. Only relevant for a bot that builds
directly by template name.

## Basic stats

- **Generic name:** Rampart Tower
- **Health:** 1200 HP
- **Armor:** 29 hack / 35 pierce / 3 crush
- **Attack:** Ranged "Bow" — damage 8 pierce — range 60 m — min range 10 m — prepare 0.4 s — repeat 3.5 s — preferred Human
- **Cost:** 100 wood, 200 stone
- **Build time:** 150 s
- **Territory influence:** radius 32 m, weight 30000
- **Garrison:** 5 slots
- **Vision:** 80 m
- **Capture points:** 500
- **Build territory:** own
- **Placement:** land
- **Build distance:** min 60 m from Tower
- **Requirements:** phase_city
- **Researches:** tower_watch tower_crenellations tower_range tower_murderholes tower_health
- **Classes:** Structure
- **Visible classes:** Defensive Tower StoneTower
- **Footprint:** Square 10 m × 10 m (height 15 m)
- **Obstruction:** Static 7 m × 7 m

## Built by

- **maur** — `structures/maur/tower_double` (not listed by any builder; construct directly)

