# wallset_palisade

Buildable by **15** civilisations. Generic (non-civ-specific) building of 0 A.D. 0.28.0 — see `docs/game_description/generic/buildings/README.md` for the method.

Generic stats resolved from the shared template `simulation/templates/template_wallset` (deepest template common to all civilisation variants; variants may override, see below).

Note: this is a **wall set**, not a single building — it defines the wall segments (short/medium/long/tower/gate) placed with the wall tool. Segment stats come from `template_structure_defensive_wall_*`.

## Guide

The palisade is the cheap, early-game way to wall off a town: the civilisation variant (`structures/wallset_palisade`) drops the generic wall's `phase_town` requirement down to `phase_village`, and its short segment costs only 4 wood (an abundant resource, so easy to mass) with a 4-second build time, versus 12 stone — a scarce, premium resource — and 12 seconds for the stone wall equivalent. Its role is to delay raids and channel attackers toward the gate or towers, not to stop a siege — segment armour is Hack 9 / Pierce 25 / Crush 2, so it collapses quickly to crush damage. It can be built in own or neutral territory. For a bot, build palisades when wood is abundant and stone is scarce or a wall is needed immediately in the Village phase; prefer the stone wall set (`wallset_stone`) once Town phase and stone income allow.

## Basic stats

- **Generic name:** Wall
- **Requirements:** phase_town
- **Visible classes:** Wall
- **Footprint (segments):** short Square 5 × 3 (h 6), medium Square 10 × 3 (h 6), long Square 15 × 3 (h 6), tower Square 5 × 5 (h 8), gate Square 15 × 3 (h 7) — identical for all 15 civilisations (han uses its own templates with the same sizes)
- **Obstruction (segments):** one Static block per segment, 1 m smaller per side (short 4 × 2, medium 9 × 2, long 14 × 2, tower 4 × 4); the gate is two 2 × 2 side blocks plus a 10 × 2 door in the middle

## Civilisations that can build it

- **athen** — `structures/wallset_palisade`
- **brit** — `structures/wallset_palisade`
- **cart** — `structures/wallset_palisade`
- **gaul** — `structures/wallset_palisade`
- **germ** — `structures/wallset_palisade`
- **han** — `structures/han/wallset_palisade`
- **iber** — `structures/wallset_palisade`
- **kush** — `structures/wallset_palisade`
- **mace** — `structures/wallset_palisade`
- **maur** — `structures/wallset_palisade`
- **pers** — `structures/wallset_palisade`
- **ptol** — `structures/wallset_palisade`
- **rome** — `structures/wallset_palisade`
- **sele** — `structures/wallset_palisade`
- **spart** — `structures/wallset_palisade`
