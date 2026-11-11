# agoge

Spartan-specific technology of 0 A.D. 0.28.0 — only the spartans can get it. See `docs/game_description/spart/technologies/README.md` for the method; shared technologies are documented in `docs/game_description/generic/technologies/`.

Data file: `simulation/data/technologies/agoge.json`.

## Basic stats

- **Name:** The Agoge
- **Cost:** 500 food, 200 metal
- **Research time:** 60 s
- **Requirements:** `{"all": [{"tech": "phase_city"}, {"civ": "spart"}]}`
- **Effect:** Champion Hoplites +25% health, but +5% training time.
- **Modifications:**
  - ×1.25 Health/Max
  - ×1.05 Cost/BuildTime
- **Affects:** Champion Infantry Spearman

## Spartans

- researched where? (see note)

Note: the City-phase capstone of the hoplite program. It affects the
`Champion Infantry Spearman` class — the Spartan Hoplite (and its
Olympian promotion, which shares the class) — giving the already
chunky 200 HP / repeat-0.9 s champion 250 HP for a 5% training-time
penalty. Combined with Tyrtean Paeans (+10% speed) and Krypteia (+10%
melee damage), the City-phase Spartan Hoplite would be the most heavily
stacked champion infantry in the game — **but no building researches
this tech**: no Researcher list references `agoge` anywhere in the
templates, so it is unreachable through the research UI (only via a
direct engine command), like athen's `pheidian_workshop`.
