# siege_ballista_packed

Trained by **2** civilisations. Generic (non-civ-specific) unit of 0 A.D. 0.28.0 — see `docs/game_description/generic/units/README.md` for the method.

Generic stats resolved from the shared template `simulation/templates/template_unit_siege_stonethrower` (deepest template common to all civilisation variants; variants may override, see below).

## Guide

A long-range anti-structure siege weapon: its 230 crush damage at 85 m range, with Structure as the preferred target, makes it the tool for demolishing enemy buildings from outside their effective defensive fire. It is trained at the arsenal (cart and rome only) for 400 wood and 250 stone — stone being a scarce, premium resource — so it is a deliberate late-game investment rather than a mass unit. This is the packed form — it moves at 7.2 m/s but must unpack into `siege_ballista_unpacked` to fire (packing takes 5 s), so it needs escort and protection; at 375 HP with only 6 hack armor it falls quickly to melee.

## Basic stats

- **Generic name:** Siege Catapult
- **Health:** 375 HP
- **Armor:** 6 hack / 25 pierce / 5 crush
- **Attack:** Ranged "Stone" — damage 230 crush — range 85 m — prepare 3 s — repeat 7 s — preferred Structure
- **Speed:** walk 7.2 m/s, run 7.2 m/s
- **Vision:** 120 m
- **Cost:** 400 wood, 250 stone
- **Build time:** 25 s
- **Population:** 3
- **Classes:** Unit ConquestCritical
- **Visible classes:** Siege Ranged StoneThrower

## Civilisations that can train it

- **cart** — `units/cart/siege_ballista_packed` (arsenal)
- **rome** — `units/rome/siege_ballista_packed` (arsenal)
