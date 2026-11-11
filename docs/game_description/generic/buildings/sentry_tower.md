# sentry_tower

Buildable by **15** civilisations. Generic (non-civ-specific) building of 0 A.D. 0.28.0 — see `docs/game_description/generic/buildings/README.md` for the method.

Generic stats resolved from the shared template `simulation/templates/template_structure_defensive_tower_sentry` (deepest template common to all civilisation variants; variants may override, see below).

## Guide

The Sentry Tower is a cheap early-game defensive structure, available from the Village Phase for only 100 wood. Its pierce attack (8 damage, 60 m range, preferred target Human) makes it a deterrent against small infantry raids rather than a real siege-stopper, and its 16 m territory influence also helps claim ground. Its 80 m vision makes it useful as a forward observation post, and it can garrison 3 units. Note the 60 m minimum build distance from other towers, so it cannot be stacked into a dense wall of towers.

## Basic stats

- **Generic name:** Sentry Tower
- **Health:** 400 HP
- **Armor:** 29 hack / 35 pierce / 3 crush
- **Attack:** Ranged "Bow" — damage 8 pierce — range 60 m — prepare 0.4 s — repeat 3.5 s — preferred Human
- **Cost:** 100 wood
- **Build time:** 40 s
- **Territory influence:** radius 16 m, weight 30000
- **Garrison:** 3 slots
- **Vision:** 80 m
- **Capture points:** 500
- **Build territory:** own
- **Placement:** land
- **Build distance:** min 60 m from Tower
- **Requirements:** phase_village
- **Classes:** Structure
- **Visible classes:** Defensive Tower SentryTower
- **Footprint:** Square 9.5 m × 8.5 m (height 9 m)
- **Obstruction:** Static 9 m × 7.5 m

## Civilisations that can build it

- **athen** — `structures/athen/sentry_tower`
- **brit** — `structures/brit/sentry_tower`
- **cart** — `structures/cart/sentry_tower`
- **gaul** — `structures/gaul/sentry_tower`
- **germ** — `structures/germ/sentry_tower`
- **han** — `structures/han/sentry_tower`
- **iber** — `structures/iber/sentry_tower`
- **kush** — `structures/kush/sentry_tower`
- **mace** — `structures/mace/sentry_tower`
- **maur** — `structures/maur/sentry_tower`
- **pers** — `structures/pers/sentry_tower`
- **ptol** — `structures/ptol/sentry_tower`
- **rome** — `structures/rome/sentry_tower`
- **sele** — `structures/sele/sentry_tower`
- **spart** — `structures/spart/sentry_tower`
