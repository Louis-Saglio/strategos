# gerousia

Spartan-specific building of 0 A.D. 0.28.0 — only the spartans can build it. See `docs/game_description/spart/buildings/README.md` for the method; shared buildings are documented in `docs/game_description/generic/buildings/`.

Stats resolved from `simulation/templates/structures/spart/gerousia` (full spartan template chain).

## Guide

The Gerousia (Spartan Senate) is the Spartan hero hall — a **Town-phase**
building (most civs get their heroes only in the City phase). For 100
stone + 200 metal and 200 s it trains all three heroes (Leonidas,
Brasidas, Agis — ×0.7 batch time; the heroes themselves still need the
City phase) and researches **Krypteia** and **Unlock Neodamodes**, the
two mid-game military techs. It carries a 38 m territory influence
(weight 40000), 5 garrison slots, and a `Council` build category — which
is **unenforced**: the player template has no `Council` limit, so
multiple gerousiai are allowed (the category is vestigial). Every
Spartan builder unit can place it (the civ's builder lists explicitly
add `structures/spart/gerousia`). Build it on the way to the City phase
so heroes and the tech pair are ready the moment they unlock.

## Basic stats

- **Generic name:** Spartan Senate
- **Health:** 2000 HP
- **Armor:** 24 hack / 30 pierce / 3 crush
- **Cost:** 100 stone, 200 metal
- **Build time:** 200 s
- **Territory influence:** radius 38 m, weight 40000
- **Garrison:** 5 slots
- **Vision:** 40 m
- **Capture points:** 500
- **Build territory:** own
- **Build category:** Council (no player limit — unenforced)
- **Placement:** land
- **Requirements:** phase_town
- **Trains:** units/{civ}/hero_leonidas units/{civ}/hero_brasidas units/{civ}/hero_agis
- **Train batch time:** ×0.7
- **Researches:** krypteia unlock_neodamodes
- **Classes:** Structure ConquestCritical
- **Visible classes:** Town Council
- **Footprint:** Circle r 12 m (height 8 m)
- **Obstruction:** Static 20 m × 20 m

## Built by

- **spart** — `structures/spart/gerousia` (spart builder units; spart-only template)
