# cavalry_spearman_b

Trained by **8** civilisations. Generic (non-civ-specific) unit of 0 A.D. 0.28.0 — see `docs/game_description/generic/units/README.md` for the method.

Generic stats resolved from the shared template `simulation/templates/template_unit_cavalry_melee_spearman` (deepest template common to all civilisation variants; variants may override, see below).

## Guide

The Cavalry Spearman is a fast CitizenSoldier whose main purpose is hunting and fighting enemy cavalry: it moves at 25.2 m/s run speed and carries a 1.75× melee attack bonus against the Cavalry class. At 100 food / 50 wood and 15 s build time, it is a cheap, quick-to-field unit trainable at the stable (and at the civil centre for mace, pers and rome). Its ability to gather meat at 5/s also makes it useful for food income from hunted animals, and it contributes a capture attack against non-palisade structures, so it doubles as a mobile raider.

## Basic stats

- **Generic name:** Cavalry Spearman
- **Health:** 160 HP
- **Armor:** 3 hack / 3 pierce / 15 crush
- **Attack:** Capture — strength 1.75 — range 4 m — repeat 1 s — restricted Field Palisade Wall
- **Attack:** Melee "Spear" — damage 6 hack + 5.5 pierce — range 4 m — prepare 0.625 s — repeat 1.25 s — bonus 1.75× vs Cavalry — preferred Unit+!Ship
- **Speed:** walk 18 m/s, run 25.2 m/s
- **Vision:** 80 m
- **Cost:** 100 food, 50 wood
- **Build time:** 15 s
- **Population:** 1
- **Gather:** rates: food: meat 5 /s
- **Gather:** capacity: 20 food
- **Classes:** Unit Organic ConquestCritical Human FastMoving CitizenSoldier
- **Visible classes:** Citizen Soldier Cavalry Melee Spearman
- **Rank:** Basic

## Civilisations that can train it

- **germ** — `units/germ/cavalry_spearman_b` (stable)
- **han** — `units/han/cavalry_spearman_b` (stable)
- **iber** — `units/iber/cavalry_spearman_b` (stable)
- **kush** — `units/kush/cavalry_spearman_b` (stable)
- **mace** — `units/mace/cavalry_spearman_b` (civil_centre, stable)
- **pers** — `units/pers/cavalry_spearman_b` (civil_centre, stable)
- **rome** — `units/rome/cavalry_spearman_b` (civil_centre, stable)
- **spart** — `units/spart/cavalry_spearman_b` (stable)

## Ranks

### Advanced — `units/{civ}/cavalry_spearman_a`
Requires 150 XP.
- Health: ×1.25 → 200 HP
- Melee attack damage: ×1.1 → hack 6.6 + pierce 6.05
- Capture strength: +0.7 → 2.45
- Build time: ×1.2 → 18 s
- Gather base speed: ×0.7 → 0.7
- Loot: ×1.2

### Elite — `units/{civ}/cavalry_spearman_e`
Requires 150 XP.
- Health: ×1.25 (total ×1.56) → 250 HP
- Melee attack damage: ×1.1 (total ×1.21) → hack 7.26 + pierce 6.66
- Capture strength: +0.8 (total +1.5) → 3.25
- Build time: ×1.2 (total ×1.44) → 21.6 s
- Gather base speed: ×0.7 (total ×0.49) → 0.49
- Loot: ×1.2 (total ×1.44)

- Note: **rome** (Elite rank promotes further to `units/{civ}/cavalry_spearman_auxiliary_b` at 2000 XP).

