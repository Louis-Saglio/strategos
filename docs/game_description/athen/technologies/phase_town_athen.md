# phase_town_athen

Athenian-specific technology of 0 A.D. 0.28.0 — only the athenians can get it. See `docs/game_description/athen/technologies/README.md` for the method; shared technologies are documented in `docs/game_description/generic/technologies/`.

Data file: `simulation/data/technologies/phase_town_athen.json`.

## Basic stats

- **Name:** Town Phase
- **Specific name:** Kōmopolis
- **Cost:** 500 food, 500 wood
- **Research time:** 30 s
- **Requirements:** `{"entity": {"class": "Village","number": 5}}` — Requires five Village Structures.
- **Supersedes:** phase_village
- **Replaces:** phase_town
- **Effect:** Advance to Town Phase, which unlocks more entities and technologies. Civic Centers +25% territory influence radius. Structures +20% damage and +0.5 capture points regeneration rate for garrisoned units. Workers +10% metal gather rate.
- **Modifications:**
  - +0.5 Capturable/GarrisonRegenRate — Structure
  - ×1.1 ResourceGatherer/Rates/metal.ore — Worker
  - ×1.2 Attack/Ranged/Damage/Pierce — Structure
  - ×1.25 TerritoryInfluence/Radius — CivCentre

## Athenian

- civil_centre

Note: the Athenian town phase — identical to the generic `phase_town`
plus one modification: `ResourceGatherer/Rates/metal.ore ×1.1` for
Workers. This is the "Silver Owls" civ bonus (in the phase tech rather
than an auto-tech): metal gathering +10% at Town and again at City
(×1.21 combined) — Athens mines the premium resource faster than anyone.
