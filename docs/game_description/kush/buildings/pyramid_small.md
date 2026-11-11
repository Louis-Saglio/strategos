# pyramid_small

Kushite-specific building of 0 A.D. 0.28.0 — only the kushites can build it. See `docs/game_description/kush/buildings/README.md` for the method; shared buildings are documented in `docs/game_description/generic/buildings/`.

Stats resolved from `simulation/templates/structures/kush/pyramid_small` (full kush template chain).

## Guide

The Small Pyramid is kush's economic monument, available from the Village phase for 100 stone and 100 metal (both premium) and 100 s, with 2000 HP and no build limit. Its "Patriotism" aura gives Workers within 50 m +15% gather speed, so build it beside a dense farm, wood or mine cluster rather than anywhere near the army. The aura does not stack (same aura name), so extra pyramids only help by covering other work areas. It trains nothing, is not conquest-critical, and has a 30 m non-root territory influence (weight 30000) that helps expand or hold border land.

## Basic stats

- **Generic name:** Small Pyramid
- **Specific name:** mr
- **Health:** 2000 HP
- **Armor:** 24 hack / 30 pierce / 3 crush
- **Vision:** 30 m
- **Cost:** 100 stone, 100 metal
- **Build time:** 100 s
- **Territory influence:** radius 30 m, weight 30000
- **Capture points:** 500
- **Build territory:** own
- **Placement:** land
- **Requirements:** phase_village
- **Auras:** structures/kush_pyramids_economic
- **Loot:** 20 stone, 20 metal
- **Classes:** Structure CivSpecific
- **Visible classes:** Civic Village Pyramid
- **Footprint:** Square 18 m × 18 m (height 15 m)
- **Obstruction:** Static 16 m × 16 m

## Built by

- **kush** — `structures/kush/pyramid_small`
