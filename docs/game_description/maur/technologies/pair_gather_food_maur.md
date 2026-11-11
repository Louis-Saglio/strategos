# pair_gather_food_maur

Mauryan-specific technology of 0 A.D. 0.28.0 — only the mauryas can get it. See `docs/game_description/maur/technologies/README.md` for the method; shared technologies are documented in `docs/game_description/generic/technologies/`.

Data file: `simulation/data/technologies/pair_gather_food_maur.json`.

## Basic stats

- **Name:** Wicker Basket vs Ahimsa
- **Top:** `gather_wicker_baskets_maur`
- **Bottom:** `gather_ahimsa`
- **Requirements:** `{"civ": "maur"}`

## Mauryan

- farmstead

Note: a **pair tech** — a UI grouping, not a researchable technology:
the farmstead's Researcher returns it as a `{pair, top, bottom}` object,
so the two Mauryan food techs ("Wicker Baskets" and "Ahimsa") are
presented side by side in one slot. The choice is **mutually exclusive,
engine-enforced**: once either tech is researched the pair definition is
auto-marked researched and the other half can never be researched (see
`mechanics/technologies_and_modifiers.md` "Tech pairs").
