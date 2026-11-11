# pharaonic_cult

Ptolemaic-specific technology of 0 A.D. 0.28.0 — only the ptolemies can get it. See `docs/game_description/ptol/technologies/README.md` for the method; shared technologies are documented in `docs/game_description/generic/technologies/`.

Data file: `simulation/data/technologies/pharaonic_cult.json`.

## Basic stats

- **Name:** Pharaonic Cult
- **Cost:** 300 food, 200 metal
- **Research time:** 50 s
- **Requirements:** `{"all": [{"tech": "phase_city"},{"civ": "ptol"}]}`
- **Effect:** Heroes +2 health/second self-regen rate.
- **Modifications:**
  - +2 Health/RegenRate
- **Affects:** Hero

## Ptolemaic

- temple_2 (as the "top" of the `pair_unlock_cult_ptol` pair)

Note: one of the two Temple-of-Isis cults, presented together in the UI
as the "Cult" pair. Take this one to keep the chosen hero alive: +2 HP/s
regeneration means the hero recovers from hit-and-run damage without a
healer or garrison. Compare "Serapis Cult" (+2 metal/s economy instead).
