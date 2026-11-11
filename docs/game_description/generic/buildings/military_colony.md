# military_colony

Buildable by **2** civilisations. Generic (non-civ-specific) building of 0 A.D. 0.28.0 — see `docs/game_description/generic/buildings/README.md` for the method.

Generic stats resolved from the shared template `simulation/templates/template_structure_civic_civil_centre_military_colony` (deepest template common to all civilisation variants; variants may override, see below).

## Guide

The Military Colony is a compact expansion structure for the Ptolemaic and Seleucid civilisations: a small Civic Centre (`Colony` class) that can be built in own **or neutral** territory, at least 120 m from an existing Civil Centre. Its territory root (radius 75 m, weight 10000) plants a new border far from your main base, and it adds +20 population, trains civilians (and mercenary infantry/cavalry for ptol/sele), and defends itself with a ranged attack. Available from the town phase for 200 wood, 200 stone and 150 metal — a premium investment in scarce stone and metal — it is the tool to claim distant territory and forward training capacity without building a full Civic Centre.

## Basic stats

- **Generic name:** Military Colony
- **Health:** 2000 HP
- **Armor:** 29 hack / 35 pierce / 3 crush
- **Attack:** Ranged "Bow" — damage 8 pierce — range 60 m — prepare 0.4 s — repeat 4 s — preferred Human
- **Cost:** 200 wood, 200 stone, 150 metal
- **Build time:** 300 s
- **Population bonus:** +20
- **Territory influence:** radius 75 m, weight 10000, territory root
- **Garrison:** 20 slots (+1/s heal)
- **Vision:** 90 m
- **Capture points:** 2500
- **Build territory:** own neutral
- **Placement:** land
- **Build distance:** min 120 m from CivilCentre
- **Requirements:** phase_town
- **Trains:** units/{native}/support_civilian
- **Classes:** Structure ConquestCritical CivCentre
- **Visible classes:** Civic Defensive CivilCentre Colony
- **Footprint:** Square 32 m × 32 m (height 8 m)
- **Obstruction:** Static 30 m × 30 m

## Civilisations that can build it

- **ptol** — `structures/ptol/military_colony`
- **sele** — `structures/sele/military_colony`

## Civilisation-specific overrides

These civilisations override the generic stats above (only differing values are listed):

- **ptol** — `structures/ptol/military_colony`
  - trains units/{civ}/infantry_spearman_merc_b units/{civ}/infantry_swordsman_merc_b units/{civ}/cavalry_spearman_merc_b units/{civ}/cavalry_javelineer_merc_b
  - footprint Square 34 m × 33 m (height 12 m)
- **sele** — `structures/sele/military_colony`
  - trains units/{native}/support_civilian units/{civ}/infantry_swordsman_merc_b units/{civ}/infantry_archer_merc_b units/{civ}/cavalry_spearman_merc_b
  - footprint Square 31 m × 31 m
