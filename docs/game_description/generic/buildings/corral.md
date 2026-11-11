# corral

Buildable by **15** civilisations. Generic (non-civ-specific) building of 0 A.D. 0.28.0 — see `docs/game_description/generic/buildings/README.md` for the method.

Generic stats resolved from the shared template `simulation/templates/template_structure_resource_corral` (deepest template common to all civilisation variants; variants may override, see below).

## Guide

The Corral is a food-production building, available from the Village Phase for 100 wood: it trains domestic animals (sheep, goats, pigs, cattle) that can then be harvested for food — a sheep costs 50 food and yields 100 food. Garrisoning animals inside (up to 8 slots) makes each animal add a food trickle to the Corral (e.g. +1 food per garrisoned sheep), so a corral stocked with animals is a steady, villager-free food income. It also researches `gather_animals_stockbreeding`. Build one when food gathering from farms or hunt is under pressure; it has no attack and only 500 HP, so keep it inside your territory.

## Basic stats

- **Generic name:** Corral
- **Health:** 500 HP
- **Armor:** 1 hack / 20 pierce / 1 crush
- **Cost:** 100 wood
- **Build time:** 50 s
- **Territory influence:** radius 20 m, weight 30000
- **Garrison:** 8 slots (+1/s heal)
- **Vision:** 20 m
- **Capture points:** 500
- **Build territory:** own
- **Placement:** land
- **Requirements:** phase_village
- **Trains:** gaia/fauna_goat_trainable gaia/fauna_sheep_trainable gaia/fauna_pig_trainable gaia/fauna_cattle_cow_trainable
- **Classes:** Structure
- **Visible classes:** Resource Economic Village Corral
- **Footprint:** Square 18 m × 17 m (height 5 m)
- **Obstruction:** Static 16 m × 15 m

## Civilisations that can build it

- **athen** — `structures/athen/corral`
- **brit** — `structures/brit/corral`
- **cart** — `structures/cart/corral`
- **gaul** — `structures/gaul/corral`
- **germ** — `structures/germ/corral`
- **han** — `structures/han/corral`
- **iber** — `structures/iber/corral`
- **kush** — `structures/kush/corral`
- **mace** — `structures/mace/corral`
- **maur** — `structures/maur/corral`
- **pers** — `structures/pers/corral`
- **ptol** — `structures/ptol/corral`
- **rome** — `structures/rome/corral`
- **sele** — `structures/sele/corral`
- **spart** — `structures/spart/corral`

## Civilisation-specific overrides

These civilisations override the generic stats above (only differing values are listed):

- **brit** — `structures/brit/corral`
  - footprint Square 12 m × 21 m
- **cart** — `structures/cart/corral`
  - trains gaia/fauna_goat_trainable gaia/fauna_sheep_trainable gaia/fauna_pig_trainable gaia/fauna_cattle_sanga_trainable
  - footprint Square 18 m × 16.5 m
- **gaul** — `structures/gaul/corral`
  - footprint Square 12 m × 21 m
- **germ** — `structures/germ/corral`
  - footprint Square 21 m × 21 m
- **han** — `structures/han/corral`
  - trains gaia/fauna_goat_trainable gaia/fauna_pig_trainable gaia/fauna_cattle_cow_trainable gaia/fauna_cattle_zebu_trainable
  - footprint Square 22 m × 20 m
- **iber** — `structures/iber/corral`
  - footprint Square 17 m × 19 m
- **kush** — `structures/kush/corral`
  - trains gaia/fauna_goat_trainable gaia/fauna_sheep_trainable gaia/fauna_pig_trainable gaia/fauna_cattle_sanga_trainable
  - footprint Square 15 m × 17 m (height 8 m)
- **maur** — `structures/maur/corral`
  - trains gaia/fauna_goat_trainable gaia/fauna_sheep_trainable gaia/fauna_pig_trainable gaia/fauna_cattle_zebu_trainable
  - footprint Square 16 m × 17 m
- **pers** — `structures/pers/corral`
  - footprint Square 20 m × 13 m
- **ptol** — `structures/ptol/corral`
  - trains gaia/fauna_goat_trainable gaia/fauna_sheep_trainable gaia/fauna_pig_trainable gaia/fauna_cattle_sanga_trainable
  - footprint Square 14 m × 22 m
- **rome** — `structures/rome/corral`
  - footprint Square 16 m × 22 m
