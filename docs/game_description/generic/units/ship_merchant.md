# ship_merchant

Trained by **15** civilisations. Generic (non-civ-specific) unit of 0 A.D. 0.28.0 — see `docs/game_description/generic/units/README.md` for the method.

Generic stats resolved from the shared template `simulation/templates/template_unit_ship_merchant` (deepest template common to all civilisation variants; variants may override, see below).

## Guide

The Merchantman is the economic ship of the game: it trades between docks to generate resources, with a base gain multiplier of 0.75 increased by +20% for each Trader garrisoned aboard (it can hold up to 15 Support/Cavalry/Relic units). It also gathers profitable aquatic treasures and improves sea trading at the Market. Trained at the dock for 100 metal — a scarce premium resource, so a real investment that is hard to mass — and available from the Town phase, it is a pure economy unit — it has no attack and its default stance is passive — so build it only when the map has usable water routes, and expect it to need protection rather than to fight. Its Bribable class means it can share vision if bribed by an enemy.

## Basic stats

- **Generic name:** Merchantman
- **Health:** 240 HP
- **Armor:** 5 hack / 10 pierce / 3 crush
- **Speed:** walk 12.15 m/s, run 20.29 m/s
- **Vision:** 50 m
- **Cost:** 100 metal
- **Build time:** 20 s
- **Population:** 1
- **Classes:** Unit
- **Visible classes:** Ship Trader Bribable

## Civilisations that can train it

- **athen** — `units/athen/ship_merchant` (dock)
- **brit** — `units/brit/ship_merchant` (crannog, dock)
- **cart** — `units/cart/ship_merchant` (dock)
- **gaul** — `units/gaul/ship_merchant` (dock)
- **germ** — `units/germ/ship_merchant` (dock)
- **han** — `units/han/ship_merchant` (dock)
- **iber** — `units/iber/ship_merchant` (dock)
- **kush** — `units/kush/ship_merchant` (dock)
- **mace** — `units/mace/ship_merchant` (dock)
- **maur** — `units/maur/ship_merchant` (dock)
- **pers** — `units/pers/ship_merchant` (dock)
- **ptol** — `units/ptol/ship_merchant` (dock)
- **rome** — `units/rome/ship_merchant` (dock)
- **sele** — `units/sele/ship_merchant` (dock)
- **spart** — `units/spart/ship_merchant` (dock)
