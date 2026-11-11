# wallset_siege

Roman-specific building of 0 A.D. 0.28.0 — only the romans can build it. See `docs/game_description/rome/buildings/README.md` for the method; shared buildings are documented in `docs/game_description/generic/buildings/`.

Stats resolved from `simulation/templates/structures/rome/wallset_siege` (full roman template chain).

Note: this is a **wall set**, not a single building — it defines the wall segments placed with the wall tool. Segment stats come from `template_structure_defensive_wall_*`.

## Guide

The Siege Wall is the Roman offensive wall set: unlike normal walls, its segments can be built in own, neutral **and enemy** territory (`BuildRestrictions`), making it the tool for walling off an area right at the enemy's doorstep. It requires `phase_city` and costs only wood (60 wood per long segment, 30 s build time), an abundant resource, so it is easy to mass, but segments are weaker than standard stone walls (Health ×0.75), so it is a field fortification rather than a permanent defense. Its gate/tower templates plus the `army_camp` fort let a bot establish a forward fortified position; build it to protect a siege or forward base, not as a substitute for the stone `wallset_stone` at home.

## Basic stats

- **Generic name:** Siege Wall
- **Requirements:** phase_city
- **Classes:** CivSpecific
- **Visible classes:** Wall SiegeWall

## Wall segment sizes

The wall tool places five segment types (`template_structure_defensive_wall_*`; dimensions in meters, footprint width × depth with placement height in brackets):

- **short** — Square 13 × 5 (h 6.7), obstruction Static 12 × 4
- **medium** — Square 25 × 5 (h 6.7), obstruction Static 24 × 4
- **long** — Square 37 × 5 (h 6.7), obstruction Static 36 × 4
- **tower** — Square 7 × 7 (h 12.5), obstruction Static 6 × 6
- **gate** — Square 37 × 7 (h 12.5), obstruction two side blocks (11.5 × 5 each, at ±12.25) with a passable gap in the middle

## Built by

- **rome** — `structures/rome/wallset_siege`
