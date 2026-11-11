# hero_boudicca

British-specific unit of 0 A.D. 0.28.0 — only the britons can train it. See `docs/game_description/brit/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/brit/hero_boudicca` (full british template chain).

## Guide

Boudicca (Boudica) is the British chariot hero — a 1500 HP scythed
chariot whose javelin volley does 60 pierce at 30 m, one of the heaviest
ranged hits any hero throws. Her aura, "Champion Army" (+2 capture
strength,
+20% melee and ranged damage, +10% speed for champions within 40 m), is
the amplifier for the civ's champion pair: with her riding along, the
Brythonic swordsman hits for 19.2 hack and the Celtic chariot's javelins
for 43.2. She is the aggressive pick — park her with the champion
assault group and let the 40 m bubble do the work. 0 population, City
phase (like all heroes), trained at the **fortress**, subject to the
global limit of 1 hero alive at a time. Vestigial foot/cavalry variant
templates of her (`hero_boudicca_sword`,
`hero_boudicca_cavalry_javelineer`) exist but nothing trains them.

## Basic stats

- **Generic name:** Boudicca
- **Health:** 1500 HP
- **Armor:** 6 hack / 8 pierce / 25 crush
- **Attack:** Capture — strength 10 — range 4 m — repeat 1 s — restricted Field Palisade Wall
- **Attack:** Ranged "Javelin" — damage 60 pierce — range 30 m — prepare 0.4 s — repeat 1.5 s — preferred Human
- **Speed:** walk 17.82 m/s, run 24.95 m/s
- **Vision:** 100 m
- **Cost:** 360 food, 250 wood, 300 metal
- **Build time:** 60 s
- **Population:** 0
- **Classes:** Unit Organic ConquestCritical Human FastMoving
- **Visible classes:** Soldier Hero Cavalry Ranged Javelineer Chariot

## Trained by

- **brit** — `units/brit/hero_boudicca` (fortress)
