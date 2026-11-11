# library

Ptolemaic-specific building of 0 A.D. 0.28.0 — only the ptolemies can build it. See `docs/game_description/ptol/buildings/README.md` for the method; shared buildings are documented in `docs/game_description/generic/buildings/`.

Stats resolved from `simulation/templates/structures/ptol/library` (full ptol template chain).

## Guide

The Ptolemaic Library is a City-phase economic-technology building, limited to one per player: 200 stone and 200 metal (both premium resources) and 200 s to build. It trains nothing and researches nothing; its value is its global **Center of Scholarship** aura, which makes every Ptolemaic structure research technologies 15% cheaper and 15% faster. Build it at the start of the City phase, before the expensive late technologies (forge upgrades, unit techs, naval techs), so the discount pays for itself; it also gives 50 m of territory and 5 garrison slots. Only the Ptolemies can build it: `structures/mace/library` and `structures/sele/library` exist but no mace or sele builder lists them.

## Basic stats

- **Generic name:** Library
- **Specific name:** Bibliothēkē
- **Health:** 2000 HP
- **Armor:** 24 hack / 30 pierce / 3 crush
- **Vision:** 40 m
- **Cost:** 200 stone, 200 metal
- **Build time:** 200 s
- **Territory influence:** radius 50 m, weight 40000
- **Garrison:** 5 slots
- **Capture points:** 500
- **Build territory:** own
- **Placement:** land
- **Build category:** Library (one per player)
- **Requirements:** phase_city
- **Auras:** structures/library
- **Loot:** 40 stone, 40 metal
- **Classes:** Structure CivSpecific
- **Visible classes:** City Library
- **Footprint:** Square 29 m × 34 m (height 9 m)
- **Obstruction:** Static 25 m × 30 m

## Built by

- **ptol** — `structures/ptol/library`
