# colonization

Carthaginian-specific technology of 0 A.D. 0.28.0 — only the carthaginians can get it. See `docs/game_description/cart/technologies/README.md` for the method; shared technologies are documented in `docs/game_description/generic/technologies/`.

Data file: `simulation/data/technologies/colonization.json`.

## Basic stats

- **Name:** Colonization
- **Cost:** 200 wood, 200 metal
- **Research time:** 20 s
- **Requirements:** `{"all": [{"civ": "cart"}]}`
- **Effect:** Civic Structures (Civic Center, Temples, and Houses) −25% build time and resource costs.
- **Modifications:**
  - ×0.75 Cost/BuildTime
  - ×0.75 Cost/Resources/food
  - ×0.75 Cost/Resources/wood
  - ×0.75 Cost/Resources/stone
  - ×0.75 Cost/Resources/metal
- **Affects:** Civic

## Carthaginian

- civil_centre

Note: researched at the civil centre from the start of the match (no phase requirement, only the civ gate). It makes Carthage's civic-centre expansion cheaper — a new CC drops from 300 wood / 300 stone / 250 metal to 225 / 225 / 187.5 — and also discounts houses and temples. Research it before planting additional civic centres.
