# ship_fishing

Trained by **15** civilisations. Generic (non-civ-specific) unit of 0 A.D. 0.28.0 — see `docs/game_description/generic/units/README.md` for the method.

Generic stats resolved from the shared template `simulation/templates/template_unit_ship_fishing` (deepest template common to all civilisation variants; variants may override, see below).

## Guide

The Fishing Boat is the naval food gatherer: trained at the dock for only 50 wood and 15 s, it harvests fish at 1.8 food/s with a 40 food capacity. Train it whenever fish are available near a dock to add a food income line that does not compete with land farms. It is not a warship — its "Harpoon" attack (10 hack, 5 m range) is restricted to sea creatures, so keep it away from enemy military ships. It can also pick up floating treasure.

## Basic stats

- **Generic name:** Fishing Boat
- **Health:** 220 HP
- **Armor:** 5 hack / 3 pierce / 3 crush
- **Attack:** Melee "Harpoon" — damage 10 hack — range 5 m — prepare 0.5 s — repeat 1 s — restricted !SeaCreature
- **Speed:** walk 9.9 m/s, run 16.53 m/s
- **Vision:** 30 m
- **Cost:** 50 wood
- **Build time:** 15 s
- **Population:** 1
- **Gather:** rates: food: fish 1.8 /s
- **Gather:** capacity: 40 food
- **Classes:** Unit
- **Visible classes:** Ship FishingBoat

## Civilisations that can train it

- **athen** — `units/athen/ship_fishing` (dock)
- **brit** — `units/brit/ship_fishing` (crannog, dock)
- **cart** — `units/cart/ship_fishing` (dock)
- **gaul** — `units/gaul/ship_fishing` (dock)
- **germ** — `units/germ/ship_fishing` (dock)
- **han** — `units/han/ship_fishing` (dock)
- **iber** — `units/iber/ship_fishing` (dock)
- **kush** — `units/kush/ship_fishing` (dock)
- **mace** — `units/mace/ship_fishing` (dock)
- **maur** — `units/maur/ship_fishing` (dock)
- **pers** — `units/pers/ship_fishing` (dock)
- **ptol** — `units/ptol/ship_fishing` (dock)
- **rome** — `units/rome/ship_fishing` (dock)
- **sele** — `units/sele/ship_fishing` (dock)
- **spart** — `units/spart/ship_fishing` (dock)
