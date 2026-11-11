# Generic units of 0 A.D. 0.28.0

One file per **generic unit**: a unit type trainable in a skirmish game by **more than one** civilisation (unit types trainable by a single civilisation — heroes, civ-specific champions, unique mercenaries — are deliberately excluded).

All data was extracted from the game files, not from memory: `binaries/data/mods/public/simulation/templates/` in the 0 A.D. source reference (0 A.D. 0.28.0, the version the harness runs; see `AGENTS.md`). Template paths below are relative to that directory.

## Method

- **Training data:** each civilisation's buildings carry a `Trainer` component listing the entity templates it can train, with `{civ}` replaced by the owner's civ code and `{native}` by the building's own civ code (`simulation/components/Trainer.js`). An entry is only trainable if the referenced template exists (`TemplateExists`); entries pointing to a missing file are silently dropped.
- **Which civs:** for each of the 15 civs, the analysis resolves every structure the civ can own (its `structures/<civ>/*.xml`, the starting entities from `simulation/data/civs/<civ>.json`, and the generic `skirmish/structures/default_*`), collects the resolved `Trainer` lists, and keeps entries whose file exists. The union over civs gives 133 trainable unit types: **36 trained by 2+ civs** (documented here) and 97 trained by a single civ (excluded).
- **Stats:** each unit file inherits from a shared template chain (`parent` attribute, `A|B` = "B as base, then A on top"). The generic stats shown are the full merge of the deepest template common to all civ variants (the engine's `CParamNode` merge semantics: child overrides, token lists merged, `disable`/`replace`/`op` attributes honoured). When a civ variant overrides the generic stats, the file lists the differing values. Armor is the `Resistance/Entity/Damage` values (hack/pierce/crush); speeds are `UnitMotion` walk/run; prepare/repeat times are in seconds (templates store milliseconds).
- **Engine arithmetic is `CFixed_15_16` fixed-point.** Values are stored and
  combined as `int(v × 65536)` (truncating); multiplication is `(a × b) >> 16`. This
  is why merged stats sometimes don't match naive float math (e.g. run speed
  9.5 × 1.67 → 15.86, not 15.87). Run speed is never stored directly — it is walk
  speed × `UnitMotion/RunMultiplier` (1.67 infantry, 1.4 cavalry), computed in
  fixed point.
- **Capture & gathering:** the `Capture` attack line shows the capture strength, range, repeat time and restricted classes (from the `Attack/Capture` section). "Gather" lines show the `ResourceGatherer` data: base speed multiplier, the rates per resource subtype (e.g. `food.fruit`; the engine looks up the specific subtype first, then the generic resource type — `ResourceGatherer.js` `GetTargetGatherRate`), and the carrying capacities.
- **Ranks:** upgradable units get a "Ranks" section per non-basic rank (Advanced, Elite) with the promotion target, the required XP and every stat that changes. The changes come from the auto-researched `unit_advanced` / `unit_elite` techs (verified: the `_a`/`_e` template files themselves only change `Identity/Rank`, `Promotion` and the actor) plus any template-level stat differences for special promotions (e.g. rome's champion → "First Cohort", athen's elite spearman → champion). Per-civ deviations (XP values, civs that skip or extend the ladder) are noted.
- **Excluded from these files:** the `Slaughter` attack (used to kill corralled animals) and promotion targets (units trained directly only).

## Index

| Unit | Civilisations | Generic stats template |
|---|---|---|
| [cavalry_archer_b](cavalry_archer_b.md) | 4 | `template_unit_cavalry_ranged_archer` |
| [cavalry_javelineer_b](cavalry_javelineer_b.md) | 13 | `template_unit_cavalry_ranged_javelineer` |
| [cavalry_javelineer_merc_b](cavalry_javelineer_merc_b.md) | 2 | `template_unit_cavalry_ranged_javelineer` |
| [cavalry_spearman_b](cavalry_spearman_b.md) | 8 | `template_unit_cavalry_melee_spearman` |
| [cavalry_spearman_merc_b](cavalry_spearman_merc_b.md) | 2 | `template_unit_cavalry_melee_spearman` |
| [cavalry_swordsman_b](cavalry_swordsman_b.md) | 5 | `template_unit_cavalry_melee_swordsman` |
| [champion_cavalry](champion_cavalry.md) | 10 | `template_unit_champion_cavalry` |
| [champion_chariot](champion_chariot.md) | 4 | `template_unit_champion_cavalry` |
| [champion_elephant](champion_elephant.md) | 6 | `template_unit_champion_elephant_melee` |
| [champion_infantry](champion_infantry.md) | 3 | `template_unit_champion_infantry_spearman` |
| [champion_infantry_maceman](champion_infantry_maceman.md) | 2 | `template_unit` |
| [champion_infantry_pikeman](champion_infantry_pikeman.md) | 2 | `template_unit_champion_infantry_pikeman` |
| [champion_infantry_swordsman](champion_infantry_swordsman.md) | 7 | `template_unit_champion_infantry_swordsman` |
| [infantry_archer_b](infantry_archer_b.md) | 8 | `template_unit_infantry_ranged_archer` |
| [infantry_javelineer_b](infantry_javelineer_b.md) | 11 | `template_unit_infantry_ranged_javelineer` |
| [infantry_pikeman_b](infantry_pikeman_b.md) | 5 | `template_unit_infantry_melee_pikeman` |
| [infantry_slinger_b](infantry_slinger_b.md) | 7 | `template_unit_infantry_ranged_slinger` |
| [infantry_spearman_b](infantry_spearman_b.md) | 13 | `template_unit_infantry_melee_spearman` |
| [infantry_swordsman_b](infantry_swordsman_b.md) | 5 | `template_unit_infantry_melee_swordsman` |
| [infantry_swordsman_merc_b](infantry_swordsman_merc_b.md) | 2 | `template_unit_infantry_melee_swordsman` |
| [ship_arrow](ship_arrow.md) | 15 | `template_unit_ship_warship_arrow` |
| [ship_fire](ship_fire.md) | 4 | `template_unit_ship_fire` |
| [ship_fishing](ship_fishing.md) | 15 | `template_unit_ship_fishing` |
| [ship_merchant](ship_merchant.md) | 15 | `template_unit_ship_merchant` |
| [ship_ram](ship_ram.md) | 8 | `template_unit_ship_warship_ram` |
| [ship_scout](ship_scout.md) | 15 | `template_unit_ship_warship_scout` |
| [ship_siege](ship_siege.md) | 5 | `template_unit_ship_warship_siege` |
| [siege_ballista_packed](siege_ballista_packed.md) | 2 | `template_unit_siege_stonethrower` |
| [siege_lithobolos_packed](siege_lithobolos_packed.md) | 4 | `template_unit_siege_stonethrower` |
| [siege_oxybeles_packed](siege_oxybeles_packed.md) | 4 | `template_unit_siege_boltshooter` |
| [siege_ram](siege_ram.md) | 15 | `template_unit_siege_ram` |
| [siege_tower](siege_tower.md) | 5 | `template_unit_siege_tower` |
| [support_civilian](support_civilian.md) | 15 | `template_unit_support_civilian` |
| [support_civilian_house](support_civilian_house.md) | 15 | `template_unit_support_civilian` |
| [support_healer_b](support_healer_b.md) | 15 | `template_unit_support_healer` |
| [support_trader](support_trader.md) | 15 | `template_unit_support_trader` |

Also see `docs/GAME.md` → "Simulation templates and data organisation" for how the template system works (inheritance, merging, civ substitution, trainer lists).
