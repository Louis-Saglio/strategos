# units/heroes/cart_hero_hamilcar_2

Carthaginian-specific aura of 0 A.D. 0.28.0 — only the carthaginians can have it. See `docs/game_description/cart/auras/README.md` for the method; shared auras are documented in `docs/game_description/generic/auras/`.

Data file: `simulation/data/auras/units/heroes/cart_hero_hamilcar_2.json`.

## Basic stats

- **Name:** Subduer of Mercenaries
- **Type:** range
- **Radius:** 60 m
- **Affects:** Mercenary
- **Affected players:** Enemy
- **Description:** Enemy Mercenaries −20% melee and ranged attack damage.
- **Modifications:**
  - ×0.8 Attack/Melee/Damage/Hack
  - ×0.8 Attack/Melee/Damage/Pierce
  - ×0.8 Attack/Melee/Damage/Crush
  - ×0.8 Attack/Ranged/Damage/Hack
  - ×0.8 Attack/Ranged/Damage/Pierce
  - ×0.8 Attack/Ranged/Damage/Crush

## Carthaginian

- attached by `units/cart/hero_hamilcar`

Note: Hamilcar carries this alongside his "Lightning General" speed aura. It debuffs every enemy Mercenary-class unit within 60 m — a direct counter to mercenary-heavy civilisations (Carthage itself, Ptolemies, Seleucids, Kush) whose armies are built from metal-paid soldiers.
