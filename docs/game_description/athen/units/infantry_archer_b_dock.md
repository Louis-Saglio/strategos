# infantry_archer_b_dock

Athenian-specific unit of 0 A.D. 0.28.0 — only the athenians can train it. See `docs/game_description/athen/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/athen/infantry_archer_b_dock` (full athen template chain).

## Guide

The dock-trained Cretan Mercenary Archer — the ranged half of the
`iphicratean_reforms` package: trained at the **dock** (gated on the
tech), 50 HP, 7.92-pierce bow at 60 m, 60 metal, 7 s. It is a
mercenary-mixin archer (metal-paid, cannot gather, auto-promotes at 0
XP) — identical in stats to the barracks `infantry_archer_b`, but
trainable at sea, so an Athenian fleet can raise its own archer
screening force on the spot. Its promotion chain differs slightly from
the land archer's: `infantry_archer_a_dock` then the regular
`infantry_archer_e`.

## Basic stats

- **Generic name:** Cretan Mercenary Archer
- **Health:** 50 HP
- **Armor:** 1 hack / 1 pierce / 10 crush
- **Attack:** Capture — strength 2.5 — range 4 m — repeat 1 s — restricted Field Palisade Wall
- **Attack:** Ranged "Bow" — damage 7.92 pierce — range 60 m — prepare 0.8 s — repeat 1.25 s — preferred Human
- **Speed:** walk 10.3 m/s, run 17.2 m/s
- **Vision:** 80 m
- **Cost:** 60 metal
- **Build time:** 7 s
- **Population:** 1
- **Classes:** Unit Organic ConquestCritical Human CitizenSoldier
- **Visible classes:** Builder Citizen Worker Soldier Infantry Ranged Archer Mercenary
- **Rank:** Basic

## Ranks

### Advanced — `units/{civ}/infantry_archer_a_dock` (Cretan Mercenary Archer)
Requires 100 XP.
- Health: ×1.25 → 62.5 HP
- Capture strength: +0.7 → 3.2
- Build time: ×1.2 → 8.4 s
- Gather base speed: ×0.7 → 0.7
- Loot: ×1.2
- Ranged spread: ×0.8

### Elite — `units/{civ}/infantry_archer_e`
Requires 100 XP.
- Health: ×1.25 (total ×1.56) → 78.13 HP
- Capture strength: +0.8 (total +1.5) → 4
- Build time: ×1.2 (total ×1.44) → 10.08 s
- Gather base speed: ×0.7 (total ×0.49) → 0.49
- Loot: ×1.2 (total ×1.44)
- Ranged spread: ×0.8 (total ×0.64)

## Trained by

- **athen** — `units/athen/infantry_archer_b_dock` (dock, after iphicratean_reforms)

