# siege_oxybeles_packed

Trained by **4** civilisations. Generic (non-civ-specific) unit of 0 A.D. 0.28.0 — see `docs/game_description/generic/units/README.md` for the method.

Generic stats resolved from the shared template `simulation/templates/template_unit_siege_boltshooter` (deepest template common to all civilisation variants; variants may override, see below).

## Guide

The Bolt Shooter is the mobile anti-personnel artillery piece, trained at the arsenal by athen, cart, mace and spart. Its role is killing infantry at range: a 240-pierce bolt every 6 s at 80 m, preferring Human targets, makes it devastating against dense infantry but useless up close (15 m minimum range, 200 HP, slow 6.75 m/s speed). This is the packed variant — it must unpack to fire and pack (5 s) to move, so it needs escort and time to deploy. At 250 wood + 250 metal (metal being a scarce, premium resource) and 2 population it is a serious investment; train it only for a siege force with melee protection in front.

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

## Civilisations that can train it

- **athen** — `units/athen/siege_oxybeles_packed` (arsenal)
- **cart** — `units/cart/siege_oxybeles_packed` (arsenal)
- **mace** — `units/mace/siege_oxybeles_packed` (arsenal)
- **spart** — `units/spart/siege_oxybeles_packed` (arsenal)
