# cavalry_spearman_ital_b

Carthaginian-specific unit of 0 A.D. 0.28.0 — only the carthaginians can train it. See `docs/game_description/cart/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/cart/cavalry_spearman_ital_b` (full cart template chain).

## Guide

The Italic Cavalry is the mercenary cavalry counter: a spear-armed horseman (6.6 hack + 6.05 pierce with a 1.75× bonus vs Cavalry — +10% over citizen cavalry spearmen) at 18 m/s walk, paid in 20 food + 90 metal and trained in 10.5 s at the Italic embassy from the Town phase. It cannot gather, so it is spent metal on the move: use it to chase down enemy cavalry raids, screen the Numidian cavalry javelineers from melee horse, and capture buildings (strength 1.75). It auto-promotes to Advanced at 0 XP; its Elite promotion takes 300 XP like the other cavalry mercenaries.

## Basic stats

- **Generic name:** Italic Cavalry
- **Health:** 160 HP
- **Armor:** 3 hack / 3 pierce / 15 crush
- **Attack:** Capture — strength 1.75 — range 4 m — repeat 1 s — restricted Field Palisade Wall
- **Attack:** Melee "Spear" — damage 6.6 hack + 6.05 pierce — range 4 m — prepare 0.625 s — repeat 1.25 s — bonus 1.75× vs Cavalry — preferred Unit+!Ship
- **Speed:** walk 18 m/s, run 25.2 m/s
- **Vision:** 80 m
- **Cost:** 20 food, 90 metal
- **Build time:** 10.5 s
- **Population:** 1
- **Classes:** Unit Organic ConquestCritical Human FastMoving CitizenSoldier
- **Visible classes:** Citizen Soldier Cavalry Melee Spearman Mercenary
- **Rank:** Basic

## Ranks

### Advanced — `units/{civ}/cavalry_spearman_ital_a`
Requires 0 XP (auto-promotes via `upgrade_rank_advanced_mercenary`).
- Health: ×1.25 → 200 HP
- Melee attack damage: ×1.1 → hack 7.26 + pierce 6.65
- Capture strength: +0.7 → 2.45
- Build time: ×1.2 → 12.6 s
- Gather base speed: ×0.7 → 0.7
- Loot: ×1.2

### Elite — `units/{civ}/cavalry_spearman_ital_e`
Requires 300 XP.
- Health: ×1.25 (total ×1.56) → 250 HP
- Melee attack damage: ×1.1 (total ×1.21) → hack 7.99 + pierce 7.32
- Capture strength: +0.8 (total +1.5) → 3.25
- Build time: ×1.2 (total ×1.44) → 15.12 s
- Gather base speed: ×0.7 (total ×0.49) → 0.49
- Loot: ×1.2 (total ×1.44)

- Note: mercenary variants promote at 0 XP (the auto-researched `upgrade_rank_advanced_mercenary` tech replaces RequiredXp with 0).

## Trained by

- **cart** — `units/cart/cavalry_spearman_ital_b` (embassy, embassy_italic)
