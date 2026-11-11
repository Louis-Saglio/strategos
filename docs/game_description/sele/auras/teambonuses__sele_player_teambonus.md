# teambonuses/sele_player_teambonus

Seleucid-specific aura of 0 A.D. 0.28.0 — only the seleucids can have it. See `docs/game_description/sele/auras/README.md` for the method; shared auras are documented in `docs/game_description/generic/auras/`.

Data file: `simulation/data/auras/teambonuses/sele_player_teambonus.json`.

## Basic stats

- **Name:** Syrian Tetrapolis
- **Type:** global
- **Affects:** CivilCentre
- **Affected players:** MutualAlly
- **Description:** Civil Centers and Colonies −20% resource cost and −30% construction time.
- **Modifications:**
  - ×0.8 Cost/Resources/food
  - ×0.8 Cost/Resources/wood
  - ×0.8 Cost/Resources/stone
  - ×0.8 Cost/Resources/metal
  - ×0.7 Cost/BuildTime

## Seleucids

- attached by `special/players/<civ>.xml` (the player's teambonus)

Note: the Seleucid team bonus, live for **every ally** (sele included)
from the start of the match. It matches the `CivilCentre` class, which
the civic centre carries via its visible classes and the military colony
inherits — so both the CC (300 wood + 300 stone + 250 metal, 500 s → 240
+ 240 + 200, 350 s) and the colony (200 + 200 + 150, 300 s → 160 + 160 +
120, 210 s) get the discount. Expansion is what the Seleucids do best:
cheaper, faster-built civic centres stack with the hero-gated second-CC
rule (see `civ.md`) to make sele the most aggressive boomer on the map,
and in team games the discount multiplies per sele ally.
