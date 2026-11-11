# serapis_cult

Ptolemaic-specific technology of 0 A.D. 0.28.0 — only the ptolemies can get it. See `docs/game_description/ptol/technologies/README.md` for the method; shared technologies are documented in `docs/game_description/generic/technologies/`.

Data file: `simulation/data/technologies/serapis_cult.json`.

## Basic stats

- **Name:** Serapis Cult
- **Cost:** 300 food, 300 metal
- **Research time:** 60 s
- **Requirements:** `{"all": [{"tech": "phase_city"},{"civ": "ptol"}]}`
- **Effect:** +2.0 metal trickle per second.
- **Modifications:**
  - +2 ResourceTrickle/Rates/metal
- **Affects:** Player

## Ptolemaic

- temple_2 (as the "bottom" of the `pair_unlock_cult_ptol` pair)

Note: the economic half of the Temple-of-Isis cult pair — a permanent +2
metal/s player trickle. Metal is the premium resource the Ptolemaic
mercenaries are paid in, so this feeds directly into the mercenary
economy: +2 metal/s ≈ a free mercenary spearman every 30 s. Compare
"Pharaonic Cult" (hero regeneration instead).
