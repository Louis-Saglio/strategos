# units/heroes/cart_hero_hannibal

Carthaginian-specific aura of 0 A.D. 0.28.0 — only the carthaginians can have it. See `docs/game_description/cart/auras/README.md` for the method; shared auras are documented in `docs/game_description/generic/auras/`.

Data file: `simulation/data/auras/units/heroes/cart_hero_hannibal.json`.

## Basic stats

- **Name:** Tactician
- **Type:** range
- **Radius:** 60 m
- **Affects:** Soldier, Siege
- **Affected players:** Ally
- **Description:** Own and Allied Soldiers and Siege Engines +1 capture attack strength, +20% melee and ranged attack damage.
- **Modifications:**
  - +1 Attack/Capture/Capture
  - ×1.2 Attack/Melee/Damage/Hack
  - ×1.2 Attack/Melee/Damage/Pierce
  - ×1.2 Attack/Melee/Damage/Crush
  - ×1.2 Attack/Ranged/Damage/Hack
  - ×1.2 Attack/Ranged/Damage/Pierce
  - ×1.2 Attack/Ranged/Damage/Crush

## Carthaginian

- attached by `units/cart/hero_hannibal`

Note: the strongest of the Carthaginian hero auras — a damage and capture boost for the whole army (including allies) around the elephant hero. It stacks with Hamilcar's speed aura and Maharbal's cavalry damage aura, so the three heroes together make a powerful deathball core.
