# hero_hamilcar

Carthaginian-specific unit of 0 A.D. 0.28.0 — only the carthaginians can train it. See `docs/game_description/cart/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/cart/hero_hamilcar` (full cart template chain).

## Guide

Hamilcar Barca is the fast Carthaginian cavalry hero: walk 18 m/s (run 25.2), a 26-hack sword at 0.75 s repeat, and 1200 HP with 11/9/25 armor — a durable, mobile fighter suited to raiding and reinforcing a moving front. He carries two auras at once: "Lightning General" (+15% walk speed for own Soldiers and Siege engines within 60 m, so he is a force-multiplier for the whole army on the march) and "Subduer of Mercenaries" (enemy Mercenary units within 60 m deal −20% melee and ranged damage — valuable against mercenary-heavy civilisations). At 300 metal he is a premium purchase; like all heroes he costs 0 population, is limited to 1 alive, and is trained at the fortress (city phase).

## Basic stats

- **Generic name:** Hamilcar Barca
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

- **cart** — `units/cart/hero_hamilcar` (fortress)
