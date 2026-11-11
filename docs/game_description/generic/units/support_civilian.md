# support_civilian

Trained by **15** civilisations. Generic (non-civ-specific) unit of 0 A.D. 0.28.0 — see `docs/game_description/generic/units/README.md` for the method.

Generic stats resolved from the shared template `simulation/templates/template_unit_support_civilian` (deepest template common to all civilisation variants; variants may override, see below).

## Guide

The Civilian is the basic all-purpose worker: at 50 food and 8 s build time it costs only food, an abundant resource, so it is easy to mass and the cheapest way to expand an economy, and it is trained at the civil_centre (plus a few civ-specific extra buildings such as the brit crannog, germ encampment and sele military_colony). It gathers every resource type (best at fruit/meat at 1/s, weakest at stone/metal at 0.35/s) and, as a `Builder`, constructs and repairs buildings. Its Dagger (2 hack) and 25 HP make it useless in combat — keep it away from fights — but it can capture (strength 1, excluding Field/Palisade/Wall targets).

## Basic stats

- **Generic name:** Civilian
- **Health:** 25 HP
- **Armor:** 1 hack / 1 pierce / 1 crush
- **Attack:** Capture — strength 1 — range 4 m — repeat 1 s — restricted Field Palisade Wall
- **Attack:** Melee "Dagger" — damage 2 hack — range 3 m — prepare 0.5 s — repeat 1 s
- **Speed:** walk 9 m/s, run 15.03 m/s
- **Vision:** 32 m
- **Cost:** 50 food
- **Build time:** 8 s
- **Population:** 1
- **Gather:** rates: food: fruit 1, grain 0.5, meat 1; wood: tree 0.7, ruins 5; stone: rock 0.35, ruins 2; metal: ore 0.35, ruins 2 /s
- **Gather:** capacity: 10 food, 10 wood, 10 stone, 10 metal
- **Classes:** Unit Organic ConquestCritical Human
- **Visible classes:** Support Builder Civilian Worker

## Civilisations that can train it

- **athen** — `units/athen/support_civilian` (civil_centre)
- **brit** — `units/brit/support_civilian` (civil_centre, crannog)
- **cart** — `units/cart/support_civilian` (civil_centre)
- **gaul** — `units/gaul/support_civilian` (civil_centre)
- **germ** — `units/germ/support_civilian` (civil_centre, encampment)
- **han** — `units/han/support_civilian` (civil_centre)
- **iber** — `units/iber/support_civilian` (civil_centre)
- **kush** — `units/kush/support_civilian` (civil_centre)
- **mace** — `units/mace/support_civilian` (civil_centre)
- **maur** — `units/maur/support_civilian` (civil_centre)
- **pers** — `units/pers/support_civilian` (civil_centre)
- **ptol** — `units/ptol/support_civilian` (civil_centre)
- **rome** — `units/rome/support_civilian` (civil_centre)
- **sele** — `units/sele/support_civilian` (civil_centre, military_colony)
- **spart** — `units/spart/support_civilian` (civil_centre)

## Civilisation-specific overrides

These civilisations override the generic stats above (only differing values are listed):

- **spart** — `units/spart/support_civilian`
  - health 35 HP
  - Capture — strength 1 — range 4 m — repeat 1 s — restricted Field Palisade Wall
  - Melee "Dagger" — damage 3 hack — range 3 m — prepare 0.5 s — repeat 1 s
