# war_dog

British-specific unit of 0 A.D. 0.28.0 — only the britons can train it. See `docs/game_description/brit/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/brit/war_dog` (full british template chain).

## Guide

The War Dog (Agrocuna) is the British kennel unit — the game's only
**0-population combat unit**. For 100 food and 15 s at the kennel
(Village phase) you get a 110 HP, 1/1/1 armor chaser that runs at 27 m/s
— the fastest land unit in the game (only scout ships are quicker) —
and bites for 7 hack + 2 pierce
every 1 s. Its limits are hard ones: it **cannot attack Structures,
Ships or Siege** (the attack carries `RestrictedClasses Structure Ship
Siege`), it cannot gather or build, and it has only 30 m vision. It
counts as `Human` class (not `Infantry`), so it is healable and is
covered by Cunobeline's regeneration aura but not by the Woad Warriors
bonus. There is a hard **dog cap**: the player's `WarDog` training limit
is 0 at base plus 10 per completed kennel (each `Kennel` raises it via
`LimitChangers`), and at most 2 kennels can be built — so a British
army tops out at **20 dogs**. Each dog is 100 food — a food-sink for the
civ, but one that costs none of the population real soldiers need: swarm
them as pop-free cannon fodder, raiders of villagers and corpse-guards,
not as a main line. One starts the match with the Britons.

## Basic stats

- **Generic name:** War Dog
- **Health:** 110 HP
- **Armor:** 1 hack / 1 pierce / 1 crush
- **Attack:** Melee "Fangs" — damage 7 hack + 2 pierce — range 3 m — prepare 0.5 s — repeat 1 s — restricted Structure Ship Siege
- **Speed:** walk 13.5 m/s, run 27 m/s
- **Vision:** 30 m
- **Cost:** 100 food
- **Build time:** 15 s
- **Population:** 0
- **Classes:** Unit Organic ConquestCritical Human FastMoving
- **Visible classes:** Dog Melee

## Trained by

- **brit** — `units/brit/war_dog` (kennel)
