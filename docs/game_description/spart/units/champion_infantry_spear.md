# champion_infantry_spear

Spartan-specific unit of 0 A.D. 0.28.0 — only the spartans can train it. See `docs/game_description/spart/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/spart/champion_infantry_spear` (full spartan template chain).

## Guide

The Spartan Hoplite (Spartiátēs) is the civ's signature champion — and
the only champion infantry available in the **Village phase** in the
game ("Laws of Lycurgus"): the syssiton is a Village-phase building and
the unit's requirement resolves to `phase_village`. For 80 food + 60
wood + 80 metal (×0.75 build time via the `spec_champ` mixin → 15 s) it
fields 200 HP, 6/6/20 armor and a spear of 10 hack + 8.5 pierce at a
**0.9 s repeat** — the fastest champion spear swing in the game, with
the standard 2.5× vs Cavalry and the phalanx formation. At 150 XP it
promotes to the **Spartan Olympic Hoplite** — a pure stat swap (see
Ranks), not a standard rank step. The tech stack built for it
(Tyrtean Paeans, Krypteia, the unreachable Agoge) makes it the center
of the Spartan army plan; the rival Skiritai Commando covers the sword
side.

## Basic stats

- **Generic name:** Spartan Hoplite
- **Health:** 200 HP
- **Armor:** 6 hack / 6 pierce / 20 crush
- **Attack:** Capture — strength 5 — range 4 m — repeat 1 s — restricted Field Palisade Wall
- **Attack:** Melee "Spear" — damage 10 hack + 8.5 pierce — range 4 m — prepare 0.5 s — repeat 0.9 s — bonus 2.5× vs Cavalry — preferred Unit+!Ship
- **Speed:** walk 9.5 m/s, run 15.86 m/s
- **Vision:** 80 m
- **Cost:** 80 food, 60 wood, 80 metal
- **Build time:** 15 s
- **Population:** 1
- **Classes:** Unit Organic ConquestCritical Human
- **Visible classes:** Soldier Champion Infantry Melee Spearman

## Ranks

### Spartan Olympic Hoplite — `units/{civ}/champion_infantry_spear_olympian`
Requires 150 XP. This is **not** a standard rank promotion: the olympian
template carries no `Rank`, so the `unit_advanced` tech does not apply —
the promotion is a pure template stat swap on top of the base unit:

- Health: ×1.2 → 240 HP
- Melee attack damage: ×1.2 → 12 hack + 10.2 pierce
- Everything else (repeat 0.9 s, armor, cost, speed) is unchanged, and
  there is no further promotion.

## Trained by

- **spart** — `units/spart/champion_infantry_spear` (syssiton)
