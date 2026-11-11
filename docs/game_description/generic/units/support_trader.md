# support_trader

Trained by **15** civilisations. Generic (non-civ-specific) unit of 0 A.D. 0.28.0 — see `docs/game_description/generic/units/README.md` for the method.

Generic stats resolved from the shared template `simulation/templates/template_unit_support_trader` (deepest template common to all civilisation variants; variants may override, see below).

## Guide

The Trader is a purely economic unit: it trades resources between your own markets and those of your allies, generating extra resources on each trip (template gain multiplier 0.75). Train it at the market once a trade route exists and the 100 food / 80 metal cost is affordable — the metal is a scarce, premium resource, so each Trader is an investment; it has no attack and only 100 HP with 1 armor in all types, so it cannot fight and relies on its speed (walk 9 m/s, run 15.03 m/s) and protected routes to survive. It is Bribable, meaning enemies can pay to share its vision, so undefended trade routes are an intelligence risk as well as an economic one.

## Basic stats

- **Generic name:** Trader
- **Health:** 100 HP
- **Armor:** 1 hack / 1 pierce / 1 crush
- **Speed:** walk 9 m/s, run 15.03 m/s
- **Vision:** 60 m
- **Cost:** 100 food, 80 metal
- **Build time:** 15 s
- **Population:** 1
- **Classes:** Unit Organic Human
- **Visible classes:** Support Trader Bribable

## Civilisations that can train it

- **athen** — `units/athen/support_trader` (market)
- **brit** — `units/brit/support_trader` (market)
- **cart** — `units/cart/support_trader` (market)
- **gaul** — `units/gaul/support_trader` (market)
- **germ** — `units/germ/support_trader` (market)
- **han** — `units/han/support_trader` (market)
- **iber** — `units/iber/support_trader` (market)
- **kush** — `units/kush/support_trader` (market)
- **mace** — `units/mace/support_trader` (market)
- **maur** — `units/maur/support_trader` (market)
- **pers** — `units/pers/support_trader` (market)
- **ptol** — `units/ptol/support_trader` (market)
- **rome** — `units/rome/support_trader` (market)
- **sele** — `units/sele/support_trader` (market)
- **spart** — `units/spart/support_trader` (market)
