# unlock_civilians_house_generic

Available to **14** civilisations. Generic (non-civ-specific) technology of 0 A.D. 0.28.0 — see `docs/game_description/generic/technologies/README.md` for the method.

Data file: `simulation/data/technologies/unlock_civilians_house_generic.json`.

## Basic stats

- **Name:** Fertility Festival
- **Cost:** 250 food, 100 wood, 100 metal
- **Research time:** 60 s
- **Requirements:** `{"all": [{"tech": "phase_village"},{"notciv": "kush"}]}`
- **Effect:** Unlock the ability to train Civilians from houses.

## Civilisations

- **athen** — house
- **brit** — house
- **cart** — apartment, house
- **gaul** — house
- **germ** — house
- **han** — house
- **iber** — house
- **mace** — house
- **maur** — house
- **pers** — house
- **ptol** — house
- **rome** — house
- **sele** — house
- **spart** — house

## Notes

- **kush** researches the civ-specific variant instead (`unlock_civilians_house_<civ>`)
- **kush** cannot research this (forbidden by the tech's requirements)
