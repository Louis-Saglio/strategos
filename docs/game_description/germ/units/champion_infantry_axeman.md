# champion_infantry_axeman

Germanic-specific unit of 0 A.D. 0.28.0 — only the germans can train it. See `docs/game_description/germ/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/germ/champion_infantry_axeman` (full germ template chain).

## Guide

The Cimbri Raider is germ's champion infantry, available from the Town phase (no unlock technology) at the great hall, whereas the generic `unlock_champion_*` techs need the City phase. It costs 60 food, 60 wood and 100 metal with a 15 s training time: the food and wood are cheap, but the metal is the scarce resource, so the army size is capped by metal income rather than by food or wood. It is a fast, light shock unit — 160 HP, 6/5/20 armor, 18 hack + 6 crush axe attack every second at 3 m range, walk 11.4 m/s (run 19.04) — and is classed Guerilla, so use it to run down ranged units and raid rather than to hold a line against heavy armor. The "Stolen Arms" team bonus (swordsmen and axemen −5 metal for every ally) lowers its effective cost to 95 metal. Like Teutobod it carries the Battering Team aura: garrisoned in a covered ram it adds +0.15 m/s to that ram's speed per unit.

## Basic stats

- **Generic name:** Cimbri Raider
- **Specific name:** Slōgijanōz
- **Health:** 160 HP
- **Armor:** 6 hack / 5 pierce / 20 crush
- **Attack:** Capture — strength 5 — range 4 m — repeat 1 s — restricted Field Palisade Wall
- **Attack:** Melee "Axe" — damage 18 hack + 6 crush — range 3 m — prepare 0.5 s — repeat 1 s — preferred Unit+!Ship
- **Speed:** walk 11.4 m/s, run 19.04 m/s
- **Vision:** 80 m
- **Cost:** 60 food, 60 wood, 100 metal
- **Build time:** 15 s
- **Population:** 1
- **Requirements:** phase_town
- **Auras:** units/ram_garrison
- **Loot:** 6 food, 6 wood, 10 metal, 150 xp
- **Classes:** Unit Organic ConquestCritical Human
- **Visible classes:** Soldier Champion Infantry Melee Axeman Guerilla

## Trained by

- **germ** — `units/germ/champion_infantry_axeman` (great_hall)
