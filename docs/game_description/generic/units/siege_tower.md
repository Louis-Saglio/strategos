# siege_tower

Trained by **5** civilisations. Generic (non-civ-specific) unit of 0 A.D. 0.28.0 — see `docs/game_description/generic/units/README.md` for the method.

Generic stats resolved from the shared template `simulation/templates/template_unit_siege_tower` (deepest template common to all civilisation variants; variants may override, see below).

## Guide

Mobile siege platform for the late-game assault: it garrisons up to 20 units (Infantry add arrows, up to 10) to transport them safely and boost its own firepower, and its very high 50 pierce armor lets it soak arrow fire while approaching defenses. Its own bow attack (10 pierce + 2.5 crush, range 55 m) is secondary — it is not a building killer, so pair it with rams or catapults. Metal-intensive (500 wood, 300 metal, 3 population) and slow (6.3 m/s), so a premium investment: build it at the arsenal only when attacking fortified positions.

## Basic stats

- **Generic name:** Siege Tower
- **Health:** 500 HP
- **Armor:** 6 hack / 50 pierce / 5 crush
- **Attack:** Ranged "Bow" — damage 10 pierce + 2.5 crush — range 55 m — prepare 1.2 s — repeat 2.5 s — preferred Human
- **Speed:** walk 6.3 m/s, run 6.3 m/s
- **Vision:** 80 m
- **Cost:** 500 wood, 300 metal
- **Build time:** 40 s
- **Population:** 3
- **Classes:** Unit ConquestCritical
- **Visible classes:** Siege Ranged SiegeTower

## Civilisations that can train it

- **han** — `units/han/siege_tower` (arsenal)
- **kush** — `units/kush/siege_tower` (arsenal)
- **mace** — `units/mace/siege_tower` (arsenal)
- **ptol** — `units/ptol/siege_tower` (arsenal)
- **sele** — `units/sele/siege_tower` (arsenal)
