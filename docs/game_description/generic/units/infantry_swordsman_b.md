# infantry_swordsman_b

Trained by **5** civilisations. Generic (non-civ-specific) unit of 0 A.D. 0.28.0 — see `docs/game_description/generic/units/README.md` for the method.

Generic stats resolved from the shared template `simulation/templates/template_unit_infantry_melee_swordsman` (deepest template common to all civilisation variants; variants may override, see below).

## Guide

The Swordsman is a basic citizen-soldier melee unit: an affordable front-line fighter (50 food, 40 wood, 10 metal — the metal, a scarce resource, makes it a small premium investment, though the food/wood base keeps it easy to mass — 10 s to train) that can also gather resources and build thanks to its CitizenSoldier/Builder/Worker classes. Its 8 hack melee attack and Capture strength 2.5 make it suitable both for fighting enemy units and for capturing enemy buildings, and it is trained at the barracks (also at the civil centre for iber and rome). No attack bonuses against specific classes — it is a general-purpose infantry unit rather than a specialist counter.

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

- **germ** — `units/germ/infantry_swordsman_b` (barracks)
- **iber** — `units/iber/infantry_swordsman_b` (barracks, civil_centre)
- **kush** — `units/kush/infantry_swordsman_b` (barracks)
- **maur** — `units/maur/infantry_swordsman_b` (barracks)
- **rome** — `units/rome/infantry_swordsman_b` (barracks, civil_centre)

## Ranks

### Advanced — `units/{civ}/infantry_swordsman_a`
Requires 100 XP.
- Health: ×1.25 → 125 HP
- Melee attack damage: ×1.1 → hack 8.8
- Capture strength: +0.7 → 3.2
- Build time: ×1.2 → 12 s
- Gather base speed: ×0.7 → 0.7
- Loot: ×1.2

### Elite — `units/{civ}/infantry_swordsman_e`
Requires 100 XP.
- Health: ×1.25 (total ×1.56) → 156.25 HP
- Melee attack damage: ×1.1 (total ×1.21) → hack 9.68
- Capture strength: +0.8 (total +1.5) → 4
- Build time: ×1.2 (total ×1.44) → 14.4 s
- Gather base speed: ×0.7 (total ×0.49) → 0.49
- Loot: ×1.2 (total ×1.44)

- Note: **rome** (Elite rank promotes further to `units/{civ}/infantry_legionary` at 2000 XP).

