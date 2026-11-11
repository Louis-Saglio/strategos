# gather_ahimsa

Mauryan-specific technology of 0 A.D. 0.28.0 — only the mauryas can get it. See `docs/game_description/maur/technologies/README.md` for the method; shared technologies are documented in `docs/game_description/generic/technologies/`.

Data file: `simulation/data/technologies/gather_ahimsa.json`.

## Basic stats

- **Name:** Ahimsa
- **Cost:** 100 wood
- **Research time:** 40 s
- **Requirements:** `{"all": [{"tech": "phase_village"},{"civ": "maur"}]}`
- **Effect:** Units +100% fruit gather rate, but −80% meat and fish gather.
- **Modifications:**
  - ×2 ResourceGatherer/Rates/food.fruit
  - ×0.2 ResourceGatherer/Rates/food.fish
  - ×0.2 ResourceGatherer/Rates/food.meat
- **Affects:** Unit

## Mauryan

- farmstead (as the "bottom" of the `pair_gather_food_maur` pair)

Note: the vegetarian option of the Mauryan food pair — double fruit
gathering for **all units** (not just workers; citizen-soldiers' fruit
rates double too), in exchange for −80% meat and fish gathering. Take it
on maps with abundant berry bushes and little hunt; it pairs with the
fruit-focused "Wicker Baskets" tech, which the pair slot presents
alongside it. The choice is **mutually exclusive** — researching one half
locks the other out (the pair definition is auto-researched once either
completes).
