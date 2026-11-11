# champion_marine

Athenian-specific unit of 0 A.D. 0.28.0 — only the athenians can train it. See `docs/game_description/athen/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/athen/champion_marine` (full athen template chain).

## Guide

The Athenian Marine (Epibátēs Athēnaîos) is the melee champion, trained
at the **gymnasium** from the Town phase — earlier than any other civ's
champions. It is the `spec_champ` swordsman: 200 HP, 3/5/20 armor, a
16-hack sword on a 0.75 s repeat, and **walk 11.4 m/s** — fast enough to
keep up with a raiding force. Cheap for a champion (60 food + 40 wood +
60 metal, 15 s). The gymnasium needs no unlock tech, so Athens fields
champion infantry in the Town phase; its twin `champion_marine_dock` is
trained at the dock after `iphicratean_reforms`, for naval landings
without a transport chain.

## Basic stats

- **Generic name:** Athenian Marine
- **Health:** 200 HP
- **Armor:** 3 hack / 5 pierce / 20 crush
- **Attack:** Capture — strength 5 — range 4 m — repeat 1 s — restricted Field Palisade Wall
- **Attack:** Melee "Sword" — damage 16 hack — range 3 m — prepare 0.375 s — repeat 0.75 s — preferred Unit+!Ship
- **Speed:** walk 11.4 m/s, run 19.04 m/s
- **Vision:** 80 m
- **Cost:** 60 food, 40 wood, 60 metal
- **Build time:** 15 s
- **Population:** 1
- **Classes:** Unit Organic ConquestCritical Human
- **Visible classes:** Soldier Champion Infantry Melee Swordsman

## Trained by

- **athen** — `units/athen/champion_marine` (gymnasium)

