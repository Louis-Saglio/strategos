# support_slave

Athenian-specific unit of 0 A.D. 0.28.0 — only the athenians can train it. See `docs/game_description/athen/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/athen/support_slave` (full athen template chain).

## Guide

The Slave (Doûlos) is the Athenian **0-population worker** — a 50-metal,
15 s gatherer that costs no population cap, gathers wood, stone and
metal at 1.0/s (vs the women's 0.7/0.35/0.35) and food at reduced rates
(fruit/fish 0.5, grain 0.35, meat 1), builds at half rate (Builder/Rate
0.5), and cannot collect treasure. The catch is its finite lifespan:
**−0.25 HP/s regeneration** kills a 100 HP slave in ~400 s (~6.7 min),
and it is `Unhealable` — nothing can extend its life. It is also
**vestigial in 0.28.0**: no trainer references it (neither the civil
centre nor any other building lists `support_slave`), so it is
unreachable in ordinary skirmish play — only a directly placed train
command produces one. If ever fielded, it is a pop-free burst of wood
and mining labor that expires on its own.

## Basic stats

- **Generic name:** Slave
- **Health:** 100 HP
- **Armor:** 1 hack / 1 pierce / 1 crush
- **Speed:** walk 9 m/s, run 15.03 m/s
- **Vision:** 12 m
- **Cost:** 50 metal
- **Build time:** 15 s
- **Population:** 0
- **Gather:** rates: food: fruit 0.5; food: grain 0.35; food: meat 1; food: fish 0.5; wood: tree 1; wood: ruins 5; stone: rock 1; stone: ruins 5; metal: ore 1 /s
- **Gather:** capacity: 10 food, 10 wood, 10 stone, 10 metal
- **Classes:** Unit Organic ConquestCritical Human
- **Visible classes:** Support Builder Worker Slave

## Trained by

- **athen** — `units/athen/support_slave` (not trained by anything; train directly only)

