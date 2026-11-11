# champion_elephant

Trained by **6** civilisations. Generic (non-civ-specific) unit of 0 A.D. 0.28.0 — see `docs/game_description/generic/units/README.md` for the method.

Generic stats resolved from the shared template `simulation/templates/template_unit_champion_elephant_melee` (deepest template common to all civilisation variants; variants may override, see below).

## Guide

The War Elephant is a heavy champion melee unit trained at the elephant stable by six civilisations (cart, kush, maur, pers, ptol, sele). Its role is to soak and deal damage: 1000 HP with high armor (especially 20 crush) plus a 30 hack + 45 crush attack every 1.5 s that prefers Unit targets, making it effective against both soldiers and structures. It is expensive to field — 300 food, 200 metal, 3 population, 36 s build time — and metal-intensive, so a premium unit: train it as a late-game assault core rather than in numbers.

## Basic stats

- **Generic name:** War Elephant
- **Health:** 1000 HP
- **Armor:** 5 hack / 7 pierce / 20 crush
- **Attack:** Melee "Trunk" — damage 30 hack + 45 crush — range 5 m — prepare 0.75 s — repeat 1.5 s — preferred Unit+!Ship
- **Speed:** walk 9 m/s, run 15.03 m/s
- **Vision:** 100 m
- **Cost:** 300 food, 200 metal
- **Build time:** 36 s
- **Population:** 3
- **Classes:** Unit Organic ConquestCritical Human
- **Visible classes:** Soldier Champion Elephant Melee

## Civilisations that can train it

- **cart** — `units/cart/champion_elephant` (elephant_stable)
- **kush** — `units/kush/champion_elephant` (elephant_stable)
- **maur** — `units/maur/champion_elephant` (elephant_stable)
- **pers** — `units/pers/champion_elephant` (elephant_stable)
- **ptol** — `units/ptol/champion_elephant` (elephant_stable)
- **sele** — `units/sele/champion_elephant` (elephant_stable)

## Civilisation-specific overrides

These civilisations override the generic stats above (only differing values are listed):

- **cart** — `units/cart/champion_elephant`
  - health 900 HP
  - Melee "Trunk" — damage 27 hack + 40.5 crush — range 5 m — prepare 0.75 s — repeat 1.5 s — preferred Unit+!Ship
  - cost 270 food, 180 metal
  - build time 32.4 s
- **kush** — `units/kush/champion_elephant`
  - health 900 HP
  - Melee "Trunk" — damage 27 hack + 40.5 crush — range 5 m — prepare 0.75 s — repeat 1.5 s — preferred Unit+!Ship
  - cost 270 food, 180 metal
  - build time 32.4 s
- **maur** — `units/maur/champion_elephant`
  - health 1100 HP
  - Melee "Trunk" — damage 33 hack + 49.5 crush — range 5 m — prepare 0.75 s — repeat 1.5 s — preferred Unit+!Ship
  - cost 330 food, 220 metal
  - build time 39.6 s
- **pers** — `units/pers/champion_elephant`
  - health 1100 HP
  - Melee "Trunk" — damage 33 hack + 49.5 crush — range 5 m — prepare 0.75 s — repeat 1.5 s — preferred Unit+!Ship
  - cost 330 food, 220 metal
  - build time 39.6 s
- **ptol** — `units/ptol/champion_elephant`
  - health 900 HP
  - Melee "Trunk" — damage 27 hack + 40.5 crush — range 5 m — prepare 0.75 s — repeat 1.5 s — preferred Unit+!Ship
  - cost 270 food, 180 metal
  - build time 32.4 s
- **sele** — `units/sele/champion_elephant`
  - health 1100 HP
  - Melee "Trunk" — damage 33 hack + 49.5 crush — range 5 m — prepare 0.75 s — repeat 1.5 s — preferred Unit+!Ship
  - cost 330 food, 220 metal
  - build time 39.6 s
