# infantry_javelineer_b

Trained by **11** civilisations. Generic (non-civ-specific) unit of 0 A.D. 0.28.0 — see `docs/game_description/generic/units/README.md` for the method.

Generic stats resolved from the shared template `simulation/templates/template_unit_infantry_ranged_javelineer` (deepest template common to all civilisation variants; variants may override, see below).

## Guide

The Infantry Javelineer is the short-range, high-damage option among the three ranged infantry types: 16 pierce damage at only 30 m, where the slinger deals 11.5 at 45 m and the archer 7.2 at 60 m — so it must get close, but hits hardest. It is also the fastest on foot of the three (walk 11.4 m/s vs 10.8 slinger, 10.3 archer), which makes it the most efficient at gathering resources (less time walking) and the best at harassing the enemy with hit-and-run attacks. Its cost is only food and wood — the abundant resources — so it is easy to mass (50 food + 50 wood, 10 s, trained at the barracks and at the civil centre for several civilisations, including gaul and rome). With only 50 HP and 1 hack / 1 pierce armor it is fragile and must be kept out of melee; as a CitizenSoldier it also gathers resources between fights. Note that some civilisations (athen, ptol) shift its cost to metal, a scarce resource, which makes it much harder to mass there.

## Basic stats

- **Generic name:** Infantry Javelineer
- **Health:** 50 HP
- **Armor:** 1 hack / 1 pierce / 10 crush
- **Attack:** Capture — strength 2.5 — range 4 m — repeat 1 s — restricted Field Palisade Wall
- **Attack:** Ranged "Javelin" — damage 16 pierce — range 30 m — prepare 0.4 s — repeat 1.5 s — preferred Human
- **Speed:** walk 11.4 m/s, run 19.04 m/s
- **Vision:** 80 m
- **Cost:** 50 food, 50 wood
- **Build time:** 10 s
- **Population:** 1
- **Gather:** rates: food: fruit 0.5, grain 0.25, meat 1; wood: tree 0.75, ruins 5; stone: rock 0.5, ruins 2; metal: ore 0.5, ruins 2 /s
- **Gather:** capacity: 10 food, 10 wood, 10 stone, 10 metal
- **Classes:** Unit Organic ConquestCritical Human CitizenSoldier
- **Visible classes:** Builder Citizen Worker Soldier Infantry Ranged Javelineer
- **Rank:** Basic

## Civilisations that can train it

- **athen** — `units/athen/infantry_javelineer_b` (barracks)
- **brit** — `units/brit/infantry_javelineer_b` (barracks)
- **gaul** — `units/gaul/infantry_javelineer_b` (barracks, civil_centre)
- **germ** — `units/germ/infantry_javelineer_b` (barracks)
- **iber** — `units/iber/infantry_javelineer_b` (barracks, civil_centre)
- **mace** — `units/mace/infantry_javelineer_b` (barracks, civil_centre)
- **pers** — `units/pers/infantry_javelineer_b` (barracks)
- **ptol** — `units/ptol/infantry_javelineer_b` (barracks)
- **rome** — `units/rome/infantry_javelineer_b` (barracks, civil_centre)
- **sele** — `units/sele/infantry_javelineer_b` (barracks, civil_centre)
- **spart** — `units/spart/infantry_javelineer_b` (barracks, civil_centre)

## Ranks

### Advanced — `units/{civ}/infantry_javelineer_a`
Requires 100 XP.
- Health: ×1.25 → 62.5 HP
- Capture strength: +0.7 → 3.2
- Build time: ×1.2 → 12 s
- Gather base speed: ×0.7 → 0.7
- Loot: ×1.2
- Ranged spread: ×0.8

### Elite — `units/{civ}/infantry_javelineer_e`
Requires 100 XP.
- Health: ×1.25 (total ×1.56) → 78.13 HP
- Capture strength: +0.8 (total +1.5) → 4
- Build time: ×1.2 (total ×1.44) → 14.4 s
- Gather base speed: ×0.7 (total ×0.49) → 0.49
- Loot: ×1.2 (total ×1.44)
- Ranged spread: ×0.8 (total ×0.64)

- Note: **rome** (Elite rank promotes further to `units/{civ}/infantry_antesignanus` at 2000 XP).
- Note: mercenary variants promote at 0 XP (the auto-researched `upgrade_rank_advanced_mercenary` tech replaces RequiredXp with 0).


## Civilisation-specific overrides

These civilisations override the generic stats above (only differing values are listed):

- **athen** — `units/athen/infantry_javelineer_b`
  - Capture — strength 2.5 — range 4 m — repeat 1 s — restricted Field Palisade Wall
  - Ranged "Javelin" — damage 17.6 pierce — range 30 m — prepare 0.4 s — repeat 1.5 s — preferred Human
  - cost 60 metal
  - build time 7 s
- **ptol** — `units/ptol/infantry_javelineer_b`
  - Capture — strength 2.5 — range 4 m — repeat 1 s — restricted Field Palisade Wall
  - Ranged "Javelin" — damage 17.6 pierce — range 30 m — prepare 0.4 s — repeat 1.5 s — preferred Human
  - cost 60 metal
  - build time 7 s
