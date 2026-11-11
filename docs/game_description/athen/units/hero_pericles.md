# hero_pericles

Athenian-specific unit of 0 A.D. 0.28.0 — only the athenians can train it. See `docs/game_description/athen/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/athen/hero_pericles` (full athen template chain).

## Guide

Pericles is the Athenian hoplite hero — a 1000 HP spearman (15 + 12,
2.5× vs Cavalry, phalanx formation) and the civ's strategic keystone.
His auras: "Periclean Defensive Strategy" (own soldiers, ships, siege
and structures within 60 m yield **no loot** when killed, and own
structures get +50% capture points — a deny-the-enemy-economy and
harder-to-capture package) and "Scholarship and the Arts" (**global**:
all technologies −10% resource cost, −50% research time — the fastest
research rate in the game). For a boom, Pericles
is the pick: half-time research everywhere, and your losses cost the
enemy nothing. Trained at the prytaneion (City phase). 0 population, 1
hero alive at a time.

## Basic stats

- **Generic name:** Pericles
- **Health:** 1000 HP
- **Armor:** 12 hack / 12 pierce / 25 crush
- **Attack:** Capture — strength 10 — range 4 m — repeat 1 s — restricted Field Palisade Wall
- **Attack:** Melee "Spear" — damage 15 hack + 12 pierce — range 4 m — prepare 0.45 s — repeat 1 s — bonus 2.5× vs Cavalry — preferred Unit+!Ship
- **Speed:** walk 9 m/s, run 15.03 m/s
- **Vision:** 100 m
- **Cost:** 200 food, 200 wood, 150 metal
- **Build time:** 50 s
- **Population:** 0
- **Classes:** Unit Organic ConquestCritical Human
- **Visible classes:** Soldier Hero Infantry Melee Spearman

## Trained by

- **athen** — `units/athen/hero_pericles` (prytaneion)

