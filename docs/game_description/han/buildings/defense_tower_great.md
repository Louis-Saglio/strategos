# defense_tower_great

Han-specific building of 0 A.D. 0.28.0 — only the han can build it. See `docs/game_description/han/buildings/README.md` for the method; shared buildings are documented in `docs/game_description/generic/buildings/`.

Stats resolved from `simulation/templates/structures/han/defense_tower_great` (full han template chain).

## Guide

The Great Tower (Dà Fángyù Tǎ) is han's upgrade of its stone defense tower, available in the City phase for 200 stone and 40 s, one per player; it cannot be placed directly. Compared with the base tower it has 2000 HP and 1000 capture points (both ×2), a 70 m range instead of 60 m (min range 10 m), 6 default arrows instead of 4 plus 1 per garrisoned Infantry, 10 garrison slots instead of 5 (up to 16 arrows), and +10 m vision and territory radius. With the base tower's 100 wood + 100 stone the total is 300 stone, a one-off premium spend, so use it for a single key position such as a chokepoint or the approach to the civil centre and garrison it with infantry when attacked. It researches the standard tower techs.

## Basic stats

- **Generic name:** Great Tower
- **Specific name:** Dà Fángyù Tǎ
- **Health:** 2000 HP
- **Armor:** 29 hack / 35 pierce / 3 crush
- **Attack:** Ranged "Bow" — damage 8 pierce — range 70 m — min range 10 m — prepare 0.4 s — repeat 3.5 s — spread 1 — preferred Human
- **Attack:** Arrows — default 6 arrow(s), +1 per garrisoned Infantry, max ∞
- **Vision:** 90 m
- **Cost:** 100 wood, 100 stone
- **Build time:** 150 s
- **Territory influence:** radius 42 m, weight 30000
- **Garrison:** 10 slots — accepts Support Infantry Minister
- **Capture points:** 1000
- **Build territory:** own
- **Placement:** land
- **Build category:** GreatTower (one per player)
- **Build distance:** min 60 m from Tower
- **Requirements:** phase_town
- **Researches:** tower_watch tower_crenellations tower_range tower_murderholes tower_health
- **Loot:** 20 wood, 20 stone
- **Classes:** Structure CivSpecific
- **Visible classes:** Defensive Tower StoneTower GreatTower
- **Footprint:** Square 10 m × 10.5 m (height 15 m)
- **Obstruction:** Static 7 m × 8 m

## Built by

- **han** — `structures/han/defense_tower_great` (upgrade of `structures/han/defense_tower`) — not placeable directly
