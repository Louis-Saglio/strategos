# fortress

Buildable by **15** civilisations. Generic (non-civ-specific) building of 0 A.D. 0.28.0 — see `docs/game_description/generic/buildings/README.md` for the method.

Generic stats resolved from the shared template `simulation/templates/template_structure_military_fortress` (deepest template common to all civilisation variants; variants may override, see below).

## Guide

The Fortress is the city-phase (phase_city) heavy military structure: a premium long-term investment at 300 wood / 600 stone — stone is a scarce resource, so it is hard to mass — and 450 s build time that anchors both defense and territorial expansion (80 m territory radius with weight 40000). It is a defensive strongpoint in its own right — 5200 HP, high hack/pierce armor, a 60 m bow attack preferring Human targets, 20 garrison slots, and garrisoned Soldiers adding extra arrows. Beyond defense, it is the production and research hub of the late game: it trains heroes (and for some civs champion units, e.g. Rome's centurion) and researches top-tier military technologies.

## Basic stats

- **Generic name:** Fortress
- **Health:** 5200 HP
- **Armor:** 24 hack / 35 pierce / 3 crush
- **Attack:** Ranged "Bow" — damage 10 pierce — range 60 m — prepare 0.4 s — repeat 3.5 s — preferred Human
- **Cost:** 300 wood, 600 stone
- **Build time:** 450 s
- **Territory influence:** radius 80 m, weight 40000
- **Garrison:** 20 slots
- **Vision:** 90 m
- **Capture points:** 4000
- **Build territory:** own
- **Placement:** land
- **Build distance:** min 80 m from Fortress
- **Requirements:** phase_city
- **Classes:** Structure ConquestCritical GarrisonFortress
- **Visible classes:** Military Defensive Fortress
- **Footprint:** Square 30 m × 30 m (height 8 m)
- **Obstruction:** Static 25 m × 25 m

## Civilisations that can build it

- **athen** — `structures/athen/fortress`
- **brit** — `structures/brit/fortress`
- **cart** — `structures/cart/fortress`
- **gaul** — `structures/gaul/fortress`
- **germ** — `structures/germ/fortress`
- **han** — `structures/han/fortress`
- **iber** — `structures/iber/fortress`
- **kush** — `structures/kush/fortress`
- **mace** — `structures/mace/fortress`
- **maur** — `structures/maur/fortress`
- **pers** — `structures/pers/fortress`
- **ptol** — `structures/ptol/fortress`
- **rome** — `structures/rome/fortress`
- **sele** — `structures/sele/fortress`
- **spart** — `structures/spart/fortress`

## Civilisation-specific overrides

These civilisations override the generic stats above (only differing values are listed):

- **athen** — `structures/athen/fortress`
  - footprint Square 26 m × 28 m
- **brit** — `structures/brit/fortress`
  - trains units/{civ}/hero_boudicca units/{civ}/hero_caratacos units/{civ}/hero_cunobelin
  - footprint Circle r 17 m (height 18 m)
- **cart** — `structures/cart/fortress`
  - trains units/{civ}/hero_hamilcar units/{civ}/hero_hannibal units/{civ}/hero_maharbal
  - footprint Square 30 m × 32 m
- **germ** — `structures/germ/fortress`
  - trains units/{civ}/hero_boiorix units/{civ}/hero_teutobod units/{civ}/hero_lugius
  - footprint Square 30 m × 30 m (height 20 m)
- **han** — `structures/han/fortress`
  - trains units/{civ}/hero_han_xin_horse units/{civ}/hero_liu_bang_horse units/{civ}/hero_wei_qing_chariot
  - footprint Square 32 m × 32 m
- **iber** — `structures/iber/fortress`
  - trains units/{civ}/hero_caros units/{civ}/hero_indibil units/{civ}/hero_viriato
- **kush** — `structures/kush/fortress`
  - trains units/{civ}/hero_nastasen units/{civ}/hero_amanirenas units/{civ}/hero_arakamani
- **mace** — `structures/mace/fortress`
  - trains units/{civ}/hero_philip_ii units/{civ}/hero_alexander_iii units/{civ}/hero_demetrius_i
  - footprint Square 26 m × 28 m
- **ptol** — `structures/ptol/fortress`
  - footprint Square 26 m × 28 m
- **rome** — `structures/rome/fortress`
  - trains units/{civ}/hero_marcellus units/{civ}/hero_maximus units/{civ}/hero_scipio units/{civ}/champion_infantry_swordsman_centurion
- **sele** — `structures/sele/fortress`
  - footprint Square 26 m × 28 m
- **spart** — `structures/spart/fortress`
  - footprint Square 26 m × 28 m
