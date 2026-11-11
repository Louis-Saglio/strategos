# barracks_batch_training

Available to **14** civilisations. Generic (non-civ-specific) technology of 0 A.D. 0.28.0 — see `docs/game_description/generic/technologies/README.md` for the method.

Data file: `simulation/data/technologies/barracks_batch_training.json`.

## Basic stats

- **Name:** Conscription
- **Cost:** 500 food
- **Research time:** 40 s
- **Requirements:** `{"all": [{"tech": "phase_city"},{"notciv": "pers"}]}` — Unlocked in City Phase.
- **Effect:** Decreases batch training time of units trained in Barracks.
- **Modifications:**
  - +-0.1 Trainer/BatchTimeModifier
- **Affects:** Barracks

## Civilisations

- **athen** — barracks
- **brit** — barracks
- **cart** — barracks
- **gaul** — barracks
- **germ** — barracks
- **han** — barracks
- **iber** — barracks
- **kush** — barracks
- **mace** — barracks
- **maur** — barracks
- **ptol** — barracks
- **rome** — barracks
- **sele** — barracks
- **spart** — barracks

## Notes

- **pers** cannot research this (forbidden by the tech's requirements)
