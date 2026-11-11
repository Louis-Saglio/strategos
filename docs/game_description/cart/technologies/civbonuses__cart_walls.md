# civbonuses/cart_walls

Carthaginian-specific technology of 0 A.D. 0.28.0 — only the carthaginians can get it. See `docs/game_description/cart/technologies/README.md` for the method; shared technologies are documented in `docs/game_description/generic/technologies/`.

Data file: `simulation/data/technologies/civbonuses/cart_walls.json`.

## Basic stats

- **Name:** Triple Walls
- **Auto-researched:** yes
- **Requirements:** `{"civ": "cart"}`
- **Effect:** City Walls +200% health, but +100% build time and stone cost.
- **Modifications:**
  - ×3 Health/Max
  - ×2 Cost/BuildTime
  - ×2 Cost/Resources/stone
- **Affects:** Wall

## Carthaginian

- auto-researched

Note: "Wall" here is the entity class, so the bonus applies to Carthage's **stone wall segments** (and gates/towers) — a long stone wall segment goes from 3000 HP to 9000 HP, at 72 stone and 72 s — but **not** to the palisade or the cart-unique Low Wall (`wallset_short`), whose segments carry no `Wall` class. See `docs/game_description/cart/buildings/wallset_short.md`.
