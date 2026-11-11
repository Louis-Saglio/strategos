# warship_ramming_attack

Available to **8** civilisations. Generic (non-civ-specific) technology of 0 A.D. 0.28.0 — see `docs/game_description/generic/technologies/README.md` for the method.

Data file: `simulation/data/technologies/warship_ramming_attack.json`.

## Basic stats

- **Name:** Bronze Ram
- **Cost:** 400 metal
- **Research time:** 40 s
- **Requirements:** `{"all": [{"tech": "phase_city"},{"notciv": "brit"},{"notciv": "gaul"},{"notciv": "germ"},{"notciv": "han"},{"notciv": "iber"},{"notciv": "kush"},{"notciv": "maur"},{"notciv": "germ"}]}` — Unlocked in City Phase.
- **Effect:** Ramming Ships +30% attack damage.
- **Modifications:**
  - ×1.3 Attack/Melee/Damage/Hack
- **Affects:** NavalRam

## Civilisations

- **athen** — dock
- **cart** — dock, super_dock
- **mace** — dock
- **pers** — dock
- **ptol** — dock
- **rome** — dock
- **sele** — dock
- **spart** — dock

## Notes

- **brit**, **gaul**, **germ**, **han**, **iber**, **kush**, **maur** cannot research this (forbidden by the tech's requirements)
