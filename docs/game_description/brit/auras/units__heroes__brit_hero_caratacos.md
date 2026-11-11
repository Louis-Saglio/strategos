# units/heroes/brit_hero_caratacos

British-specific aura of 0 A.D. 0.28.0 — only the britons can have it. See `docs/game_description/brit/auras/README.md` for the method; shared auras are documented in `docs/game_description/generic/auras/`.

Data file: `simulation/data/auras/units/heroes/brit_hero_caratacos.json`.

## Basic stats

- **Name:** Guerrilla Chief
- **Type:** global
- **Affects:** Soldier, Siege
- **Description:** Soldiers and Siege Engines +1 crush, hack, pierce resistance, +15% movement speed.
- **Modifications:**
  - +1 Resistance/Entity/Damage/Hack
  - +1 Resistance/Entity/Damage/Pierce
  - +1 Resistance/Entity/Damage/Crush
  - ×1.15 UnitMotion/WalkSpeed

## Britons

- attached by `units/brit/hero_caratacos`

Note: a **global** aura — the whole army, everywhere on the map, gets +1
to all armor and +15% walk speed while Caratacus lives, no range limit.
Combined with the Woad Warriors civ bonus (+5% infantry speed), the
British infantry line becomes genuinely fast: a javelineer runs at 11.4
× 1.05 × 1.15 ≈ 13.77 m/s walk. The +1 armor is flat and stacks with
whatever armor techs are researched. Pick Caratacus when the game plan
is a mobile, map-wide skirmish army rather than one big push.
