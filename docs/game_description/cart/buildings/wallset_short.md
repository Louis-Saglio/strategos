# wallset_short

Carthaginian-specific building of 0 A.D. 0.28.0 — only the carthaginians can build it. See `docs/game_description/cart/buildings/README.md` for the method; shared buildings are documented in `docs/game_description/generic/buildings/`.

Stats resolved from `simulation/templates/structures/cart/wallset_short` (full cart template chain).

Note: this is a **wall set**, not a single building — it defines the wall segments placed with the wall tool. Segment stats come from the `structures/palisades_*` chain.

## Guide

The Low Wall is Carthage's third wall set, alongside the generic palisade and the stone walls. It is the cheapest and earliest fortification: village phase, wood-only segments (4 / 8 / 12 wood for short / medium / long), and — unlike Carthage's stone walls — buildable in **own and neutral territory**, so it can wall off forward positions and choke points before the Town phase. The trade-off is strength: segments have palisade-class stats (600 HP on the long segment, 9/25/2 armor) and are **not** affected by the "Triple Walls" civ bonus (they carry no `Wall` class), so they never scale into the late game. Use it for early map control and cheap expansion walls; replace it with stone walls — which Triple Walls triples to 9000 HP per long segment — once stone income allows. Note the `Wall` visible class sits on the wallset itself, not the segments, which is what keeps the segments out of the Triple Walls bonus.

## Basic stats

- **Generic name:** Low Wall
- **Requirements:** phase_village
- **Visible classes:** Wall

## Wall segment sizes

The wall tool places five segment types (dimensions in meters, footprint width × depth with placement height in brackets; costs in wood):

- **short** — Square 5 × 3 (h 6), obstruction Static 4 × 2 — 4 wood, 4 s, 200 HP
- **medium** — Square 10 × 3 (h 6), obstruction Static 9 × 2 — 8 wood, 8 s, 400 HP
- **long** — Square 15 × 3 (h 6), obstruction Static 14 × 2 — 12 wood, 12 s, 600 HP
- **tower** — Square 4 × 4 (h 8), obstruction Static 3 × 3 — 14 wood, 14 s, 700 HP
- **gate** — Square 15 × 3 (h 7) — 10 wood, 10 s, 500 HP

All segments: armor 9 hack / 25 pierce / 2 crush, 500 capture points, 4 m vision, buildable in own + neutral territory.

## Built by

- **cart** — `structures/cart/wallset_short`
