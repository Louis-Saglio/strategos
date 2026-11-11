# units/heroes/iber_hero_viriato_2

Iberian-specific aura of 0 A.D. 0.28.0 — only the iberians can have it. See `docs/game_description/iber/auras/README.md` for the method; shared auras are documented in `docs/game_description/generic/auras/`.

Data file: `simulation/data/auras/units/heroes/iber_hero_viriato_2.json`.

## Basic stats

- **Name:** Swag
- **Type:** range
- **Radius:** 60 m
- **Affects:** Soldier, Siege
- **Description:** Soldiers and Siege Engines gain +100% resource loot.
- **Modifications:**
  - ×2 Looter/Resource/food
  - ×2 Looter/Resource/wood
  - ×2 Looter/Resource/stone
  - ×2 Looter/Resource/metal

## Iberian

- attached by `units/iber/hero_viriato`

Note: Viriato's looting aura — own soldiers and siege engines within
60 m collect **double** resources from kills and destroyed buildings
(the `Looter` component's per-resource multipliers). Raiding with
Viriato literally pays for itself; pair it with his "Guerrilla Tactics"
speed aura for hit-and-run looting.
