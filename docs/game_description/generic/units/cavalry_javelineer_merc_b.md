# cavalry_javelineer_merc_b

Trained by **2** civilisations. Generic (non-civ-specific) unit of 0 A.D. 0.28.0 — see `docs/game_description/generic/units/README.md` for the method.

Generic stats resolved from the shared template `simulation/templates/template_unit_cavalry_ranged_javelineer` (deepest template common to all civilisation variants; variants may override, see below).

## Guide

A fast ranged skirmisher-mercenary for kush and ptol, trained from their mercenary structures (camp_blemmye, military_colony). Its very high speed (run 22.68 m/s) and 30 m javelin range with "preferred Human" make it suited to mobile harassment and hit-and-run against infantry. Both civilisation variants cost metal instead of wood/food (20 food, 90 metal), and since metal is scarce this is a premium investment that is hard to mass. It promotes at 0 XP, so it pays off as a standing raiding force that improves on its own, but its low armor (2 hack / 1 pierce) means it should avoid sustained melee. Like all mercenaries it **cannot gather** (the mercenary mixin disables ResourceGatherer).

## Basic stats

- **Generic name:** Cavalry Javelineer
- **Health:** 100 HP
- **Armor:** 2 hack / 1 pierce / 15 crush
- **Attack:** Capture — strength 1.75 — range 4 m — repeat 1 s — restricted Field Palisade Wall
- **Attack:** Ranged "Javelin" — damage 18 pierce — range 30 m — prepare 0.4 s — repeat 1.5 s — preferred Human
- **Speed:** walk 16.2 m/s, run 22.68 m/s
- **Vision:** 80 m
- **Cost:** 100 food, 50 wood
- **Build time:** 15 s
- **Population:** 1
- **Gather:** rates: food: meat 5 /s
- **Gather:** capacity: 20 food
- **Classes:** Unit Organic ConquestCritical Human FastMoving CitizenSoldier
- **Visible classes:** Citizen Soldier Cavalry Ranged Javelineer
- **Rank:** Basic

## Civilisations that can train it

- **kush** — `units/kush/cavalry_javelineer_merc_b` (camp_blemmye)
- **ptol** — `units/ptol/cavalry_javelineer_merc_b` (military_colony)

## Ranks

### Advanced — `units/{civ}/cavalry_javelineer_merc_a`
Requires 300 XP.
- Health: ×1.25 → 125 HP
- Capture strength: +0.7 → 2.45
- Build time: ×1.2 → 18 s
- Gather base speed: ×0.7 → 0.7
- Loot: ×1.2
- Ranged spread: ×0.8

### Elite — `units/{civ}/cavalry_javelineer_merc_e`
Requires 300 XP.
- Health: ×1.25 (total ×1.56) → 156.25 HP
- Capture strength: +0.8 (total +1.5) → 3.25
- Build time: ×1.2 (total ×1.44) → 21.6 s
- Gather base speed: ×0.7 (total ×0.49) → 0.49
- Loot: ×1.2 (total ×1.44)
- Ranged spread: ×0.8 (total ×0.64)

- Note: mercenary variants promote at 0 XP (the auto-researched `upgrade_rank_advanced_mercenary` tech replaces RequiredXp with 0).


## Civilisation-specific overrides

These civilisations override the generic stats above (only differing values are listed):

- **kush** — `units/kush/cavalry_javelineer_merc_b`
  - Capture — strength 1.75 — range 4 m — repeat 1 s — restricted Field Palisade Wall
  - Ranged "Javelin" — damage 19.8 pierce — range 30 m — prepare 0.4 s — repeat 1.5 s — preferred Human
  - cost 20 food, 90 metal
  - build time 10.5 s
  - no gathering (ResourceGatherer disabled)
- **ptol** — `units/ptol/cavalry_javelineer_merc_b`
  - Capture — strength 1.75 — range 4 m — repeat 1 s — restricted Field Palisade Wall
  - Ranged "Javelin" — damage 19.8 pierce — range 30 m — prepare 0.4 s — repeat 1.5 s — preferred Human
  - cost 20 food, 90 metal
  - build time 10.5 s
  - no gathering (ResourceGatherer disabled)
