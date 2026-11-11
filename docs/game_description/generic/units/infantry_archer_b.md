# infantry_archer_b

Trained by **8** civilisations. Generic (non-civ-specific) unit of 0 A.D. 0.28.0 — see `docs/game_description/generic/units/README.md` for the method.

Generic stats resolved from the shared template `simulation/templates/template_unit_infantry_ranged_archer` (deepest template common to all civilisation variants; variants may override, see below).

## Guide

The archer is the basic ranged infantry unit, trained at the barracks (and at the civil centre for cart, kush, maur and pers) for 50 food and 50 wood. Among the three ranged infantry types it is the long-range, low-damage option: the bow reaches 60 m with 7.2 pierce damage, where the slinger trades down to 45 m for 11.5 damage and the javelineer to 30 m for 16. It is also the slowest of the three on foot (walk 10.3 m/s), so it is the worst at gathering and harassing but the best at static fire support, with a preference for Human targets. It costs only food and wood — the abundant resources — so it is easy to mass, but it is fragile (50 HP, 1 hack / 1 pierce armor) and must be kept behind melee units. As a CitizenSoldier it can also gather resources (wood at 0.75/s, food from meat at 1/s) when not fighting, so idle archers can contribute to the economy. Its crush armor of 10 gives it some resilience against ranged attacks, but it has no answer to cavalry reaching it.

## Basic stats

- **Generic name:** Archer
- **Health:** 50 HP
- **Armor:** 1 hack / 1 pierce / 10 crush
- **Attack:** Capture — strength 2.5 — range 4 m — repeat 1 s — restricted Field Palisade Wall
- **Attack:** Ranged "Bow" — damage 7.2 pierce — range 60 m — prepare 0.8 s — repeat 1.25 s — preferred Human
- **Speed:** walk 10.3 m/s, run 17.2 m/s
- **Vision:** 80 m
- **Cost:** 50 food, 50 wood
- **Build time:** 10 s
- **Population:** 1
- **Gather:** rates: food: fruit 0.5, grain 0.25, meat 1; wood: tree 0.75, ruins 5; stone: rock 0.5, ruins 2; metal: ore 0.5, ruins 2 /s
- **Gather:** capacity: 10 food, 10 wood, 10 stone, 10 metal
- **Classes:** Unit Organic ConquestCritical Human CitizenSoldier
- **Visible classes:** Builder Citizen Worker Soldier Infantry Ranged Archer
- **Rank:** Basic

## Civilisations that can train it

- **athen** — `units/athen/infantry_archer_b` (barracks)
- **cart** — `units/cart/infantry_archer_b` (barracks, civil_centre)
- **han** — `units/han/infantry_archer_b` (barracks)
- **kush** — `units/kush/infantry_archer_b` (barracks, civil_centre)
- **mace** — `units/mace/infantry_archer_b` (barracks)
- **maur** — `units/maur/infantry_archer_b` (barracks, civil_centre)
- **pers** — `units/pers/infantry_archer_b` (barracks, civil_centre)
- **ptol** — `units/ptol/infantry_archer_b` (barracks)

## Ranks

### Advanced — `units/{civ}/infantry_archer_a`
Requires 100 XP.
- Health: ×1.25 → 62.5 HP
- Capture strength: +0.7 → 3.2
- Build time: ×1.2 → 12 s
- Gather base speed: ×0.7 → 0.7
- Loot: ×1.2
- Ranged spread: ×0.8

### Elite — `units/{civ}/infantry_archer_e`
Requires 100 XP.
- Health: ×1.25 (total ×1.56) → 78.13 HP
- Capture strength: +0.8 (total +1.5) → 4
- Build time: ×1.2 (total ×1.44) → 14.4 s
- Gather base speed: ×0.7 (total ×0.49) → 0.49
- Loot: ×1.2 (total ×1.44)
- Ranged spread: ×0.8 (total ×0.64)

- Note: mercenary variants promote at 0 XP (the auto-researched `upgrade_rank_advanced_mercenary` tech replaces RequiredXp with 0).


## Civilisation-specific overrides

These civilisations override the generic stats above (only differing values are listed):

- **athen** — `units/athen/infantry_archer_b`
  - Capture — strength 2.5 — range 4 m — repeat 1 s — restricted Field Palisade Wall
  - Ranged "Bow" — damage 7.92 pierce — range 60 m — prepare 0.8 s — repeat 1.25 s — preferred Human
  - cost 60 metal
  - build time 7 s
- **mace** — `units/mace/infantry_archer_b`
  - Capture — strength 2.5 — range 4 m — repeat 1 s — restricted Field Palisade Wall
  - Ranged "Bow" — damage 7.92 pierce — range 60 m — prepare 0.8 s — repeat 1.25 s — preferred Human
  - cost 60 metal
  - build time 7 s
- **ptol** — `units/ptol/infantry_archer_b`
  - Capture — strength 2.5 — range 4 m — repeat 1 s — restricted Field Palisade Wall
  - Ranged "Bow" — damage 7.92 pierce — range 60 m — prepare 0.8 s — repeat 1.25 s — preferred Human
  - cost 60 metal
  - build time 7 s
