# units/heroes/iber_hero_caros_1

Iberian-specific aura of 0 A.D. 0.28.0 — only the iberians can have it. See `docs/game_description/iber/auras/README.md` for the method; shared auras are documented in `docs/game_description/generic/auras/`.

Data file: `simulation/data/auras/units/heroes/iber_hero_caros_1.json`.

## Basic stats

- **Name:** Valiant Defender
- **Type:** garrison
- **Affects:** Structure, SiegeTower
- **Description:** When garrisoned, the Structure or Siege Tower has +75% arrow count.
- **Modifications:**
  - ×1.75 BuildingAI/GarrisonArrowMultiplier
  - ×1.75 BuildingAI/MaxArrowCount

## Iberian

- attached by `units/iber/hero_caros`

Note: a **garrison-type** aura — it only applies while Caros is
garrisoned inside the building. The structure's arrow count (both the
garrison-arrow multiplier and the max arrow count) is multiplied by
1.75, so a tower or fortress with Caros inside throws 75% more arrows.
Unique among hero auras; pairs with the Iberian massive towers, which
already have +1 default arrow and 8 garrison slots.
