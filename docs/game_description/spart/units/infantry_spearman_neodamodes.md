# infantry_spearman_neodamodes

Spartan-specific unit of 0 A.D. 0.28.0 — only the spartans can train it. See `docs/game_description/spart/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/spart/infantry_spearman_neodamodes` (full spartan template chain).

## Guide

The Neodamodes Hoplite (Neodamōdeis) is the freed-helot spearman —
Sparta's City-phase citizen reinforcement. It is a citizen-tier hoplite
(100 HP, 3/3/15 armor, spear 4.5 hack + 4 pierce with the 2.5× vs
Cavalry bonus and the phalanx formation) that costs **30 food + 20
metal** and trains in 12 s — the cheapest metal-based melee unit in the
game, and the only citizen unit that pays metal instead of wood. That
makes it Sparta's late-game answer to wood starvation: once the
`unlock_neodamodes` tech (gerousia, City) is researched, the barracks
can spam hoplites for food and metal while wood goes to buildings and
ships. It cannot build (the `Builder` component and its visible classes
are disabled) and has no rank ladder.

## Basic stats

- **Generic name:** Neodamodes Hoplite
- **Health:** 100 HP
- **Armor:** 3 hack / 3 pierce / 15 crush
- **Attack:** Capture — strength 2.5 — range 4 m — repeat 1 s — restricted Field Palisade Wall
- **Attack:** Melee "Spear" — damage 4.5 hack + 4 pierce — range 4 m — prepare 0.5 s — repeat 1 s — bonus 2.5× vs Cavalry — preferred Unit+!Ship
- **Speed:** walk 9.5 m/s, run 15.86 m/s
- **Vision:** 80 m
- **Cost:** 30 food, 20 metal
- **Build time:** 12 s
- **Population:** 1
- **Classes:** Unit Organic ConquestCritical Human CitizenSoldier
- **Visible classes:** Citizen Soldier Infantry Melee Spearman

## Trained by

- **spart** — `units/spart/infantry_spearman_neodamodes` (barracks)
