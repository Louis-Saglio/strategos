# units/heroes/ptol_hero_cleopatra_vii_2

Ptolemaic-specific aura of 0 A.D. 0.28.0 — only the ptolemies can have it. See `docs/game_description/ptol/auras/README.md` for the method; shared auras are documented in `docs/game_description/generic/auras/`.

Data file: `simulation/data/auras/units/heroes/ptol_hero_cleopatra_vii_2.json`.

## Basic stats

- **Name:** Consort
- **Type:** range
- **Radius:** 30 m
- **Affects:** Hero
- **Affected players:** ExclusiveMutualAlly
- **Description:** Allied Heroes +10% health.
- **Modifications:**
  - ×1.1 Health/Max

## Ptolemaic

- attached by `units/ptol/hero_cleopatra_vii`

Note: the friendly half of Cleopatra's "Consort" aura — every **ally's**
hero within 30 m gets +10% health. `ExclusiveMutualAlly` means mutual
allies other than the Ptolemies themselves, so Cleopatra buffs team-mates'
heroes, not her own. Pair it with her "Patriot" aura to run a hero
deathball with an ally in team games.
