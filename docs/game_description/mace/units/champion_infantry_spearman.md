# champion_infantry_spearman

Macedonian-specific unit of 0 A.D. 0.28.0 — only the macedonians can train it. See `docs/game_description/mace/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/mace/champion_infantry_spearman` (full mace template chain).

## Guide

The Macedonian Shield Bearer (Hypaspist) is the civ's champion spear infantry, trained at the barracks once `unlock_champion_infantry` (the "Agēma" tech, 600 food, 60 s, City phase) has been researched. At 80 food, 60 wood and 80 metal and 20 s it is a metal-hungry premium unit — mass it only when the metal income supports it — and it does not gather, so it is a pure line-holder: 200 HP, 6 hack / 6 pierce / 20 crush armor and a 10 hack + 8.5 pierce spear (18.5 damage per second) with a 2.5× bonus against cavalry, so it also counters enemy horse. It uses the phalanx formation (hoplites only, 10+ members). It promotes at 2000 XP to the Silver Shield (`champion_infantry_spearman_02`: 220 HP and +10% hack/pierce damage), and the fortress tech `silvershields` (600 metal, 60 s) sets that XP requirement to 0, converting every Shield Bearer you own at once. Philip II's aura (+20% damage, +2 capture strength for champions within 60 m) stacks well with a block of these.

## Basic stats

- **Generic name:** Macedonian Shield Bearer
- **Specific name:** Hypaspistḗs
- **Health:** 200 HP
- **Armor:** 6 hack / 6 pierce / 20 crush
- **Attack:** Capture — strength 5 — range 4 m — repeat 1 s — restricted Field Palisade Wall
- **Attack:** Melee "Spear" — damage 10 hack + 8.5 pierce — range 4 m — prepare 0.5 s — repeat 1 s — bonus 2.5× vs Cavalry — preferred Unit+!Ship
- **Speed:** walk 9.5 m/s, run 15.86 m/s
- **Vision:** 80 m
- **Cost:** 80 food, 60 wood, 80 metal
- **Build time:** 20 s
- **Population:** 1
- **Requirements:** unlock_champion_infantry
- **Auras:** units/ram_garrison
- **Loot:** 8 food, 6 wood, 8 metal, 150 xp
- **Classes:** Unit Organic ConquestCritical Human
- **Visible classes:** Soldier Champion Infantry Melee Spearman

## Ranks

- Promotes at 2000 XP to `units/mace/champion_infantry_spearman_02` (a different unit, no rank).

## Trained by

- **mace** — `units/mace/champion_infantry_spearman` (barracks)
