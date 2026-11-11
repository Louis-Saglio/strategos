# hoplite_tradition

Available to **2** civilisations. Generic (non-civ-specific) technology of 0 A.D. 0.28.0 — see `docs/game_description/generic/technologies/README.md` for the method.

Data file: `simulation/data/technologies/hoplite_tradition.json`.

## Basic stats

- **Name:** Hoplite Tradition
- **Cost:** 400 food, 300 metal
- **Research time:** 60 s
- **Requirements:** `{"all": [{"tech": "phase_town"},{"any": [{"civ": "athen"},{"civ": "spart"}]}]}` — Unlocked in Town Phase.
- **Effect:** Hoplites −25% training time, −50% promotion experience, and +10% health.
- **Modifications:**
  - ×0.75 Cost/BuildTime
  - ×0.5 Promotion/RequiredXp
  - ×1.1 Health/Max
- **Affects:** Infantry Spearman !Hero

## Civilisations

- **athen** — civil_centre
- **spart** — civil_centre

## Notes

- **brit**, **cart**, **gaul**, **germ**, **han**, **iber**, **kush**, **mace**, **maur**, **pers**, **ptol**, **rome**, **sele** cannot research this (forbidden by the tech's requirements)
