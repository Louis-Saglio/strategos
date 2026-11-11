# infantry_swordsman_gaul_b

Carthaginian-specific unit of 0 A.D. 0.28.0 — only the carthaginians can train it. See `docs/game_description/cart/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/cart/infantry_swordsman_gaul_b` (full cart template chain).

## Guide

The Gallic Mercenary Swordsman is Carthage's citizen-grade sword infantry, trained at the Celtic embassy from the Town phase. Like all Carthaginian mercenaries it is paid in metal — 60 metal, the scarce premium resource, in exchange for a 7 s training time (vs 10 s for a normal swordsman) and +10% melee damage (8.8 hack vs 8). It cannot gather or build up the economy, so it is a pure fighting unit: buy it when metal is available and the army needs a sword line quickly. It auto-promotes to Advanced rank at 0 XP (the "Expertise In War" civ-agnostic tech), so survivors immediately fight at 125 HP / 9.68 hack. In the City phase the "Celtic Auxiliaries" tech halves its metal cost but adds 50 food, letting a metal-strapped economy mass it for food instead.

## Basic stats

- **Generic name:** Gallic Mercenary Swordsman
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

### Advanced — `units/{civ}/infantry_swordsman_gaul_a`
Requires 100 XP.
- Health: ×1.25 → 125 HP
- Melee attack damage: ×1.1 → hack 9.68
- Capture strength: +0.7 → 3.2
- Build time: ×1.2 → 8.4 s
- Gather base speed: ×0.7 → 0.7
- Loot: ×1.2

### Elite — `units/{civ}/infantry_swordsman_gaul_e`
Requires 100 XP.
- Health: ×1.25 (total ×1.56) → 156.25 HP
- Melee attack damage: ×1.1 (total ×1.21) → hack 10.65
- Capture strength: +0.8 (total +1.5) → 4
- Build time: ×1.2 (total ×1.44) → 10.08 s
- Gather base speed: ×0.7 (total ×0.49) → 0.49
- Loot: ×1.2 (total ×1.44)

- Note: mercenary variants promote at 0 XP (the auto-researched `upgrade_rank_advanced_mercenary` tech replaces RequiredXp with 0).

## Trained by

- **cart** — `units/cart/infantry_swordsman_gaul_b` (embassy, embassy_celtic)
