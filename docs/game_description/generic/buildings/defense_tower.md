# defense_tower

Buildable by **15** civilisations. Generic (non-civ-specific) building of 0 A.D. 0.28.0 — see `docs/game_description/generic/buildings/README.md` for the method.

Generic stats resolved from the shared template `simulation/templates/template_structure_defensive_tower_stone` (deepest template common to all civilisation variants; variants may override, see below).

## Guide

The defense tower is a static defensive structure: it automatically fires on enemies within its 60 m range, preferring Human targets, and projects your territory (radius 32 m). Its heavy pierce armor (35) makes it resistant to enemy ranged units, but its very low crush armor (3) leaves it vulnerable to siege weapons, and it cannot shoot enemies at its foot without the “Murder Holes” technology. Garrisoning up to 5 units adds extra arrows, so it works best as a hardened strongpoint anchored by nearby troops rather than a standalone wall. It requires phase_town and costs 100 wood plus 100 stone — stone is a scarce resource, so it is a deliberate investment: build it to hold key positions (resource lines, borders) rather than as an early-game answer.

## Basic stats

- **Generic name:** Stone Tower
- **Health:** 1000 HP
- **Armor:** 29 hack / 35 pierce / 3 crush
- **Attack:** Ranged "Bow" — damage 8 pierce — range 60 m — prepare 0.4 s — repeat 3.5 s — preferred Human
- **Cost:** 100 wood, 100 stone
- **Build time:** 150 s
- **Territory influence:** radius 32 m, weight 30000
- **Garrison:** 5 slots
- **Vision:** 80 m
- **Capture points:** 500
- **Build territory:** own
- **Placement:** land
- **Build distance:** min 60 m from Tower
- **Requirements:** phase_town
- **Classes:** Structure
- **Visible classes:** Defensive Tower StoneTower
- **Footprint:** Square 10 m × 10 m (height 15 m)
- **Obstruction:** Static 7 m × 7 m

## Civilisations that can build it

- **athen** — `structures/athen/defense_tower`
- **brit** — `structures/brit/defense_tower`
- **cart** — `structures/cart/defense_tower`
- **gaul** — `structures/gaul/defense_tower`
- **germ** — `structures/germ/defense_tower`
- **han** — `structures/han/defense_tower`
- **iber** — `structures/iber/defense_tower`
- **kush** — `structures/kush/defense_tower`
- **mace** — `structures/mace/defense_tower`
- **maur** — `structures/maur/defense_tower`
- **pers** — `structures/pers/defense_tower`
- **ptol** — `structures/ptol/defense_tower`
- **rome** — `structures/rome/defense_tower`
- **sele** — `structures/sele/defense_tower`
- **spart** — `structures/spart/defense_tower`

## Civilisation-specific overrides

These civilisations override the generic stats above (only differing values are listed):

- **athen** — `structures/athen/defense_tower`
  - footprint Square 10 m × 10.5 m
- **brit** — `structures/brit/defense_tower`
  - footprint Circle r 6 m (height 10 m)
- **cart** — `structures/cart/defense_tower`
  - footprint Square 10 m × 10 m (height 18 m)
- **han** — `structures/han/defense_tower`
  - footprint Square 10 m × 10.5 m
- **iber** — `structures/iber/defense_tower`
  - health 2400 HP
  - Ranged "Bow" — damage 8 pierce — range 60 m — prepare 0.4 s — repeat 3.5 s — preferred Human
  - cost 50 wood, 250 stone
  - build time 200 s
  - territory radius 38 m, weight 30000
  - garrison 8 slots
  - footprint Circle r 8 m (height 12 m)
- **mace** — `structures/mace/defense_tower`
  - footprint Square 10 m × 10.5 m
- **ptol** — `structures/ptol/defense_tower`
  - footprint Square 10 m × 10 m (height 18 m)
- **sele** — `structures/sele/defense_tower`
  - footprint Square 10 m × 10.5 m
- **spart** — `structures/spart/defense_tower`
  - footprint Square 10 m × 10.5 m
