# hero_caratacos

British-specific unit of 0 A.D. 0.28.0 — only the britons can train it. See `docs/game_description/brit/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/brit/hero_caratacos` (full british template chain).

## Guide

Caratacus (Caratacos) is the British infantry-swordsman hero — 1000 HP
with 12/12/25 armor and a 26-hack sword. His aura, "Guerrilla Chief", is
**global**: every own soldier and siege engine on the map gets +1 to all
three armor types and +15% walk speed while he lives. Stacked on the
Woad Warriors civ bonus, the whole British army becomes the fastest
skirmish force in the game — javelineers that out-walk enemy infantry,
raiders that outrun pursuit. Pick him for map-wide harassment and
multi-front play; unlike the other two heroes his value does not depend
on where he stands, which also means he is the safest hero to keep at
home once the aura is all you need. 0 population, City phase, trained
at the **fortress**, subject to the global limit of 1 hero alive at a
time.

## Basic stats

- **Generic name:** Caratacus
- **Health:** 1000 HP
- **Armor:** 12 hack / 12 pierce / 25 crush
- **Attack:** Capture — strength 10 — range 4 m — repeat 1 s — restricted Field Palisade Wall
- **Attack:** Melee "Sword" — damage 26 hack — range 3 m — prepare 0.375 s — repeat 0.75 s — preferred Unit+!Ship
- **Speed:** walk 9 m/s, run 15.03 m/s
- **Vision:** 100 m
- **Cost:** 200 food, 150 wood, 200 metal
- **Build time:** 50 s
- **Population:** 0
- **Classes:** Unit Organic ConquestCritical Human
- **Visible classes:** Soldier Hero Infantry Melee Swordsman

## Trained by

- **brit** — `units/brit/hero_caratacos` (fortress)
