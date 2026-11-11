# siege_mangonel_packed

Han-specific unit of 0 A.D. 0.28.0 — only the han can train it. See `docs/game_description/han/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/han/siege_mangonel_packed` (full han template chain).

## Guide

The Mangonel (Pào) is han's stone-throwing siege engine, trained at the arsenal in the City phase for 400 wood and 250 stone (25 s, 3 population), so stone makes it a premium unit to build in small numbers. Its 230 crush shot (splash 120 crush within 1.5 m) at 85 m, 7 s repeat and a 26 m minimum range prefers Structures, making it han's long-range answer to towers, fortresses and civil centres (60–70 m ranges). At 375 HP with 6/25/5 armor it survives arrows but not melee, and it cannot hit anything close, so escort it. It is trained packed, must unpack to fire and re-pack to move (5 s; `siege_pack_unpack` cuts that by 40%); han's siege roster is only this, the ram and the siege tower.

## Basic stats

- **Generic name:** Mangonel
- **Specific name:** Pào
- **Health:** 375 HP
- **Armor:** 6 hack / 25 pierce / 5 crush
- **Attack:** Ranged "Stone" — damage 230 crush — range 85 m — min range 26 m — prepare 3 s — repeat 7 s — spread 3 — splash Circular 1.5 m 120 crush — preferred Structure
- **Speed:** walk 7.2 m/s, run 7.2 m/s
- **Vision:** 120 m
- **Cost:** 400 wood, 250 stone
- **Build time:** 25 s
- **Population:** 3
- **Requirements:** phase_city
- **Loot:** 80 wood, 50 stone, 250 xp
- **Classes:** Unit ConquestCritical
- **Visible classes:** Siege Ranged StoneThrower

## Trained by

- **han** — `units/han/siege_mangonel_packed` (arsenal)
