# hero_antiochus_iv

Seleucid-specific unit of 0 A.D. 0.28.0 — only the seleucids can train it. See `docs/game_description/sele/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/sele/hero_antiochus_iv` (full seleucid template chain).

## Guide

Antiochus IV Epiphanes (Antiokhos D' Epiphanēs) is the Seleucid
cavalry-swordsman hero — 1200 HP with a fast 26-hack sword (repeat 0.75
s) and run 25.2 m/s. His aura, "Renowned Conqueror" (enemy structures,
ships and siege engines within 80 m −20% health), is the civ's siege
edge: it shortens every wall-breaking, tower-clearing and naval fight
while he is parked with the assault force. It does nothing to enemy
units, so he belongs at sieges, not open-field brawls — but 1200 HP
means he can stand in the range where the aura matters. 0 population,
City phase, trained at the **civic centre**, subject to the global limit
of 1 hero alive at a time (which also gates the second civic centre —
see `civ.md`).

## Basic stats

- **Generic name:** Antiochus IV
- **Health:** 1200 HP
- **Armor:** 11 hack / 9 pierce / 25 crush
- **Attack:** Capture — strength 10 — range 4 m — repeat 1 s — restricted Field Palisade Wall
- **Attack:** Melee "Sword" — damage 26 hack — range 4 m — prepare 0.375 s — repeat 0.75 s — preferred Unit+!Ship
- **Speed:** walk 18 m/s, run 25.2 m/s
- **Vision:** 100 m
- **Cost:** 300 food, 150 wood, 300 metal
- **Build time:** 50 s
- **Population:** 0
- **Classes:** Unit Organic ConquestCritical Human FastMoving
- **Visible classes:** Soldier Hero Cavalry Melee Swordsman

## Trained by

- **sele** — `units/sele/hero_antiochus_iv` (civil_centre)
