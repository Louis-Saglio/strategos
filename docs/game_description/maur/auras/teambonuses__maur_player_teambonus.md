# teambonuses/maur_player_teambonus

Mauryan-specific aura of 0 A.D. 0.28.0 — only the mauryas can have it. See `docs/game_description/maur/auras/README.md` for the method; shared auras are documented in `docs/game_description/generic/auras/`.

Data file: `simulation/data/auras/teambonuses/maur_player_teambonus.json`.

## Basic stats

- **Name:** Ashoka's Religious Support
- **Type:** global
- **Affects:** Temple
- **Affected players:** MutualAlly
- **Description:** Temples −50% resource costs and building time; Temple technologies −50% resource costs and research time.
- **Modifications:**
  - ×0.5 Cost/BuildTime
  - ×0.5 Cost/Resources/wood
  - ×0.5 Cost/Resources/stone
  - ×0.5 Researcher/TechCostMultiplier/food
  - ×0.5 Researcher/TechCostMultiplier/wood
  - ×0.5 Researcher/TechCostMultiplier/stone
  - ×0.5 Researcher/TechCostMultiplier/metal
  - ×0.5 Researcher/TechCostMultiplier/time

## Mauryan

- attached by `special/players/<civ>.xml` (the player's teambonus)

Note: temples cost and build at −50% for **every ally** (the Mauryas
included), and the temple technologies (healing, garrison-heal, etc.)
cost and research at −50% too — the `TechCostMultiplier` modifications
apply to research done *at* the temple. Note this does not stack with
Ashoka's "Buddhism" aura, which applies the identical ×0.5 modifiers to
the Mauryas' own temples — the stronger of the two wins (they are the
same multiplier, so no difference for the Mauryan player; allies get
the discount through the teambonus only).
