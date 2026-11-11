# units/heroes/iber_hero_viriato_1

Iberian-specific aura of 0 A.D. 0.28.0 — only the iberians can have it. See `docs/game_description/iber/auras/README.md` for the method; shared auras are documented in `docs/game_description/generic/auras/`.

Data file: `simulation/data/auras/units/heroes/iber_hero_viriato_1.json`.

## Basic stats

- **Name:** Guerrilla Tactics
- **Type:** range
- **Radius:** 60 m
- **Affects:** Soldier
- **Description:** Soldiers +20% movement speed.
- **Modifications:**
  - ×1.2 UnitMotion/WalkSpeed

## Iberian

- attached by `units/iber/hero_viriato`

Note: Viriato's speed aura — every own soldier within 60 m moves +20%
faster (walk speed; run speed scales with it). On the already-mobile
Iberian roster (javelineer cavalry at 16.2 m/s walk, fast infantry) this
makes raiding parties nearly uncatchable, and it doubles as a
disengage/reposition tool in pitched fights. Combine with his "Swag"
loot aura for hit-and-run looting.
