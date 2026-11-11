# structures/athen_prytaneion_hero_heal

Athenian-specific aura of 0 A.D. 0.28.0 — only the athenians can have it. See `docs/game_description/athen/auras/README.md` for the method; shared auras are documented in `docs/game_description/generic/auras/`.

Data file: `simulation/data/auras/structures/athen_prytaneion_hero_heal.json`.

## Basic stats

- **Name:** Officer Accommodation
- **Type:** garrisonedUnits
- **Affects:** Hero
- **Description:** Garrisoned Heroes +6 health regeneration rate.
- **Modifications:**
  - +6 Health/RegenRate

## Athenian

- attached by `structures/athen/prytaneion`

Note: a garrison-type aura on the prytaneion — any hero garrisoned
inside regenerates +6 HP/s (a 1000 HP hero mends fully in under 3
minutes; a damaged one in seconds). Always-on regen (`RegenRate`), so
the prytaneion doubles as the hero repair bay. It stacks with any other
regen the hero has (e.g. the Pharaonic Cult or Hippocrates' auras).
