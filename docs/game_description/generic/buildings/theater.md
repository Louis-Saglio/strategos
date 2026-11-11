# theater

Buildable by **5** civilisations. Generic (non-civ-specific) building of 0 A.D. 0.28.0 — see `docs/game_description/generic/buildings/README.md` for the method.

Generic stats resolved from the shared template `simulation/templates/template_structure_special_theater` (deepest template common to all civilisation variants; variants may override, see below).

## Guide

The Theater is a City-phase territory-expansion building: it has a territory influence of radius 100 m / weight 40000 itself, and its global stackable aura "Hellenization" increases the territory influence radius of all your structures by +20%. It is a pure strategic investment — it trains no units and researches nothing, and costs 200 wood, 600 stone, 200 metal — a heavy premium investment, since stone and metal are scarce — plus a long 500 s build time, so build it only when pushing borders matters more than immediate military or economic spending. Its `BuildRestrictions` category "Theater" limits it to one per player, and it does not root new territory (`TerritoryInfluence/Root` is false), so it extends existing borders rather than founding new ones.

## Basic stats

- **Generic name:** Theater
- **Health:** 3000 HP
- **Armor:** 24 hack / 30 pierce / 3 crush
- **Cost:** 200 wood, 600 stone, 200 metal
- **Build time:** 500 s
- **Territory influence:** radius 100 m, weight 40000
- **Garrison:** 5 slots
- **Vision:** 40 m
- **Capture points:** 500
- **Build territory:** own
- **Placement:** land
- **Requirements:** phase_city
- **Classes:** Structure
- **Visible classes:** City Theater
- **Footprint:** Circle r 25 m (height 10 m)
- **Obstruction:** Static 40 m × 46 m

## Civilisations that can build it

- **athen** — `structures/athen/theater`
- **mace** — `structures/mace/theater`
- **ptol** — `structures/ptol/theater`
- **sele** — `structures/sele/theater`
- **spart** — `structures/spart/theater`
