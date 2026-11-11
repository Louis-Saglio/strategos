# wallset_stone

Buildable by **15** civilisations. Generic (non-civ-specific) building of 0 A.D. 0.28.0 — see `docs/game_description/generic/buildings/README.md` for the method.

Generic stats resolved from the shared template `simulation/templates/template_wallset` (deepest template common to all civilisation variants; variants may override, see below).

Note: this is a **wall set**, not a single building — it defines the wall segments (short/medium/long/tower/gate) placed with the wall tool. Segment stats come from `template_structure_defensive_wall_*`.

## Guide

The Wall set is a defensive structure: it lets you enclose your base or critical buildings with stone wall segments to block or delay enemy attacks, with towers providing defensive strength and a gate letting your own units pass. It requires the town phase, so it is not available in the village phase — the bot can only start walling once it has advanced. Segments cost stone (a short segment is 12 stone and 12 s build time, a long one 36 stone and 36 s, a tower 48 stone and 48 s), so building a full enclosure is a premium investment, since stone is a scarce resource. Build walls only if you have a steady stone income and a genuine need to protect a static position; they are buildable by 15 civilisations including gaul.

## Basic stats

- **Generic name:** Wall
- **Requirements:** phase_town
- **Visible classes:** Wall

## Civilisations that can build it

- **athen** — `structures/athen/wallset_stone`
- **brit** — `structures/brit/wallset_stone`
- **cart** — `structures/cart/wallset_stone`
- **gaul** — `structures/gaul/wallset_stone`
- **germ** — `structures/germ/wallset_stone`
- **han** — `structures/han/wallset_stone`
- **iber** — `structures/iber/wallset_stone`
- **kush** — `structures/kush/wallset_stone`
- **mace** — `structures/mace/wallset_stone`
- **maur** — `structures/maur/wallset_stone`
- **pers** — `structures/pers/wallset_stone`
- **ptol** — `structures/ptol/wallset_stone`
- **rome** — `structures/rome/wallset_stone`
- **sele** — `structures/sele/wallset_stone`
- **spart** — `structures/spart/wallset_stone`

## Wall segment sizes

The wall tool places five segment types from per-civilisation templates (`structures/<civ>/wall_*`); footprints differ by civilisation (width × depth in meters, placement height in brackets):

- **athen** — short 13×6 (h 12.5), medium 25×6 (h 12.5), long 37×6 (h 9), tower 8×8 (h 19), gate 37×8 (h 15.5)
- **brit** — short 13×7 (h 10.3), medium 25×7 (h 10.3), long 37×7 (h 10.3), tower 11×10 (h 20), gate 37×8 (h 18)
- **cart** — short 13×8 (h 13), medium 25×8 (h 13), long 37×8 (h 13), tower 12×12 (h 20), gate 37×9 (h 16.5)
- **gaul** — short 13×7 (h 10.3), medium 25×7 (h 10.3), long 37×7 (h 10.3), tower 9×9 (h 21.5), gate 37×8 (h 12)
- **germ** — short 14×12 (h 9), medium 26×12 (h 9), long 39×12 (h 9), tower 12×12 (h 20), gate 39×12 (h 9)
- **han** — short 13×9 (h 11), medium 25×9 (h 11), long 37×9 (h 11), tower 11×11 (h 23), gate 37×11 (h 18)
- **iber** — short 13×8 (h 10), medium 25×8 (h 10), long 37×8 (h 10), tower Circle r 6 (h 13), gate 37×8 (h 12.7)
- **kush** — short 13×6 (h 12.6), medium 25×6 (h 12.6), long 37×6 (h 12.6), tower 9×9 (h 15.7), gate 37×9 (h 12.6)
- **mace** — short 13×6 (h 12.5), medium 25×6 (h 12.5), long 37×6 (h 12.5), tower 8×8 (h 19), gate 37×7.5 (h 15.5)
- **maur** — short 13×5 (h 10.5), medium 25×5 (h 10.5), long 37×5 (h 10.5), tower 8×8 (h 20), gate 37×8 (h 22)
- **pers** — short 13×7 (h 11.6), medium 25×7 (h 11.6), long 37×7 (h 11.6), tower 8×8 (h 14.4), gate 37×7 (h 13.8)
- **ptol** — short 16×6 (h 10.8), medium 26×6 (h 10.8), long 39×6 (h 10.8), tower 10×10 (h 16), gate 40×12 (h 17.8)
- **rome** — short 13×9 (h 9.9), medium 25×9 (h 9.9), long 37×9 (h 9.9), tower 11×11 (h 20), gate 37×7 (h 11.9)
- **sele** — short 12×6 (h 11.4), medium 22×6 (h 11.4), long 35×6 (h 11.4), tower 8×8 (h 19), gate 35×8 (h 11.6)
- **spart** — short 13×6 (h 12.5), medium 25×6 (h 12.5), long 37×6 (h 12.5), tower 8×8 (h 19), gate 37×7 (h 15.5)

Each segment's obstruction is a single Static block 1 m smaller per side than the footprint; gates use two side obstructions with a passable gap in the middle.
