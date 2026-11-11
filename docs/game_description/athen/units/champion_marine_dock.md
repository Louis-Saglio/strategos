# champion_marine_dock

Athenian-specific unit of 0 A.D. 0.28.0 — only the athenians can train it. See `docs/game_description/athen/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/athen/champion_marine_dock` (full athen template chain).

## Guide

The dock-trained Marine — identical stats to `champion_marine` (200 HP,
16-hack sword, walk 11.4 m/s, 60/40/60, 15 s), differing only in its
trainer and its gate: it is trained **at the dock** and requires the
`iphicratean_reforms` tech. That makes it Athens' amphibious tool: with
the reforms researched, warships carry their own champion escort, and an
Athenian fleet can drop a champion assault force on an enemy shore
without ferrying units from the mainland. The gymnasium version remains
available for land armies; take the reforms when the game turns naval.

## Basic stats

- **Generic name:** Athenian Marine
- **Health:** 200 HP
- **Armor:** 3 hack / 5 pierce / 20 crush
- **Attack:** Capture — strength 5 — range 4 m — repeat 1 s — restricted Field Palisade Wall
- **Attack:** Melee "Sword" — damage 16 hack — range 3 m — prepare 0.375 s — repeat 0.75 s — preferred Unit+!Ship
- **Speed:** walk 11.4 m/s, run 19.04 m/s
- **Vision:** 80 m
- **Cost:** 60 food, 40 wood, 60 metal
- **Build time:** 15 s
- **Population:** 1
- **Classes:** Unit Organic ConquestCritical Human
- **Visible classes:** Soldier Champion Infantry Melee Swordsman

## Trained by

- **athen** — `units/athen/champion_marine_dock` (dock, after iphicratean_reforms)

