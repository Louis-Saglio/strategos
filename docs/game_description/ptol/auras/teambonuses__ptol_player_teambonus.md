# teambonuses/ptol_player_teambonus

Ptolemaic-specific aura of 0 A.D. 0.28.0 — only the ptolemies can have it. See `docs/game_description/ptol/auras/README.md` for the method; shared auras are documented in `docs/game_description/generic/auras/`.

Data file: `simulation/data/auras/teambonuses/ptol_player_teambonus.json`.

## Basic stats

- **Name:** Breadbasket of the Mediterranean
- **Type:** player
- **Affects:** Player
- **Affected players:** MutualAlly
- **Description:** +1.0 food trickle rate.
- **Modifications:**
  - +1 ResourceTrickle/Rates/food

## Ptolemaic

- attached by `special/players/<civ>.xml` (the player's teambonus)

Note: a flat +1 food/s player trickle for **every ally** (the Ptolemies
included), from the start of the match — roughly one extra woman on a
berry bush for free, all game long. Modest alone, but on a team of three
or four it stacks per Ptolemaic ally, and it synergises with the Ptolemaic
food economy: the "Nile Delta" farming techs and the cheap wood costs of
the mud-brick houses leave food as the main expense, and the teambonus
covers part of it.
