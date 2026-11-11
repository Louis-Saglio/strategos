# nisean_horses

Available to **2** civilisations. Generic (non-civ-specific) technology of 0 A.D. 0.28.0 — see `docs/game_description/generic/technologies/README.md` for the method.

Data file: `simulation/data/technologies/nisean_horses.json`.

## Basic stats

- **Name:** Nisean War Horses
- **Cost:** 400 food, 200 metal
- **Research time:** 60 s
- **Requirements:** `{"all": [{"tech": "unlock_champion_cavalry"},{"any": [{"civ": "pers"},{"civ": "sele"}]}]}` — Unlocked in City Phase.
- **Supersedes:** cavalry_health
- **Effect:** Champion Cavalry Spearmen +10% health, but +10% training time.
- **Modifications:**
  - ×1.1 Cost/BuildTime
  - ×1.1 Health/Max
- **Affects:** Champion Cavalry Spearman

## Civilisations

- **pers** — stable
- **sele** — stable

## Notes

- **athen**, **brit**, **cart**, **gaul**, **germ**, **han**, **iber**, **kush**, **mace**, **maur**, **ptol**, **rome**, **spart** cannot research this (forbidden by the tech's requirements)
