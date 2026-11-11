# gather_farming_training_ptol

Ptolemaic-specific technology of 0 A.D. 0.28.0 — only the ptolemies can get it. See `docs/game_description/ptol/technologies/README.md` for the method; shared technologies are documented in `docs/game_description/generic/technologies/`.

Data file: `simulation/data/technologies/gather_farming_training_ptol.json`.

## Basic stats

- **Name:** Gather Training
- **Cost:** 300 wood, 200 metal
- **Research time:** 50 s
- **Requirements:** `{"all": [{"tech": "phase_village"},{"civ": "ptol"}]}`
- **Effect:** Workers +20% grain gather rate.
- **Modifications:**
  - ×1.2 ResourceGatherer/Rates/food.grain
- **Affects:** Worker

## Ptolemaic

- farmstead

Note: the second "Nile Delta" farming technology. The generic
`gather_farming_training` (same +20% grain) is Town-phase and
`notciv: ptol`; this Ptolemaic replacement is available in the **Village
phase**. Together with `gather_farming_plows` (already village-phase for
everyone) and `gather_farming_fertilizer_ptol`, the Ptolemies can stack
the full ×1.728 grain boost long before any other civilisation.
