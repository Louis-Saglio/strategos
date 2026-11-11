# architecture_pers

Persian-specific technology of 0 A.D. 0.28.0 — only the persians can get it. See `docs/game_description/pers/technologies/README.md` for the method; shared technologies are documented in `docs/game_description/generic/technologies/`.

Data file: `simulation/data/technologies/architecture_pers.json`.

## Basic stats

- **Name:** Achaemenid Architecture
- **Cost:** 200 wood, 200 stone
- **Research time:** 60 s
- **Requirements:** `{"all": [{"tech": "phase_village"},{"civ": "pers"}]}`
- **Effect:** Structures +25% health and capture points, but also +20% build time.
- **Modifications:**
  - ×1.25 Capturable/CapturePoints
  - ×1.2 Cost/BuildTime
  - ×1.25 Health/Max
- **Affects:** Structure !Wonder

## Persian

- civil_centre

Note: researched at the civil centre from the start of the match (only the
village-phase gate). It makes every Persian structure (except the Wonder)
25% harder to destroy and to capture, at the price of 20% longer build
times — including the civil centres themselves, so expansion is slower but
each building is sturdier. The stone wall segments are covered too (their
HP ×1.25 stacks on top of the Persian wall-set's own stats).
