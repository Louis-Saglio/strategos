# Generic buildings of 0 A.D. 0.28.0

One file per **generic building**: a structure type that civilisations can **build** in a skirmish game and that is buildable by **more than one** civilisation (structures buildable by a single civilisation — civ-unique temples, halls, embassies, monuments… — are deliberately excluded).

All data was extracted from the game files, not from memory: `binaries/data/mods/public/simulation/templates/` in the 0 A.D. source reference (0 A.D. 0.28.0, the version the harness runs; see `AGENTS.md`). Template paths below are relative to that directory.

## Method

- **Buildability:** builder units carry a `Builder` component listing the structure templates they can build, with `{civ}` replaced by the owner's civ code (`simulation/components/Builder.js`, same mechanics as the training `Trainer` lists). An entry is only buildable if the referenced template exists; entries pointing to a missing file are silently dropped.
- **Which civs:** for each of the 15 civs, the analysis resolves every unit the civ can train (see `generic/units/`), collects the resolved `Builder` lists, and keeps entries whose file exists. The union over civs gives 56 buildable structure types: **23 buildable by 2+ civs** (documented here) and 33 buildable by a single civ (excluded).
- **Vestigial templates:** `structures/<civ>/range.xml` exists for athen/mace/pers/sele/han but no `Builder` list references `range` — the archery range is **not buildable** in 0.28 (archers train from the barracks). Likewise `structures/pers/apartment_block.xml` and the sele academy are unreferenced.
- **Stats:** each structure file inherits from a shared template chain (`parent` attribute, `A|B` = "B as base, then A on top"). The generic stats shown are the full merge of the deepest template common to all civ variants (engine `CParamNode` merge semantics). When a civ variant overrides the generic stats, the file lists the differing values. Armor is `Resistance/Entity/Damage`; "trains" lists are the `Trainer` entries (with `{civ}`/`{native}` placeholders; per-civ override lists only show entries whose unit template exists for that civ).
- **Wall sets:** `wallset_palisade`/`wallset_stone` are wall sets, not single buildings — they define the wall segments placed with the wall tool (stats in `template_structure_defensive_wall_*`).
- **Size (footprint):** building footprints differ by civilisation — nearly every structure type has per-civ footprint overrides (shape, width × depth, placement height), listed in each file's "Civilisation-specific overrides" section. The obstruction (the pathfinding/collision shape, a separate component) is usually a single Static block 1–2 m smaller per side than the footprint. Notable cases: brit structures use circular footprints, fields have `BlockMovement false` (units walk over them), and wall gates use two side obstructions with a passable gap in the middle.

## Index

| Building | Civilisations | Generic stats template |
|---|---|---|
| [arsenal](arsenal.md) | 15 | `template_structure_military_arsenal` |
| [barracks](barracks.md) | 15 | `template_structure_military_barracks` |
| [civil_centre](civil_centre.md) | 15 | `template_structure_civic_civil_centre` |
| [corral](corral.md) | 15 | `template_structure_resource_corral` |
| [defense_tower](defense_tower.md) | 15 | `template_structure_defensive_tower_stone` |
| [dock](dock.md) | 15 | `template_structure_military_dock` |
| [elephant_stable](elephant_stable.md) | 6 | `template_structure_military_elephant_stable` |
| [farmstead](farmstead.md) | 15 | `template_structure_economic_farmstead` |
| [field](field.md) | 15 | `template_structure_resource_field` |
| [forge](forge.md) | 15 | `template_structure_military_forge` |
| [fortress](fortress.md) | 15 | `template_structure_military_fortress` |
| [house](house.md) | 15 | `template_structure_civic_house` |
| [market](market.md) | 15 | `template_structure_economic_market` |
| [military_colony](military_colony.md) | 2 | `template_structure_civic_civil_centre_military_colony` |
| [outpost](outpost.md) | 15 | `template_structure_defensive_outpost` |
| [sentry_tower](sentry_tower.md) | 15 | `template_structure_defensive_tower_sentry` |
| [stable](stable.md) | 15 | `template_structure_military_stable` |
| [storehouse](storehouse.md) | 15 | `template_structure_economic_storehouse` |
| [temple](temple.md) | 15 | `template_structure_civic_temple` |
| [theater](theater.md) | 5 | `template_structure_special_theater` |
| [wallset_palisade](wallset_palisade.md) | 15 | `template_wallset` |
| [wallset_stone](wallset_stone.md) | 15 | `template_wallset` |
| [wonder](wonder.md) | 15 | `template_structure_wonder` |

Also see `docs/GAME.md` → "Simulation templates and data organisation" for how the template system works (inheritance, merging, civ substitution, builder/trainer lists).
