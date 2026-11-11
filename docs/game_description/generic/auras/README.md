# Generic auras of 0 A.D. 0.28.0

One file per **generic aura**: an aura attached to entities that **2+ civilisations** can own (their trainable units, buildable structures and their player template). Auras carried only by one civilisation's entities are documented in the per-civ folders (`gaul/auras/`, `rome/auras/`, `cart/auras/`).

All data was extracted from the game files, not from memory: `binaries/data/mods/public/simulation/data/auras/` and `binaries/data/mods/public/simulation/templates/` in the 0 A.D. source reference (0 A.D. 0.28.0, the version the harness runs; see `AGENTS.md`).

## Method

- **Attachment:** entities carry aura names in an `Auras` token list (`simulation/components/Auras.js`); the aura JSON defines type (`range`/`garrison`/`garrisonedUnits`/`formation`/`global`), radius, affected classes/players, `stackable`, `requiredTechnology` and the `modifications` (same format as tech modifications).
- **Which civs:** for each of the 15 civs, the analysis walks the full inheritance chain of every unit/structure the civ can own plus its `special/players/<civ>.xml` player template, and collects the aura tokens declared by each template in the chain (token lists merge along the chain). The carriers listed per civ are the templates that declare the aura.
- **Gaia-carried auras:** the corral food-trickle auras are attached to gaia domestic animals (garrisoned in the corral), so they are documented here as shared auras with a note.
- **Unreachable auras:** `structures/farmstead_60`, `structures/loyalty_regen`, `units/catafalques/athen_catafalque_1`, `units/catafalques/athen_catafalque_2`, `units/catafalques/brit_catafalque_1`, `units/catafalques/brit_catafalque_2`, `units/catafalques/cart_catafalque`, `units/catafalques/gaul_catafalque_1`, `units/catafalques/gaul_catafalque_2`, `units/catafalques/germ_1`, `units/catafalques/germ_2`, `units/catafalques/han_catafalque_1`, `units/catafalques/han_catafalque_2`, `units/catafalques/iber_catafalque_1`, `units/catafalques/iber_catafalque_2`, `units/catafalques/kush_catafalque_1`, `units/catafalques/kush_catafalque_2`, `units/catafalques/mace_catafalque_1`, `units/catafalques/mace_catafalque_2`, `units/catafalques/maur_catafalque_1`, `units/catafalques/maur_catafalque_2`, `units/catafalques/pers_catafalque`, `units/catafalques/ptol_catafalque`, `units/catafalques/rome_catafalque_1`, `units/catafalques/rome_catafalque_2`, `units/catafalques/sele_catafalque_1`, `units/catafalques/sele_catafalque_2`, `units/catafalques/sele_catafalque_3`, `units/catafalques/spart_catafalque_1`, `units/catafalques/spart_catafalque_2`, `units/catafalques/spart_catafalque_3`, `units/centurion`, `units/heroes/mace_hero_craterus`, `units/heroes/mace_hero_pyrrhus_i` are attached to entities no civilisation can obtain in a skirmish (the catafalque auras — catafalques are not in any builder/trainer list; `structures/farmstead_60`/`structures/loyalty_regen` — decorative mills and the Ishtar gate; `units/centurion` and the mace heroes Craterus/Pyrrhus — unreferenced).

## Index

| Aura | Civilisations | Type |
|---|---|---|
| [structures/arsenal_repair](structures__arsenal_repair.md) | 15 | garrisonedUnits |
| [structures/temple_heal](structures__temple_heal.md) | 15 | range |
| [structures/theater](structures__theater.md) | 5 | global |
| [structures/wall_garrisoned](structures__wall_garrisoned.md) | 15 | turretedUnits |
| [structures/wonder_population_cap](structures__wonder_population_cap.md) | 15 | player |
| [structures/xp_trickle](structures__xp_trickle.md) | 15 | garrisonedUnits |
| [units/celtic_healer](units__celtic_healer.md) | 2 | range |
| [units/heroes/hero_garrison](units__heroes__hero_garrison.md) | 15 | garrison |
| [units/ram_garrison](units__ram_garrison.md) | 15 | garrison |

Also see `docs/GAME.md` → "Simulation templates and data organisation" for how the template system works.
