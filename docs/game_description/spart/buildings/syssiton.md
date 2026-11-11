# syssiton

Spartan-specific building of 0 A.D. 0.28.0 — only the spartans can build it. See `docs/game_description/spart/buildings/README.md` for the method; shared buildings are documented in `docs/game_description/generic/buildings/`.

Stats resolved from `simulation/templates/structures/spart/syssiton` (full spartan template chain).

## Guide

The Syssition (Military Mess Hall) is the Spartan champion barracks —
and it is a **Village-phase** building (`phase_village` requirement), the
reason Sparta fields the only Village-phase champion in the game ("Laws
of Lycurgus"). For 150 stone + 150 metal and 200 s it trains the
**Spartan Hoplite** (×0.7 batch time) and researches **Tyrtean Paeans**
(the champion speed tech), while also providing **+10 population**, a
38 m territory influence (weight 40000) and 10 garrison slots — a
genuinely useful economic anchor, not just a barracks. It sits in every
Spartan builder's list (women, spearmen, javelineers, the Skiritai —
the civ's units explicitly add `structures/spart/syssiton`), and it is
not capped: the `Structure` category carries no player limit. Build it
in the first minutes; the hoplite it unlocks is the civ's whole early
power spike.

## Basic stats

- **Generic name:** Military Mess Hall
- **Health:** 2000 HP
- **Armor:** 24 hack / 30 pierce / 3 crush
- **Cost:** 150 stone, 150 metal
- **Build time:** 200 s
- **Population bonus:** +10
- **Territory influence:** radius 38 m, weight 40000
- **Garrison:** 10 slots
- **Vision:** 40 m
- **Capture points:** 500
- **Build territory:** own
- **Placement:** land
- **Requirements:** phase_village
- **Trains:** units/{civ}/champion_infantry_spear
- **Train batch time:** ×0.7
- **Researches:** tyrtean_paeans
- **Classes:** Structure ConquestCritical CivSpecific
- **Visible classes:** Village Syssiton
- **Footprint:** Square 18 m × 28 m (height 12 m)
- **Obstruction:** Static 15 m × 25 m

## Built by

- **spart** — `structures/spart/syssiton` (spart builder units; spart-only template)
