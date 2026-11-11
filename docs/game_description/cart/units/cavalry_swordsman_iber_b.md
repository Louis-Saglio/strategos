# cavalry_swordsman_iber_b

Carthaginian-specific unit of 0 A.D. 0.28.0 — only the carthaginians can train it. See `docs/game_description/cart/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/cart/cavalry_swordsman_iber_b` (full cart template chain).

## Guide

The Iberian Heavy Cavalry is a stat-twin of the Gallic Mercenary Cavalry (160 HP, 9.9-hack sword, 20 food + 90 metal, 10.5 s, no gathering, 0-XP auto-promotion, 300 XP for Elite) but with a practical catch: no buildable embassy trains it. Its only trainer token lives on the vestigial all-in-one `embassy`, which no builder lists, so it is unreachable through the normal build UI — a construct command placed directly on that embassy still works. For skirmish play the Gallic Mercenary Cavalry from the Celtic embassy is the obtainable equivalent; this template is effectively a map-script/trigger unit.

## Basic stats

- **Generic name:** Iberian Heavy Cavalry
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

### Advanced — `units/{civ}/cavalry_swordsman_iber_a`
Requires 0 XP (auto-promotes via `upgrade_rank_advanced_mercenary`).
- Health: ×1.25 → 200 HP
- Melee attack damage: ×1.1 → hack 10.89
- Capture strength: +0.7 → 2.45
- Build time: ×1.2 → 12.6 s
- Gather base speed: ×0.7 → 0.7
- Loot: ×1.2

### Elite — `units/{civ}/cavalry_swordsman_iber_e`
Requires 300 XP.
- Health: ×1.25 (total ×1.56) → 250 HP
- Melee attack damage: ×1.1 (total ×1.21) → hack 11.98
- Capture strength: +0.8 (total +1.5) → 3.25
- Build time: ×1.2 (total ×1.44) → 15.12 s
- Gather base speed: ×0.7 (total ×0.49) → 0.49
- Loot: ×1.2 (total ×1.44)

- Note: mercenary variants promote at 0 XP (the auto-researched `upgrade_rank_advanced_mercenary` tech replaces RequiredXp with 0).

## Trained by

- **cart** — `units/cart/cavalry_swordsman_iber_b` (embassy — the vestigial all-in-one embassy, not listed by any builder; construct directly)
