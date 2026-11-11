# units/heroes/spart_hero_agis_2

Spartan-specific aura of 0 A.D. 0.28.0 — only the spartans can have it. See `docs/game_description/spart/auras/README.md` for the method; shared auras are documented in `docs/game_description/generic/auras/`.

Data file: `simulation/data/auras/units/heroes/spart_hero_agis_2.json`.

## Basic stats

- **Name:** Last Stand
- **Type:** (none — see note)
- **Description:** Agis +50% health.
- **Modifications:** none

## Spartans

- attached by `units/spart/hero_agis`

Note: a **broken/vestigial aura** — the JSON contains only a name
("Last Stand") and a description ("Agis +50% health") with no `type`,
`affects` or `modifications` fields, so the engine applies nothing. It
is attached by the hero template (`units/spart/hero_agis` lists both
`spart_hero_agis_1` and `spart_hero_agis_2`) but contributes zero
effect; do not count on any Agis self-buff.
