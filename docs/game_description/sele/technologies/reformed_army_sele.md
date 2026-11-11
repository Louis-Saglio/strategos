# reformed_army_sele

Seleucid-specific technology of 0 A.D. 0.28.0 — only the seleucids can get it. See `docs/game_description/sele/technologies/README.md` for the method; shared technologies are documented in `docs/game_description/generic/technologies/`.

Data file: `simulation/data/technologies/reformed_army_sele.json`.

## Basic stats

- **Name:** Reform Army
- **Cost:** none (free, instant)
- **Requirements:** `{"all": [{"tech": "phase_city"}, {"civ": "sele"}]}`
- **Effect:** Unlocks the Champion Infantry Swordsman at the barracks.
- **Modifications:** none — the unlock is a training requirement on the unit: `units/sele/champion_infantry_swordsman` has `Identity/Requirements/Techs = reformed_army_sele`.

## Seleucids

- barracks (through the `pair_unlock_champions_sele` pair)

Note: the bottom half of the army-reform pair — the Roman-style choice.
Researching it makes the Romanized Swordsman (the sele champion
swordsman) trainable at the barracks. Like the traditional half it is
free and instant, and the two halves are **mutually exclusive**: queueing
one blocks the other, and once one is researched the other can never be
(see `pair_unlock_champions_sele`).
