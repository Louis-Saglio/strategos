# units/heroes/pers_hero_xerxes_i_1

Persian-specific aura of 0 A.D. 0.28.0 — only the persians can have it. See `docs/game_description/pers/auras/README.md` for the method; shared auras are documented in `docs/game_description/generic/auras/`.

Data file: `simulation/data/auras/units/heroes/pers_hero_xerxes_i_1.json`.

## Basic stats

- **Name:** Administrator
- **Type:** range
- **Radius:** 100 m
- **Affects:** Worker
- **Description:** Workers +25% build rate and +15% gather speed.
- **Modifications:**
  - ×1.25 Builder/Rate
  - ×1.15 ResourceGatherer/BaseSpeed — Builder

## Persian

- attached by `units/pers/hero_xerxes_i`

Note: the economy aura, and a large one — 100 m covers a whole resource
camp. The +25% build rate applies to all Worker buildings; the +15% gather
speed applies to Builder-class units (the citizen-soldiers, which carry
both the `Builder` and `Worker` classes — the `ResourceGatherer/BaseSpeed`
modification is restricted to `Builder`). Park Xerxes at the woodline or a
construction site, not on the front line; he also carries the "Invader of
Greece" health aura, so an army camped around him gets both benefits.
