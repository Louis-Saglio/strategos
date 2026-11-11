# iphicratean_reforms

Athenian-specific technology of 0 A.D. 0.28.0 — only the athenians can get it. See `docs/game_description/athen/technologies/README.md` for the method; shared technologies are documented in `docs/game_description/generic/technologies/`.

Data file: `simulation/data/technologies/iphicratean_reforms.json`.

## Basic stats

- **Name:** Iphicratean Reforms
- **Cost:** 200 food, 200 metal
- **Research time:** 30 s
- **Requirements:** `{"all": [{"tech": "phase_town"},{"civ": "athen"}]}`
- **Effect:** Athenian Docks and Triremes can train Marines and Cretan Mercenary Archers.

## Athenian

- gymnasium

Note: a gate tech, like the Persians' `equine_transports` — it carries no
modifications. The Athenian dock always lists the marine trainers
(`units/athen/champion_marine_dock`, `units/athen/infantry_archer_b_dock`)
in its `Trainer`, but those templates have
`Identity/Requirements/Techs = iphicratean_reforms`, so they only become
trainable once this tech is researched. Research it (Town phase, at the
gymnasium) before any naval operation: it turns the fleet into a
self-supporting assault force.
