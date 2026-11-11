# pyramid_large

Kushite-specific building of 0 A.D. 0.28.0 — only the kushites can build it. See `docs/game_description/kush/buildings/README.md` for the method; shared buildings are documented in `docs/game_description/generic/buildings/`.

Stats resolved from `simulation/templates/structures/kush/pyramid_large` (full kush template chain).

## Guide

The Large Pyramid is kush's City-phase military monument: 450 stone and 150 metal (both premium), 300 s build time, 3000 HP, and at most 2 per player. Its "Exhortative Presence" aura covers a 100 m radius and gives your Soldiers +10% melee and ranged damage and +1 hack, pierce and crush armor, so place it where the army will gather or fight, not at the edge of the map. The aura does not stack (same aura name), so a second pyramid only extends coverage. It trains and researches nothing, is not conquest-critical, and has a non-root territory influence of 40 m (weight 40000).

## Basic stats

- **Generic name:** Large Pyramid
- **Specific name:** mr ʿȝ
- **Health:** 3000 HP
- **Armor:** 24 hack / 30 pierce / 3 crush
- **Vision:** 40 m
- **Cost:** 450 stone, 150 metal
- **Build time:** 300 s
- **Territory influence:** radius 40 m, weight 40000
- **Capture points:** 500
- **Build territory:** own
- **Placement:** land
- **Build category:** PyramidLarge (max 2 per player)
- **Requirements:** phase_city
- **Auras:** structures/kush_pyramids_military
- **Loot:** 90 stone, 30 metal
- **Classes:** Structure CivSpecific
- **Visible classes:** Civic City Pyramid
- **Footprint:** Square 22 m × 26 m (height 20 m)
- **Obstruction:** Static 20 m × 24 m

## Built by

- **kush** — `structures/kush/pyramid_large`
