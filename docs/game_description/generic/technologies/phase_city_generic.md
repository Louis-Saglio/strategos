# phase_city_generic

Available to **13** civilisations. Generic (non-civ-specific) technology of 0 A.D. 0.28.0 — see `docs/game_description/generic/technologies/README.md` for the method.

Data file: `simulation/data/technologies/phase_city_generic.json`.

## Basic stats

- **Name:** City Phase
- **Cost:** 750 stone, 750 metal
- **Research time:** 60 s
- **Requirements:** `{"entity": {"class": "Town","number": 3}}` — Requires three Town Structures.
- **Supersedes:** phase_town_generic
- **Replaces:** phase_city
- **Effect:** Advance to City Phase, which unlocks more entities and technologies. Civic Centers +25% territory influence radius. Structures +20% damage and +1 capture points regeneration rate for garrisoned units.
- **Modifications:**
  - +1 Capturable/GarrisonRegenRate — Structure
  - ×1.2 Attack/Ranged/Damage/Pierce — Structure
  - ×1.25 TerritoryInfluence/Radius — CivCentre

## Civilisations

- **brit** — civil_centre, crannog
- **cart** — civil_centre
- **gaul** — civil_centre
- **germ** — civil_centre
- **han** — civil_centre
- **iber** — civil_centre
- **kush** — civil_centre
- **mace** — civil_centre
- **maur** — civil_centre
- **ptol** — civil_centre
- **rome** — civil_centre
- **sele** — civil_centre
- **spart** — civil_centre

## Notes

- **athen**, **pers** research the civ-specific variants instead (`phase_city_<civ>`)
