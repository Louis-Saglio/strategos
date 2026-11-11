# civil_centre

Buildable by **15** civilisations. Generic (non-civ-specific) building of 0 A.D. 0.28.0 — see `docs/game_description/generic/buildings/README.md` for the method.

Generic stats resolved from the shared template `simulation/templates/template_structure_civic_civil_centre` (deepest template common to all civilisation variants; variants may override, see below).

## Guide

The Civil Centre is the faction's core structure: it is a territory root (140 m radius) that claims land, provides +20 population, and trains the basic `support_civilian` workers plus basic infantry and cavalry in most civilisations. It is also a defensive asset — 3000 HP, high hack/pierce armor, a 60 m ranged attack, and 20 garrison slots that heal occupants — making it the natural rally point and refuge. Building additional Civil Centres (300 wood, 300 stone, 250 metal — the stone and metal make each one a premium investment, hard to mass) is the documented way to expand territory and population beyond the starting base; it is buildable in own or neutral territory, min 200 m from another one.

## Basic stats

- **Generic name:** Civic Center
- **Health:** 3000 HP
- **Armor:** 29 hack / 35 pierce / 3 crush
- **Attack:** Ranged "Bow" — damage 8 pierce — range 60 m — prepare 0.4 s — repeat 4 s — preferred Human
- **Cost:** 300 wood, 300 stone, 250 metal
- **Build time:** 500 s
- **Population bonus:** +20
- **Territory influence:** radius 140 m, weight 10000, territory root
- **Garrison:** 20 slots (+1/s heal)
- **Vision:** 90 m
- **Capture points:** 2500
- **Build territory:** own neutral
- **Placement:** land
- **Build distance:** min 200 m from CivilCentre
- **Trains:** units/{native}/support_civilian
- **Classes:** Structure ConquestCritical CivCentre
- **Visible classes:** Civic Defensive CivilCentre
- **Footprint:** Square 32 m × 32 m (height 8 m)
- **Obstruction:** Static 30 m × 30 m

## Civilisations that can build it

- **athen** — `structures/athen/civil_centre`
- **brit** — `structures/brit/civil_centre`
- **cart** — `structures/cart/civil_centre`
- **gaul** — `structures/gaul/civil_centre`
- **germ** — `structures/germ/civil_centre`
- **han** — `structures/han/civil_centre`
- **iber** — `structures/iber/civil_centre`
- **kush** — `structures/kush/civil_centre`
- **mace** — `structures/mace/civil_centre`
- **maur** — `structures/maur/civil_centre`
- **pers** — `structures/pers/civil_centre`
- **ptol** — `structures/ptol/civil_centre`
- **rome** — `structures/rome/civil_centre`
- **sele** — `structures/sele/civil_centre`
- **spart** — `structures/spart/civil_centre`

## Civilisation-specific overrides

These civilisations override the generic stats above (only differing values are listed):

- **athen** — `structures/athen/civil_centre`
  - trains units/{native}/support_civilian units/{civ}/infantry_spearman_b units/{civ}/infantry_slinger_b units/{civ}/cavalry_javelineer_b
- **brit** — `structures/brit/civil_centre`
  - trains units/{native}/support_civilian units/{civ}/infantry_spearman_b units/{civ}/infantry_slinger_b units/{civ}/cavalry_javelineer_b
  - footprint Circle r 15 m
- **cart** — `structures/cart/civil_centre`
  - trains units/{native}/support_civilian units/{civ}/infantry_spearman_b units/{civ}/infantry_archer_b units/{civ}/cavalry_javelineer_b
- **gaul** — `structures/gaul/civil_centre`
  - trains units/{native}/support_civilian units/{civ}/infantry_spearman_b units/{civ}/infantry_javelineer_b units/{civ}/cavalry_javelineer_b
  - footprint Square 28 m × 28 m
- **germ** — `structures/germ/civil_centre`
  - trains units/{native}/support_civilian units/{civ}/infantry_spearman_b units/{civ}/infantry_slinger_b units/{civ}/cavalry_javelineer_b units/{civ}/support_wagon
  - footprint Square 33 m × 29 m
- **han** — `structures/han/civil_centre`
  - trains units/{native}/support_civilian units/{civ}/infantry_spearman_b units/{civ}/infantry_crossbowman_b units/{civ}/cavalry_swordsman_b
  - footprint Square 43 m × 35 m
- **iber** — `structures/iber/civil_centre`
  - trains units/{native}/support_civilian units/{civ}/infantry_swordsman_b units/{civ}/infantry_javelineer_b units/{civ}/cavalry_javelineer_b
- **kush** — `structures/kush/civil_centre`
  - trains units/{native}/support_civilian units/{civ}/infantry_spearman_b units/{civ}/infantry_archer_b units/{civ}/cavalry_javelineer_b
  - footprint Square 32 m × 32 m (height 10 m)
- **mace** — `structures/mace/civil_centre`
  - trains units/{native}/support_civilian units/{civ}/infantry_pikeman_b units/{civ}/infantry_javelineer_b units/{civ}/cavalry_spearman_b
- **maur** — `structures/maur/civil_centre`
  - trains units/{native}/support_civilian units/{civ}/infantry_spearman_b units/{civ}/infantry_archer_b units/{civ}/cavalry_javelineer_b units/{civ}/support_elephant
  - footprint Square 40 m × 34 m
- **pers** — `structures/pers/civil_centre`
  - trains units/{native}/support_civilian units/{civ}/infantry_spearman_b units/{civ}/infantry_archer_b units/{civ}/cavalry_javelineer_b units/{civ}/cavalry_axeman_b units/{civ}/cavalry_spearman_b units/{civ}/cavalry_archer_b
  - footprint Square 40 m × 24 m (height 18 m)
- **ptol** — `structures/ptol/civil_centre`
  - trains units/{native}/support_civilian units/{civ}/infantry_pikeman_b units/{civ}/infantry_slinger_b units/{civ}/cavalry_archer_b
  - footprint Square 41 m × 33 m
- **rome** — `structures/rome/civil_centre`
  - trains units/{native}/support_civilian units/{civ}/infantry_swordsman_b units/{civ}/infantry_javelineer_b units/{civ}/infantry_spearman_conscript units/{civ}/cavalry_spearman_b
  - footprint Square 40 m × 40 m
- **sele** — `structures/sele/civil_centre`
  - trains units/{native}/support_civilian units/{civ}/infantry_spearman_b units/{civ}/infantry_javelineer_b units/{civ}/cavalry_javelineer_b units/{civ}/hero_seleucus_i units/{civ}/hero_antiochus_iii units/{civ}/hero_antiochus_iv
- **spart** — `structures/spart/civil_centre`
  - trains units/{native}/support_civilian units/{civ}/infantry_spearman_b units/{civ}/infantry_javelineer_b units/{civ}/cavalry_javelineer_b
