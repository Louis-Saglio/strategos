# siege_onager_packed

Roman-specific unit of 0 A.D. 0.28.0 — only the romans can train it. See `docs/game_description/rome/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/rome/siege_onager_packed` (full roman template chain).

## Guide

The Roman siege catapult (onager) is the late-game building destroyer: 40 crush damage per hit plus a 160-crush splash (4 m radius, no friendly fire) at 60 m range. It is trained at the army camp or arsenal (300 wood plus 150 stone, a scarce resource, and 3 population) and requires the `roman_reforms` technology, so it is a deliberate investment, not an early unit. This packed form moves; it must unpack (`units/rome/siege_onager_unpacked`) to fire, and it cannot shoot targets closer than 20 m, so it needs an escort. For a bot, build a few once reforms are researched to crack enemy civic centres and fortifications that normal units grind down slowly.

## Basic stats

- **Generic name:** Siege Catapult
- **Health:** 250 HP
- **Armor:** 6 hack / 25 pierce / 5 crush
- **Attack:** Ranged "Stone" — damage 40 crush — range 60 m — prepare 1 s — repeat 5 s
- **Speed:** walk 7.2 m/s, run 7.2 m/s
- **Vision:** 95 m
- **Cost:** 300 wood, 150 stone
- **Build time:** 25 s
- **Population:** 3
- **Classes:** Unit ConquestCritical
- **Visible classes:** Siege Ranged StoneThrower

## Trained by

- **rome** — `units/rome/siege_onager_packed` (army_camp, arsenal)
