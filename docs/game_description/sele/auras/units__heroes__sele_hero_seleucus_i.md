# units/heroes/sele_hero_seleucus_i

Seleucid-specific aura of 0 A.D. 0.28.0 — only the seleucids can have it. See `docs/game_description/sele/auras/README.md` for the method; shared auras are documented in `docs/game_description/generic/auras/`.

Data file: `simulation/data/auras/units/heroes/sele_hero_seleucus_i.json`.

## Basic stats

- **Name:** Zooiarchos
- **Type:** range
- **Radius:** 60 m
- **Affects:** Elephant Champion
- **Description:** Champion Elephants +20% melee attack damage, +20% movement speed.
- **Modifications:**
  - ×1.2 Attack/Melee/Damage/Hack
  - ×1.2 Attack/Melee/Damage/Pierce
  - ×1.2 Attack/Melee/Damage/Crush
  - ×1.2 UnitMotion/WalkSpeed

## Seleucids

- attached by `units/sele/hero_seleucus_i`

Note: Seleucus I is himself an elephant, and this aura turns the
Seleucid armored war elephants — already the upgraded `elephant_indian`
variant (1100 HP, 33 hack + 49.5 crush, 330 food + 220 metal, vs the
generic 1000 HP / 30 + 45) — into the hardest-hitting cavalry screen in
the game: +20% trunk damage and +20% speed for every own elephant
champion within 60 m of him. March him with the elephant corps, not
ahead of it — the aura is range-limited, and the elephants are the melee
line he needs to survive.
