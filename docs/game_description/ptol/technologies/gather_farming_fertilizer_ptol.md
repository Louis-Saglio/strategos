# gather_farming_fertilizer_ptol

Ptolemaic-specific technology of 0 A.D. 0.28.0 — only the ptolemies can get it. See `docs/game_description/ptol/technologies/README.md` for the method; shared technologies are documented in `docs/game_description/generic/technologies/`.

Data file: `simulation/data/technologies/gather_farming_fertilizer_ptol.json`.

## Basic stats

- **Name:** Fertilizer
- **Cost:** 400 wood, 300 metal
- **Research time:** 60 s
- **Requirements:** `{"all": [{"tech": "phase_village"},{"civ": "ptol"}]}`
- **Effect:** Workers +20% grain gather rate.
- **Modifications:**
  - ×1.2 ResourceGatherer/Rates/food.grain
- **Affects:** Worker

## Ptolemaic

- farmstead

Note: one of the three "Nile Delta" farming technologies. The generic
`gather_farming_fertilizer` (same +20% grain) is City-phase and
`notciv: ptol`; this Ptolemaic replacement is available in the **Village
phase**, so the whole grain line (plows + fertilizer + training, ×1.2
each, ×1.728 total) is researchable from the start of the match.
