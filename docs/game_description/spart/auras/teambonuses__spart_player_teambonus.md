# teambonuses/spart_player_teambonus

Spartan-specific aura of 0 A.D. 0.28.0 — only the spartans can have it. See `docs/game_description/spart/auras/README.md` for the method; shared auras are documented in `docs/game_description/generic/auras/`.

Data file: `simulation/data/auras/teambonuses/spart_player_teambonus.json`.

## Basic stats

- **Name:** Peloponnesian League
- **Type:** global
- **Affects:** Hero
- **Affected players:** MutualAlly
- **Description:** Heroes are trained for free.
- **Modifications:**
  - Cost/Resources/food → replace 0
  - Cost/Resources/wood → replace 0
  - Cost/Resources/stone → replace 0
  - Cost/Resources/metal → replace 0

## Spartans

- attached by `special/players/<civ>.xml` (the player's teambonus)

Note: the Spartan team bonus, live for **every ally** (spart included)
from the start of the match — **all heroes train for free**, resource
costs zeroed outright (`replace 0`, so it also overrides any other cost
modifiers). For the Spartans this stacks with their own hero economy:
the gerousia trains all three heroes from the Town phase, so a Spartan
ally means everyone's Leonidas/Brasidas/Agis equivalents (and the ally's
own heroes) cost nothing but build time. The strongest team bonus in
the game for hero-reliant civs (ptol and sele, whose second civic centre
requires a live hero, benefit enormously).
