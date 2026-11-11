# units/heroes/spart_hero_leonidas

Spartan-specific aura of 0 A.D. 0.28.0 — only the spartans can have it. See `docs/game_description/spart/auras/README.md` for the method; shared auras are documented in `docs/game_description/generic/auras/`.

Data file: `simulation/data/auras/units/heroes/spart_hero_leonidas.json`.

## Basic stats

- **Name:** Last Stand
- **Type:** range
- **Radius:** 30 m
- **Affects:** Spearman
- **Description:** Spearmen +1 capture attack strength, +25% melee attack damage.
- **Modifications:**
  - +1 Attack/Capture/Capture
  - ×1.25 Attack/Melee/Damage/Hack
  - ×1.25 Attack/Melee/Damage/Pierce
  - ×1.25 Attack/Melee/Damage/Crush

## Spartans

- attached by `units/spart/hero_leonidas`

Note: the spear-line amplifier — every own spearman within 30 m (the
citizen Perioikoi Hoplite, the champion Spartan Hoplite, the
Neodamodes, even Leonidas himself) hits 25% harder in melee and
captures 1 point stronger. In the spear-heavy Spartan army this is the
highest-value combat aura of the three; keep Leonidas in the phalanx,
and remember the radius is small — he must stand in the line he is
buffing.
