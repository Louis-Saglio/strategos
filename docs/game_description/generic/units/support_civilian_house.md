# support_civilian_house

Trained by **15** civilisations. Generic (non-civ-specific) unit of 0 A.D. 0.28.0 — see `docs/game_description/generic/units/README.md` for the method.

Generic stats resolved from the shared template `simulation/templates/template_unit_support_civilian` (deepest template common to all civilisation variants; variants may override, see below).

## Guide

A cheap economic worker costing only 50 food — an abundant resource, so easy to mass — trained at houses, letting a bot produce gatherers in parallel with the civic centre — but only after researching the house technology "Fertility Festival" (`unlock_civilians_house_generic`, 250 food / 100 wood / 100 metal, Village Phase), whose 100 metal is a premium cost, metal being scarce. Its gather rates favour food (fruit and meat 1/s) over stone and metal (0.35/s), so assign it to food or wood. With 25 HP and only a 2-hack "Dagger" attack it is not a fighter: keep it away from combat. Note that all civilisation variants raise the build time from 8 s to 30 s.

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

- **athen** — `units/athen/support_civilian_house` (house)
- **brit** — `units/brit/support_civilian_house` (house)
- **cart** — `units/cart/support_civilian_house` (apartment, house)
- **gaul** — `units/gaul/support_civilian_house` (house)
- **germ** — `units/germ/support_civilian_house` (house)
- **han** — `units/han/support_civilian_house` (house)
- **iber** — `units/iber/support_civilian_house` (house)
- **kush** — `units/kush/support_civilian_house` (house)
- **mace** — `units/mace/support_civilian_house` (house)
- **maur** — `units/maur/support_civilian_house` (house)
- **pers** — `units/pers/support_civilian_house` (house)
- **ptol** — `units/ptol/support_civilian_house` (house)
- **rome** — `units/rome/support_civilian_house` (house)
- **sele** — `units/sele/support_civilian_house` (house)
- **spart** — `units/spart/support_civilian_house` (house)

## Civilisation-specific overrides

These civilisations override the generic stats above (only differing values are listed):

- **athen** — `units/athen/support_civilian_house`
  - build time 30 s
- **brit** — `units/brit/support_civilian_house`
  - build time 30 s
- **cart** — `units/cart/support_civilian_house`
  - build time 30 s
- **gaul** — `units/gaul/support_civilian_house`
  - build time 30 s
- **germ** — `units/germ/support_civilian_house`
  - build time 30 s
- **han** — `units/han/support_civilian_house`
  - build time 30 s
- **iber** — `units/iber/support_civilian_house`
  - build time 30 s
- **kush** — `units/kush/support_civilian_house`
  - build time 30 s
- **mace** — `units/mace/support_civilian_house`
  - build time 30 s
- **maur** — `units/maur/support_civilian_house`
  - build time 30 s
- **pers** — `units/pers/support_civilian_house`
  - build time 30 s
- **ptol** — `units/ptol/support_civilian_house`
  - build time 30 s
- **rome** — `units/rome/support_civilian_house`
  - build time 30 s
- **sele** — `units/sele/support_civilian_house`
  - build time 30 s
- **spart** — `units/spart/support_civilian_house`
  - health 35 HP
  - Capture — strength 1 — range 4 m — repeat 1 s — restricted Field Palisade Wall
  - Melee "Dagger" — damage 3 hack — range 3 m — prepare 0.5 s — repeat 1 s
  - build time 30 s
