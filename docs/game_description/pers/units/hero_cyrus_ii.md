# hero_cyrus_ii

Persian-specific unit of 0 A.D. 0.28.0 — only the persians can train it. See `docs/game_description/pers/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/pers/hero_cyrus_ii` (full pers template chain).

## Guide

Cyrus II the Great (Kuruš) is the Persian cavalry hero: 1200 HP with
11/10/25 armor, a 16 hack + 12 pierce spear with the 1.75× vs Cavalry
bonus, at cavalry speed. Two things set him apart. His "Forefront Leader"
aura gives every own cavalry unit within 45 m +1 capture strength and +20%
melee and ranged damage — the natural centre of a Persian cavalry army
(which the roster encourages: axemen, javelineers, archers, lancers,
chariots). And he is himself a **trainer**: he trains the spear-mode
Persian Immortal (`champion_infantry`) on the move, with a ×0.7 batch-time
modifier, so a raiding force can reinforce itself with champions in the
field. Like all heroes he costs 0 population and is limited to 1 alive at
a time, trained at the Winter Palace (City phase).

## Basic stats

- **Generic name:** Cyrus II The Great
- **Health:** 1200 HP
- **Armor:** 11 hack / 10 pierce / 25 crush
- **Attack:** Capture — strength 10 — range 4 m — repeat 1 s — restricted Field Palisade Wall
- **Attack:** Melee "Spear" — damage 16 hack + 12 pierce — range 4 m — prepare 0.5 s — repeat 1.25 s — bonus 1.75× vs Cavalry — preferred Unit+!Ship
- **Speed:** walk 18 m/s, run 25.2 m/s
- **Vision:** 100 m
- **Cost:** 300 food, 200 wood, 250 metal
- **Build time:** 50 s
- **Population:** 0
- **Classes:** Unit Organic ConquestCritical Human FastMoving
- **Visible classes:** Soldier Hero Cavalry Melee Spearman

## Trained by

- **pers** — `units/pers/hero_cyrus_ii` (tachara)

