# krypteia

Spartan-specific technology of 0 A.D. 0.28.0 — only the spartans can get it. See `docs/game_description/spart/technologies/README.md` for the method; shared technologies are documented in `docs/game_description/generic/technologies/`.

Data file: `simulation/data/technologies/krypteia.json`.

## Basic stats

- **Name:** Krypteia
- **Cost:** 200 food, 200 metal
- **Research time:** 50 s
- **Requirements:** `{"all": [{"tech": "phase_town"}, {"civ": "spart"}]}`
- **Effect:** Champions +10% melee attack damage, but Citizen Infantry Javelineers +30% training time.
- **Modifications:**
  - ×1.1 Attack/Melee/Damage/Hack (Champion)
  - ×1.1 Attack/Melee/Damage/Pierce (Champion)
  - ×1.3 Cost/BuildTime (Citizen Infantry Javelineer)
- **Affects:** (per-modification — the champion buff and the javelineer tax are independent)

## Spartans

- gerousia

Note: the Town-phase war-trade. Every champion hits 10% harder in melee
(the hoplite, the Skiritai, the pike), while the Helot Skirmisher takes
30% longer to train — the civ's only citizen ranged infantry becomes
noticeably slower to mass. Research it when the champion core is the
army and the skirmisher line is already stocked; skip it while
javelineers are still being queued in bulk.
