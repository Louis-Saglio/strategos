# structures/satrapy_tribute

Persian-specific aura of 0 A.D. 0.28.0 — only the persians can have it. See `docs/game_description/pers/auras/README.md` for the method; shared auras are documented in `docs/game_description/generic/auras/`.

Data file: `simulation/data/auras/structures/satrapy_tribute.json`.

## Basic stats

- **Name:** Satrapy Tribute
- **Type:** (none — label only)
- **Description:** Upgrade the Winter Palace to receive a free trickle of a desired resource.

## Persian

- attached by `structures/pers/tachara`

Note: this aura carries **no modifications** — it is a label attached to
the Winter Palace describing the "Satrapy Tribute" feature. The actual
trickle is the building's own `ResourceTrickle` component (initially all
zeros), which the four upgrade forms (`tachara_food/wood/stone/metal`) set
to 10 of one resource every 2000 ms (5/s). See
[`tachara`](../buildings/tachara.md).
