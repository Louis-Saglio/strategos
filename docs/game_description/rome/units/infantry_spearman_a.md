# infantry_spearman_a

Roman-specific unit of 0 A.D. 0.28.0 — only the romans can train it. See `docs/game_description/rome/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/rome/infantry_spearman_a` (full roman template chain).

## Guide

Advanced-rank roman spearman trained at the army_camp for 50 food + 50 wood in 10 s, making it a cheap anti-cavalry unit: its Spear attack carries a 2.5× bonus vs Cavalry. As a CitizenSoldier it doubles as a worker (it gathers all four resources and builds), so it can support the economy between fights. Its crush armor (15) is far higher than its hack/pierce armor (3/3), so it is poorly suited to tanking melee or ranged damage despite the cavalry counter role.

## Basic stats

- **Generic name:** Veteran Spearman
- **Health:** 100 HP
- **Armor:** 3 hack / 3 pierce / 15 crush
- **Attack:** Capture — strength 2.5 — range 4 m — repeat 1 s — restricted Field Palisade Wall
- **Attack:** Melee "Spear" — damage 4.5 hack + 4 pierce — range 4 m — prepare 0.5 s — repeat 1 s — bonus 2.5× vs Cavalry — preferred Unit+!Ship
- **Speed:** walk 9.5 m/s, run 15.86 m/s
- **Vision:** 80 m
- **Cost:** 50 food, 50 wood
- **Build time:** 10 s
- **Population:** 1
- **Gather:** rates: food: fruit 0.5, grain 0.25, meat 1; wood: tree 0.75, ruins 5; stone: rock 0.5, ruins 2; metal: ore 0.5, ruins 2 /s
- **Gather:** capacity: 10 food, 10 wood, 10 stone, 10 metal
- **Classes:** Unit Organic ConquestCritical Human CitizenSoldier
- **Visible classes:** Builder Citizen Worker Soldier Infantry Melee Spearman
- **Rank:** Advanced

## Ranks

### Elite — `units/rome/infantry_spearman_e`
Requires 100 XP.
- Health: ×1.25 (total ×1.56) → 156.25 HP
- Melee attack damage: ×1.1 (total ×1.21) → hack 5.45 + pierce 4.84
- Capture strength: +0.8 (total +1.5) → 4
- Build time: ×1.2 (total ×1.44) → 14.4 s
- Gather base speed: ×0.7 (total ×0.49) → 0.49
- Loot: ×1.2 (total ×1.44)

### Basic — `units/rome/infantry_spearman_conscript`
Requires 2000 XP.
- No stat changes (identity/visuals only).

Note: this unit is already **Advanced** rank — in game it also receives the auto-researched `unit_advanced` tech modifications (see the Ranks sections in `docs/game_description/generic/units/`).

## Trained by

- **rome** — `units/rome/infantry_spearman_a` (army_camp)
