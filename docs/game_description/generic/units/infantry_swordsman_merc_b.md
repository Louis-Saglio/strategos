# infantry_swordsman_merc_b

Trained by **2** civilisations. Generic (non-civ-specific) unit of 0 A.D. 0.28.0 — see `docs/game_description/generic/units/README.md` for the method.

Generic stats resolved from the shared template `simulation/templates/template_unit_infantry_melee_swordsman` (deepest template common to all civilisation variants; variants may override, see below).

## Guide

A mercenary melee swordsman trained at the **military_colony** (Ptolemies and Seleucids only). Both variants pay **60 metal** — the mercenary mixin zeroes the food, wood and stone components — and build in only **7 s**, making it a fast-to-field frontline fighter when metal is available — metal is a scarce, premium resource, so spamming it is expensive so it suits emergency or supplementary recruitment rather than a main-line army. Its melee attack (8.8 hack, preferred Unit+!Ship) is a general-purpose anti-unit weapon with no class bonus. Like all mercenaries it **cannot gather** (the mercenary mixin disables ResourceGatherer), though it keeps the Builder class. Mercenaries auto-promote at 0 XP via `upgrade_rank_advanced_mercenary`, so survivors reach Advanced/Elite rank (up to ~156 HP) without needing to earn experience in combat.

## Basic stats

- **Generic name:** Swordsman
- **Health:** 100 HP
- **Armor:** 3 hack / 3 pierce / 15 crush
- **Attack:** Capture — strength 2.5 — range 4 m — repeat 1 s — restricted Field Palisade Wall
- **Attack:** Melee "Sword" — damage 8 hack — range 3 m — prepare 0.375 s — repeat 0.75 s — preferred Unit+!Ship
- **Speed:** walk 9.5 m/s, run 15.86 m/s
- **Vision:** 80 m
- **Cost:** 50 food, 40 wood, 10 metal
- **Build time:** 10 s
- **Population:** 1
- **Gather:** rates: food: fruit 0.5, grain 0.25, meat 1; wood: tree 0.75, ruins 5; stone: rock 0.5, ruins 2; metal: ore 0.5, ruins 2 /s
- **Gather:** capacity: 10 food, 10 wood, 10 stone, 10 metal
- **Classes:** Unit Organic ConquestCritical Human CitizenSoldier
- **Visible classes:** Builder Citizen Worker Soldier Infantry Melee Swordsman
- **Rank:** Basic

## Civilisations that can train it

- **ptol** — `units/ptol/infantry_swordsman_merc_b` (military_colony)
- **sele** — `units/sele/infantry_swordsman_merc_b` (military_colony)

## Ranks

### Advanced — `units/{civ}/infantry_swordsman_merc_a`
Requires 100 XP.
- Health: ×1.25 → 125 HP
- Melee attack damage: ×1.1 → hack 8.8
- Capture strength: +0.7 → 3.2
- Build time: ×1.2 → 12 s
- Gather base speed: ×0.7 → 0.7
- Loot: ×1.2

### Elite — `units/{civ}/infantry_swordsman_merc_e`
Requires 100 XP.
- Health: ×1.25 (total ×1.56) → 156.25 HP
- Melee attack damage: ×1.1 (total ×1.21) → hack 9.68
- Capture strength: +0.8 (total +1.5) → 4
- Build time: ×1.2 (total ×1.44) → 14.4 s
- Gather base speed: ×0.7 (total ×0.49) → 0.49
- Loot: ×1.2 (total ×1.44)

- Note: mercenary variants promote at 0 XP (the auto-researched `upgrade_rank_advanced_mercenary` tech replaces RequiredXp with 0).


## Civilisation-specific overrides

These civilisations override the generic stats above (only differing values are listed):

- **ptol** — `units/ptol/infantry_swordsman_merc_b`
  - Capture — strength 2.5 — range 4 m — repeat 1 s — restricted Field Palisade Wall
  - Melee "Sword" — damage 8.8 hack — range 3 m — prepare 0.375 s — repeat 0.75 s — preferred Unit+!Ship
  - cost 60 metal
  - build time 7 s
  - no gathering (ResourceGatherer disabled)
- **sele** — `units/sele/infantry_swordsman_merc_b`
  - Capture — strength 2.5 — range 4 m — repeat 1 s — restricted Field Palisade Wall
  - Melee "Rhomphaia" — damage 8.8 hack — range 3 m — prepare 0.375 s — repeat 0.75 s — preferred Unit+!Ship
  - cost 60 metal
  - build time 7 s
  - no gathering (ResourceGatherer disabled)
