# hero_viriato

Iberian-specific unit of 0 A.D. 0.28.0 — only the iberians can train it. See `docs/game_description/iber/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/iber/hero_viriato` (full iber template chain).

## Guide

Viriato is the raiding Iberian hero — a 1000 HP infantry swordsman (26
hack, 0.75 s repeat) built for guerrilla war: "Guerrilla Tactics" gives
every own soldier within 60 m **+20% movement speed** (Iberian units
already move fast, so this makes raiding parties uncatchable), and "Swag"
doubles the **loot** of soldiers and siege engines within 60 m (+100%
food/wood/stone/metal looted from killed enemies and destroyed
buildings). Run him with the raiding cavalry and javelineers — hit,
loot, and outrun the pursuit. 0 population, 1 hero alive at a time,
trained at the fortress (City phase).

## Basic stats

- **Generic name:** Hero Swordsman
- **Health:** 1000 HP
- **Armor:** 12 hack / 12 pierce / 25 crush
- **Attack:** Capture — strength 10 — range 4 m — repeat 1 s — restricted Field Palisade Wall
- **Attack:** Melee "Sword" — damage 26 hack — range 3 m — prepare 0.375 s — repeat 0.75 s — preferred Unit+!Ship
- **Speed:** walk 9 m/s, run 15.03 m/s
- **Vision:** 100 m
- **Cost:** 200 food, 150 wood, 200 metal
- **Build time:** 50 s
- **Population:** 0
- **Classes:** Unit Organic ConquestCritical Human
- **Visible classes:** Soldier Hero Infantry Melee Swordsman

## Trained by

- **iber** — `units/iber/hero_viriato` (fortress)

