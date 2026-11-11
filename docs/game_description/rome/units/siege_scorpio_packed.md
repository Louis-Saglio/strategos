# siege_scorpio_packed

Roman-specific unit of 0 A.D. 0.28.0 — only the romans can train it. See `docs/game_description/rome/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/rome/siege_scorpio_packed` (full roman template chain).

## Guide

The Scorpio is the Romans' bolt shooter, a long-range anti-personnel siege weapon trained at the arsenal for 250 wood and 250 metal — metal-intensive, so a premium unit that is hard to mass. Its 240 pierce damage at 80 m range (preferred target Human) makes it a backline support unit for killing infantry, not a building destroyer. This is the packed state: it can move but must unpack for 5 s into `siege_scorpio_unpacked` before it can fire, so position it ahead of an engagement. At 200 HP with only 5 crush armor it is fragile and needs escorts.

## Basic stats

- **Generic name:** Bolt Shooter
- **Health:** 200 HP
- **Armor:** 6 hack / 25 pierce / 5 crush
- **Attack:** Ranged "Bolt" — damage 240 pierce — range 80 m — prepare 2 s — repeat 6 s — preferred Human
- **Speed:** walk 6.75 m/s, run 6.75 m/s
- **Vision:** 100 m
- **Cost:** 250 wood, 250 metal
- **Build time:** 20 s
- **Population:** 2
- **Classes:** Unit ConquestCritical
- **Visible classes:** Siege Ranged BoltShooter

## Trained by

- **rome** — `units/rome/siege_scorpio_packed` (arsenal)
