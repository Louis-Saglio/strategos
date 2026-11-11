# hero_maharbal

Carthaginian-specific unit of 0 A.D. 0.28.0 — only the carthaginians can train it. See `docs/game_description/cart/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/cart/hero_maharbal` (full cart template chain).

## Guide

Maharbal is the Carthaginian cavalry-command hero: a fast spear-armed horseman (walk 18 m/s) whose spear does 16 hack + 12 pierce with a 1.75× bonus vs Cavalry, so he fights well against enemy horse. His "Cavalry Commander" aura gives every Melee Cavalry unit within 60 m +30% melee attack damage, which stacks with Carthage's own cavalry (the Numidian cavalry javelineers, the mercenary horsemen and the Sacred Band Cavalry) to make a Maharbal-led cavalry wing hit far above its weight. At 250 metal he is the cheapest of the three heroes but still a premium; 0 population, limited to 1 alive, trained at the fortress (city phase).

## Basic stats

- **Generic name:** Maharbal
- **Health:** 1200 HP
- **Armor:** 11 hack / 10 pierce / 25 crush
- **Attack:** Capture — strength 10 — range 4 m — repeat 1 s — restricted Field Palisade Wall
- **Attack:** Melee "Spear" — damage 16 hack + 12 pierce — range 4 m — prepare 0.5 s — repeat 1.25 s — bonus 1.75× vs Cavalry — preferred Unit+!Ship
- **Speed:** walk 18 m/s, run 25.2 m/s
- **Vision:** 100 m
- **Cost:** 300 food, 200 wood, 250 metal
- **Build time:** 50 s
- **Population:** 0
- **Classes:** Unit Organic ConquestCritical Human FastMoving
- **Visible classes:** Soldier Hero Cavalry Melee Spearman

## Trained by

- **cart** — `units/cart/hero_maharbal` (fortress)
