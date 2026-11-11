# structures/iber_monument

Iberian-specific aura of 0 A.D. 0.28.0 — only the iberians can have it. See `docs/game_description/iber/auras/README.md` for the method; shared auras are documented in `docs/game_description/generic/auras/`.

Data file: `simulation/data/auras/structures/iber_monument.json`.

## Basic stats

- **Name:** Religious Fervor
- **Type:** range
- **Radius:** 50 m
- **Affects:** Soldier
- **Description:** Soldiers +20% melee and ranged attack damage.
- **Modifications:**
  - ×1.2 Attack/Melee/Damage/Hack
  - ×1.2 Attack/Melee/Damage/Pierce
  - ×1.2 Attack/Melee/Damage/Crush
  - ×1.2 Attack/Ranged/Damage/Hack
  - ×1.2 Attack/Ranged/Damage/Pierce
  - ×1.2 Attack/Ranged/Damage/Crush

## Iberian

- attached by `structures/iber/monument`

Note: the Revered Monument's combat aura — a +20% damage buff for every
own soldier within 50 m. Up to five monuments per player, 150 m apart,
so a defended front can be carpeted with overlapping +20% damage zones
at 100 stone + 100 metal each. The cheapest standing damage buff in the
game.
