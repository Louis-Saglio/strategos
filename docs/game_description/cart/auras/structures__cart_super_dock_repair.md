# structures/cart_super_dock_repair

Carthaginian-specific aura of 0 A.D. 0.28.0 — only the carthaginians can have it. See `docs/game_description/cart/auras/README.md` for the method; shared auras are documented in `docs/game_description/generic/auras/`.

Data file: `simulation/data/auras/structures/cart_super_dock_repair.json`.

## Basic stats

- **Name:** Dockyard Repairs
- **Type:** garrisonedUnits
- **Affects:** Ship
- **Description:** Garrisoned Ships +10 health regeneration rate.
- **Modifications:**
  - +10 Health/RegenRate

## Carthaginian

- attached by `structures/cart/super_dock`

Note: while a ship is garrisoned in the Cothon (the cart super dock) it regenerates 10 HP/s. With the dock's 5 garrison slots, a damaged fleet can rotate through for repairs without healers.
