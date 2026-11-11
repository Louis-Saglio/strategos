# champion_chariot

Trained by **4** civilisations. Generic (non-civ-specific) unit of 0 A.D. 0.28.0 — see `docs/game_description/generic/units/README.md` for the method.

Generic stats resolved from the shared template `simulation/templates/template_unit_champion_cavalry` (deepest template common to all civilisation variants; variants may override, see below).

## Guide

A champion-tier ranged cavalry unit trained at the stable by brit, maur, pers and sele. Every variant pairs a pierce ranged attack (30 m javelin for brit, 60 m bow for the others, preferred Human) with a Capture attack (strength 3.5, range 4 m) and high mobility (run ~24–25 m/s), so it suits fast harassment of units and structure capture. It is a costly, metal-heavy investment (150–180 food, 80–100 wood, 100–120 metal, 25–30 s), and with only 1 hack armor in every variant it is fragile in melee, so avoid committed close combat.

## Basic stats

- **Generic name:** Champion Cavalry
- **Health:** 240 HP
- **Armor:** 5 hack / 5 pierce / 20 crush
- **Attack:** Capture — strength 3.5 — range 4 m — repeat 1 s — restricted Field Palisade Wall
- **Speed:** walk 18 m/s, run 25.2 m/s
- **Vision:** 80 m
- **Cost:** 150 food, 80 wood, 100 metal
- **Build time:** 25 s
- **Population:** 1
- **Classes:** Unit Organic ConquestCritical Human FastMoving
- **Visible classes:** Soldier Champion Cavalry

## Civilisations that can train it

- **brit** — `units/brit/champion_chariot` (stable)
- **maur** — `units/maur/champion_chariot` (stable)
- **pers** — `units/pers/champion_chariot` (stable)
- **sele** — `units/sele/champion_chariot` (stable)

## Civilisation-specific overrides

These civilisations override the generic stats above (only differing values are listed):

- **brit** — `units/brit/champion_chariot`
  - health 300 HP
  - armor 1 hack / 5 pierce / 20 crush
  - Capture — strength 3.5 — range 4 m — repeat 1 s — restricted Field Palisade Wall
  - Ranged "Javelin" — damage 36 pierce — range 30 m — prepare 0.4 s — repeat 1.5 s — preferred Human
  - cost 180 food, 100 wood, 120 metal
  - build time 30 s
- **maur** — `units/maur/champion_chariot`
  - health 300 HP
  - armor 1 hack / 5 pierce / 20 crush
  - Capture — strength 3.5 — range 4 m — repeat 1 s — restricted Field Palisade Wall
  - Ranged "Bow" — damage 15 pierce — range 60 m — prepare 0.8 s — repeat 1.25 s — preferred Human
  - walk 17 m/s
  - run 23.8 m/s
  - cost 180 food, 100 wood, 120 metal
  - build time 30 s
- **pers** — `units/pers/champion_chariot`
  - health 300 HP
  - armor 1 hack / 5 pierce / 20 crush
  - Capture — strength 3.5 — range 4 m — repeat 1 s — restricted Field Palisade Wall
  - Ranged "Bow" — damage 15 pierce — range 60 m — prepare 0.8 s — repeat 1.25 s — preferred Human
  - walk 17 m/s
  - run 23.8 m/s
  - cost 180 food, 100 wood, 120 metal
  - build time 30 s
- **sele** — `units/sele/champion_chariot`
  - health 300 HP
  - armor 1 hack / 5 pierce / 20 crush
  - Capture — strength 3.5 — range 4 m — repeat 1 s — restricted Field Palisade Wall
  - Ranged "Bow" — damage 15 pierce — range 60 m — prepare 0.8 s — repeat 1.25 s — preferred Human
  - walk 17 m/s
  - run 23.8 m/s
  - cost 180 food, 100 wood, 120 metal
  - build time 30 s
