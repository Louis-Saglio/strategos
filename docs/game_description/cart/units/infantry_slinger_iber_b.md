# infantry_slinger_iber_b

Carthaginian-specific unit of 0 A.D. 0.28.0 — only the carthaginians can train it. See `docs/game_description/cart/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/cart/infantry_slinger_iber_b` (full cart template chain).

## Guide

The Balearic Slinger is the long-range mercenary skirmisher: a 50 m sling doing 14.55 pierce + 1.39 crush (the crush chip helps against structures) — it outranges the 30 m javelin line and is outranged only by the 60 m Mauritanian archer, so it wins the ranged duel against other skirmishers and slingers once the 50 HP slinger kites. It costs 75 metal and trains in 7 s at the Iberian embassy (Town phase), hits +10% harder than a citizen slinger, cannot gather, and auto-promotes to Advanced at 0 XP. It is the mercenary answer to enemy ranged units and workers behind walls, but like every Carthaginian mercenary it is a pure metal expense — keep it supplied and protected, as 1/1 armor dies to any melee contact.

## Basic stats

- **Generic name:** Balearic Slinger
- **Health:** 50 HP
- **Armor:** 1 hack / 1 pierce / 10 crush
- **Attack:** Capture — strength 2.5 — range 4 m — repeat 1 s — restricted Field Palisade Wall
- **Attack:** Ranged "Sling" — damage 14.55 pierce + 1.39 crush — range 50 m — prepare 0.4 s — repeat 1.75 s — preferred Human
- **Speed:** walk 10.8 m/s, run 18.04 m/s
- **Vision:** 80 m
- **Cost:** 75 metal
- **Build time:** 7 s
- **Population:** 1
- **Classes:** Unit Organic ConquestCritical Human CitizenSoldier
- **Visible classes:** Builder Citizen Worker Soldier Infantry Ranged Slinger Mercenary
- **Rank:** Basic

## Ranks

### Advanced — `units/{civ}/infantry_slinger_iber_a`
Requires 100 XP.
- Health: ×1.25 → 62.5 HP
- Capture strength: +0.7 → 3.2
- Build time: ×1.2 → 8.4 s
- Gather base speed: ×0.7 → 0.7
- Loot: ×1.2
- Ranged spread: ×0.8

### Elite — `units/{civ}/infantry_slinger_iber_e`
Requires 100 XP.
- Health: ×1.25 (total ×1.56) → 78.13 HP
- Capture strength: +0.8 (total +1.5) → 4
- Build time: ×1.2 (total ×1.44) → 10.08 s
- Gather base speed: ×0.7 (total ×0.49) → 0.49
- Loot: ×1.2 (total ×1.44)
- Ranged spread: ×0.8 (total ×0.64)

- Note: mercenary variants promote at 0 XP (the auto-researched `upgrade_rank_advanced_mercenary` tech replaces RequiredXp with 0).

## Trained by

- **cart** — `units/cart/infantry_slinger_iber_b` (embassy, embassy_iberian)
