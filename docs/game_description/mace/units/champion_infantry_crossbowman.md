# champion_infantry_crossbowman

Macedonian-specific unit of 0 A.D. 0.28.0 — only the macedonians can train it. See `docs/game_description/mace/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/mace/champion_infantry_crossbowman` (full mace template chain).

## Guide

The Gastraphetophoros is Macedonia's champion ranged infantry, trained at the arsenal from the City phase for 80 food, 60 wood and 80 metal (20 s) — metal makes it a premium unit rather than something to mass. Its crossbow bolt deals 30 pierce every 3 s (10 damage per second) at 60 m range, hitting far harder per shot than mace's mercenary archers (7.9 pierce per 1.25 s) but at a slow rate, so it is best behind a pike or Shield Bearer line. With 120 HP and 3 hack / 3 pierce / 20 crush armor it is fragile for a champion, and it uses the skirmish formation. It does not gather and has a capture attack (strength 5) like other champions. Philip II's aura (+20% damage for champions within 60 m) raises its bolt to 36 pierce.

## Basic stats

- **Generic name:** Champion Infantry Crossbowman
- **Specific name:** Gastraphetophoros
- **Health:** 120 HP
- **Armor:** 3 hack / 3 pierce / 20 crush
- **Attack:** Capture — strength 5 — range 4 m — repeat 1 s — restricted Field Palisade Wall
- **Attack:** Ranged "Crossbow" — damage 30 pierce — range 60 m — prepare 0.2 s — repeat 3 s — spread 0.8 — preferred Human
- **Speed:** walk 9.6 m/s, run 16.03 m/s
- **Vision:** 80 m
- **Cost:** 80 food, 60 wood, 80 metal
- **Build time:** 20 s
- **Population:** 1
- **Requirements:** phase_city
- **Auras:** units/ram_garrison
- **Loot:** 8 food, 6 wood, 8 metal, 150 xp
- **Classes:** Unit Organic ConquestCritical Human
- **Visible classes:** Soldier Champion Infantry Ranged Crossbowman

## Trained by

- **mace** — `units/mace/champion_infantry_crossbowman` (arsenal, range (only when pre-placed on a skirmish map))
