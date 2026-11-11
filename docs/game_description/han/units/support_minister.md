# support_minister

Han-specific unit of 0 A.D. 0.28.0 — only the han can train it. See `docs/game_description/han/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/han/support_minister` (full han template chain).

## Guide

The Imperial Minister (Qīng) is han's unique support unit: it has no damage attack (only capture) and neither gathers nor builds, but two 20 m auras improve every Worker nearby — "Minister over the Masses" +10% gathering rate and "Building Programs" +10% build rate. Both auras are non-stackable, so overlapping ministers add nothing and they should be spread over separate worker clusters. It is trained only at the Imperial Ministry from the Village phase for 100 food and 100 metal (15 s, 1 population), limited to 9 alive, and one comes with the start; the 100 metal is a premium cost, so place them where they cover the most workers (the farm ring around a farmstead, a busy woodline). With 50 HP, 2/2/6 armor and a passive stance they must be kept out of fights; `civil_service_01` halves their training time and `civil_service_02` gives +50% health (the two are a one-time pair choice).

## Basic stats

- **Generic name:** Imperial Minister
- **Specific name:** Qīng
- **Health:** 50 HP
- **Armor:** 2 hack / 2 pierce / 6 crush
- **Attack:** Capture — strength 4 — range 4 m — repeat 1 s — restricted Field Palisade Wall
- **Speed:** walk 9 m/s, run 15.03 m/s
- **Vision:** 40 m
- **Cost:** 100 food, 100 metal
- **Build time:** 15 s
- **Population:** 1
- **Requirements:** phase_village
- **Auras:** units/han_minister_gathering units/han_minister_building
- **Loot:** 10 food, 10 metal, 150 xp
- **Classes:** Unit Organic ConquestCritical Human
- **Visible classes:** Support Minister

## Trained by

- **han** — `units/han/support_minister` (ministry)
