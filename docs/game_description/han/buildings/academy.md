# academy

Han-specific building of 0 A.D. 0.28.0 — only the han can build it. See `docs/game_description/han/buildings/README.md` for the method; shared buildings are documented in `docs/game_description/generic/buildings/`.

Stats resolved from `simulation/templates/structures/han/academy` (full han template chain).

## Guide

The Imperial Academy (Tàixué) is han's champion factory: the only building that trains the Tiger Guard spearman, champion crossbowman, Youzhou cavalry and war chariot, and since han has no champion unlock techs, building one is all it takes. It needs the City phase and costs 150 stone and 150 metal (200 s, 2000 HP, 24/35/3 armor): the buildings are cheap, but they are paid in the two premium resources and each champion then costs 80–120 metal, so metal income is what limits production. There is no entity limit, so several academies can run in parallel (batch time ×0.8). Garrisoned units (10 slots: Infantry, Minister, Cavalry) gain +1 XP/s from the `xp_trickle` aura, which promotes citizen soldiers parked inside. It projects 50 m of territory influence (weight 40000).

## Basic stats

- **Generic name:** Imperial Academy
- **Specific name:** Tàixué
- **Health:** 2000 HP
- **Armor:** 24 hack / 35 pierce / 3 crush
- **Vision:** 32 m
- **Cost:** 150 stone, 150 metal
- **Build time:** 200 s
- **Territory influence:** radius 50 m, weight 40000
- **Garrison:** 10 slots — accepts Infantry Minister Cavalry
- **Capture points:** 500
- **Build territory:** own
- **Placement:** land
- **Requirements:** phase_city
- **Trains:** units/{civ}/champion_infantry_spearman_academy units/{civ}/champion_infantry_crossbowman_academy units/{civ}/champion_cavalry_spearman_academy units/{civ}/champion_chariot_academy
- **Train batch time:** ×0.8
- **Auras:** structures/xp_trickle
- **Loot:** 30 stone, 30 metal
- **Classes:** Structure ConquestCritical
- **Visible classes:** Military Barracks City Academy
- **Footprint:** Square 24 m × 24 m (height 10 m)
- **Obstruction:** Static 22 m × 22 m

## Built by

- **han** — `structures/han/academy`
