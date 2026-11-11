# Generic technologies of 0 A.D. 0.28.0

One file per **generic technology**: a tech available to **more than one** civilisation — either researchable from one of the civ's buildings (`Researcher/Technologies` lists) or auto-researched (`autoResearch: true`, e.g. the civ bonus techs in `civbonuses/`). Techs available to a single civilisation (civ-specific phase techs, pair choices, unique bonuses) are deliberately excluded.

All data was extracted from the game files, not from memory: `binaries/data/mods/public/simulation/data/technologies/` in the 0 A.D. source reference (0 A.D. 0.28.0, the version the harness runs; see `AGENTS.md`).

## Method

- **Researcher lists:** each building's `Researcher/Technologies` token list is resolved exactly like `Researcher.js` `GetTechnologiesList`: a `{civ}` token resolves to the `<civ>`-specific tech if its file exists, otherwise to the `generic` fallback (e.g. `phase_town_{civ}` → `phase_town_athen` for athen, `phase_town_generic` for the other civs). Tokens whose tech file does not exist are dropped.
- **Civ gates:** techs carry `requirements` operators `civ`, `notciv`, `all`, `any` (`globalscripts/Technologies.js` `InterpretTechRequirements`); a civ is excluded when those forbid it (e.g. `unlock_civilians_house_generic` has `notciv: kush`, the `civbonuses/` techs are gated to their civs).
- **Buildings:** the set of buildings a civ owns is the buildable-structure closure of `generic/buildings/` (builder lists with `{civ}` substitution and template existence).
- **Auto-research:** techs with `autoResearch: true` are researched automatically by every civ whose requirements allow it (`TechnologyManager.UpdateAutoResearch`); they appear with "auto-researched" instead of a building.
- **Stats:** cost, research time, requirements, supersedes/replaces, tooltip and the full `modifications` list (value + operation + affected classes) are read from the tech JSON. Per-civ `specificName` and `description` are flavour text and not listed.

## Index

