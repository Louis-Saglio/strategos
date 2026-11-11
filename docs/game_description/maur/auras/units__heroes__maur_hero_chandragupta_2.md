# units/heroes/maur_hero_chandragupta_2

Mauryan-specific aura of 0 A.D. 0.28.0 — only the mauryas can have it. See `docs/game_description/maur/auras/README.md` for the method; shared auras are documented in `docs/game_description/generic/auras/`.

Data file: `simulation/data/auras/units/heroes/maur_hero_chandragupta_2.json`.

## Basic stats

- **Name:** Elephant Corps
- **Type:** global
- **Affects:** Elephant
- **Description:** Elephants +15% attack rate, +10% movement speed.
- **Modifications:**
  - ×0.85 Attack/Melee/RepeatTime
  - ×0.85 Attack/Ranged/RepeatTime
  - ×1.1 UnitMotion/WalkSpeed

## Mauryan

- attached by `units/maur/hero_chandragupta`

Note: the Mauryan elephant buff — **global**: every own elephant
(citizen Elephant Archers, champion war elephants, the hero himself)
attacks 15% faster and walks 10% faster while Chandragupta lives, with
no positioning requirement. A repeat-time ×0.85 is a +17.6% damage
output; stacked on the Elephant Archers' 1 s bow repeat, it turns a
herd of them into the game's densest mobile archery.
