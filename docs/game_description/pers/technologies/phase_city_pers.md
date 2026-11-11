# phase_city_pers

Persian-specific technology of 0 A.D. 0.28.0 — only the persians can get it. See `docs/game_description/pers/technologies/README.md` for the method; shared technologies are documented in `docs/game_description/generic/technologies/`.

Data file: `simulation/data/technologies/phase_city_pers.json`.

## Basic stats

- **Name:** City Phase
- **Specific name:** Vazaraka Vardana
- **Cost:** 750 stone, 750 metal
- **Research time:** 60 s
- **Requirements:** `{"entity": {"class": "Town","number": 3}}` — Requires three Town Structures.
- **Supersedes:** phase_town_pers
- **Replaces:** phase_city
- **Effect:** Advance to City Phase, which unlocks more entities and technologies. Civic Centers +25% territory influence radius. Structures +20% damage and +1 capture points regeneration rate for garrisoned units. Decrease batch training time of units trained in Stables.
- **Modifications:**
  - +1 Capturable/GarrisonRegenRate — Structure
  - −0.1 Trainer/BatchTimeModifier — Stable
  - ×1.2 Attack/Ranged/Damage/Pierce — Structure
  - ×1.25 TerritoryInfluence/Radius — CivCentre

## Persian

- civil_centre

Note: the Persian city phase — the generic `phase_city` plus a second
`Trainer/BatchTimeModifier −0.1` for the Stable ("Times of War"): with the
Town-phase −0.1 already applied, stable batch training time is divided by
`batchSize^0.2` in the City phase. Because the generic
`stable_batch_training` tech is `notciv: pers`, this phase bonus is the
Persians' only batch-time discount for stables.
