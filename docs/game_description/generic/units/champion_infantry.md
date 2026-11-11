# champion_infantry

Trained by **3** civilisations. Generic (non-civ-specific) unit of 0 A.D. 0.28.0 — see `docs/game_description/generic/units/README.md` for the method.

Generic stats resolved from the shared template `simulation/templates/template_unit_champion_infantry_spearman` (deepest template common to all civilisation variants; variants may override, see below).

## Guide

An elite anti-cavalry spearman: its melee attack carries a 2.5× bonus vs Cavalry, and at 200 HP with 6/6/20 armor it is far tougher than citizen-soldier spearmen. Train it when you face cavalry or need a durable front line, but mind the cost — 80 metal per unit is a premium resource investment, making it expensive to mass. It also has a Capture attack (strength 5) restricted to Field/Palisade/Wall targets. Where it is trained depends on the civilisation: gymnasium (athen), temple (cart), or barracks (pers), with the pers variant being a cheaper but weaker version (120 HP, 50/30/50 cost).

## Basic stats

- **Generic name:** Champion Spearman
- **Health:** 200 HP
- **Armor:** 6 hack / 6 pierce / 20 crush
- **Attack:** Capture — strength 5 — range 4 m — repeat 1 s — restricted Field Palisade Wall
- **Attack:** Melee "Spear" — damage 10 hack + 8.5 pierce — range 4 m — prepare 0.5 s — repeat 1 s — bonus 2.5× vs Cavalry — preferred Unit+!Ship
- **Speed:** walk 9.5 m/s, run 15.86 m/s
- **Vision:** 80 m
- **Cost:** 80 food, 60 wood, 80 metal
- **Build time:** 20 s
- **Population:** 1
- **Classes:** Unit Organic ConquestCritical Human
- **Visible classes:** Soldier Champion Infantry Melee Spearman

## Civilisations that can train it

- **athen** — `units/athen/champion_infantry` (gymnasium)
- **cart** — `units/cart/champion_infantry` (temple)
- **pers** — `units/pers/champion_infantry` (barracks)

## Civilisation-specific overrides

These civilisations override the generic stats above (only differing values are listed):

- **athen** — `units/athen/champion_infantry`
  - build time 15 s
- **cart** — `units/cart/champion_infantry`
  - build time 15 s
- **pers** — `units/pers/champion_infantry`
  - health 120 HP
  - armor 4 hack / 5 pierce / 20 crush
  - Capture — strength 5 — range 4 m — repeat 1 s — restricted Field Palisade Wall
  - Melee "Spear" — damage 8.5 hack + 7.225 pierce — range 4 m — prepare 0.5 s — repeat 1 s — bonus 2.5× vs Cavalry — preferred Unit+!Ship
  - cost 50 food, 30 wood, 50 metal
