# infantry_spearman_b

Trained by **13** civilisations. Generic (non-civ-specific) unit of 0 A.D. 0.28.0 — see `docs/game_description/generic/units/README.md` for the method.

Generic stats resolved from the shared template `simulation/templates/template_unit_infantry_melee_spearman` (deepest template common to all civilisation variants; variants may override, see below).

## Guide

The Spearman is the basic melee infantry of most civilisations: 13 of 15 train it (all but mace and ptol, which field pikemen instead), usually at both the civil centre and the barracks, whereas the other melee infantry types are restricted to a few civilisations each (swordsman 5, pikeman 5). Its spear carries a 2.5× attack bonus vs Cavalry, and its cost is only food and wood — the abundant resources — so it is easy to mass (50 food, 50 wood, 10 s). As a CitizenSoldier it doubles as an economic unit, gathering food, wood, stone and metal between fights. Its low hack/pierce damage and 100 HP make it a poor general-purpose fighter, so train it as a cavalry counter and mobile worker rather than as a frontline against other infantry. It also carries a small Capture attack (strength 2.5) and ranks up to Advanced and Elite with XP.

## Basic stats

- **Generic name:** Spearman
- **Health:** 100 HP
- **Armor:** 3 hack / 3 pierce / 15 crush
- **Attack:** Capture — strength 2.5 — range 4 m — repeat 1 s — restricted Field Palisade Wall
- **Attack:** Melee "Spear" — damage 4.5 hack + 4 pierce — range 4 m — prepare 0.5 s — repeat 1 s — bonus 2.5× vs Cavalry — preferred Unit+!Ship
- **Speed:** walk 9.5 m/s, run 15.86 m/s
- **Vision:** 80 m
- **Cost:** 50 food, 50 wood
- **Build time:** 10 s
- **Population:** 1
- **Gather:** rates: food: fruit 0.5, grain 0.25, meat 1; wood: tree 0.75, ruins 5; stone: rock 0.5, ruins 2; metal: ore 0.5, ruins 2 /s
- **Gather:** capacity: 10 food, 10 wood, 10 stone, 10 metal
- **Classes:** Unit Organic ConquestCritical Human CitizenSoldier
- **Visible classes:** Builder Citizen Worker Soldier Infantry Melee Spearman
- **Rank:** Basic

## Civilisations that can train it

- **athen** — `units/athen/infantry_spearman_b` (barracks, civil_centre)
- **brit** — `units/brit/infantry_spearman_b` (barracks, civil_centre, crannog)
- **cart** — `units/cart/infantry_spearman_b` (barracks, civil_centre)
- **gaul** — `units/gaul/infantry_spearman_b` (barracks, civil_centre)
- **germ** — `units/germ/infantry_spearman_b` (barracks, civil_centre, encampment)
- **han** — `units/han/infantry_spearman_b` (barracks, civil_centre)
- **iber** — `units/iber/infantry_spearman_b` (barracks)
- **kush** — `units/kush/infantry_spearman_b` (barracks, civil_centre)
- **maur** — `units/maur/infantry_spearman_b` (barracks, civil_centre)
- **pers** — `units/pers/infantry_spearman_b` (barracks, civil_centre)
- **rome** — `units/rome/infantry_spearman_b` (barracks)
- **sele** — `units/sele/infantry_spearman_b` (barracks, civil_centre)
- **spart** — `units/spart/infantry_spearman_b` (barracks, civil_centre)

## Ranks

### Advanced — `units/{civ}/infantry_spearman_a`
Requires 100 XP.
- Health: ×1.25 → 125 HP
- Melee attack damage: ×1.1 → hack 4.95 + pierce 4.4
- Capture strength: +0.7 → 3.2
- Build time: ×1.2 → 12 s
- Gather base speed: ×0.7 → 0.7
- Loot: ×1.2

### Elite — `units/{civ}/infantry_spearman_e`
Requires 100 XP.
- Health: ×1.25 (total ×1.56) → 156.25 HP
- Melee attack damage: ×1.1 (total ×1.21) → hack 5.45 + pierce 4.84
- Capture strength: +0.8 (total +1.5) → 4
- Build time: ×1.2 (total ×1.44) → 14.4 s
- Gather base speed: ×0.7 (total ×0.49) → 0.49
- Loot: ×1.2 (total ×1.44)

- Note: **athen** (Elite rank promotes further to `units/{civ}/champion_infantry` at 250 XP); **rome** (Elite rank promotes further to `units/{civ}/infantry_spearman_conscript` at 2000 XP).

