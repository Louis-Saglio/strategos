# infantry_swordsman_ital_b

Carthaginian-specific unit of 0 A.D. 0.28.0 — only the carthaginians can train it. See `docs/game_description/cart/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/cart/infantry_swordsman_ital_b` (full cart template chain).

## Guide

The Samnite Swordsman is Carthage's second mercenary sword infantry, stat-identical to the Gallic Mercenary Swordsman (60 metal, 7 s, 8.8 hack, no gathering) and covered by the same "Celtic Auxiliaries" tech. Its one difference is practical and important: no buildable structure trains it — the only trainer token lives on the vestigial all-in-one `embassy` template, which no builder lists, so it is unreachable through the normal build UI. A construct command placed directly on that embassy still works (construction does not validate the builder's list), so it is effectively a map-script/trigger unit; for skirmish play, buy the Gallic swordsman at the Celtic embassy instead.

## Basic stats

- **Generic name:** Samnite Swordsman
- **Health:** 100 HP
- **Armor:** 3 hack / 3 pierce / 15 crush
- **Attack:** Capture — strength 2.5 — range 4 m — repeat 1 s — restricted Field Palisade Wall
- **Attack:** Melee "Sword" — damage 8.8 hack — range 3 m — prepare 0.375 s — repeat 0.75 s — preferred Unit+!Ship
- **Speed:** walk 9.5 m/s, run 15.86 m/s
- **Vision:** 80 m
- **Cost:** 60 metal
- **Build time:** 7 s
- **Population:** 1
- **Classes:** Unit Organic ConquestCritical Human CitizenSoldier
- **Visible classes:** Builder Citizen Worker Soldier Infantry Melee Swordsman Mercenary
- **Rank:** Basic

## Ranks

### Advanced — `units/{civ}/infantry_swordsman_ital_a`
Requires 100 XP.
- Health: ×1.25 → 125 HP
- Melee attack damage: ×1.1 → hack 9.68
- Capture strength: +0.7 → 3.2
- Build time: ×1.2 → 8.4 s
- Gather base speed: ×0.7 → 0.7
- Loot: ×1.2

### Elite — `units/{civ}/infantry_swordsman_ital_e`
Requires 100 XP.
- Health: ×1.25 (total ×1.56) → 156.25 HP
- Melee attack damage: ×1.1 (total ×1.21) → hack 10.65
- Capture strength: +0.8 (total +1.5) → 4
- Build time: ×1.2 (total ×1.44) → 10.08 s
- Gather base speed: ×0.7 (total ×0.49) → 0.49
- Loot: ×1.2 (total ×1.44)

- Note: mercenary variants promote at 0 XP (the auto-researched `upgrade_rank_advanced_mercenary` tech replaces RequiredXp with 0).

## Trained by

- **cart** — `units/cart/infantry_swordsman_ital_b` (embassy — the vestigial all-in-one embassy, not listed by any builder; construct directly)
