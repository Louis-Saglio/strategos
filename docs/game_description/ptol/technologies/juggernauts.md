# juggernauts

Ptolemaic-specific technology of 0 A.D. 0.28.0 — only the ptolemies can get it. See `docs/game_description/ptol/technologies/README.md` for the method; shared technologies are documented in `docs/game_description/generic/technologies/`.

Data file: `simulation/data/technologies/juggernauts.json`.

## Basic stats

- **Name:** Juggernauts
- **Cost:** 500 wood, 300 metal
- **Research time:** 40 s
- **Requirements:** `{"all": [{"tech": "phase_city"},{"civ": "ptol"}]}`
- **Effect:** Warships +25% health, but −10% speed.
- **Modifications:**
  - ×1.25 Health/Max
  - ×0.9 UnitMotion/WalkSpeed
- **Affects:** Warship

## Ptolemaic

- dock

Note: a Ptolemaic navy tech — every warship (scout, arrow, ram and siege
ships) gets +25% health at the cost of −10% speed. It is the tech of the
same name as the (untrainable) `champion_juggernaut` super-ship, and
would apply to that unit too via the `Warship` class if it could be
fielded. Worth taking before a naval engagement: the Ptolemies have a
full warship roster except the fire ship.
