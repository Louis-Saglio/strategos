# infantry_spearman_ital_b

Carthaginian-specific unit of 0 A.D. 0.28.0 — only the carthaginians can train it. See `docs/game_description/cart/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/cart/infantry_spearman_ital_b` (full cart template chain).

## Guide

The Samnite Spearman is the mercenary cavalry counter: a metal-paid (60 metal), 7 s spearman whose spear does 4.95 hack + 4.4 pierce with the standard 2.5× bonus vs Cavalry — +10% damage over the Libyan Spearman's citizen stats. Like all Carthaginian mercenaries it cannot gather, so it is pure military spending, and it auto-promotes to Advanced at 0 XP. It is trained at the Italic embassy (Town phase), the cheapest embassy to field a spearman line from, and its main value is covering the rest of the mercenary army against enemy cavalry while the citizen economy keeps working.

## Basic stats

- **Generic name:** Samnite Spearman
- **Health:** 100 HP
- **Armor:** 3 hack / 3 pierce / 15 crush
- **Attack:** Capture — strength 2.5 — range 4 m — repeat 1 s — restricted Field Palisade Wall
- **Attack:** Melee "Spear" — damage 4.95 hack + 4.4 pierce — range 4 m — prepare 0.5 s — repeat 1 s — bonus 2.5× vs Cavalry — preferred Unit+!Ship
- **Speed:** walk 9.5 m/s, run 15.86 m/s
- **Vision:** 80 m
- **Cost:** 60 metal
- **Build time:** 7 s
- **Population:** 1
- **Classes:** Unit Organic ConquestCritical Human CitizenSoldier
- **Visible classes:** Builder Citizen Worker Soldier Infantry Melee Spearman Mercenary
- **Rank:** Basic

## Ranks

### Advanced — `units/{civ}/infantry_spearman_ital_a`
Requires 100 XP.
- Health: ×1.25 → 125 HP
- Melee attack damage: ×1.1 → hack 5.44 + pierce 4.84
- Capture strength: +0.7 → 3.2
- Build time: ×1.2 → 8.4 s
- Gather base speed: ×0.7 → 0.7
- Loot: ×1.2

### Elite — `units/{civ}/infantry_spearman_ital_e`
Requires 100 XP.
- Health: ×1.25 (total ×1.56) → 156.25 HP
- Melee attack damage: ×1.1 (total ×1.21) → hack 5.99 + pierce 5.32
- Capture strength: +0.8 (total +1.5) → 4
- Build time: ×1.2 (total ×1.44) → 10.08 s
- Gather base speed: ×0.7 (total ×0.49) → 0.49
- Loot: ×1.2 (total ×1.44)

- Note: mercenary variants promote at 0 XP (the auto-researched `upgrade_rank_advanced_mercenary` tech replaces RequiredXp with 0).

## Trained by

- **cart** — `units/cart/infantry_spearman_ital_b` (embassy_italic)
