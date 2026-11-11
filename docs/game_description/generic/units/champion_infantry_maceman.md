# champion_infantry_maceman

Trained by **2** civilisations. Generic (non-civ-specific) unit of 0 A.D. 0.28.0 — see `docs/game_description/generic/units/README.md` for the method.

Generic stats resolved from the shared template `simulation/templates/template_unit` (deepest template common to all civilisation variants; variants may override, see below).

Note: the civilisation variants of this unit share no concrete common template — the values below are the abstract `template_unit` base; see the overrides for the actual stats.

## Guide

A barracks-trained champion melee infantry whose role is assaulting structures: its Mace attack is dominated by crush damage (5 hack + 7 crush for `germ`, 10 hack + 14 crush for `maur`) and it carries an active Capture ability with strength 2.5–5. The very high crush armor (15 for `germ`, 20 for `maur`) makes it especially resistant to siege and other crush attackers, while the 80 m vision lets it serve as a close-range spotter. Train it when pushing against enemy buildings; note the `maur` variant is metal-intensive (80 food, 60 wood, 80 metal), making it a premium investment that is hard to mass, and requires the `unlock_champion_infantry` technology.

## Basic stats

- **Generic name:** Unit
- **Health:** 100 HP
- **Armor:** 1 hack / 1 pierce / 1 crush
- **Speed:** walk 9 m/s, run 15.03 m/s
- **Vision:** 12 m
- **Build time:** 1 s
- **Population:** 1
- **Classes:** Unit Organic ConquestCritical

## Civilisations that can train it

- **germ** — `units/germ/champion_infantry_maceman` (barracks)
- **maur** — `units/maur/champion_infantry_maceman` (barracks)

## Civilisation-specific overrides

These civilisations override the generic stats above (only differing values are listed):

- **germ** — `units/germ/champion_infantry_maceman`
  - armor 1 hack / 2 pierce / 15 crush
  - Capture — strength 2.5 — range 4 m — repeat 1 s — restricted Field Palisade Wall
  - Melee "Mace" — damage 5 hack + 7 crush — range 3 m — prepare 0.5 s — repeat 1 s — preferred !Ship
  - walk 11.4 m/s
  - run 19.04 m/s
  - vision 80 m
  - cost 50 food, 30 wood, 20 stone
  - build time 10 s
- **maur** — `units/maur/champion_infantry_maceman`
  - health 200 HP
  - armor 5 hack / 6 pierce / 20 crush
  - Capture — strength 5 — range 4 m — repeat 1 s — restricted Field Palisade Wall
  - Melee "Mace" — damage 10 hack + 14 crush — range 3 m — prepare 0.5 s — repeat 1 s — preferred !Ship
  - walk 9.5 m/s
  - run 15.86 m/s
  - vision 80 m
  - cost 80 food, 60 wood, 80 metal
  - build time 20 s
