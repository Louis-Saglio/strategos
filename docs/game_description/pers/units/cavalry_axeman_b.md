# cavalry_axeman_b

Persian-specific unit of 0 A.D. 0.28.0 — only the persians can train it. See `docs/game_description/pers/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/pers/cavalry_axeman_b` (full pers template chain).

## Guide

The Hyrcanian Cavalry is the Persian citizen melee cavalry — the roster's
only axe unit and its cheapest cavalry (100 food + 40 wood + 10 metal, 15
s). It is fast (walk 18 m/s, the cavalry pace) and its axe does 10 hack +
3.5 crush, which hurts both units and structures (the crush component
gives it mild anti-building value, unlike the spearman and javelineer
cavalry). Uniquely among Persian units it is trained at **both** the civil
centre and the stable (Town phase), so it is the natural early raiding and
worker-harassment force, and as a citizen soldier it still gathers meat
(5/s). It promotes at 150 XP. The "Equine Transports" tech adds a
sea-borne twin (`cavalry_axeman_b_trireme`) trained from the Persian
warships, with identical stats.

## Basic stats

- **Generic name:** Hyrcanian Cavalry
- **Health:** 160 HP
- **Armor:** 3 hack / 2 pierce / 15 crush
- **Attack:** Capture — strength 1.75 — range 4 m — repeat 1 s — restricted Field Palisade Wall
- **Attack:** Melee "Axe" — damage 10 hack + 3.5 crush — range 4 m — prepare 0.5 s — repeat 1 s — preferred Unit+!Ship
- **Speed:** walk 18 m/s, run 25.2 m/s
- **Vision:** 80 m
- **Cost:** 100 food, 40 wood, 10 metal
- **Build time:** 15 s
- **Population:** 1
- **Gather:** rates: food: meat 5 /s
- **Gather:** capacity: 20 food
- **Classes:** Unit Organic ConquestCritical Human FastMoving CitizenSoldier
- **Visible classes:** Citizen Soldier Cavalry Melee Axeman
- **Rank:** Basic

## Ranks

### Advanced — `units/{civ}/cavalry_axeman_a` (Hyrcanian Cavalry)
Requires 150 XP.
- Health: ×1.25 → 200 HP
- Melee attack damage: ×1.1 → hack 11 + crush 3.85
- Capture strength: +0.7 → 2.45
- Build time: ×1.2 → 18 s
- Gather base speed: ×0.7 → 0.7
- Loot: ×1.2

### Elite — `units/{civ}/cavalry_axeman_e`
Requires 150 XP.
- Health: ×1.25 (total ×1.56) → 250 HP
- Melee attack damage: ×1.1 (total ×1.21) → hack 12.1 + crush 4.23
- Capture strength: +0.8 (total +1.5) → 3.25
- Build time: ×1.2 (total ×1.44) → 21.6 s
- Gather base speed: ×0.7 (total ×0.49) → 0.49
- Loot: ×1.2 (total ×1.44)

## Trained by

- **pers** — `units/pers/cavalry_axeman_b` (civil_centre, stable)

