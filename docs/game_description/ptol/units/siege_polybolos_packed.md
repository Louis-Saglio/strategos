# siege_polybolos_packed

Ptolemaic-specific unit of 0 A.D. 0.28.0 — only the ptolemies can train it. See `docs/game_description/ptol/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/ptol/siege_polybolos_packed` (full ptol template chain).

## Guide

The Polybolos is the Ptolemaic bolt shooter — the "Polybolos" civ bonus
incarnate: compared to the generic Bolt Shooter (240 pierce every 6 s) it
fires a **132-pierce** bolt (×0.55) every **3 s** (×0.5) with a 1.5 s
prepare, and adds 44-pierce splash damage — roughly the same damage over
time but far better against groups of infantry, where the splash hits
several targets per bolt. Same cost as the generic bolt shooter (250 wood
+ 250 metal), same 80 m range and 15 m minimum range, same 2 population
and 6.75 m/s crawl. This is the packed variant: it must unpack to fire
(the unpacked twin `siege_polybolos_unpacked` is immobile, 0.001 m/s) and
pack (5 s) to move again, so it needs escort and time to deploy. Trained
at the arsenal (City phase); the Ptolemies have no other bolt shooters,
so this is their entire anti-personnel artillery.

## Basic stats

- **Generic name:** Bolt Shooter
- **Health:** 200 HP
- **Armor:** 6 hack / 25 pierce / 5 crush
- **Attack:** Ranged "Bolt" — damage 132 pierce — range 80 m — min range 15 m — prepare 1.5 s — repeat 3 s — preferred Human
- **Speed:** walk 6.75 m/s, run 6.75 m/s
- **Vision:** 100 m
- **Cost:** 250 wood, 250 metal
- **Build time:** 20 s
- **Population:** 2
- **Classes:** Unit ConquestCritical
- **Visible classes:** Siege Ranged BoltShooter

## Trained by

- **ptol** — `units/ptol/siege_polybolos_packed` (arsenal)

