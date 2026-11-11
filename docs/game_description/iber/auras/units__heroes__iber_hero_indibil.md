# units/heroes/iber_hero_indibil

Iberian-specific aura of 0 A.D. 0.28.0 — only the iberians can have it. See `docs/game_description/iber/auras/README.md` for the method; shared auras are documented in `docs/game_description/generic/auras/`.

Data file: `simulation/data/auras/units/heroes/iber_hero_indibil.json`.

## Basic stats

- **Name:** Mobilization
- **Type:** global
- **Affects:** Soldier
- **Description:** Soldiers −15% resources costs, −20% training time.
- **Modifications:**
  - ×0.8 Cost/BuildTime
  - ×0.85 Cost/Resources/food
  - ×0.85 Cost/Resources/wood
  - ×0.85 Cost/Resources/stone
  - ×0.85 Cost/Resources/metal

## Iberian

- attached by `units/iber/hero_indibil` (and the vestigial
  `units/iber/hero_indibil_infantry`)

Note: a **global** aura — while Indibil lives, every own soldier trains
20% faster and costs 15% less on all resources, map-wide. It stacks with
the "Saripeko" team bonus on javelineers (×0.9 × 0.85 ≈ ×0.765) and with
the stable/barracks batch-time discounts. Indibil is therefore the
economy hero pick for mass-producing the Iberian army.
