# phase_city_athen

Athenian-specific technology of 0 A.D. 0.28.0 — only the athenians can get it. See `docs/game_description/athen/technologies/README.md` for the method; shared technologies are documented in `docs/game_description/generic/technologies/`.

Data file: `simulation/data/technologies/phase_city_athen.json`.

## Basic stats

- **Name:** City Phase
- **Cost:** 750 stone, 750 metal
- **Research time:** 60 s
- **Requirements:** `{"entity": {"class": "Town","number": 3}}` — Requires three Town Structures.
- **Supersedes:** phase_town_athen
- **Replaces:** phase_city
- **Effect:** Advance to City Phase, which unlocks more entities and technologies. Civic Centers +25% territory influence radius. Structures +20% damage and +1 capture points regeneration rate for garrisoned units. Workers +10% metal gather rate.
- **Modifications:**
  - +1 Capturable/GarrisonRegenRate — Structure
  - ×1.1 ResourceGatherer/Rates/metal.ore — Worker
  - ×1.2 Attack/Ranged/Damage/Pierce — Structure
  - ×1.25 TerritoryInfluence/Radius — CivCentre

## Athenian

- civil_centre

Note: the Athenian city phase — the generic `phase_city` plus a second
"Silver Owls" ×1.1 metal gather for Workers (cumulative ×1.21 with the
Town-phase bonus).
