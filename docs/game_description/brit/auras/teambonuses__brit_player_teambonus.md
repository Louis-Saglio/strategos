# teambonuses/brit_player_teambonus

British-specific aura of 0 A.D. 0.28.0 — only the britons can have it. See `docs/game_description/brit/auras/README.md` for the method; shared auras are documented in `docs/game_description/generic/auras/`.

Data file: `simulation/data/auras/teambonuses/brit_player_teambonus.json`.

## Basic stats

- **Name:** Druids
- **Type:** global
- **Affects:** Healer
- **Affected players:** MutualAlly
- **Description:** Healers −20% resource costs.
- **Modifications:**
  - ×0.8 Cost/Resources/food
  - ×0.8 Cost/Resources/wood
  - ×0.8 Cost/Resources/stone
  - ×0.8 Cost/Resources/metal

## Britons

- attached by `special/players/<civ>.xml` (the player's teambonus)

Note: the British team bonus, live for **every ally** (brit included)
from the start of the match. It discounts the healer's 100 food + 30
metal to 80 + 24 for every player on the team — a small but real saving
on the game's cheapest support unit, and on a team of three or four it
stacks per British ally. It matters most in the mid-game, when healers
are queued in batches to keep the front line topped up; the British
druid itself carries the "Deas Celtica" aura (see
`generic/auras/units__celtic_healer.md`), so discounted druids are
discounted battlefield multipliers.
