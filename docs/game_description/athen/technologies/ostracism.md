# ostracism

Athenian-specific technology of 0 A.D. 0.28.0 — only the athenians can get it. See `docs/game_description/athen/technologies/README.md` for the method; shared technologies are documented in `docs/game_description/generic/technologies/`.

Data file: `simulation/data/technologies/ostracism.json`.

## Basic stats

- **Name:** Ostracism
- **Cost:** 300 food, 300 metal
- **Research time:** 60 s
- **Requirements:** `{"all": [{"tech": "phase_city"},{"civ": "athen"}]}`
- **Effect:** Citizen soldiers +5% health, but Heroes −40% health.
- **Modifications:**
  - ×1.05 Health/Max — CitizenSoldier
  - ×0.6 Health/Max — Hero
- **Affects:** (nested)

## Athenian

- prytaneion

Note: the deliberate trade-off tech — every own citizen soldier gets
+5% health while every own hero loses 40%. A 1000 HP hero drops to 600,
a 1200 HP one to 720 — enough to make heroes fragile in a fight. Only
worth taking if the army strategy leans entirely on citizen soldiers
and champions (the gymnasium line); if the plan revolves around a hero
aura (Pericles' research, Themistocles' navy), leave it unresearched.
