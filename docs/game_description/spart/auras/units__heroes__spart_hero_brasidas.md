# units/heroes/spart_hero_brasidas

Spartan-specific aura of 0 A.D. 0.28.0 — only the spartans can have it. See `docs/game_description/spart/auras/README.md` for the method; shared auras are documented in `docs/game_description/generic/auras/`.

Data file: `simulation/data/auras/units/heroes/spart_hero_brasidas.json`.

## Basic stats

- **Name:** Helot Reforms
- **Type:** range
- **Radius:** 60 m
- **Affects:** Citizen Infantry Javelineer
- **Description:** Citizen Infantry Javelineers +1 crush, hack, pierce resistance, +25% ranged attack pierce damage.
- **Modifications:**
  - ×1.25 Attack/Ranged/Damage/Pierce
  - +1 Resistance/Entity/Damage/Hack
  - +1 Resistance/Entity/Damage/Pierce
  - +1 Resistance/Entity/Damage/Crush

## Spartans

- attached by `units/spart/hero_brasidas`

Note: the Helot aura — the Helot Skirmisher (Sparta's only citizen
ranged infantry) gains +25% javelin damage and +1 to all armor within
60 m of Brasidas. That reverses the Helot Economy trade (−10% pierce)
with interest while he is near, and the 60 m radius covers a whole
skirmish screen. Pair Brasidas with the javelineer line; he is a
swordsman hero, so he fights at the front where the aura matters.
