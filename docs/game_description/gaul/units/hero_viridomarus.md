# hero_viridomarus

Gaul-specific unit of 0 A.D. 0.28.0 — only the gauls can train it. See `docs/game_description/gaul/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/gaul/hero_viridomarus` (full gaul template chain).

## Guide

Viridomarus is the gaul hero: a tanky (1000 HP, high armor) infantry spearman trained once at the assembly for 200 food, 200 wood, 150 metal and no population cost. The 150 metal is a scarce resource, so he is a premium investment rather than a unit to mass — though he is trained only once anyway. His 2.5× attack bonus vs Cavalry makes him a strong anti-cavalry fighter, and his global "Preparation for War" aura gives all Workers +15% gather speed, so training him early pays off economically even without fighting.

## Basic stats

- **Generic name:** Viridomarus
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

- **gaul** — `units/gaul/hero_viridomarus` (assembly)
