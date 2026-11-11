# cavalry_swordsman_b

Trained by **5** civilisations. Generic (non-civ-specific) unit of 0 A.D. 0.28.0 — see `docs/game_description/generic/units/README.md` for the method.

Generic stats resolved from the shared template `simulation/templates/template_unit_cavalry_melee_swordsman` (deepest template common to all civilisation variants; variants may override, see below).

## Guide

Fast melee cavalry trained at the stable (also at the civil centre for han) for 100 food, 40 wood, 10 metal — the metal cost is a scarce, premium resource, so it is not as easy to mass as food/wood-only units. Its high speed (run 25.2 m/s) makes it suited to raiding, hunting (meat 5 /s) and quickly reaching fights, while the capture attack (strength 1.75, restricted to Field Palisade Wall) lets it capture that field fortification class. Like other cavalry it relies on speed rather than armor (3 hack / 2 pierce) to survive; ranks multiply its health and damage at the cost of gather speed and build time.

## Basic stats

- **Generic name:** Cavalry Swordsman
- **Health:** 160 HP
- **Armor:** 3 hack / 2 pierce / 15 crush
- **Attack:** Capture — strength 1.75 — range 4 m — repeat 1 s — restricted Field Palisade Wall
- **Attack:** Melee "Sword" — damage 9 hack — range 4 m — prepare 0.375 s — repeat 0.75 s — preferred Unit+!Ship
- **Speed:** walk 18 m/s, run 25.2 m/s
- **Vision:** 80 m
- **Cost:** 100 food, 40 wood, 10 metal
- **Build time:** 15 s
- **Population:** 1
- **Gather:** rates: food: meat 5 /s
- **Gather:** capacity: 20 food
- **Classes:** Unit Organic ConquestCritical Human FastMoving CitizenSoldier
- **Visible classes:** Citizen Soldier Cavalry Melee Swordsman
- **Rank:** Basic

## Civilisations that can train it

- **athen** — `units/athen/cavalry_swordsman_b` (stable)
- **brit** — `units/brit/cavalry_swordsman_b` (stable)
- **gaul** — `units/gaul/cavalry_swordsman_b` (stable)
- **han** — `units/han/cavalry_swordsman_b` (civil_centre, stable)
- **maur** — `units/maur/cavalry_swordsman_b` (stable)

## Ranks

### Advanced — `units/{civ}/cavalry_swordsman_a`
Requires 150 XP.
- Health: ×1.25 → 200 HP
- Melee attack damage: ×1.1 → hack 9.9
- Capture strength: +0.7 → 2.45
- Build time: ×1.2 → 18 s
- Gather base speed: ×0.7 → 0.7
- Loot: ×1.2

### Elite — `units/{civ}/cavalry_swordsman_e`
Requires 150 XP.
- Health: ×1.25 (total ×1.56) → 250 HP
- Melee attack damage: ×1.1 (total ×1.21) → hack 10.89
- Capture strength: +0.8 (total +1.5) → 3.25
- Build time: ×1.2 (total ×1.44) → 21.6 s
- Gather base speed: ×0.7 (total ×0.49) → 0.49
- Loot: ×1.2 (total ×1.44)


