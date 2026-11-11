# hero_agis

Spartan-specific unit of 0 A.D. 0.28.0 — only the spartans can train it. See `docs/game_description/spart/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/spart/hero_agis` (full spartan template chain).

## Guide

Agis III is the Spartan economic hero — a 1500 HP spear hoplite
(15 hack + 12 pierce, 2.5× vs Cavalry, phalanx formation), the tankiest
of the three. His real value is the **global** aura "Great Revolt":
while he lives, every own soldier on the map trains 25% faster and for
25% less metal — a map-wide production buff that compounds with the
metal-heavy Spartan roster and the free-hero team bonus. He also
attaches a second aura (`spart_hero_agis_2`, "Last Stand") that is
**broken** — its JSON carries no modifications, so it does nothing; do
not plan around an Agis self-buff. Pick Agis when the game is about
macro and reinforcement throughput; protect him, since the aura dies
with him. 0 population, City phase, trained at the **gerousia**, free
with the team bonus, subject to the global limit of 1 hero alive at a
time.

## Basic stats

- **Generic name:** Agis III
- **Health:** 1500 HP
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

- **spart** — `units/spart/hero_agis` (gerousia)
