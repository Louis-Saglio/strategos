# champion_juggernaut

Ptolemaic-specific unit of 0 A.D. 0.28.0 — only the ptolemies can train it. See `docs/game_description/ptol/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/ptol/champion_juggernaut` (full ptol template chain).

## Guide

The Juggernaut (Tessarakonterēs) is the Ptolemaic super-warship: a 4000
HP, 100-garrison siege warship that hurls 220-crush stones at 80 m (splash
damage against ships, structures and units) from a 12 × 48 m hull, for
800 wood + 400 metal and 5 population. It is **vestigial in 0.28.0**: no
trainer lists it (the dock trains the ordinary warships only), so it is
unreachable through the build UI in ordinary skirmish play — only a
directly placed train command would produce it. The pieces around it are
still live: the `juggernauts` tech (dock, City phase) buffs Warship health
+25% / speed −10%, the `Juggernaut` category limit is 1 per player, and
owning the hero Ptolemy IV raises that limit by 4 (a `LimitChangers`
entry) — all moot while the ship itself cannot be trained.

## Basic stats

- **Generic name:** Juggernaut
- **Health:** 4000 HP
- **Armor:** 2 hack / 5 pierce / 4 crush
- **Attack:** Ranged "Stone" — damage 220 crush — range 80 m — prepare 2 s — repeat 4 s — preferred Ship Human Structure
- **Speed:** walk 12 m/s, run 20.04 m/s
- **Vision:** 100 m
- **Cost:** 800 wood, 400 metal
- **Build time:** 60 s
- **Population:** 5
- **Classes:** Unit ConquestCritical Quinquereme Juggernaut
- **Visible classes:** Ship Warship NavalSiege Heavy

## Trained by

- **ptol** — `units/ptol/champion_juggernaut` (not trained by anything; construct/train directly only)

