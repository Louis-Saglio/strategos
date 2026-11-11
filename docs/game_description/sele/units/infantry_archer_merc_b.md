# infantry_archer_merc_b

Seleucid-specific unit of 0 A.D. 0.28.0 — only the seleucids can train it. See `docs/game_description/sele/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/sele/infantry_archer_merc_b` (full seleucid template chain).

## Guide

The Syrian Archer (Toxótēs Syrías) is the Seleucid mercenary archer —
and the **only ranged infantry the civ gets beyond its javelineers**: the
Seleucids have no citizen archer or slinger, so this mercenary is the
entire bow line. It is paid in metal (60 metal, zero
food/wood/stone — the mercenary mixin zeroes the other resources), trains
fast (7 s), shoots a 7.92-pierce bow at 60 m and **cannot gather**
(`ResourceGatherer` disabled) — though it keeps the `Builder` class.
Like all mercenaries it auto-promotes at 0 XP (`upgrade_rank_advanced_mercenary`).
Hired at the military colony from the Town phase, it gives the Seleucids
ranged firepower that wood can't buy — at the price of permanent metal
spending that competes with the champion roster.

## Basic stats

- **Generic name:** Syrian Archer
- **Health:** 50 HP
- **Armor:** 1 hack / 1 pierce / 10 crush
- **Attack:** Capture — strength 2.5 — range 4 m — repeat 1 s — restricted Field Palisade Wall
- **Attack:** Ranged "Bow" — damage 7.92 pierce — range 60 m — prepare 0.8 s — repeat 1.25 s — preferred Human
- **Speed:** walk 10.3 m/s, run 17.2 m/s
- **Vision:** 80 m
- **Cost:** 60 metal
- **Build time:** 7 s
- **Population:** 1
- **Classes:** Unit Organic ConquestCritical Human CitizenSoldier
- **Visible classes:** Builder Citizen Worker Soldier Infantry Ranged Archer Mercenary
- **Rank:** Basic

## Ranks

### Advanced — `units/{civ}/infantry_archer_merc_a` (Syrian Archer)
Requires 100 XP.
- Health: ×1.25 → 62.5 HP
- Capture strength: +0.7 → 3.2
- Build time: ×1.2 → 8.4 s
- Gather base speed: ×0.7 → 0.7
- Loot: ×1.2
- Ranged spread: ×0.8

### Elite — `units/{civ}/infantry_archer_merc_e` (Syrian Archer)
Requires 100 XP.
- Health: ×1.25 (total ×1.56) → 78.13 HP
- Capture strength: +0.8 (total +1.5) → 4
- Build time: ×1.2 (total ×1.44) → 10.08 s
- Gather base speed: ×0.7 (total ×0.49) → 0.49
- Loot: ×1.2 (total ×1.44)
- Ranged spread: ×0.8 (total ×0.64)

- Note: mercenary variants promote at 0 XP (the auto-researched `upgrade_rank_advanced_mercenary` tech replaces RequiredXp with 0).

## Trained by

- **sele** — `units/sele/infantry_archer_merc_b` (military_colony)
