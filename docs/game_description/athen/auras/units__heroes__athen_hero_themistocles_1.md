# units/heroes/athen_hero_themistocles_1

Athenian-specific aura of 0 A.D. 0.28.0 — only the athenians can have it. See `docs/game_description/athen/auras/README.md` for the method; shared auras are documented in `docs/game_description/generic/auras/`.

Data file: `simulation/data/auras/units/heroes/athen_hero_themistocles_1.json`.

## Basic stats

- **Name:** Naval Preparation
- **Type:** global
- **Affects:** Ship
- **Description:** Ships −50% metal cost, construction time, and +15% movement speed.
- **Modifications:**
  - ×0.5 Cost/BuildTime
  - ×0.5 Cost/Resources/metal
  - ×1.15 UnitMotion/WalkSpeed

## Athenian

- attached by `units/athen/hero_themistocles`

Note: Themistocles' navy aura — every own ship costs half the metal and
builds in half the time, and moves +15% faster, map-wide. Paired with
`arsenal_philon` (+1 HP/s warship regen) and the reforms' dock-trained
marines, a Themistocles-led Athens fields the cheapest, fastest,
self-repairing navy in the game. The pick when the map is water-heavy.
