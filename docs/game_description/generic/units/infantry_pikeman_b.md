# infantry_pikeman_b

Trained by **5** civilisations. Generic (non-civ-specific) unit of 0 A.D. 0.28.0 — see `docs/game_description/generic/units/README.md` for the method.

Generic stats resolved from the shared template `simulation/templates/template_unit_infantry_melee_pikeman` (deepest template common to all civilisation variants; variants may override, see below).

## Guide

The Pikeman is the frontline holder of the five civilisations that field it (han, kush, mace, ptol, sele — for mace and ptol it replaces the spearman as the basic melee infantry). Its edge over the spearman is durability and reach, not damage: 5 hack / 5 pierce armor (vs 3/3), an 8 m pike reach that lets massed pikemen fight from the second rank instead of needing the front row, at the price of being slow (walk ×0.9) and dealing damage at a low rate (11.5 damage per 2 s vs the spearman's 8.5 per 1 s). Use it to fix and hold a front line while ranged units deal the damage. It still carries the 2.5× attack bonus vs Cavalry and costs only food and wood, so it doubles as a cavalry deterrent. As a Citizen Soldier it can also gather and build when not fighting. It is trained at the barracks (also at the civil centre for mace and ptol).

## Basic stats

- **Generic name:** Pikeman
- **Health:** 100 HP
- **Armor:** 5 hack / 5 pierce / 15 crush
- **Attack:** Capture — strength 2.5 — range 4 m — repeat 1 s — restricted Field Palisade Wall
- **Attack:** Melee "Pike" — damage 4 hack + 7.5 pierce — range 8 m — prepare 1 s — repeat 2 s — bonus 2.5× vs Cavalry — preferred Human
- **Speed:** walk 8.55 m/s, run 14.28 m/s
- **Vision:** 80 m
- **Cost:** 50 food, 50 wood
- **Build time:** 10 s
- **Population:** 1
- **Gather:** rates: food: fruit 0.5, grain 0.25, meat 1; wood: tree 0.75, ruins 5; stone: rock 0.5, ruins 2; metal: ore 0.5, ruins 2 /s
- **Gather:** capacity: 10 food, 10 wood, 10 stone, 10 metal
- **Classes:** Unit Organic ConquestCritical Human CitizenSoldier
- **Visible classes:** Builder Citizen Worker Soldier Infantry Melee Pikeman
- **Rank:** Basic

## Civilisations that can train it

- **han** — `units/han/infantry_pikeman_b` (barracks)
- **kush** — `units/kush/infantry_pikeman_b` (barracks)
- **mace** — `units/mace/infantry_pikeman_b` (barracks, civil_centre)
- **ptol** — `units/ptol/infantry_pikeman_b` (barracks, civil_centre)
- **sele** — `units/sele/infantry_pikeman_b` (barracks)

## Ranks

### Advanced — `units/{civ}/infantry_pikeman_a`
Requires 100 XP.
- Health: ×1.25 → 125 HP
- Melee attack damage: ×1.1 → hack 4.4 + pierce 8.25
- Capture strength: +0.7 → 3.2
- Build time: ×1.2 → 12 s
- Gather base speed: ×0.7 → 0.7
- Loot: ×1.2

### Elite — `units/{civ}/infantry_pikeman_e`
Requires 100 XP.
- Health: ×1.25 (total ×1.56) → 156.25 HP
- Melee attack damage: ×1.1 (total ×1.21) → hack 4.84 + pierce 9.08
- Capture strength: +0.8 (total +1.5) → 4
- Build time: ×1.2 (total ×1.44) → 14.4 s
- Gather base speed: ×0.7 (total ×0.49) → 0.49
- Loot: ×1.2 (total ×1.44)



## Civilisation-specific overrides

These civilisations override the generic stats above (only differing values are listed):

- **han** — `units/han/infantry_pikeman_b`
  - armor 3 hack / 3 pierce / 15 crush
  - Capture — strength 2.5 — range 4 m — repeat 1 s — restricted Field Palisade Wall
  - Melee "Ji" — damage 10 hack + 3.5 pierce — range 8 m — prepare 1 s — repeat 2 s — bonus 2.5× vs Cavalry — preferred Human
