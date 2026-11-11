# elephant_archer_b

Mauryan-specific unit of 0 A.D. 0.28.0 — only the mauryas can train it. See `docs/game_description/maur/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/maur/elephant_archer_b` (full maur template chain).

## Guide

The Elephant Archer (Vachii Gaja) is the Mauryan citizen elephant line —
the civ's signature unit. A 200 HP, 4/3/15-armored elephant shooting 15
pierce from 60 m with a fast 1 s repeat: a mobile archer platform that
archers cannot kill quickly and that does not flee like cavalry. It costs
175 food + 75 wood, 2 population, and walks at infantry pace (9 m/s). It
is a citizen-soldier (Rank Basic, promotes at 150 XP) but — like all
elephants — **cannot gather**. Trained at the elephant stable from the
Town phase. With Chandragupta's "Elephant Corps" aura (+15% attack rate,
+10% speed) a mass of these becomes the Mauryan deathball: park a line
of elephant archers behind the spearmen and nothing melee survives the
approach.

## Basic stats

- **Generic name:** Elephant Archer
- **Health:** 200 HP
- **Armor:** 4 hack / 3 pierce / 15 crush
- **Attack:** Ranged "Bow" — damage 15 pierce — range 60 m — prepare 0.5 s — repeat 1 s — preferred Human
- **Speed:** walk 9 m/s, run 15.03 m/s
- **Vision:** 100 m
- **Cost:** 175 food, 75 wood
- **Build time:** 20 s
- **Population:** 2
- **Classes:** Unit Organic ConquestCritical Human CitizenSoldier
- **Visible classes:** Citizen Soldier Elephant Ranged Archer
- **Rank:** Basic

## Ranks

### Advanced — `units/{civ}/elephant_archer_a` (Elephant Archer)
Requires 150 XP.
- Health: ×1.25 → 250 HP
- Build time: ×1.2 → 24 s
- Gather base speed: ×0.7 → 0.7
- Loot: ×1.2
- Ranged spread: ×0.8

### Elite — `units/{civ}/elephant_archer_e`
Requires 150 XP.
- Health: ×1.25 (total ×1.56) → 312.5 HP
- Build time: ×1.2 (total ×1.44) → 28.8 s
- Gather base speed: ×0.7 (total ×0.49) → 0.49
- Loot: ×1.2 (total ×1.44)
- Ranged spread: ×0.8 (total ×0.64)

## Trained by

- **maur** — `units/maur/elephant_archer_b` (elephant_stable)

