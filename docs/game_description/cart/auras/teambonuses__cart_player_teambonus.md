# teambonuses/cart_player_teambonus

Carthaginian-specific aura of 0 A.D. 0.28.0 — only the carthaginians can have it. See `docs/game_description/cart/auras/README.md` for the method; shared auras are documented in `docs/game_description/generic/auras/`.

Data file: `simulation/data/auras/teambonuses/cart_player_teambonus.json`.

## Basic stats

- **Name:** Mercenary Transports
- **Type:** global
- **Affects:** Mercenary Infantry
- **Affected players:** MutualAlly
- **Description:** Mercenaries −50% train time.
- **Modifications:**
  - ×0.5 Cost/BuildTime

## Carthaginian

- attached by `special/players/<civ>.xml` (the player's teambonus)

Note: applies to every ally (Carthage included) and only to `Mercenary` **Infantry** — the swordsmen, spearman, skirmisher and slinger mercenaries — not to the mercenary cavalry. Combined with the mercenaries' already-short 7 s train time, Carthaginian infantry mercenaries (and those of its allies) train in 3.5 s.
