# units/heroes/pers_hero_darius_i

Persian-specific aura of 0 A.D. 0.28.0 — only the persians can have it. See `docs/game_description/pers/auras/README.md` for the method; shared auras are documented in `docs/game_description/generic/auras/`.

Data file: `simulation/data/auras/units/heroes/pers_hero_darius_i.json`.

## Basic stats

- **Name:** Leadership
- **Type:** global
- **Affects:** Soldier, Siege, Trader
- **Description:** Soldiers, Siege Engines, Traders, and Merchant Ships +15% movement speed.
- **Modifications:**
  - ×1.15 UnitMotion/WalkSpeed

## Persian

- attached by `units/pers/hero_darius_i`

Note: a **global** aura — it applies to the whole map, not a radius — so
merely having Darius alive speeds up every own soldier, siege engine and
trader, including the merchant ships (the `Trader` visible class covers
both land traders and `ship_merchant`). This makes him the best
single-hero pick for a large empire that has to move armies and trade
carts across long distances.
