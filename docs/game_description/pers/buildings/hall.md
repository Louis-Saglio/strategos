# hall

Persian-specific building of 0 A.D. 0.28.0 — only the persians can build it. See `docs/game_description/pers/buildings/README.md` for the method; shared buildings are documented in `docs/game_description/generic/buildings/`.

Stats resolved from `simulation/templates/structures/pers/hall` (full pers template chain).

## Guide

The Gate of All Nations (Duvarθi Visadahyu) is a **vestigial** Persian
template in 0.28.0: a City-phase special building (250 stone + 250 metal,
3000 HP, 10 garrison slots, 38 m territory influence with **no territory
decay**) that trains nothing and researches nothing — the template has no
`Trainer` and no `Researcher`, and the unit line it hosted in older
versions (the Kardakes) has been left untrained by any building. No
builder lists it, so it is not offered through the build UI (a construct
command placed directly still works). For a bot it is only relevant
through such direct placement; in ordinary skirmish play its role is
covered by the Winter Palace.

## Basic stats

- **Generic name:** Gate of All Nations
- **Health:** 3000 HP
- **Armor:** 24 hack / 30 pierce / 3 crush
- **Cost:** 250 stone, 250 metal
- **Build time:** 300 s
- **Territory influence:** radius 38 m, weight 40000
- **Garrison:** 10 slots
- **Vision:** 40 m
- **Capture points:** 500
- **Build territory:** own
- **Placement:** land
- **Requirements:** phase_city
- **Classes:** Structure
- **Visible classes:** City Hall
- **Footprint:** Square 25 m × 25 m (height 8 m)
- **Obstruction:** Static 25 m × 25 m

## Built by

- **pers** — `structures/pers/hall` (not listed by any builder; construct directly)

