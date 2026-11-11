# champion_infantry_crossbowman_academy

Han-specific unit of 0 A.D. 0.28.0 — only the han can train it. See `docs/game_description/han/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/han/champion_infantry_crossbowman_academy` (full han template chain).

## Guide

The Juezhang is han's champion crossbowman, trained at the Imperial Academy in the City phase for 80 food, 60 wood and 80 metal (15 s, 1 population). It fires a 30 pierce bolt every 3 s (10 pierce/s) at 60 m with spread 0.8, against the citizen crossbowman's 24 pierce at 45 m with spread 3, and has 120 HP with 3/3/20 armor: han's long-range damage core, but still fragile behind a melee line. The 80 metal per unit is premium spending, so add them once the economy can feed the academy continuously and keep the cheap food/wood citizen crossbowmen as the bulk. It carries the Crossbowman class, so `crossbow_training` (−20% training time), `poison_arrows` and the forge ranged-attack techs apply, and Wei Qing's aura (+20% attack, 60 m) is the natural hero pairing.

## Basic stats

- **Generic name:** Champion Infantry Crossbowman
- **Specific name:** Juezhang
- **Health:** 120 HP
- **Armor:** 3 hack / 3 pierce / 20 crush
- **Attack:** Capture — strength 5 — range 4 m — repeat 1 s — restricted Field Palisade Wall
- **Attack:** Ranged "Crossbow" — damage 30 pierce — range 60 m — prepare 0.2 s — repeat 3 s — spread 0.8 — preferred Human
- **Speed:** walk 9.6 m/s, run 16.03 m/s
- **Vision:** 80 m
- **Cost:** 80 food, 60 wood, 80 metal
- **Build time:** 15 s
- **Population:** 1
- **Requirements:** phase_city
- **Auras:** units/ram_garrison
- **Loot:** 8 food, 6 wood, 8 metal, 150 xp
- **Classes:** Unit Organic ConquestCritical Human
- **Visible classes:** Soldier Champion Infantry Ranged Crossbowman

## Trained by

- **han** — `units/han/champion_infantry_crossbowman_academy` (academy)
