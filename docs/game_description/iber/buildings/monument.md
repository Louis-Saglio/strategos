# monument

Iberian-specific building of 0 A.D. 0.28.0 — only the iberians can build it. See `docs/game_description/iber/buildings/README.md` for the method; shared buildings are documented in `docs/game_description/generic/buildings/`.

Stats resolved from `simulation/templates/structures/iber/monument` (full iber template chain).

## Guide

The Revered Monument (Gur Oroigarri) is the Iberian combat-aura anchor:
a cheap (100 stone + 100 metal, 120 s) Town-phase stone, built by the
Iberian women and all four citizen infantry types (each adds it to its
builder list — cavalry and champions do not), up to **5 per player**,
placed at least 150 m apart. Its "Religious
Fervor" aura gives every own soldier within 50 m **+20% melee and ranged
damage** — plant one on the front line or at a choke point and the
defenders fight 20% harder. It is otherwise inert: no territory
influence, no trainer or researcher, a 4 m vision, and — unusually — it
**cannot be captured** (`Capturable` disabled), so an enemy must raze it
outright rather than flip it. At 1200 HP it is reasonably tough for its
cost. For a bot it is the cheapest standing damage buff in the game:
dot monuments behind the front rather than garrisoning them.

## Basic stats

- **Generic name:** Revered Monument
- **Health:** 1200 HP
- **Armor:** 20 hack / 30 pierce / 3 crush
- **Cost:** 100 stone, 100 metal
- **Build time:** 120 s
- **Vision:** 4 m
- **Build territory:** own
- **Build category:** Monument (max 5 per player)
- **Placement:** land
- **Build distance:** min 150 m from Monument
- **Requirements:** phase_town
- **Classes:** Structure CivSpecific
- **Visible classes:** Monument Town
- **Footprint:** Square 8 m × 8 m (height 8 m)
- **Obstruction:** Static 6 m × 6 m
- **Auras:** structures/iber_monument

## Built by

- **iber** — `structures/iber/monument` (iber women and all four citizen infantry types)

