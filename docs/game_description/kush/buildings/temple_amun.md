# temple_amun

Kushite-specific building of 0 A.D. 0.28.0 — only the kushites can build it. See `docs/game_description/kush/buildings/README.md` for the method; shared buildings are documented in `docs/game_description/generic/buildings/`.

Stats resolved from `simulation/templates/structures/kush/temple_amun` (full kush template chain).

## Guide

The Grand Temple of Amun is kush's City-phase elite temple, limited to one per player, at 600 stone (premium), 400 s build time, 4000 HP and 1000 capture points; it is conquest-critical. It trains the elite Priest and the Napatan Temple Guard champion, researches the healing techs, garrisons 40 units with +3 HP/s heal and gives Humans within 70 m +1 HP/s regeneration, so it is a healing hub and champion factory in one. Its 80 m territory influence (weight 30000) also helps hold land. The price is "Powerful Priesthood": all your heroes get −5% health while it stands.

## Basic stats

- **Generic name:** Grand Temple of Amun
- **Specific name:** Pr-ʿImn
- **Health:** 4000 HP
- **Armor:** 24 hack / 30 pierce / 3 crush
- **Vision:** 40 m
- **Cost:** 600 stone
- **Build time:** 400 s
- **Territory influence:** radius 80 m, weight 30000
- **Garrison:** 40 slots (+3/s heal)
- **Capture points:** 1000
- **Build territory:** own
- **Placement:** land
- **Build category:** TempleOfAmun (one per player)
- **Requirements:** phase_city
- **Trains:** units/{civ}/support_healer_e units/{civ}/champion_infantry_amun
- **Train batch time:** ×0.8
- **Researches:** cost_healer heal_range heal_range_2 heal_rate heal_rate_2 garrison_heal health_regen_units
- **Auras:** structures/kush_temple_amun structures/kush_temple_amun_heal
- **Loot:** 120 stone
- **Classes:** Structure ConquestCritical CivSpecific
- **Visible classes:** Civic Temple City TempleOfAmun
- **Footprint:** Square 32 m × 62 m (height 12 m)
- **Obstruction:** Static 28 m × 56 m

## Built by

- **kush** — `structures/kush/temple_amun`
