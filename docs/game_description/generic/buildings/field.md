# field

Buildable by **15** civilisations. Generic (non-civ-specific) building of 0 A.D. 0.28.0 — see `docs/game_description/generic/buildings/README.md` for the method.

Generic stats resolved from the shared template `simulation/templates/template_structure_resource_field` (deepest template common to all civilisation variants; variants may override, see below).

## Guide

The Field is the standard renewable food source: it provides an infinite supply of grain for up to 5 gatherers at once, with each additional gatherer working at 0.90 efficiency relative to the previous one (diminishing returns). At only 100 wood and 50 s build time it is cheap to place, so the bot should build fields near a dropsite once easily accessible food (berries, hunt) runs out, and prefer spreading workers across multiple fields rather than stacking 5 on one. It is a soft target — 250 HP, no vision, 500 capture points — so fields should be built inside your own territory, in defensible spots.

## Basic stats

- **Generic name:** Field
- **Health:** 250 HP
- **Armor:** 15 hack / 40 pierce / 5 crush
- **Cost:** 100 wood
- **Build time:** 50 s
- **Vision:** 0 m
- **Capture points:** 500
- **Build territory:** own
- **Placement:** land
- **Classes:** Structure
- **Visible classes:** Resource Field
- **Footprint:** Square 28 m × 28 m (height 2 m)
- **Obstruction:** Static 22 m × 22 m — BlockMovement false (units can walk over fields)

## Civilisations that can build it

- **athen** — `structures/athen/field`
- **brit** — `structures/brit/field`
- **cart** — `structures/cart/field`
- **gaul** — `structures/gaul/field`
- **germ** — `structures/germ/field`
- **han** — `structures/han/field`
- **iber** — `structures/iber/field`
- **kush** — `structures/kush/field`
- **mace** — `structures/mace/field`
- **maur** — `structures/maur/field`
- **pers** — `structures/pers/field`
- **ptol** — `structures/ptol/field`
- **rome** — `structures/rome/field`
- **sele** — `structures/sele/field`
- **spart** — `structures/spart/field`

## Civilisation-specific overrides

These civilisations override the generic stats above (only differing values are listed):

- **han** — `structures/han/field`
  - cost 60 wood
  - build time 30 s
  - footprint Square 22 m × 22 m
