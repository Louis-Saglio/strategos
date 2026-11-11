# hellenistic_metropolis

Available to **3** civilisations. Generic (non-civ-specific) technology of 0 A.D. 0.28.0 — see `docs/game_description/generic/technologies/README.md` for the method.

Data file: `simulation/data/technologies/hellenistic_metropolis.json`.

## Basic stats

- **Name:** Hellenistic Metropolis
- **Cost:** 500 stone, 500 metal
- **Research time:** 60 s
- **Requirements:** `{"all": [{"tech": "phase_city"},{"any": [{"civ": "mace"},{"civ": "ptol"},{"civ": "sele"}]}]}` — Unlocked in City Phase.
- **Effect:** Civic Centers +100% health and capture points, double default arrows.
- **Modifications:**
  - ×2 BuildingAI/DefaultArrowCount
  - ×2 Capturable/CapturePoints
  - ×2 Health/Max
- **Affects:** CivCentre !Colony !Naval

## Civilisations

- **mace** — civil_centre
- **ptol** — civil_centre
- **sele** — civil_centre

## Notes

- **athen**, **brit**, **cart**, **gaul**, **germ**, **han**, **iber**, **kush**, **maur**, **pers**, **rome**, **spart** cannot research this (forbidden by the tech's requirements)
