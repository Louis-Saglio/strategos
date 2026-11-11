# siege_ram_covered

Germanic-specific unit of 0 A.D. 0.28.0 — only the germans can train it. See `docs/game_description/germ/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/germ/siege_ram_covered` (full germ template chain).

## Guide

The Covered Gate Smasher is germ's city-phase siege ram, trained at the arsenal for 300 wood and 150 metal (30 s, 3 pop) — the wood is abundant but the metal makes each ram a premium purchase. Its 150 crush strike (1.5 s repeat, 6.5 m range, buildings only — it cannot hit fields or living units) and 400 HP with 35 pierce armor let it destroy fortified targets under tower and arrow fire, but its 7 hack and 5 crush armor mean melee units kill it quickly, so escort it. It is slower than the Log Ram (7.2 m/s) but can carry 10 Support or Infantry units: each garrisoned Cimbri Raider or Teutobod adds +0.15 m/s through the Battering Team aura. Germ's lighter Log Ram (200 wood + 75 metal, 20 s, 300 HP, 120 crush, 8.64 m/s, no garrison) is available from the Town phase at the great hall, so the covered ram is the heavier, more survivable late-game option.

## Basic stats

- **Generic name:** Covered Gate Smasher
- **Specific name:** Gataslahanaz
- **Health:** 400 HP
- **Armor:** 7 hack / 35 pierce / 5 crush
- **Attack:** Melee "Ram" — damage 150 crush — range 6.5 m — prepare 0.75 s — repeat 1.5 s — preferred Structure — restricted Field Organic
- **Speed:** walk 7.2 m/s, run 7.2 m/s
- **Vision:** 80 m
- **Cost:** 300 wood, 150 metal
- **Build time:** 30 s
- **Population:** 3
- **Garrison:** 10 slots — accepts Support Infantry
- **Requirements:** phase_city
- **Loot:** 60 wood, 30 metal, 200 xp
- **Classes:** Unit ConquestCritical
- **Visible classes:** Siege Melee Ram

## Trained by

- **germ** — `units/germ/siege_ram_covered` (arsenal)
