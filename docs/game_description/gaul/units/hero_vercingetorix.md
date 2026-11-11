# hero_vercingetorix

Gaul-specific unit of 0 A.D. 0.28.0 — only the gauls can train it. See `docs/game_description/gaul/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/gaul/hero_vercingetorix` (full gaul template chain).

## Guide

Vercingetorix is the gaul hero: a fast (run 25.2 m/s), very durable (1200 HP, 25 crush armor) cavalry swordsman that costs no population, making it a strong addition to any army. Its 300 metal (a scarce resource) on top of 300 food / 150 wood makes it a premium investment rather than a unit to mass. Its "Celtic Warlord" aura (from the source template) gives Soldiers and Siege Engines within 60 m +1 capture attack strength and +20% melee and ranged damage, so it is most valuable fighting at the head of an army rather than alone. Its own Capture attack (strength 10, 1 s repeat) supports assaults on buildings.

## Basic stats

- **Generic name:** Vercingetorix
- **Health:** 1200 HP
- **Armor:** 11 hack / 9 pierce / 25 crush
- **Attack:** Capture — strength 10 — range 4 m — repeat 1 s — restricted Field Palisade Wall
- **Attack:** Melee "Sword" — damage 26 hack — range 4 m — prepare 0.375 s — repeat 0.75 s — preferred Unit+!Ship
- **Speed:** walk 18 m/s, run 25.2 m/s
- **Vision:** 100 m
- **Cost:** 300 food, 150 wood, 300 metal
- **Build time:** 50 s
- **Population:** 0
- **Classes:** Unit Organic ConquestCritical Human FastMoving
- **Visible classes:** Soldier Hero Cavalry Melee Swordsman

## Trained by

- **gaul** — `units/gaul/hero_vercingetorix` (assembly)
