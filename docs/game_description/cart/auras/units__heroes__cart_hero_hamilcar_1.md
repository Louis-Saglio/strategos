# units/heroes/cart_hero_hamilcar_1

Carthaginian-specific aura of 0 A.D. 0.28.0 — only the carthaginians can have it. See `docs/game_description/cart/auras/README.md` for the method; shared auras are documented in `docs/game_description/generic/auras/`.

Data file: `simulation/data/auras/units/heroes/cart_hero_hamilcar_1.json`.

## Basic stats

- **Name:** Lightning General
- **Type:** range
- **Radius:** 60 m
- **Affects:** Soldier, Siege
- **Description:** Soldiers and Siege Engines +15% movement speed.
- **Modifications:**
  - ×1.15 UnitMotion/WalkSpeed

## Carthaginian

- attached by `units/cart/hero_hamilcar`

Note: a speed aura for the whole army around Hamilcar — useful for marching on an enemy base, repositioning siege engines and chasing down raiders. It stacks with the civ bonus "Numidian Cavalry" on the cavalry javelineers (walk 17.82 × 1.15 ≈ 20.5 m/s).
