# phase_town_generic

Available to **13** civilisations. Generic (non-civ-specific) technology of 0 A.D. 0.28.0 — see `docs/game_description/generic/technologies/README.md` for the method.

Data file: `simulation/data/technologies/phase_town_generic.json`.

## Basic stats

- **Name:** Town Phase
- **Cost:** 500 food, 500 wood
- **Research time:** 30 s
- **Requirements:** `{"entity": {"class": "Village","number": 5}}` — Requires five Village Structures.
- **Supersedes:** phase_village
- **Replaces:** phase_town
- **Effect:** Advance to Town Phase, which unlocks more entities and technologies. Civic Centers +25% territory influence radius. Structures +20% damage and +0.5 capture points regeneration rate for garrisoned units.
- **Modifications:**
  - +0.5 Capturable/GarrisonRegenRate — Structure
  - ×1.2 Attack/Ranged/Damage/Pierce — Structure
  - ×1.25 TerritoryInfluence/Radius — CivCentre

## Civilisations

- **brit** — civil_centre
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

- **athen**, **pers** research the civ-specific variants instead (`phase_town_<civ>`)
