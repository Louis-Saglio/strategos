# support_wagon

Germanic-specific unit of 0 A.D. 0.28.0 — only the germans can train it. See `docs/game_description/germ/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/germ/support_wagon` (full germ template chain).

## Guide

The Supply Wagon is germ's mobile dropsite for all four resources, costing only 25 food and 50 wood (12 s, 1 pop) — cheap in the abundant resources — and trained at the civil centre and the encampments; one is also part of the starting entities. Because it is a unit and not a structure it ignores the "own territory" restriction of storehouses and farmsteads, so a bot can drive wagons to a distant forest or mine, or into neutral land, to shorten gather trips, then walk them on when the patch runs out. It is fragile and slow (200 HP, 4/4/10 armor, walk 5 m/s) and has no attack, so it needs protection. The Wagon Trains technology (400 wood + 100 metal, Town phase, researched at the encampments) lowers a wagon's promotion requirement to 0 XP, so all wagons — existing and new — turn at once into house wagons that each give +5 population (they still occupy 1 pop), making wagons a cheap, mobile supplement to houses. Without that tech a wagon promotes only at 5000 XP.

## Basic stats

- **Generic name:** Mobile Dropsite
- **Specific name:** Wagnaz
- **Health:** 200 HP
- **Armor:** 4 hack / 4 pierce / 10 crush
- **Speed:** walk 5 m/s, run 8.35 m/s
- **Vision:** 30 m
- **Cost:** 25 food, 50 wood
- **Build time:** 12 s
- **Population:** 1
- **Loot:** 10 food, 10 wood, 10 stone, 10 metal, 100 xp
- **Classes:** Unit Organic ConquestCritical Human DropsiteFood DropsiteWood DropsiteMetal DropsiteStone
- **Visible classes:** Support Wagon Dropsite

## Ranks

- Promotes at 5000 XP to `units/germ/support_wagon_house` (a different unit, no rank).

## Trained by

- **germ** — `units/germ/support_wagon` (civil_centre, encampment, encampment_fortified)
