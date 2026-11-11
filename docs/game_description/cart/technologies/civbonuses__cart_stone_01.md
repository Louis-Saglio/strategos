# civbonuses/cart_stone_01

Carthaginian-specific technology of 0 A.D. 0.28.0 — only the carthaginians can get it. See `docs/game_description/cart/technologies/README.md` for the method; shared technologies are documented in `docs/game_description/generic/technologies/`.

Data file: `simulation/data/technologies/civbonuses/cart_stone_01.json`.

## Basic stats

- **Name:** Servants
- **Auto-researched:** yes
- **Requirements:** `{"all": [{"tech": "phase_village"},{"civ": "cart"}]}`
- **Effect:** Workers +25% stone gather rate.
- **Modifications:**
  - ×1.25 ResourceGatherer/Rates/stone.rock
- **Affects:** Worker

## Carthaginian

- auto-researched

Note: the three "Servants" techs (`cart_stone_01/02/03`, one per phase) are the "Mining Economy" civ bonus — they replace the generic stone-mining techs (`gather_mining_servants`, `gather_mining_serfs`, `gather_mining_slaves`), which Carthage cannot research (`notciv: cart`), with free, instant auto-researched equivalents of the same +25% stone.rock each. The effects stack: ×1.25 (village), ×1.56 (town), ×1.95 (city).
