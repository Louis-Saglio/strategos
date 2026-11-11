# units/heroes/ptol_hero_ptolemy_i_2

Ptolemaic-specific aura of 0 A.D. 0.28.0 — only the ptolemies can have it. See `docs/game_description/ptol/auras/README.md` for the method; shared auras are documented in `docs/game_description/generic/auras/`.

Data file: `simulation/data/auras/units/heroes/ptol_hero_ptolemy_i_2.json`.

## Basic stats

- **Name:** Mercenary Patron
- **Type:** global
- **Affects:** Mercenary
- **Description:** Mercenaries −35% resource costs.
- **Modifications:**
  - ×0.65 Cost/Resources/food
  - ×0.65 Cost/Resources/wood
  - ×0.65 Cost/Resources/stone
  - ×0.65 Cost/Resources/metal

## Ptolemaic

- attached by `units/ptol/hero_ptolemy_i`

Note: a **global** aura — while Ptolemy I lives, every own
`Mercenary`-class unit costs 35% less on all resources. For the
metal-paid infantry mercs that means 60 → 39 metal (Thureos Spearman and
Gallic Swordsman); the cavalry mercs (90 metal + 20 food) drop to 58.5
metal + 13 food. This is the economic heart of the Ptolemaic army: pick
Ptolemy I first when you plan to buy mercenaries, and the whole hireling
roster becomes a bargain.
