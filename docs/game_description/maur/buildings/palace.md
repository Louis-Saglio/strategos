# palace

Mauryan-specific building of 0 A.D. 0.28.0 — only the mauryas can build it. See `docs/game_description/maur/buildings/README.md` for the method; shared buildings are documented in `docs/game_description/generic/buildings/`.

Stats resolved from `simulation/templates/structures/maur/palace` (full maur template chain).

## Guide

The Palace (Harmya) is the Mauryan special building — the civ's hero and
champion hub. City phase, 200 stone + 200 metal, 200 s, 3000 HP, a
**territory root** (38 m radius), and — unlike the Persian and Ptolemaic
palaces — **no build limit** (it keeps the generic `Structure` category,
so several palaces can be planted, each claiming territory). It trains
the two Maiden Guard champions and the three heroes (Chanakya,
Chandragupta, Ashoka) with a ×0.7 batch-time modifier, and researches
`unlock_spies` and `spy_counter`. Built only by Mauryan women and the
three citizen infantry types (spearman, swordsman, archer — each adds it
to their builder list). For a bot it is both the late-game military
production site and a forward-territory tool: plant one to claim ground,
then train heroes and maidens on the spot.

## Basic stats

- **Generic name:** Palace
- **Health:** 3000 HP
- **Armor:** 24 hack / 30 pierce / 3 crush
- **Cost:** 200 stone, 200 metal
- **Build time:** 200 s
- **Territory influence:** radius 38 m, weight 40000, territory root
- **Garrison:** 5 slots
- **Vision:** 32 m
- **Capture points:** 500
- **Build territory:** own
- **Placement:** land
- **Requirements:** phase_city
- **Trains:** units/{civ}/champion_maiden units/{civ}/champion_maiden_archer units/{civ}/hero_chanakya units/{civ}/hero_chandragupta units/{civ}/hero_ashoka
- **Train batch time:** ×0.7
- **Researches:** unlock_spies spy_counter
- **Classes:** Structure ConquestCritical CivSpecific
- **Visible classes:** City Palace
- **Footprint:** Square 30 m × 30 m (height 10 m)
- **Obstruction:** Static 26 m × 26 m

## Built by

- **maur** — `structures/maur/palace` (maur women and the three citizen infantry types)

