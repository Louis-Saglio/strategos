# units/heroes/athen_hero_hippocrates_2

Athenian-specific aura of 0 A.D. 0.28.0 — only the athenians can have it. See `docs/game_description/athen/auras/README.md` for the method; shared auras are documented in `docs/game_description/generic/auras/`.

Data file: `simulation/data/auras/units/heroes/athen_hero_hippocrates_2.json`.

## Basic stats

- **Name:** Hippocratic Oath
- **Type:** global
- **Affects:** Healer !Hero
- **Affected players:** MutualAlly
- **Description:** Own and Allied Healers +3 healing effect.
- **Modifications:**
  - +3 Heal/Health

## Athenian

- attached by `units/athen/hero_hippocrates`

Note: a **global, team-wide** healing buff — every own and allied healer
unit (the `Healer` class, excluding heroes) heals +3 HP per tick: the
base healer's 5 HP/2 s becomes 8 (2.5 → 4 HP/s, +60%). In team games
Hippocrates is the best support hero pick in the game: he supercharges
every ally's healer corps while he lives.
