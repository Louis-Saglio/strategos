# units/heroes/iber_hero_caros_2

Iberian-specific aura of 0 A.D. 0.28.0 — only the iberians can have it. See `docs/game_description/iber/auras/README.md` for the method; shared auras are documented in `docs/game_description/generic/auras/`.

Data file: `simulation/data/auras/units/heroes/iber_hero_caros_2.json`.

## Basic stats

- **Name:** Battle Fervor
- **Type:** range
- **Radius:** 50 m
- **Affects:** Soldier
- **Description:** Soldiers +1 crush, hack, pierce resistance.
- **Modifications:**
  - +1 Resistance/Entity/Damage/Hack
  - +1 Resistance/Entity/Damage/Pierce
  - +1 Resistance/Entity/Damage/Crush

## Iberian

- attached by `units/iber/hero_caros`

Note: Caros's field aura — every own soldier within 50 m gets +1 to all
three armor types. A flat +1 reads small, but against fast low-damage
attackers (slingers, archers, the 0.75 s sword repeat) it is a real
survivability boost for a whole army. Keep Caros with the main force
when he is not garrisoned in a tower.
