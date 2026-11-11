# soldier_attack_melee_03_variant

Available to **2** civilisations. Generic (non-civ-specific) technology of 0 A.D. 0.28.0 — see `docs/game_description/generic/technologies/README.md` for the method.

Data file: `simulation/data/technologies/soldier_attack_melee_03_variant.json`.

## Basic stats

- **Name:** Steel Working
- **Cost:** 500 food, 400 metal
- **Research time:** 60 s
- **Requirements:** `{"all": [{"tech": "phase_city"},{"any": [{"civ": "iber"},{"civ": "maur"}]}]}` — Unlocked in City Phase.
- **Supersedes:** soldier_attack_melee_02
- **Effect:** Soldiers +20% melee attack damage. Swordsmen get an additional +20% bonus.
- **Modifications:**
  - ×1.2 Attack/Melee/Damage/Hack
  - ×1.2 Attack/Melee/Damage/Pierce
  - ×1.2 Attack/Melee/Damage/Crush
  - ×1.2 Attack/Melee/Damage/Hack — Swordsman
  - ×1.2 Attack/Melee/Damage/Pierce — Swordsman
  - ×1.2 Attack/Melee/Damage/Crush — Swordsman
- **Affects:** Soldier !Elephant

## Civilisations

- **iber** — forge
- **maur** — forge

## Notes

- **athen**, **brit**, **cart**, **gaul**, **germ**, **han**, **kush**, **mace**, **pers**, **ptol**, **rome**, **sele**, **spart** cannot research this (forbidden by the tech's requirements)
