# champion_infantry_swordsman

Trained by **7** civilisations. Generic (non-civ-specific) unit of 0 A.D. 0.28.0 — see `docs/game_description/generic/units/README.md` for the method.

Generic stats resolved from the shared template `simulation/templates/template_unit_champion_infantry_swordsman` (deepest template common to all civilisation variants; variants may override, see below).

## Guide

A champion-tier melee unit trained at the barracks: for a bot, this is a late-game damage dealer, not a citizen-soldier. At 80 food / 60 wood / 80 metal, it is metal-intensive — a premium, hard-to-mass investment — but packs 16 hack damage every 0.75 s against Units (not Ships) with 200 HP and solid 6/6/20 armor. Its capture attack is restricted to fields, palisades and walls, so rely on other units to take down buildings. No attack bonuses against specific classes, so it wins fights by raw stats rather than by countering a particular enemy type.

## Basic stats

- **Generic name:** Champion Swordsman
- **Health:** 200 HP
- **Armor:** 6 hack / 6 pierce / 20 crush
- **Attack:** Capture — strength 5 — range 4 m — repeat 1 s — restricted Field Palisade Wall
- **Attack:** Melee "Sword" — damage 16 hack — range 3 m — prepare 0.375 s — repeat 0.75 s — preferred Unit+!Ship
- **Speed:** walk 9.5 m/s, run 15.86 m/s
- **Vision:** 80 m
- **Cost:** 80 food, 60 wood, 80 metal
- **Build time:** 20 s
- **Population:** 1
- **Classes:** Unit Organic ConquestCritical Human
- **Visible classes:** Soldier Champion Infantry Melee Swordsman

## Civilisations that can train it

- **brit** — `units/brit/champion_infantry_swordsman` (barracks)
- **gaul** — `units/gaul/champion_infantry_swordsman` (barracks)
- **iber** — `units/iber/champion_infantry_swordsman` (barracks)
- **mace** — `units/mace/champion_infantry_swordsman` (barracks)
- **rome** — `units/rome/champion_infantry_swordsman` (barracks)
- **sele** — `units/sele/champion_infantry_swordsman` (barracks)
- **spart** — `units/spart/champion_infantry_swordsman` (barracks)

## Ranks

### Basic — `units/{civ}/champion_infantry_swordsman_first`
Requires 3000 XP.
- No stat changes (identity/visuals only).

- Note: **spart**'s variant is trained at **Elite** rank (already receives the rank techs in game).


## Civilisation-specific overrides

These civilisations override the generic stats above (only differing values are listed):

- **mace** — `units/mace/champion_infantry_swordsman`
  - Capture — strength 5 — range 4 m — repeat 1 s — restricted Field Palisade Wall
  - Melee "Rhomphaia" — damage 10 hack — range 5 m — prepare 0.5 s — repeat 1 s — preferred Unit+!Ship
- **spart** — `units/spart/champion_infantry_swordsman`
  - health 100 HP
  - armor 5 hack / 5 pierce / 15 crush
  - Capture — strength 2.5 — range 4 m — repeat 1 s — restricted Field Palisade Wall
  - Melee "Sword" — damage 9.5 hack — range 3 m — prepare 0.375 s — repeat 0.75 s — preferred Unit+!Ship
  - cost 50 food, 40 wood, 35 metal
  - build time 10 s
  - rates: food: fruit 0.5, grain 0.25, meat 1; wood: tree 0.75, ruins 5; stone: rock 0.5, ruins 2; metal: ore 0.5, ruins 2 /s
  - capacity: 10 food, 10 wood, 10 stone, 10 metal
