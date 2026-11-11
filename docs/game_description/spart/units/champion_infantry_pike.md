# champion_infantry_pike

Spartan-specific unit of 0 A.D. 0.28.0 — only the spartans can train it. See `docs/game_description/spart/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/spart/champion_infantry_pike` (full spartan template chain).

## Guide

The Spartan Pikeman (Phalangites Spartiatis) is a **vestigial champion
template** — it has the standard champion-pikeman stats (200 HP, 8/8/20
armor, pike 8 hack + 15 pierce at 8 m, 2.5× vs Cavalry) and the City
phase requirement, but **no trainer references it**: the syssiton trains
only the Spartan Hoplite, the barracks only the Skiritai Commando, and
no other structure lists `champion_infantry_pike`. It is the pikeman
half of a champion roster that in practice consists of the spear and
sword lines only — like the ptol Juggernaut, it exists in the data but
cannot be fielded in a normal game.

## Basic stats

- **Generic name:** Spartan Pikeman
- **Health:** 200 HP
- **Armor:** 8 hack / 8 pierce / 20 crush
- **Attack:** Capture — strength 5 — range 4 m — repeat 1 s — restricted Field Palisade Wall
- **Attack:** Melee "Pike" — damage 8 hack + 15 pierce — range 8 m — prepare 1 s — repeat 2 s — bonus 2.5× vs Cavalry — preferred Human
- **Speed:** walk 8.55 m/s, run 14.28 m/s
- **Vision:** 80 m
- **Cost:** 80 food, 60 wood, 80 metal
- **Build time:** 20 s
- **Population:** 1
- **Classes:** Unit Organic ConquestCritical Human
- **Visible classes:** Soldier Champion Infantry Melee Pikeman

## Trained by

- **spart** — `units/spart/champion_infantry_pike` (not trained by anything; construct/train directly only)
