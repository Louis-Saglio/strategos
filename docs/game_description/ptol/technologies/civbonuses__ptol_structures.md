# civbonuses/ptol_structures

Ptolemaic-specific technology of 0 A.D. 0.28.0 — only the ptolemies can get it. See `docs/game_description/ptol/technologies/README.md` for the method; shared technologies are documented in `docs/game_description/generic/technologies/`.

Data file: `simulation/data/technologies/civbonuses/ptol_structures.json`.

## Basic stats

- **Name:** Sun-dried Mud Bricks
- **Auto-researched:** yes
- **Requirements:** `{"any": [{"civ": "ptol"}]}`
- **Effect:** Houses and Economic Structures −40% wood cost, health, and capture points as well as +50% build time.
- **Modifications:**
  - ×0.6 Cost/Resources/wood
  - ×0.6 Health/Max
  - ×0.6 Loot/wood
  - ×1.5 Cost/BuildTime
  - ×0.6 Capturable/CapturePoints
- **Affects:** Economic !CivCentre !Naval, House

## Ptolemaic

- auto-researched

Note: the Ptolemaic economy buildings are built cheap but flimsy. The
`Economic` class covers the farmstead, field, corral, market and
storehouse (the dock is `Naval` and excluded; the civic centre is
excluded too) plus the houses. Wood costs drop 40% (house 75 → 45 wood,
storehouse 100 → 60) while build time rises 50% (house 30 → 45 s) and the
buildings are 40% weaker (600 HP houses, easier to capture). Net effect:
Ptolemaic expansion is wood-cheap but slower to erect and easier to burn
down — keep defenders near the frontier, and expect enemy raiders to
level houses fast.
