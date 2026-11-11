# gather_wicker_baskets_maur

Mauryan-specific technology of 0 A.D. 0.28.0 — only the mauryas can get it. See `docs/game_description/maur/technologies/README.md` for the method; shared technologies are documented in `docs/game_description/generic/technologies/`.

Data file: `simulation/data/technologies/gather_wicker_baskets_maur.json`.

## Basic stats

- **Name:** Wicker Baskets
- **Cost:** 100 wood
- **Research time:** 40 s
- **Requirements:** `{"all": [{"tech": "phase_village"},{"civ": "maur"}]}`
- **Effect:** Workers +50% fruit gather rate.
- **Modifications:**
  - ×1.5 ResourceGatherer/Rates/food.fruit
- **Affects:** Worker

## Mauryan

- farmstead (as the "top" of the `pair_gather_food_maur` pair)

Note: the Mauryan replacement for the generic `gather_wicker_baskets`
(which is `notciv: maur`) — same +50% fruit gather for workers, village
phase, but presented in a pair slot with "Ahimsa". Unlike Ahimsa it only
affects `Worker`-class units. Researching both is allowed (the pair
groups, it does not exclude); the two stack to ×3 fruit for workers.
