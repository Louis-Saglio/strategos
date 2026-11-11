# support_elephant

Mauryan-specific unit of 0 A.D. 0.28.0 — only the mauryas can train it. See `docs/game_description/maur/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/maur/support_elephant` (full maur template chain).

## Guide

The Worker Elephant (Karmākara Gaja) is the Mauryan support unit — and
the only unit the Mauryas **start with** (one at match start, the sole
civilisation with a starting elephant). It is not a gatherer: it has no
`ResourceGatherer` at all. Its jobs are (1) a **mobile resource dropsite**
(`ResourceDropsite` for food/wood/stone/metal, non-sharable) — gatherers
deposit into it wherever it stands, so a woodline camp can skip the
storehouse entirely — and (2) a **builder** (the generic `builder`
mixin's roster). At 300 HP for 100 food and 1 population it is the
cheapest durable dropsite in the game. Train it at the civil centre or
elephant stable and park it at the woodline or a distant mine.

## Basic stats

- **Generic name:** Worker Elephant
- **Health:** 300 HP
- **Armor:** 2 hack / 2 pierce / 10 crush
- **Speed:** walk 5.4 m/s, run 9.02 m/s
- **Vision:** 50 m
- **Cost:** 100 food
- **Build time:** 15 s
- **Population:** 1
- **Classes:** Unit Organic ConquestCritical Human
- **Visible classes:** Support Builder Elephant

## Trained by

- **maur** — `units/maur/support_elephant` (civil_centre, elephant_stable)

