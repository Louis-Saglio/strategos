# tyrtean_paeans

Spartan-specific technology of 0 A.D. 0.28.0 — only the spartans can get it. See `docs/game_description/spart/technologies/README.md` for the method; shared technologies are documented in `docs/game_description/generic/technologies/`.

Data file: `simulation/data/technologies/tyrtean_paeans.json`.

## Basic stats

- **Name:** Tyrtean Paeans
- **Cost:** 200 food, 100 metal
- **Research time:** 30 s
- **Requirements:** `{"all": [{"tech": "phase_village"}, {"civ": "spart"}]}`
- **Effect:** Champion Hoplites +10% movement speed.
- **Modifications:**
  - ×1.1 UnitMotion/WalkSpeed
- **Affects:** Champion Melee Infantry !Hero

## Spartans

- syssiton

Note: a Village-phase tech researched at the syssiton — the earliest
champion buff available to any civ, matching the Spartan Hoplite's
Village-phase availability. +10% walk speed for every champion melee
infantry unit (the Spartan Hoplite, the Skiritai Commando, and — if it
were trainable — the vestigial Spartan Pikeman; heroes are excluded).
Stack it with Krypteia (Town) and The Agoge (City) for the full
hoplite program; the speed helps the phalanx close the distance where
its repeat-0.9 s spear is deadliest.
