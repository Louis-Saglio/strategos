# champion_ranged

Athenian-specific unit of 0 A.D. 0.28.0 — only the athenians can train it. See `docs/game_description/athen/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/athen/champion_ranged` (full athen template chain).

## Guide

The Scythian Archer (Speusínios) is Athens' ranged champion, trained at
the gymnasium (Town phase): 120 HP with 3/3/20 armor, a 14.4-pierce bow
at 60 m (1.25 s repeat), and — courtesy of the `spec_champ` mixin —
**walk 10.3 m/s**, far faster than citizen archers. At 80 food + 60 wood
+ 80 metal, 15 s, it is affordable to mass alongside the Marines. It
outkites melee infantry and keeps pace with the Marine line, so the
gymnasium gives Athens a complete fast champion duo (sword + bow) before
any other civ's champions exist.

## Basic stats

- **Generic name:** Scythian Archer
- **Health:** 120 HP
- **Armor:** 3 hack / 3 pierce / 20 crush
- **Attack:** Capture — strength 5 — range 4 m — repeat 1 s — restricted Field Palisade Wall
- **Attack:** Ranged "Bow" — damage 14.4 pierce — range 60 m — prepare 0.8 s — repeat 1.25 s — preferred Human
- **Speed:** walk 10.3 m/s, run 17.2 m/s
- **Vision:** 80 m
- **Cost:** 80 food, 60 wood, 80 metal
- **Build time:** 15 s
- **Population:** 1
- **Classes:** Unit Organic ConquestCritical Human
- **Visible classes:** Soldier Champion Infantry Ranged Archer

## Trained by

- **athen** — `units/athen/champion_ranged` (gymnasium)

