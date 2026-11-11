# hero_demetrius_i

Macedonian-specific unit of 0 A.D. 0.28.0 — only the macedonians can train it. See `docs/game_description/mace/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/mace/hero_demetrius_i` (full mace template chain).

## Guide

Demetrius I the Besieger is the siege-support hero, trained at the fortress (City phase) for 200 food, 150 wood and 200 metal, 0 population — the cheapest of mace's three heroes, with a 50 s training time and the one-hero-alive limit. He is a slow infantry swordsman (walk 9 m/s) with 1000 HP, 12 hack / 12 pierce / 25 crush armor and a 26 hack sword every 0.75 s with a strength-10 capture attack, so he can escort the siege train on foot. His "Besieger" aura gives your siege engines within 60 m +1 hack/pierce/crush armor, +20% damage, +10% ranged attack range and +10% vision, which improves lithobolos, bolt shooters, siege towers and rams alike. Pair him with Macedonia's cheaper arsenal output (the team bonus cuts allied siege cost and build time by 25%) for a late-game push on fortified positions.

## Basic stats

- **Generic name:** Demetrius I the Besieger
- **Specific name:** Dēmētrios Poliorkētēs
- **Health:** 1000 HP
- **Armor:** 12 hack / 12 pierce / 25 crush
- **Attack:** Capture — strength 10 — range 4 m — repeat 1 s — restricted Field Palisade Wall
- **Attack:** Melee "Sword" — damage 26 hack — range 3 m — prepare 0.375 s — repeat 0.75 s — preferred Unit+!Ship
- **Speed:** walk 9 m/s, run 15.03 m/s
- **Vision:** 100 m
- **Cost:** 200 food, 150 wood, 200 metal
- **Build time:** 50 s
- **Population:** 0
- **Requirements:** phase_city
- **Auras:** units/heroes/hero_garrison units/ram_garrison units/heroes/mace_hero_demetrius_i
- **Loot:** 10 food, 25 metal, 400 xp
- **Classes:** Unit Organic ConquestCritical Human
- **Visible classes:** Soldier Hero Infantry Melee Swordsman

## Trained by

- **mace** — `units/mace/hero_demetrius_i` (fortress)
