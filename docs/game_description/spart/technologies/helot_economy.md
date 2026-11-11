# helot_economy

Spartan-specific technology of 0 A.D. 0.28.0 — only the spartans can get it. See `docs/game_description/spart/technologies/README.md` for the method; shared technologies are documented in `docs/game_description/generic/technologies/`.

Data file: `simulation/data/technologies/helot_economy.json`.

## Basic stats

- **Name:** Helot Economy
- **Cost:** 200 food, 200 wood
- **Research time:** 40 s
- **Requirements:** `{"civ": "spart"}`
- **Effect:** Infantry Javelineers +100% grain gather rate, but −10% ranged attack pierce damage.
- **Modifications:**
  - ×2 ResourceGatherer/Rates/food.grain
  - ×0.9 Attack/Ranged/Damage/Pierce
- **Affects:** Infantry Javelineer

## Spartans

- civil centre (added to the CC's researcher list — it has no phase
  requirement, so it is available from the Village phase)

Note: the Helot trade — the Helot Skirmisher becomes a doubled-speed
grain harvester at the cost of 10% of its javelin damage. The skirmisher
is the civ's only citizen ranged infantry, so this weakens the ranged
line it also feeds; but doubling a soldier's farming rate turns surplus
skirmishers into fieldhands that still fight (badly) in a pinch. Take it
in food-starved mid-games when the army is hoplite-heavy; skip it while
skirmishers are the main ranged damage.