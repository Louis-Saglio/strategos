# warship_siege_attack

Available to **5** civilisations. Generic (non-civ-specific) technology of 0 A.D. 0.28.0 — see `docs/game_description/generic/technologies/README.md` for the method.

Data file: `simulation/data/technologies/warship_siege_attack.json`.

## Basic stats

- **Name:** Naval Ballistae
- **Cost:** 300 wood, 300 metal
- **Research time:** 40 s
- **Requirements:** `{"all": [{"tech": "phase_city"},{"notciv": "athen"},{"notciv": "brit"},{"notciv": "gaul"},{"notciv": "germ"},{"notciv": "iber"},{"notciv": "kush"},{"notciv": "mace"},{"notciv": "maur"},{"notciv": "pers"},{"notciv": "spart"},{"notciv": "germ"}]}` — Unlocked in City Phase.
- **Effect:** Siege Ships +20% attack range and vision range.
- **Modifications:**
  - ×1.2 Vision/Range
  - ×1.2 Attack/Ranged/MaxRange
- **Affects:** NavalSiege

## Civilisations

- **cart** — dock, super_dock
- **han** — dock
- **ptol** — dock
- **rome** — dock
- **sele** — dock

## Notes

- **athen**, **brit**, **gaul**, **germ**, **iber**, **kush**, **mace**, **maur**, **pers**, **spart** cannot research this (forbidden by the tech's requirements)
