# infantry_crossbowman_b

Han-specific unit of 0 A.D. 0.28.0 — only the han can train it. See `docs/game_description/han/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/han/infantry_crossbowman_b` (full han template chain).

## Guide

The Infantry Crossbowman (Nǔ Shǒu) is han's basic ranged citizen soldier: two come with the start, and it is trained at the barracks, the civil centre and the Imperial Court from the Village phase for only 50 food and 50 wood (10 s), so it is the abundant-resource unit to mass. It deals 24 pierce per 3 s (8 pierce/s) at 45 m with spread 3, out-damaging the generic archer (7.2 pierce per 1.25 s, 5.76/s) but reaching 15 m less. With 50 HP and 1/1/10 armor it is fragile and must stand behind spearmen or Halberdiers. As a CitizenSoldier it gathers and builds at the standard citizen-soldier rates, so idle crossbowmen can feed the economy. `crossbow_training` (barracks, Town, 400 food + 400 wood) cuts its training time by 20%, and `poison_arrows` and the forge techs raise its damage.

## Basic stats

- **Generic name:** Infantry Crossbowman
- **Specific name:** Nǔ Shǒu
- **Health:** 50 HP
- **Armor:** 1 hack / 1 pierce / 10 crush
- **Attack:** Capture — strength 2.5 — range 4 m — repeat 1 s — restricted Field Palisade Wall
- **Attack:** Ranged "Crossbow" — damage 24 pierce — range 45 m — prepare 0.6 s — repeat 3 s — spread 3 — preferred Human
- **Speed:** walk 10 m/s, run 16.7 m/s
- **Vision:** 80 m
- **Cost:** 50 food, 50 wood
- **Build time:** 10 s
- **Population:** 1
- **Gather:** rates: food: fruit 0.5, grain 0.25, meat 1; wood: tree 0.75, ruins 5; stone: rock 0.5, ruins 2; metal: ore 0.5, ruins 2 /s
- **Gather:** capacity: 10 food, 10 wood, 10 stone, 10 metal
- **Builds:** civil_centre house storehouse farmstead field corral dock barracks stable forge temple market ministry outpost sentry_tower defense_tower arsenal academy fortress wallset_palisade wallset_stone wonder
- **Auras:** units/ram_garrison
- **Loot:** 5 food, 5 wood, 100 xp
- **Classes:** Unit Organic ConquestCritical Human CitizenSoldier
- **Visible classes:** Builder Citizen Worker Soldier Infantry Ranged Crossbowman
- **Rank:** Basic

## Ranks

### Advanced — `units/{civ}/infantry_crossbowman_a`
Requires 100 XP.
- Health: ×1.25 → 62.5 HP
- Capture strength: +0.7 → 3.2
- Build time: ×1.2 → 12 s
- Gather base speed: ×0.7 → 0.7
- Loot: ×1.2
- Ranged spread: ×0.8

### Elite — `units/{civ}/infantry_crossbowman_e`
Requires 100 XP.
- Health: ×1.25 (total ×1.56) → 78.13 HP
- Capture strength: +0.8 (total +1.5) → 4
- Build time: ×1.2 (total ×1.44) → 14.4 s
- Gather base speed: ×0.7 (total ×0.49) → 0.49
- Loot: ×1.2 (total ×1.44)
- Ranged spread: ×0.8 (total ×0.64)

## Trained by

- **han** — `units/han/infantry_crossbowman_b` (barracks, civil_centre, civil_centre_court, range (only when pre-placed on a skirmish map))
