# units/heroes/spart_hero_agis_1

Spartan-specific aura of 0 A.D. 0.28.0 — only the spartans can have it. See `docs/game_description/spart/auras/README.md` for the method; shared auras are documented in `docs/game_description/generic/auras/`.

Data file: `simulation/data/auras/units/heroes/spart_hero_agis_1.json`.

## Basic stats

- **Name:** Great Revolt
- **Type:** global
- **Affects:** Soldier
- **Description:** Soldiers −25% metal cost, and training time.
- **Modifications:**
  - ×0.75 Cost/Resources/metal
  - ×0.75 Cost/BuildTime

## Spartans

- attached by `units/spart/hero_agis`

Note: a **global** production aura — while Agis lives, every soldier
on the map trains 25% faster and for 25% less metal (the
`Cost/Resources/metal` modifier hits only units with a metal
component; food/wood costs are untouched). It is the economy hero of
the three: with the metal-heavy Spartan roster (the Neodamodes' 20
metal, the champions' 80) the discount compounds, and it stacks with
the team bonus that already makes heroes free. Keep him alive and
queue armies, not raids.