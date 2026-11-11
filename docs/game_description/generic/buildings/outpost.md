# outpost

Buildable by **15** civilisations. Generic (non-civ-specific) building of 0 A.D. 0.28.0 — see `docs/game_description/generic/buildings/README.md` for the method.

Generic stats resolved from the shared template `simulation/templates/template_structure_defensive_outpost` (deepest template common to all civilisation variants; variants may override, see below).

## Guide

The Outpost is a pure vision structure: at 60 wood and 30 s build time it is the cheapest way to extend sight range, giving 90 m of vision in own or neutral territory. It provides no attack, so its role for a bot is early-warning map coverage — watching approaches to the base or expansion routes — rather than defence. Its high pierce armor (20) lets it survive stray arrows, but 1 crush armor and 500 capture points mean it folds quickly to siege or capture, so place it where the enemy is unlikely to commit forces. Note the placement constraint of min 50 m from other Outposts when chaining vision coverage.

## Basic stats

- **Generic name:** Outpost
- **Health:** 400 HP
- **Armor:** 10 hack / 20 pierce / 1 crush
- **Cost:** 60 wood
- **Build time:** 30 s
- **Vision:** 90 m
- **Capture points:** 500
- **Build territory:** own neutral
- **Placement:** land
- **Build distance:** min 50 m from Outpost
- **Classes:** Structure
- **Visible classes:** Defensive Outpost
- **Footprint:** Square 7 m × 7 m (height 13 m)
- **Obstruction:** Static 6 m × 6 m

## Civilisations that can build it

- **athen** — `structures/athen/outpost`
- **brit** — `structures/brit/outpost`
- **cart** — `structures/cart/outpost`
- **gaul** — `structures/gaul/outpost`
- **germ** — `structures/germ/outpost`
- **han** — `structures/han/outpost`
- **iber** — `structures/iber/outpost`
- **kush** — `structures/kush/outpost`
- **mace** — `structures/mace/outpost`
- **maur** — `structures/maur/outpost`
- **pers** — `structures/pers/outpost`
- **ptol** — `structures/ptol/outpost`
- **rome** — `structures/rome/outpost`
- **sele** — `structures/sele/outpost`
- **spart** — `structures/spart/outpost`
