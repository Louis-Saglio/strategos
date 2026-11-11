# champion_cavalry

Trained by **10** civilisations. Generic (non-civ-specific) unit of 0 A.D. 0.28.0 — see `docs/game_description/generic/units/README.md` for the method.

Generic stats resolved from the shared template `simulation/templates/template_unit_champion_cavalry` (deepest template common to all civilisation variants; variants may override, see below).

## Guide

Champion Cavalry is an elite fast unit for the late game: it is a Champion-class Soldier trained at the stable (temple for cart, great_hall for germ), not a citizen-soldier, so it fights but does not gather. Its very high speed (run 25.2 m/s), 80 m vision make it suited to raiding, flanking and chasing down fleeing units. Every variant also carries a Capture attack (strength 3.5, range 4 m), so it doubles as a fast capture unit against buildings; most variants add a spear attack with a 1.75× bonus vs Cavalry, making it a counter to enemy cavalry. The cost is heavy (150 food, 80 wood, 100 metal), so it is a metal-intensive, premium unit best reserved for when the economy can support it.

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

- **cart** — `units/cart/champion_cavalry` (temple)
- **gaul** — `units/gaul/champion_cavalry` (stable)
- **germ** — `units/germ/champion_cavalry` (great_hall)
- **iber** — `units/iber/champion_cavalry` (stable)
- **kush** — `units/kush/champion_cavalry` (stable)
- **mace** — `units/mace/champion_cavalry` (stable)
- **pers** — `units/pers/champion_cavalry` (stable)
- **ptol** — `units/ptol/champion_cavalry` (stable)
- **rome** — `units/rome/champion_cavalry` (stable)
- **sele** — `units/sele/champion_cavalry` (stable)

## Civilisation-specific overrides

These civilisations override the generic stats above (only differing values are listed):

- **cart** — `units/cart/champion_cavalry`
  - health 260 HP
  - armor 5 hack / 6 pierce / 20 crush
  - Capture — strength 3.5 — range 4 m — repeat 1 s — restricted Field Palisade Wall
  - Melee "Spear" — damage 12 hack + 10 pierce — range 4 m — prepare 0.5 s — repeat 1.25 s — bonus 1.75× vs Cavalry — preferred Unit+!Ship
  - build time 18.75 s
- **gaul** — `units/gaul/champion_cavalry`
  - health 260 HP
  - armor 5 hack / 6 pierce / 20 crush
  - Capture — strength 3.5 — range 4 m — repeat 1 s — restricted Field Palisade Wall
  - Melee "Spear" — damage 12 hack + 10 pierce — range 4 m — prepare 0.5 s — repeat 1.25 s — bonus 1.75× vs Cavalry — preferred Unit+!Ship
- **germ** — `units/germ/champion_cavalry`
  - health 260 HP
  - armor 6 hack / 5 pierce / 20 crush
  - Capture — strength 3.5 — range 4 m — repeat 1 s — restricted Field Palisade Wall
  - Melee "Sword" — damage 18 hack — range 4 m — prepare 0.375 s — repeat 0.75 s — preferred Unit+!Ship
  - build time 18.75 s
- **iber** — `units/iber/champion_cavalry`
  - armor 3 hack / 3 pierce / 20 crush
  - Capture — strength 3.5 — range 4 m — repeat 1 s — restricted Field Palisade Wall
  - Ranged "Javelin" — damage 25 pierce — range 30 m — prepare 0.4 s — repeat 1.5 s — preferred Human
  - the javelin applies a Burning status: +2 fire damage every 3 s for 9 s, stacking
  - walk 16.2 m/s
  - run 22.68 m/s
- **kush** — `units/kush/champion_cavalry`
  - health 260 HP
  - armor 5 hack / 6 pierce / 20 crush
  - Capture — strength 3.5 — range 4 m — repeat 1 s — restricted Field Palisade Wall
  - Melee "Spear" — damage 12 hack + 10 pierce — range 4 m — prepare 0.5 s — repeat 1.25 s — bonus 1.75× vs Cavalry — preferred Unit+!Ship
- **mace** — `units/mace/champion_cavalry`
  - health 260 HP
  - armor 5 hack / 6 pierce / 20 crush
  - Capture — strength 3.5 — range 4 m — repeat 1 s — restricted Field Palisade Wall
  - Melee "Spear" — damage 12 hack + 10 pierce — range 4 m — prepare 0.5 s — repeat 1.25 s — bonus 1.75× vs Cavalry — preferred Unit+!Ship
- **pers** — `units/pers/champion_cavalry`
  - health 260 HP
  - armor 8 hack / 9 pierce / 20 crush
  - Capture — strength 3.5 — range 4 m — repeat 1 s — restricted Field Palisade Wall
  - Melee "Spear" — damage 12 hack + 10 pierce — range 7 m — prepare 0.5 s — repeat 1.25 s — bonus 1.75× vs Cavalry — preferred Unit+!Ship
  - walk 14.4 m/s
  - run 20.16 m/s
  - cost 150 food, 80 wood, 110 metal
- **ptol** — `units/ptol/champion_cavalry`
  - health 260 HP
  - armor 5 hack / 6 pierce / 20 crush
  - Capture — strength 3.5 — range 4 m — repeat 1 s — restricted Field Palisade Wall
  - Melee "Spear" — damage 12 hack + 10 pierce — range 4 m — prepare 0.5 s — repeat 1.25 s — bonus 1.75× vs Cavalry — preferred Unit+!Ship
- **rome** — `units/rome/champion_cavalry`
  - health 260 HP
  - armor 6 hack / 5 pierce / 20 crush
  - Capture — strength 3.5 — range 4 m — repeat 1 s — restricted Field Palisade Wall
  - Melee "Sword" — damage 18 hack — range 4 m — prepare 0.375 s — repeat 0.75 s — preferred Unit+!Ship
- **sele** — `units/sele/champion_cavalry`
  - health 260 HP
  - armor 8 hack / 9 pierce / 20 crush
  - Capture — strength 3.5 — range 4 m — repeat 1 s — restricted Field Palisade Wall
  - Melee "Spear" — damage 12 hack + 10 pierce — range 7 m — prepare 0.5 s — repeat 1.25 s — bonus 1.75× vs Cavalry — preferred Unit+!Ship
  - walk 14.4 m/s
  - run 20.16 m/s
  - cost 150 food, 80 wood, 110 metal
