# hero_hippocrates

Athenian-specific unit of 0 A.D. 0.28.0 — only the athenians can train it. See `docs/game_description/athen/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/athen/hero_hippocrates` (full athen template chain).

## Guide

Hippocrates is the Athenian healer hero — a 600 HP support hero with no
attack who heals Humans (15 HP every 2 s = 7.5 HP/s, range 20 m). His
two auras make him the medicine engine of the civ: "Father of Medicine"
(Humans within 35 m +0.5 HP/s regeneration, always-on) and "Hippocratic
Oath" (**global**: own and **allied** healers heal +3 more per tick —
the base healer's 5 HP/2 s becomes 8, a +60% healing output for every
healer in the game). Uniquely
among the heroes he is trained at the **temple** (City phase, along with
the healers), not at the prytaneion. Park him with the army for the
regen aura or at home to supercharge the healer corps. 0 population, 1
hero alive at a time.

## Basic stats

- **Generic name:** Hippocrates
- **Health:** 600 HP
- **Armor:** 4 hack / 8 pierce / 4 crush
- **Speed:** walk 9 m/s, run 15.03 m/s
- **Vision:** 100 m
- **Cost:** 200 food, 150 wood, 200 metal
- **Build time:** 50 s
- **Population:** 0
- **Classes:** Unit Organic ConquestCritical Human
- **Visible classes:** Hero Healer Support

## Trained by

- **athen** — `units/athen/hero_hippocrates` (temple)

