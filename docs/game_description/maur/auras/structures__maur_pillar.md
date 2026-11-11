# structures/maur_pillar

Mauryan-specific aura of 0 A.D. 0.28.0 — only the mauryas can have it. See `docs/game_description/maur/auras/README.md` for the method; shared auras are documented in `docs/game_description/generic/auras/`.

Data file: `simulation/data/auras/structures/maur_pillar.json`.

## Basic stats

- **Name:** Edict of Ashoka
- **Type:** range
- **Radius:** 75 m
- **Affects:** Trader
- **Description:** Traders +20% movement speed.
- **Modifications:**
  - ×1.2 UnitMotion/WalkSpeed

## Mauryan

- attached by `structures/maur/pillar_ashoka`

Note: the Edict Pillar's trade aura — land traders (and merchant ships,
which also carry the `Trader` class) within 75 m move +20% faster. Pillars
are buildable only while the hero Ashoka is owned (the `Pillar` limit is
0, +5 via Ashoka's `LimitChangers` entry), so this aura is the payoff
for keeping him alive: line a trade route with pillars and each caravan
spends a fifth less time in transit.
