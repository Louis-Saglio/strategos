# teambonuses/iber_player_teambonus

Iberian-specific aura of 0 A.D. 0.28.0 — only the iberians can have it. See `docs/game_description/iber/auras/README.md` for the method; shared auras are documented in `docs/game_description/generic/auras/`.

Data file: `simulation/data/auras/teambonuses/iber_player_teambonus.json`.

## Basic stats

- **Name:** Saripeko
- **Type:** global
- **Affects:** Citizen Javelineer
- **Affected players:** MutualAlly
- **Description:** Citizen Javelineers −10% resource costs.
- **Modifications:**
  - ×0.9 Cost/Resources/food
  - ×0.9 Cost/Resources/wood
  - ×0.9 Cost/Resources/stone
  - ×0.9 Cost/Resources/metal

## Iberian

- attached by `special/players/<civ>.xml` (the player's teambonus)

Note: a −10% resource cost on **citizen javelineers** (infantry and
cavalry) for every ally — Iberians included. It stacks with Indibil's
global "Mobilization" aura (−15%), so an Iberian javelineer with the hero
alive costs ~23% less on every resource.
