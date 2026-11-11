# temple_2

Ptolemaic-specific building of 0 A.D. 0.28.0 — only the ptolemies can build it. See `docs/game_description/ptol/buildings/README.md` for the method; shared buildings are documented in `docs/game_description/generic/buildings/`.

Stats resolved from `simulation/templates/structures/ptol/temple_2` (full ptol template chain).

## Guide

The Temple of Isis (Naos) is the Ptolemaic second temple — the civ's
hero and cult centre, one per player (`TempleOfIsis` limit). It is a
City-phase, upscaled temple (×1.5 on the standard temple: 450 stone,
300 s, 3000 HP, 30 garrison slots with the same +3/s garrison heal,
30 × 33 m footprint) that trains the **three Ptolemaic heroes** (plus the
usual healers) and researches the healing technologies and the
`pair_unlock_cult_ptol` pair — the two mutually-presented cults:
"Pharaonic Cult" (heroes +2 HP/s self-regeneration) and "Serapis Cult"
(+2 metal/s trickle). Like the lighthouse it is built only by Ptolemaic
women and mercenary infantry. Note the generic (Town-phase) temple remains
the early healer building; the Temple of Isis is the City-phase
upgrade that unlocks the heroes and the cult choice.

## Basic stats

- **Generic name:** Temple of Isis
- **Health:** 3000 HP
- **Armor:** 24 hack / 30 pierce / 3 crush
- **Cost:** 450 stone
- **Build time:** 300 s
- **Territory influence:** radius 40 m, weight 30000
- **Garrison:** 30 slots (+3/s heal)
- **Vision:** 40 m
- **Capture points:** 500
- **Build territory:** own
- **Build category:** TempleOfIsis (one per player)
- **Placement:** land
- **Requirements:** phase_city
- **Trains:** units/{civ}/support_healer_b units/{civ}/hero_ptolemy_i units/{civ}/hero_ptolemy_iv units/{civ}/hero_cleopatra_vii
- **Train batch time:** ×0.8
- **Researches:** cost_healer heal_range heal_range_2 heal_rate heal_rate_2 garrison_heal health_regen_units pair_unlock_cult_ptol
- **Classes:** Structure ConquestCritical CivSpecific
- **Visible classes:** Civic Temple City TempleOfIsis
- **Footprint:** Square 30 m × 33 m (height 12 m)
- **Obstruction:** Static 27 m × 30 m
- **Auras:** structures/temple_heal

## Built by

- **ptol** — `structures/ptol/temple_2` (ptol women and mercenary infantry; construct directly otherwise)

