# infantry_javelineer_iber_b

Carthaginian-specific unit of 0 A.D. 0.28.0 — only the carthaginians can train it. See `docs/game_description/cart/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/cart/infantry_javelineer_iber_b` (full cart template chain).

## Guide

The Iberian Mercenary Skirmisher is the metal-paid ranged harasser: 80 metal (the most metal of the infantry mercenaries) buys a 50 HP skirmisher throwing 17.6-pierce javelins at 30 m — +10% damage over a citizen javelineer — trained in 7 s at the Iberian embassy from the Town phase. Its javelins are **flaming**: each hit applies a stacking Burning status (+1 fire damage every 3 s for 9 s — 4 fire per hit, unmitigated by armor). It is fragile (1/1 armor, 50 HP) and cannot gather, so it must stay behind the melee line and kite; its fast feet (walk 11.4 m/s) help it run from trouble. It auto-promotes to Advanced at 0 XP, tightening its spread immediately. Because mercenaries cannot harvest, every one trained is a permanent net consumer of metal rather than a worker that pays for itself — train it for fire support, not as the backbone of the army.

## Basic stats

- **Generic name:** Iberian Mercenary Skirmisher
- **Health:** 50 HP
- **Armor:** 1 hack / 1 pierce / 10 crush
- **Attack:** Capture — strength 2.5 — range 4 m — repeat 1 s — restricted Field Palisade Wall
- **Attack:** Ranged "Javelin" — damage 17.6 pierce — range 30 m — prepare 0.4 s — repeat 1.5 s — preferred Human
- **Attack:** Ranged "Javelin" applies a Burning status: +1 fire damage every 3 s for 9 s, stacking
- **Speed:** walk 11.4 m/s, run 19.04 m/s
- **Vision:** 80 m
- **Cost:** 80 metal
- **Build time:** 7 s
- **Population:** 1
- **Classes:** Unit Organic ConquestCritical Human CitizenSoldier
- **Visible classes:** Builder Citizen Worker Soldier Infantry Ranged Javelineer Mercenary
- **Rank:** Basic

## Ranks

### Advanced — `units/{civ}/infantry_javelineer_iber_a`
Requires 100 XP.
- Health: ×1.25 → 62.5 HP
- Capture strength: +0.7 → 3.2
- Build time: ×1.2 → 8.4 s
- Gather base speed: ×0.7 → 0.7
- Loot: ×1.2
- Ranged spread: ×0.8

### Elite — `units/{civ}/infantry_javelineer_iber_e`
Requires 100 XP.
- Health: ×1.25 (total ×1.56) → 78.13 HP
- Capture strength: +0.8 (total +1.5) → 4
- Build time: ×1.2 (total ×1.44) → 10.08 s
- Gather base speed: ×0.7 (total ×0.49) → 0.49
- Loot: ×1.2 (total ×1.44)
- Ranged spread: ×0.8 (total ×0.64)

- Note: mercenary variants promote at 0 XP (the auto-researched `upgrade_rank_advanced_mercenary` tech replaces RequiredXp with 0).

## Trained by

- **cart** — `units/cart/infantry_javelineer_iber_b` (embassy, embassy_iberian)
