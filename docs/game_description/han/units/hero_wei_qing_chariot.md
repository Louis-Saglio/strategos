# hero_wei_qing_chariot

Han-specific unit of 0 A.D. 0.28.0 — only the han can train it. See `docs/game_description/han/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/han/hero_wei_qing_chariot` (full han template chain).

## Guide

Wei Qing is han's chariot-crossbowman hero, trained at the Imperial Court or the fortress in the City phase for 360 food, 250 wood and 300 metal (0 population, 60 s) — the dearest of the three heroes in food and wood — and only one hero may be alive at a time. He has 1500 HP, 6/8/25 armor and a 45 pierce + 3 crush crossbow at 55 m every 3 s (16 damage/s), so he is a ranged hero to be kept out of melee. His "Mandate of Heaven" auras are han's strongest army buff: champions within 60 m get +20% attack damage and +2 capture strength, and enemy cavalry within 30 m deal −10% damage. The first aura affects only Champion-class units (the academy champions, not citizen soldiers or other heroes), so he pays off when the army is built around the academy.

## Basic stats

- **Generic name:** Hero Cavalry Crossbowman
- **Specific name:** Wèi Qīng
- **Health:** 1500 HP
- **Armor:** 6 hack / 8 pierce / 25 crush
- **Attack:** Capture — strength 10 — range 4 m — repeat 1 s — restricted Field Palisade Wall
- **Attack:** Ranged "Crossbow" — damage 45 pierce + 3 crush — range 55 m — prepare 0.6 s — repeat 3 s — spread 2 — preferred Human
- **Speed:** walk 16 m/s, run 22.4 m/s
- **Vision:** 100 m
- **Cost:** 360 food, 250 wood, 300 metal
- **Build time:** 60 s
- **Population:** 0
- **Requirements:** phase_city
- **Auras:** units/heroes/hero_garrison units/heroes/han_hero_wei_qing_1 units/heroes/han_hero_wei_qing_2
- **Loot:** 12 food, 30 metal, 480 xp
- **Classes:** Unit Organic ConquestCritical Human FastMoving
- **Visible classes:** Soldier Hero Cavalry Ranged Crossbowman Chariot

## Trained by

- **han** — `units/han/hero_wei_qing_chariot` (civil_centre_court, fortress)
