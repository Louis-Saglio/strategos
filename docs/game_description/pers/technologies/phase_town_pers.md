# phase_town_pers

Persian-specific technology of 0 A.D. 0.28.0 — only the persians can get it. See `docs/game_description/pers/technologies/README.md` for the method; shared technologies are documented in `docs/game_description/generic/technologies/`.

Data file: `simulation/data/technologies/phase_town_pers.json`.

## Basic stats

- **Name:** Town Phase
- **Specific name:** Vardana
- **Cost:** 500 food, 500 wood
- **Research time:** 30 s
- **Requirements:** `{"entity": {"class": "Village","number": 5}}` — Requires five Village Structures.
- **Supersedes:** phase_village
- **Replaces:** phase_town
- **Effect:** Advance to Town Phase, which unlocks more entities and technologies. Civic Centers +25% territory influence radius. Structures +20% damage and +0.5 capture points regeneration rate for garrisoned units. Decrease batch training time of units trained in Stables.
- **Modifications:**
  - +0.5 Capturable/GarrisonRegenRate — Structure
  - −0.1 Trainer/BatchTimeModifier — Stable
  - ×1.2 Attack/Ranged/Damage/Pierce — Structure
  - ×1.25 TerritoryInfluence/Radius — CivCentre

## Persian

- civil_centre

Note: the Persian town phase — identical to the generic `phase_town` except
for one extra modification: `Trainer/BatchTimeModifier −0.1` for the
Stable. This is the "Times of War" civ bonus (in the engine, a batch's
training time is divided by `batchSize^(−BatchTimeModifier)` = `batchSize^0.1`,
so large stable batches get progressively cheaper). The effect is repeated
at the City phase for a total of −0.2.
