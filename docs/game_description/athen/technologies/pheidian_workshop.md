# pheidian_workshop

Athenian-specific technology of 0 A.D. 0.28.0 — only the athenians can get it. See `docs/game_description/athen/technologies/README.md` for the method; shared technologies are documented in `docs/game_description/generic/technologies/`.

Data file: `simulation/data/technologies/pheidian_workshop.json`.

## Basic stats

- **Name:** Pheidian Workshop
- **Cost:** 300 stone
- **Research time:** 40 s
- **Requirements:** `{"all": [{"tech": "phase_town"},{"civ": "athen"}]}`
- **Effect:** Temples and Wonder −50% stone cost and build time.
- **Modifications:**
  - ×0.5 Cost/BuildTime
  - ×0.5 Cost/Resources/stone
- **Affects:** Temple, Wonder

## Athenian

- **vestigial** — no structure's `Researcher` lists it, so it is
  unreachable through the build UI in 0.28.0 (a directly issued research
  command would still work).

Note: an orphaned tech — the temples and the wonder would be half-price
and half-time, but nothing offers it. Only relevant to a bot that
researches by direct command.
