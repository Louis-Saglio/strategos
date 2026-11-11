# teambonuses/pers_player_teambonus

Persian-specific aura of 0 A.D. 0.28.0 — only the persians can have it. See `docs/game_description/pers/auras/README.md` for the method; shared auras are documented in `docs/game_description/generic/auras/`.

Data file: `simulation/data/auras/teambonuses/pers_player_teambonus.json`.

## Basic stats

- **Name:** Training Regimes
- **Type:** global
- **Affects:** Barracks, Stable
- **Affected players:** MutualAlly
- **Description:** Barracks and Stables −20% wood and stone cost and build time.
- **Modifications:**
  - ×0.8 Cost/Resources/wood
  - ×0.8 Cost/Resources/stone
  - ×0.8 Cost/BuildTime

## Persian

- attached by `special/players/<civ>.xml` (the player's teambonus)

Note: applies to every ally (Persia included) and only to Barracks and
Stable — not to the other military buildings. The Barracks and Stable have
no wood/stone cost themselves, so the discount does not make those two
buildings cheaper to build; its practical effect is on the units trained
in them, whose `Cost/Resources/wood` and `stone` are modified by the aura
at training time (e.g. the Bactrian Heavy Cavalry Archer drops from 80 to
64 wood). Units trained elsewhere (civil centre, Winter Palace, fortress)
are unaffected.
