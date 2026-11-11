# units/heroes/brit_hero_cunobelin

British-specific aura of 0 A.D. 0.28.0 — only the britons can have it. See `docs/game_description/brit/auras/README.md` for the method; shared auras are documented in `docs/game_description/generic/auras/`.

Data file: `simulation/data/auras/units/heroes/brit_hero_cunobelin.json`.

## Basic stats

- **Name:** Britannorum Rex
- **Type:** range
- **Radius:** 30 m
- **Affects:** Human
- **Description:** Humans +0.8 health regeneration rate.
- **Modifications:**
  - +0.8 Health/RegenRate

## Britons

- attached by `units/brit/hero_cunobelin`

Note: a constant +0.8 HP/s regeneration for every `Human` unit within
30 m of Cunobeline — soldiers, workers **and war dogs** (dogs carry the
`Human` class). It is the British answer to the civ's weak healing
options (no temple heal upgrade beyond the generic line): a slow,
passive, cost-free top-up that keeps a raiding or siege force on its
feet between engagements. 0.8 HP/s is modest per unit (a 50 HP slinger
fully heals in ~62 s), but it is free, permanent and stacks with the
druid's actual healing. Keep Cunobeline embedded in the main force, not
raiding on his own.
