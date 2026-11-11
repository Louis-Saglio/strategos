# hero_leonidas

Spartan-specific unit of 0 A.D. 0.28.0 — only the spartans can train it. See `docs/game_description/spart/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/spart/hero_leonidas` (full spartan template chain).

## Guide

Leonidas I (Leōnidas) is the Spartan spear hero — 1000 HP, 12/12/25
armor, a spear of 15 hack + 12 pierce (2.5× vs Cavalry, 1 s repeat) and
the phalanx formation. His aura, "Last Stand" (+25% melee damage and +1
capture strength for every own spearman within 30 m), is the
spear-line amplifier — and in the spear-heavy Spartan army (Perioikoi
Hoplites, Spartan Hoplites, Neodamodes) it is the strongest combat aura
of the three heroes. Keep him in the phalanx, not behind it: the 30 m
radius demands front-line presence. 0 population, City phase, trained
at the **gerousia** — the Town-phase senate building — so the Spartans
can queue heroes one phase earlier than most civs, and (with the
Peloponnesian League team bonus active) for free. Subject to the global
limit of 1 hero alive at a time. A vestigial `hero_leonidas_300`
variant template exists but nothing trains it.

## Basic stats

- **Generic name:** Leonidas I
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

- **spart** — `units/spart/hero_leonidas` (gerousia)
