# arsenal_philon

Athenian-specific technology of 0 A.D. 0.28.0 — only the athenians can get it. See `docs/game_description/athen/technologies/README.md` for the method; shared technologies are documented in `docs/game_description/generic/technologies/`.

Data file: `simulation/data/technologies/arsenal_philon.json`.

## Basic stats

- **Name:** Arsenal of Philon
- **Cost:** 300 wood, 300 stone
- **Research time:** 40 s
- **Requirements:** `{"all": [{"tech": "phase_city"},{"civ": "athen"}]}`
- **Effect:** Warships +1 health/second self-repair rate.
- **Modifications:**
  - +1 Health/RegenRate
- **Affects:** Warship

## Athenian

- dock

Note: every Athenian warship (scout, arrow and ram ships) passively
regenerates +1 HP/s — always, including in combat (`RegenRate` is
always-on). Combined with Themistocles' "Naval Preparation" aura (−50%
metal cost and build time), it makes the Athenian navy cheap to build
and self-repairing between fights — the strongest sustained-navy economy
in the game.
