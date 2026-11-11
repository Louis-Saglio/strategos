# cavalry_spearman_merc_b

Trained by **2** civilisations. Generic (non-civ-specific) unit of 0 A.D. 0.28.0 — see `docs/game_description/generic/units/README.md` for the method.

Generic stats resolved from the shared template `simulation/templates/template_unit_cavalry_melee_spearman` (deepest template common to all civilisation variants; variants may override, see below).

## Guide

A mercenary cavalry spearman available to Ptolemies and Seleucids, trained at the Military Colony rather than the Civic Centre. It is the anti-cavalry choice among cavalry: the Spear attack carries a documented 1.75× bonus vs Cavalry, and its speed (run 25.2 m/s) lets it intercept or raid. The civilisation variants cost 20 food + 90 metal — the citizen cavalry's wood (and most of its food) replaced by metal — so it is metal-intensive, a premium unit that is hard to mass, and mercenaries promote automatically (the rank upgrades require 0 XP). Like all mercenaries it **cannot gather** (the mercenary mixin disables ResourceGatherer), unlike the citizen cavalry it replaces.

## Basic stats

- **Generic name:** Cavalry Spearman
- **Health:** 160 HP
- **Armor:** 3 hack / 3 pierce / 15 crush
- **Attack:** Capture — strength 1.75 — range 4 m — repeat 1 s — restricted Field Palisade Wall
- **Attack:** Melee "Spear" — damage 6 hack + 5.5 pierce — range 4 m — prepare 0.625 s — repeat 1.25 s — bonus 1.75× vs Cavalry — preferred Unit+!Ship
- **Speed:** walk 18 m/s, run 25.2 m/s
- **Vision:** 80 m
- **Cost:** 100 food, 50 wood
- **Build time:** 15 s
- **Population:** 1
- **Gather:** rates: food: meat 5 /s
- **Gather:** capacity: 20 food
- **Classes:** Unit Organic ConquestCritical Human FastMoving CitizenSoldier
- **Visible classes:** Citizen Soldier Cavalry Melee Spearman
- **Rank:** Basic

## Civilisations that can train it

- **ptol** — `units/ptol/cavalry_spearman_merc_b` (military_colony)
- **sele** — `units/sele/cavalry_spearman_merc_b` (military_colony)

## Ranks

### Advanced — `units/{civ}/cavalry_spearman_merc_a`
Requires 300 XP.
- Health: ×1.25 → 200 HP
- Melee attack damage: ×1.1 → hack 6.6 + pierce 6.05
- Capture strength: +0.7 → 2.45
- Build time: ×1.2 → 18 s
- Gather base speed: ×0.7 → 0.7
- Loot: ×1.2

### Elite — `units/{civ}/cavalry_spearman_merc_e`
Requires 300 XP.
- Health: ×1.25 (total ×1.56) → 250 HP
- Melee attack damage: ×1.1 (total ×1.21) → hack 7.26 + pierce 6.66
- Capture strength: +0.8 (total +1.5) → 3.25
- Build time: ×1.2 (total ×1.44) → 21.6 s
- Gather base speed: ×0.7 (total ×0.49) → 0.49
- Loot: ×1.2 (total ×1.44)

- Note: mercenary variants promote at 0 XP (the auto-researched `upgrade_rank_advanced_mercenary` tech replaces RequiredXp with 0).


## Civilisation-specific overrides

These civilisations override the generic stats above (only differing values are listed):

- **ptol** — `units/ptol/cavalry_spearman_merc_b`
  - Capture — strength 1.75 — range 4 m — repeat 1 s — restricted Field Palisade Wall
  - Melee "Spear" — damage 6.6 hack + 6.05 pierce — range 4 m — prepare 0.625 s — repeat 1.25 s — bonus 1.75× vs Cavalry — preferred Unit+!Ship
  - cost 20 food, 90 metal
  - build time 10.5 s
  - no gathering (ResourceGatherer disabled)
- **sele** — `units/sele/cavalry_spearman_merc_b`
  - Capture — strength 1.75 — range 4 m — repeat 1 s — restricted Field Palisade Wall
  - Melee "Spear" — damage 6.6 hack + 6.05 pierce — range 4 m — prepare 0.625 s — repeat 1.25 s — bonus 1.75× vs Cavalry — preferred Unit+!Ship
  - cost 20 food, 90 metal
  - build time 10.5 s
  - no gathering (ResourceGatherer disabled)
