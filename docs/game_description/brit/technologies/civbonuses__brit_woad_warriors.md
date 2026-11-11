# civbonuses/brit_woad_warriors

British-specific technology of 0 A.D. 0.28.0 — only the britons can get it. See `docs/game_description/brit/technologies/README.md` for the method; shared technologies are documented in `docs/game_description/generic/technologies/`.

Data file: `simulation/data/technologies/civbonuses/brit_woad_warriors.json`.

## Basic stats

- **Name:** Woad Warriors
- **Auto-researched:** yes
- **Requirements:** `{"civ": "brit"}`
- **Effect:** All Infantry Units +5% movement speed, and gain +1 loot taking.
- **Modifications:**
  - ×1.05 UnitMotion/WalkSpeed
  - +1 Looter/Resource/metal
  - +1 Looter/Resource/stone
  - +1 Looter/Resource/food
  - +1 Looter/Resource/wood
- **Affects:** Infantry

## Britons

- auto-researched

Note: the British civ bonus, live from the first minute. Every unit
with the `Infantry` class — spearmen, slingers, javelineers, the
Brythonic champion swordsman, even the foot heroes — walks 5% faster
(e.g. the spearman 9.5 m/s → 9.98 m/s, the javelineer 11.4 → 11.97
m/s), which helps the civ's infantry-heavy skirmish line close distance
and chase raiders. The
`Looter` part is a +1 of **each** resource every time an infantry unit
loots a corpse — small per body, but it stacks across every dead enemy
and every looting soldier, so battles quietly refund a trickle of
resources to the Britons. War dogs are not `Infantry` (they are
`Human`/`FastMoving`), so they get neither bonus.
