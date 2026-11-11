# siege_ram

Trained by **15** civilisations. Generic (non-civ-specific) unit of 0 A.D. 0.28.0 — see `docs/game_description/generic/units/README.md` for the method.

Generic stats resolved from the shared template `simulation/templates/template_unit_siege_ram` (deepest template common to all civilisation variants; variants may override, see below).

## Guide

The ram is a dedicated anti-building unit: its 150 crush melee attack is restricted against Field and Organic targets, so it can only damage structures, which it prefers. Train it at the arsenal when the aim is to destroy enemy buildings (civic centres included) faster than citizen-soldiers can, noting its high 35 pierce armor against fort and tower fire. It is slow and costs 300 wood / 150 metal and 3 population, so the metal makes it a premium investment that is harder to mass. It cannot defend itself against units, so escort it.

## Basic stats

- **Generic name:** Battering Ram
- **Health:** 400 HP
- **Armor:** 7 hack / 35 pierce / 5 crush
- **Attack:** Melee "Ram" — damage 150 crush — range 6.5 m — prepare 0.75 s — repeat 1.5 s — preferred Structure — restricted Field Organic
- **Speed:** walk 7.2 m/s, run 7.2 m/s
- **Vision:** 80 m
- **Cost:** 300 wood, 150 metal
- **Build time:** 30 s
- **Population:** 3
- **Classes:** Unit ConquestCritical
- **Visible classes:** Siege Melee Ram

## Civilisations that can train it

- **athen** — `units/athen/siege_ram` (arsenal)
- **brit** — `units/brit/siege_ram` (arsenal)
- **cart** — `units/cart/siege_ram` (arsenal)
- **gaul** — `units/gaul/siege_ram` (arsenal)
- **germ** — `units/germ/siege_ram` (arsenal, great_hall)
- **han** — `units/han/siege_ram` (arsenal)
- **iber** — `units/iber/siege_ram` (arsenal)
- **kush** — `units/kush/siege_ram` (arsenal)
- **mace** — `units/mace/siege_ram` (arsenal)
- **maur** — `units/maur/siege_ram` (arsenal)
- **pers** — `units/pers/siege_ram` (arsenal)
- **ptol** — `units/ptol/siege_ram` (arsenal)
- **rome** — `units/rome/siege_ram` (army_camp, arsenal)
- **sele** — `units/sele/siege_ram` (arsenal)
- **spart** — `units/spart/siege_ram` (arsenal)

## Civilisation-specific overrides

These civilisations override the generic stats above (only differing values are listed):

- **germ** — `units/germ/siege_ram`
  - health 300 HP
  - armor 1 hack / 10 pierce / 8 crush
  - Melee "Ram" — damage 120 crush — range 7.5 m — prepare 1 s — repeat 2 s — preferred Structure — restricted Field Organic
  - walk 8.64 m/s
  - run 8.64 m/s
  - cost 200 wood, 75 metal
  - build time 20 s
- **kush** — `units/kush/siege_ram`
  - Melee "Ram" — damage 180 crush — range 6.5 m — prepare 0.75 s — repeat 1.5 s — preferred Structure — restricted Field Organic
- **pers** — `units/pers/siege_ram`
  - Melee "Ram" — damage 180 crush — range 6.5 m — prepare 0.75 s — repeat 1.5 s — preferred Structure — restricted Field Organic
