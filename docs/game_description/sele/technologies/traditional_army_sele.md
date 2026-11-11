# traditional_army_sele

Seleucid-specific technology of 0 A.D. 0.28.0 — only the seleucids can get it. See `docs/game_description/sele/technologies/README.md` for the method; shared technologies are documented in `docs/game_description/generic/technologies/`.

Data file: `simulation/data/technologies/traditional_army_sele.json`.

## Basic stats

- **Name:** Traditional Army
- **Cost:** none (free, instant)
- **Requirements:** `{"all": [{"tech": "phase_city"}, {"civ": "sele"}]}`
- **Effect:** Unlocks the Champion Infantry Pikeman at the barracks.
- **Modifications:** none — the unlock is a training requirement on the unit: `units/sele/champion_infantry_pikeman` has `Identity/Requirements/Techs = traditional_army_sele`.

## Seleucids

- barracks (through the `pair_unlock_champions_sele` pair)

Note: the top half of the army-reform pair — the Macedonian-style choice.
It carries no stats itself; researching it makes the Silver Shield Pikeman
(the sele champion pikeman) trainable at the barracks. The pair is
researched in the City phase, is free and instant, and the two halves are
**mutually exclusive**: queueing one blocks the other, and once one is
researched the other can never be (see `pair_unlock_champions_sele`).
Pick the army that fits the game — Silver Shield pikemen vs Romanized
heavy swordsmen.
