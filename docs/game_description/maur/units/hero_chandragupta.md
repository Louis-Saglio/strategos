# hero_chandragupta

Mauryan-specific unit of 0 A.D. 0.28.0 — only the mauryas can train it. See `docs/game_description/maur/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/maur/hero_chandragupta` (full maur template chain).

## Guide

Chandragupta Maurya is the Mauryan elephant hero — 1500 HP with 10/10/25
armor and the elephant trunk attack (60 hack + 90 crush every 1.5 s),
doubling as a siege engine. He carries **two** auras: "Empire Maker"
(own soldiers and elephants within 60 m +1 hack, pierce and crush armor)
and "Elephant Corps" (**global**: own elephants +15% attack rate — repeat
time ×0.85 — and +10% walk speed). The second aura is the Mauryan
deathball switch: it buffs the citizen Elephant Archers, the champion
war elephants and Chandragupta himself, map-wide, with no positioning
requirement. 0 population, 1 hero alive at a time, trained at the palace
(City phase).

## Basic stats

- **Generic name:** Chandragupta Maurya
- **Health:** 1500 HP
- **Armor:** 10 hack / 10 pierce / 25 crush
- **Attack:** Melee "Trunk" — damage 60 hack + 90 crush — range 5 m — prepare 0.75 s — repeat 1.5 s — preferred !Ship
- **Speed:** walk 9 m/s, run 15.03 m/s
- **Vision:** 100 m
- **Cost:** 600 food, 400 metal
- **Build time:** 50 s
- **Population:** 0
- **Classes:** Unit Organic ConquestCritical Human
- **Visible classes:** Soldier Hero Elephant Melee

## Trained by

- **maur** — `units/maur/hero_chandragupta` (palace)

