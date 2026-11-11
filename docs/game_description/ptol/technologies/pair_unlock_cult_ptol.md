# pair_unlock_cult_ptol

Ptolemaic-specific technology of 0 A.D. 0.28.0 — only the ptolemies can get it. See `docs/game_description/ptol/technologies/README.md` for the method; shared technologies are documented in `docs/game_description/generic/technologies/`.

Data file: `simulation/data/technologies/pair_unlock_cult_ptol.json`.

## Basic stats

- **Name:** Cult
- **Top:** `pharaonic_cult`
- **Bottom:** `serapis_cult`
- **Requirements:** `{"civ": "ptol"}`

## Ptolemaic

- temple_2

Note: a **pair tech** — not a researchable technology itself but a UI
grouping: the Researcher returns it as a `{pair, top, bottom}` object, so
the Temple of Isis presents the two cults ("Pharaonic Cult" and "Serapis
Cult") side by side in one slot. The choice is **mutually exclusive,
engine-enforced**: once either cult is researched the pair definition is
auto-marked researched and the other half can never be researched. Both
cults are City-phase, civ-ptol gated.
