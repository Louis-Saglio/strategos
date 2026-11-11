# units/heroes/maur_hero_ashoka

Mauryan-specific aura of 0 A.D. 0.28.0 — only the mauryas can have it. See `docs/game_description/maur/auras/README.md` for the method; shared auras are documented in `docs/game_description/generic/auras/`.

Data file: `simulation/data/auras/units/heroes/maur_hero_ashoka.json`.

## Basic stats

- **Name:** Buddhism
- **Type:** global
- **Affects:** Temple
- **Description:** Temples −50% resource costs and build time. Temple technologies −50% resource costs and research time.
- **Modifications:**
  - ×0.5 Cost/BuildTime
  - ×0.5 Cost/Resources/wood
  - ×0.5 Cost/Resources/stone
  - ×0.5 Researcher/TechCostMultiplier/food
  - ×0.5 Researcher/TechCostMultiplier/wood
  - ×0.5 Researcher/TechCostMultiplier/stone
  - ×0.5 Researcher/TechCostMultiplier/metal
  - ×0.5 Researcher/TechCostMultiplier/time

## Mauryan

- attached by `units/maur/hero_ashoka`

Note: identical to the Mauryan teambonus but **own-only** and carried by
the hero — while Ashoka lives, the Mauryas' temples are half-price and
temple research is half-price. Since the teambonus already applies the
same ×0.5 to the Mauryas' own temples, this aura adds nothing for the
Mauryan player itself (allies get the discount via the teambonus); its
real significance is that Ashoka is also the `Ashoka`-class gate for the
Edict Pillars.
