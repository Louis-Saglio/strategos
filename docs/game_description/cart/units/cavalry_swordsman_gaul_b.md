# cavalry_swordsman_gaul_b

Carthaginian-specific unit of 0 A.D. 0.28.0 — only the carthaginians can train it. See `docs/game_description/cart/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/cart/cavalry_swordsman_gaul_b` (full cart template chain).

## Guide

The Gallic Mercenary Cavalry is Carthage's fast sword cavalry: 160 HP at 18 m/s walk (25.2 run), a 9.9-hack sword (+10% over citizen cavalry), paid in 20 food + 90 metal and trained in 10.5 s at the Celtic embassy from the Town phase. It cannot gather, so it is a pure raiding instrument: run it past the enemy army to kill workers and capture undefended buildings (capture strength 1.75), then disengage at cavalry speed. It auto-promotes to Advanced at 0 XP and, like the other cavalry mercenaries, needs 300 XP for its Elite promotion. The City-phase "Celtic Auxiliaries" tech halves its metal cost and adds 50 food, easing massing it once food farms are up.

## Basic stats

- **Generic name:** Gallic Mercenary Cavalry
- **Health:** 160 HP
- **Armor:** 3 hack / 2 pierce / 15 crush
- **Attack:** Capture — strength 1.75 — range 4 m — repeat 1 s — restricted Field Palisade Wall
- **Attack:** Melee "Sword" — damage 9.9 hack — range 4 m — prepare 0.375 s — repeat 0.75 s — preferred Unit+!Ship
- **Speed:** walk 18 m/s, run 25.2 m/s
- **Vision:** 80 m
- **Cost:** 20 food, 90 metal
- **Build time:** 10.5 s
- **Population:** 1
- **Classes:** Unit Organic ConquestCritical Human FastMoving CitizenSoldier
- **Visible classes:** Citizen Soldier Cavalry Melee Swordsman Mercenary
- **Rank:** Basic

## Ranks

### Advanced — `units/{civ}/cavalry_swordsman_gaul_a`
Requires 0 XP (auto-promotes via `upgrade_rank_advanced_mercenary`).
- Health: ×1.25 → 200 HP
- Melee attack damage: ×1.1 → hack 10.89
- Capture strength: +0.7 → 2.45
- Build time: ×1.2 → 12.6 s
- Gather base speed: ×0.7 → 0.7
- Loot: ×1.2

### Elite — `units/{civ}/cavalry_swordsman_gaul_e`
Requires 300 XP.
- Health: ×1.25 (total ×1.56) → 250 HP
- Melee attack damage: ×1.1 (total ×1.21) → hack 11.98
- Capture strength: +0.8 (total +1.5) → 3.25
- Build time: ×1.2 (total ×1.44) → 15.12 s
- Gather base speed: ×0.7 (total ×0.49) → 0.49
- Loot: ×1.2 (total ×1.44)

- Note: mercenary variants promote at 0 XP (the auto-researched `upgrade_rank_advanced_mercenary` tech replaces RequiredXp with 0).

## Trained by

- **cart** — `units/cart/cavalry_swordsman_gaul_b` (embassy, embassy_celtic)
