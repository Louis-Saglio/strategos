# pillar_ashoka

Mauryan-specific building of 0 A.D. 0.28.0 — only the mauryas can build it. See `docs/game_description/maur/buildings/README.md` for the method; shared buildings are documented in `docs/game_description/generic/buildings/`.

Stats resolved from `simulation/templates/structures/maur/pillar_ashoka` (full maur template chain).

## Guide

The Edict Pillar of Ashoka (Śāsana Stambha Aśokā) is the Mauryan trade
aura building: a cheap (100 stone + 100 metal, 80 s) City-phase column
whose "Edict of Ashoka" aura gives **traders within 75 m +20% walk
speed** — plant pillars along a trade route and the caravans shuttle
faster. It is inert otherwise: no territory influence, no trainer or
researcher, 4 m vision, no territory decay, and **uncapturable**
(`Capturable` disabled). It is **gated on the hero Ashoka**: the
`Pillar` build limit is 0 by default and raised by 5 while an
`Ashoka`-class entity (the hero) is owned — no Ashoka, no pillars, and
losing him re-imposes the limit. Built by Mauryan women and the three
citizen infantry types, min 75 m from another pillar.

## Basic stats

- **Generic name:** Edict Pillar of Ashoka
- **Health:** 1000 HP
- **Armor:** 24 hack / 30 pierce / 3 crush
- **Cost:** 100 stone, 100 metal
- **Build time:** 80 s
- **Vision:** 4 m
- **Build territory:** own
- **Build category:** Pillar (limit 0; +5 while Ashoka is owned)
- **Placement:** land
- **Build distance:** min 75 m from Pillar
- **Requirements:** phase_city
- **Classes:** Structure CivSpecific
- **Visible classes:** City Pillar
- **Footprint:** Square 7 m × 7 m (height 5 m)
- **Obstruction:** Static 4 m × 4 m
- **Auras:** structures/maur_pillar

## Built by

- **maur** — `structures/maur/pillar_ashoka` (maur women and the three citizen infantry types)

