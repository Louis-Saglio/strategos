# temple_vesta

Roman-specific building of 0 A.D. 0.28.0 — only the romans can build it. See `docs/game_description/rome/buildings/README.md` for the method; shared buildings are documented in `docs/game_description/generic/buildings/`.

Stats resolved from `simulation/templates/structures/rome/temple_vesta` (full roman template chain).

## Guide

The Temple of Vesta is the roman temple, available from Town phase for 300 stone, a scarce resource, so it is a real investment. It is the only roman source of healers (`support_healer_b`) and its 20-slot garrison heals occupants at +3 HP/s, so build one near the front or the economy to keep troops and workers alive. Its Eternal Fire aura also gives friendly structures within 75 m +50% capture points, making it a defensive anchor against enemy captures.

## Basic stats

- **Generic name:** Temple of Vesta
- **Health:** 2000 HP
- **Armor:** 24 hack / 30 pierce / 3 crush
- **Cost:** 300 stone
- **Build time:** 200 s
- **Territory influence:** radius 40 m, weight 30000
- **Garrison:** 20 slots (+3/s heal)
- **Vision:** 40 m
- **Capture points:** 500
- **Build territory:** own
- **Placement:** land
- **Requirements:** phase_town
- **Trains:** units/{civ}/support_healer_b
- **Classes:** Structure ConquestCritical CivSpecific
- **Visible classes:** Civic Town Temple TempleOfVesta
- **Footprint:** Circle r 11 m (height 12 m)
- **Obstruction:** Static 19 m × 19 m

## Built by

- **rome** — `structures/rome/temple_vesta`