| Technology | Civilisations | Type |
|---|---|---|
| [archer_attack_spread](archer_attack_spread.md) | 9 | researchable |
| [archery_tradition](archery_tradition.md) | 3 | researchable |
| [attack_soldiers_will](attack_soldiers_will.md) | 14 | researchable |
| [barracks_batch_training](barracks_batch_training.md) | 14 | researchable |
| [cavalry_health](cavalry_health.md) | 15 | researchable |
| [cavalry_movement_speed](cavalry_movement_speed.md) | 15 | researchable |
| [civbonuses/celt_structures](civbonuses__celt_structures.md) | 2 | auto |
| [civbonuses/greek_structures](civbonuses__greek_structures.md) | 3 | auto |
| [cost_healer](cost_healer.md) | 15 | researchable |
| [dock_efficiency](dock_efficiency.md) | 15 | researchable |
| [exploration](exploration.md) | 2 | researchable |
| [fishing_boat_gather_capacity](fishing_boat_gather_capacity.md) | 15 | researchable |
| [fishing_boat_gather_rate](fishing_boat_gather_rate.md) | 15 | researchable |
| [garrison_heal](garrison_heal.md) | 15 | researchable |
| [gather_animals_stockbreeding](gather_animals_stockbreeding.md) | 15 | researchable |
| [gather_capacity_basket](gather_capacity_basket.md) | 15 | researchable |
| [gather_capacity_carts](gather_capacity_carts.md) | 15 | researchable |
| [gather_capacity_wheelbarrow](gather_capacity_wheelbarrow.md) | 15 | researchable |
| [gather_farming_fertilizer](gather_farming_fertilizer.md) | 13 | researchable |
| [gather_farming_plows](gather_farming_plows.md) | 14 | researchable |
| [gather_farming_training](gather_farming_training.md) | 13 | researchable |
| [gather_lumbering_ironaxes](gather_lumbering_ironaxes.md) | 15 | researchable |
| [gather_lumbering_sharpaxes](gather_lumbering_sharpaxes.md) | 15 | researchable |
| [gather_lumbering_strongeraxes](gather_lumbering_strongeraxes.md) | 15 | researchable |
| [gather_mining_serfs](gather_mining_serfs.md) | 14 | researchable |
| [gather_mining_servants](gather_mining_servants.md) | 14 | researchable |
| [gather_mining_shaftmining](gather_mining_shaftmining.md) | 15 | researchable |
| [gather_mining_silvermining](gather_mining_silvermining.md) | 15 | researchable |
| [gather_mining_slaves](gather_mining_slaves.md) | 14 | researchable |
| [gather_mining_wedgemallet](gather_mining_wedgemallet.md) | 15 | researchable |
| [gather_wicker_baskets](gather_wicker_baskets.md) | 14 | researchable |
| [heal_range](heal_range.md) | 15 | researchable |
| [heal_range_2](heal_range_2.md) | 15 | researchable |
| [heal_rate](heal_rate.md) | 15 | researchable |
| [heal_rate_2](heal_rate_2.md) | 15 | researchable |
| [health_civilians_01](health_civilians_01.md) | 15 | researchable |
| [health_regen_units](health_regen_units.md) | 15 | researchable |
| [hellenistic_metropolis](hellenistic_metropolis.md) | 3 | researchable |
| [hoplite_tradition](hoplite_tradition.md) | 2 | researchable |
| [nisean_horses](nisean_horses.md) | 2 | researchable |
| [outpost_vision](outpost_vision.md) | 15 | researchable |
| [phase_city_generic](phase_city_generic.md) | 13 | researchable |
| [phase_town_generic](phase_town_generic.md) | 13 | researchable |
| [phase_village](phase_village.md) | 15 | auto |
| [pop_house_01](pop_house_01.md) | 15 | researchable |
| [pop_house_02](pop_house_02.md) | 15 | researchable |
| [ship_capture_resistance](ship_capture_resistance.md) | 0 | researchable (unreachable — no researcher) |
| [ship_health](ship_health.md) | 3 | researchable |
| [ship_movement_speed](ship_movement_speed.md) | 2 | researchable |
| [ship_vision](ship_vision.md) | 15 | researchable |
| [siege_attack](siege_attack.md) | 15 | researchable |
| [siege_bolt_accuracy](siege_bolt_accuracy.md) | 6 | researchable |
| [siege_cost_time](siege_cost_time.md) | 15 | researchable |
| [siege_health](siege_health.md) | 15 | researchable |
| [siege_pack_unpack](siege_pack_unpack.md) | 8 | researchable |
| [soldier_attack_melee_01](soldier_attack_melee_01.md) | 15 | researchable |
| [soldier_attack_melee_02](soldier_attack_melee_02.md) | 15 | researchable |
| [soldier_attack_melee_03](soldier_attack_melee_03.md) | 13 | researchable |
| [soldier_attack_melee_03_variant](soldier_attack_melee_03_variant.md) | 2 | researchable |
| [soldier_attack_ranged_01](soldier_attack_ranged_01.md) | 15 | researchable |
| [soldier_attack_ranged_02](soldier_attack_ranged_02.md) | 15 | researchable |
| [soldier_attack_ranged_03](soldier_attack_ranged_03.md) | 15 | researchable |
| [soldier_ranged_experience](soldier_ranged_experience.md) | 15 | auto |
| [soldier_resistance_hack_01](soldier_resistance_hack_01.md) | 15 | researchable |
| [soldier_resistance_hack_02](soldier_resistance_hack_02.md) | 15 | researchable |
| [soldier_resistance_hack_03](soldier_resistance_hack_03.md) | 15 | researchable |
| [soldier_resistance_pierce_01](soldier_resistance_pierce_01.md) | 15 | researchable |
| [soldier_resistance_pierce_02](soldier_resistance_pierce_02.md) | 15 | researchable |
| [soldier_resistance_pierce_03](soldier_resistance_pierce_03.md) | 15 | researchable |
| [spy_counter](spy_counter.md) | 15 | researchable |
| [stable_batch_training](stable_batch_training.md) | 14 | researchable |
| [tower_crenellations](tower_crenellations.md) | 15 | researchable |
| [tower_garrison](tower_garrison.md) | 15 | researchable |
| [tower_health](tower_health.md) | 14 | researchable |
| [tower_murderholes](tower_murderholes.md) | 15 | researchable |
| [tower_range](tower_range.md) | 15 | researchable |
| [tower_watch](tower_watch.md) | 15 | researchable |
| [trade_commercial_treaty](trade_commercial_treaty.md) | 15 | researchable |
| [trade_gain_01](trade_gain_01.md) | 15 | researchable |
| [trade_gain_02](trade_gain_02.md) | 15 | researchable |
| [trader_health](trader_health.md) | 15 | researchable |
| [unit_advanced](unit_advanced.md) | 15 | auto |
| [unit_elite](unit_elite.md) | 15 | auto |
| [unlock_champion_cavalry](unlock_champion_cavalry.md) | 8 | researchable |
| [unlock_champion_chariots](unlock_champion_chariots.md) | 4 | researchable |
| [unlock_champion_infantry](unlock_champion_infantry.md) | 9 | researchable |
| [unlock_civilians_house_generic](unlock_civilians_house_generic.md) | 14 | researchable |
| [unlock_shared_dropsites](unlock_shared_dropsites.md) | 15 | researchable |
| [unlock_shared_los](unlock_shared_los.md) | 15 | researchable |
| [unlock_spies](unlock_spies.md) | 15 | researchable |
| [upgrade_rank_advanced_mercenary](upgrade_rank_advanced_mercenary.md) | 15 | auto |
| [warship_arrow_attack](warship_arrow_attack.md) | 10 | researchable |
| [warship_fireship_attack](warship_fireship_attack.md) | 4 | researchable |
| [warship_health](warship_health.md) | 5 | researchable |
| [warship_ramming_attack](warship_ramming_attack.md) | 8 | researchable |
| [warship_siege_attack](warship_siege_attack.md) | 5 | researchable |
| [wonder_population_cap](wonder_population_cap.md) | 15 | researchable |

Also see `docs/GAME.md` → "Simulation templates and data organisation" for how the template system works (inheritance, merging, civ substitution, researcher lists).
