# Macedonians vs a generic civilisation

Synthesis of **everything that differs between the mace civilisation and a
generic (non-civ-specific) civilisation** in 0 A.D. 0.28.0. The baseline
"generic civ" is defined as: the shared entity pool documented in
[`generic/`](../generic/) (units, buildings, technologies, auras with no
civ-specific content), the standard tech tree (`phase_town_generic` /
`phase_city_generic`, all techs with no civ requirement), the standard
`StartEntities` pattern, and no civ or team bonuses. Per-entity details are
in this folder's [`auras/`](auras/), [`technologies/`](technologies/) and
[`units/`](units/) directories (mace-only entities; mace has no
civ-exclusive building, so there is no `buildings/` folder) and in
[`generic/`](../generic/) (shared entities with per-civ variants); this file
is the complete delta.

Data sources: `civs/mace.json`, `templates/structures/mace/`,
`templates/units/mace/`, `data/technologies/`,
`data/auras/`, `special/players/mace.xml`.

## Narrative

Macedonia is a **phalanx-and-siege civilisation with a Town-phase arsenal**.
The citizen line is built around the **pikeman** (Foot Companion), which
replaces the spearman: 5/5 armor, an 8 m pike and a slow attack, trained at
the civic centre and barracks from the first minute and formed into a
**syntagma** (16+ pikemen) for a defensive wall. Everything else the
barracks and stable can train in the Town phase is cheap food-and-wood
skirmish support — the **peltast** javelineer and the **Thessalian lancer**
(cavalry spearman) — or **mercenaries paid in metal**: Cretan archers and
Rhodian slingers (60 metal each) and Odrysian cavalry javelineers (20 food
+ 90 metal), hired from the Town phase with +10% damage, 70% of the
normal training time and Advanced starting rank, but unable to gather. Mace is therefore flexible
in range and cavalry but every ranged option except the peltast is a
metal sink.

The late game is where it is distinctive. The City-phase barracks adds two
champions, the **Shield Bearer** (Hypaspist, champion spearman, also in a
phalanx; upgradeable to the Silver Shield via the 600-metal `silvershields`
tech) and the **Thracian Black Cloak** (champion swordsman with a long
rhomphaia and splash damage), the stable adds the **Companion Cavalry**,
and the arsenal trains the unique **champion crossbowman**. Three heroes
from the fortress shape the army: **Philip II** (fast cavalry; champions
within 60 m +20% damage and +2 capture), **Alexander III** (fast cavalry;
nearby soldiers +10% damage and +15% speed, enemies −10% damage, enemy
civic centres capture-regenerate at half rate) and **Demetrius I** (infantry;
siege engines +1 armor, +20% damage, +10% range). Only one hero can be alive
at a time.

The civ's real specialisation is **siege**. Its **arsenal is a Town-phase
building** (every other civ builds it in the City phase) and costs only 300
wood, so siege production does not wait for a stone- and metal-funded City
phase; it trains the bolt shooter (Oxybeles) from the Town phase, and the
catapult (Lithobolos), battering ram, siege tower and crossbowman once the
City phase is reached. The team bonus **Mechanical Innovation**
makes allied siege weapons and arsenals 25% cheaper and quicker to build,
and Demetrius I turns the siege train into the strongest in the field. The
navy is competent but not complete: arrow ships, rams and the
warship tech line, but no fire ships and no siege warships.

The economy has one civ bonus, **Resource-Rich Economy**: every storehouse
tech (gathering, mining, carry capacity) is researched instantly, so a mace
bot gets its wood and metal upgrades the moment it can pay for them. Add
**Hellenic Architecture** (structures +10% health and capture points) and
the ability to research `hellenistic_metropolis` (civic centres ×2 health,
capture points and arrows) so mace is hard to dislodge while its siege and heroes come online.

Weaknesses: **no citizen spearman or swordsman** (the pikeman is the only
citizen melee), **no ranged citizen-soldier except the peltast** (archers
and slingers are metal mercenaries), no chariots or elephants, and the
champion crossbowman, Silver Shields and heroes are metal-heavy, so the
army ceiling is set by metal income. In short: hold the line with pikes,
stay flexible with hired ranged and cavalry, then break the enemy with an
early arsenal and a hero-led siege army.

## Civ bonuses (things a generic civ does not have)

`civs/mace.json` has an empty `CivBonuses` list; the bonuses below come
from the player entity, auras and auto-researched techs.

- **Team bonus — "Mechanical Innovation"**
  (`data/auras/teambonuses/mace_player_teambonus.json`, attached by
  `special/players/mace.xml`): **Siege and Arsenal −25% resource costs and
  build time** for every ally (`MutualAlly`, mace included).
- **"Resource-Rich Economy"** (auto-researched tech
  `data/technologies/civbonuses/mace_storehouse.json`, requirement `mace`):
  storehouse technologies get **−100% research time** (they complete
  instantly; the resource cost is unchanged).
- **"Hellenic Architecture"** (auto-researched tech
  `data/technologies/civbonuses/greek_structures.json`, requirement
  `athen|mace|spart`): all **Structures except Wonder** get **+10% health and
  +10% capture points**. (Shared with athen and spart.)
- **Formations** (`special/players/mace.xml`): `special/formations/phalanx`
  (hoplites only, 10+ members — the Shield Bearer champion spearman) and
  `special/formations/syntagma` (infantry pikemen only, 16+ members).

## Starting entities

`civs/mace.json` — the standard pattern (1 CC, 4 women, 2 melee, 2 ranged,
1 cavalry), with mace's picks:

- 1 × `structures/mace/civil_centre`
- 4 × `units/mace/support_civilian` (women)
- 2 × `units/mace/infantry_pikeman_b` (the melee pair)
- 2 × `units/mace/infantry_javelineer_b` (the ranged pair)
- 1 × `units/mace/cavalry_spearman_b`

## Buildings

Mace has **no civ-exclusive building**: every mace structure is a variant
of a shared one, documented in [`generic/buildings/`](../generic/buildings/).
Differences from the generic building:

- **Arsenal is a Town-phase building** (`structures/mace/arsenal` replaces
  the generic `phase_city` requirement with `phase_town` and changes its
  visible classes from `City` to `Town`): 300 wood, 180 s, 2000 HP. It
  therefore also counts as a **Town structure** toward the three needed for
  the City phase (`phase_city_generic`). It still trains the units that
  need the City phase (ram, catapult, tower, crossbowman) only once that
  phase has been reached.
- **Fortress** (`structures/mace/fortress`): trains the three mace heroes
  (the generic fortress trains nothing) and researches `silvershields`.
- **Civic centre** (`structures/mace/civil_centre`): trains women, pikemen,
  peltasts and cavalry spearmen.
- **Barracks, stable, temple, house, etc.**: generic costs (barracks 200
  wood + 100 stone, stable 200 wood + 50 stone, temple 300 stone); the
  mace house is the standard large house (150 wood, 10 population, 1200
  HP). Mace overrides of other shared buildings (defense tower, dock,
  farmstead, storehouse, wonder, wall pieces) only change the footprint.
- **Theater**: mace gets the standard Greek theater (shared with athen, ptol,
  sele, spart — see [`generic/buildings/theater.md`](../generic/buildings/theater.md)):
  City phase, 200 wood + 600 stone + 200 metal, 500 s, one per player; its
  "Hellenization" aura gives all your structures +20% territory radius.
- **Walls**: palisade plus stone walls (`structures/mace/wallset_stone`,
  standard stats, mace footprints — see
  [`generic/buildings/wallset_stone.md`](../generic/buildings/wallset_stone.md)).
- **Vestigial mace templates, not buildable by anything**: the archery range
  (`structures/mace/range`), the library (`structures/mace/library`, only
  ptol builds a library), the stoa (`structures/mace/royal_stoa`) and the
  bolt/artillery towers (`tower_bolt`, `tower_artillery`). The range's
  trainer lists exist only for skirmish maps that pre-place one.
- **Shared buildings mace lacks entirely** (no mace template, no builder):
  elephant stable (cart/kush/maur/pers/ptol/sele) and military colony
  (ptol/sele).

## Units

### Mace-only units (trained by no other civ)

| Unit | Trained at | Phase | Notable stats |
|---|---|---|---|
| Shield Bearer (`champion_infantry_spearman`, "Hypaspist") | barracks | City (`unlock_champion_infantry`) | 200 HP, 6/6/20 armor, spear 10 hack + 8.5 pierce, 2.5× vs Cavalry, walk 9.5 / run 15.86 m/s, 80 food + 60 wood + 80 metal, 20 s, 1 pop; promotes at 2000 XP to `champion_infantry_spearman_02` (220 HP, +10% damage) |
| Champion Crossbowman (`champion_infantry_crossbowman`, "Gastraphetophoros") | arsenal | City | 120 HP, 3/3/20 armor, crossbow 30 pierce per 3 s at 60 m, 80 food + 60 wood + 80 metal, 20 s, 1 pop |
| Hero Philip II (`hero_philip_ii`) | fortress | City | 1200 HP cavalry (walk 18 m/s), spear 16 hack + 12 pierce, 1.75× vs Cavalry; aura: champions within 60 m +2 capture strength, +20% damage |
| Hero Alexander III (`hero_alexander_iii`) | fortress | City | 1200 HP cavalry, sword 26 hack (1.2× vs Hero); three auras (see below) |
| Hero Demetrius I (`hero_demetrius_i`) | fortress | City | 1000 HP infantry, 12/12/25 armor, sword 26 hack; aura: siege within 60 m +1 armor, +20% damage, +10% range and vision |

Heroes cost 0 population, require the City phase, take 50 s and are subject
to the global limit of **1 hero alive at a time** (`EntityLimits`).
Costs: Philip 300 food + 200 wood + 250 metal; Alexander 300 food + 150
wood + 300 metal; Demetrius 200 food + 150 wood + 200 metal.

- **The Champion Swordsman is not mace-only**: the Thracian Black Cloak
  (`champion_infantry_swordsman`) is a generic champion swordsman with a
  mace override (see
  [`generic/units/champion_infantry_swordsman.md`](../generic/units/champion_infantry_swordsman.md)):
  rhomphaia 10 hack + 6 hack splash (2.5 m, no friendly fire) at 5 m
  range, 1 s repeat, instead of the generic 16 hack sword.
- **Unreferenced hero templates**: `hero_craterus`, `hero_pyrrhus_i`
  (infantry/cavalry heroes with the auras `mace_hero_craterus` and
  `mace_hero_pyrrhus_i`), `hero_philip_ii_pike` and the `catafalque` exist
  as templates but no building trains them in a skirmish game.

### Training roster (what mace's buildings train)

- CC: women (`support_civilian`), pikeman_b, javelineer_b, cavalry
  spearman_b.
- Barracks: pikeman_b, javelineer_b, **Rhodian slinger** and **Cretan
  archer** (both metal mercenaries, Town phase, 60 metal, 7 s), + champion
  spearman (Shield Bearer) and champion swordsman (Thracian Black Cloak)
  once `unlock_champion_infantry` is researched (City).
- Stable: cavalry spearman_b ("Thessalian Lancer", 100 food + 50 wood), the
  **Odrysian cavalry javelineer** (metal mercenary, Town phase, 20 food +
  90 metal, 10.5 s), + champion cavalry ("Companion Cavalry", 260 HP —
  +20 over the generic 240) once `unlock_champion_cavalry` (City).
- Temple: healers (the Surgeon, standard stats, no aura).
- Arsenal: bolt shooter / Oxybeles (Town), lithobolos (City, 400 wood + 250
  stone), siege ram (City), siege tower (City), champion crossbowman
  (City). No ballista, scorpio, polybolos or onager.
- Fortress (City): 3 heroes (+ the `silvershields` tech).
- Dock: fishing, merchant, scout, arrow (Tetrērēs) and **ram** ships — no
  fire ship, no siege ship.
- Market: traders. House: women (`unlock_civilians_house_generic`).

The three mercenaries (`infantry_archer_b`, `infantry_slinger_b`,
`cavalry_javelineer_b`) use the shared `merc_inf`/`merc_cav` mixins: metal
cost only, `ResourceGatherer` disabled, +10% attack damage, ×0.7 training
time, and the auto-researched `upgrade_rank_advanced_mercenary` starts
them at Advanced rank. See the per-civ override lines in
[`generic/units/infantry_archer_b.md`](../generic/units/infantry_archer_b.md),
[`infantry_slinger_b.md`](../generic/units/infantry_slinger_b.md) and
[`cavalry_javelineer_b.md`](../generic/units/cavalry_javelineer_b.md).

### Shared unit classes mace does NOT have

- **No citizen spearman, swordsman, maceman, axeman or clubman**: the
  pikeman is the only citizen melee infantry; no champion pikeman or
  maceman either.
- Cavalry: no cavalry archer, no cavalry swordsman, no mercenary cavalry
  spearman.
- No chariots, no war elephants.
- Siege: no ballista, scorpio, polybolos or onager — only the ram, bolt
  shooter, lithobolos and siege tower.
- Navy: no fire ship and no siege warship (`ship_fire`, `ship_siege`
  absent); `warship_siege_attack` and `warship_fireship_attack` are not
  researchable.

## Technologies

- **Mace-only techs**: `civbonuses/mace_storehouse` (auto, see above) and
  **"Silver Shields Regiment"** ([`silvershields`](technologies/silvershields.md),
  fortress, City phase, 600 metal, 60 s): sets `Promotion/RequiredXp` to 0
  for champion infantry, converting the Shield Bearers into Silver Shields
  (`champion_infantry_spearman_02`: +10% health, +10% hack and pierce
  damage).
- **Shared-with-others techs**: `civbonuses/greek_structures` (Hellenic
  Architecture, auto, with athen and spart), `hellenistic_metropolis`
  (civic centre, City, 500 stone + 500 metal: CCs +100% health and capture
  points, double default arrows — with ptol and sele), `unlock_champion_infantry`
  (barracks, 600 food; "Agēma" is its mace-specific name).
- **Phase techs**: mace researches the generic ones (`phase_town_generic`,
  `phase_city_generic`) — no mace-specific phase techs. The arsenal counts
  as a Town structure for the City phase requirement.
- **Unlock techs**: `unlock_champion_infantry`, `unlock_champion_cavalry`,
  `unlock_civilians_house_generic` (standard).
- **Generic techs mace CANNOT research** (civ requirements exclude it —
  everything else in [`generic/technologies/`](../generic/technologies/) is
  available): `archery_tradition`, `exploration`, `hoplite_tradition`,
  `nisean_horses`, `ship_capture_resistance`, `ship_health`,
  `ship_movement_speed`, `soldier_attack_melee_03_variant`,
  `unlock_champion_chariots`, `warship_fireship_attack`,
  `warship_siege_attack`, and `civbonuses/celt_structures`.
- **Restricted techs mace DOES get**: `siege_pack_unpack` (siege −40%
  pack/unpack time), `siege_bolt_accuracy` (bolt shooters −20% spread),
  `warship_arrow_attack`, `warship_ramming_attack`, `warship_health`,
  `archer_attack_spread` (for its mercenary archers) and
  `hellenistic_metropolis`.

## Auras (summary)

| Aura | Carrier | Effect |
|---|---|---|
| `teambonuses/mace_player_teambonus` | the player (teambonus) | Siege and Arsenal −25% resource costs and build time, all allies |
| `units/heroes/mace_hero_philip_ii` | Philip II | champions within 60 m +2 capture strength, +20% melee and ranged damage |
| `units/heroes/mace_hero_alexander_iii_1` | Alexander III | soldiers within 60 m +10% attack damage, +15% walk speed |
| `units/heroes/mace_hero_alexander_iii_2` | Alexander III | enemy soldiers and structures within 30 m −10% attack damage |
| `units/heroes/mace_hero_alexander_iii_3` | Alexander III | enemy civic centres within 60 m −50% capture-point garrison regeneration |
| `units/heroes/mace_hero_demetrius_i` | Demetrius I | siege within 60 m +1 hack/pierce/crush armor, +20% damage, +10% ranged range, +10% vision |

The auras `units/heroes/mace_hero_craterus` (infantry pikemen within 60 m
+20% capture strength and melee damage) and `units/heroes/mace_hero_pyrrhus_i`
(soldiers +20% attack damage, −15% health) and the two Philip V catafalque
auras are attached only to the unreferenced templates described above
(see [`generic/auras/README.md`](../generic/auras/README.md)).

## Stat deltas on otherwise shared content

- All structures except Wonder: +10% health and +10% capture points
  (Hellenic Architecture, auto).
- Storehouse techs: no research time (Resource-Rich Economy, auto).
- Allied siege and arsenals: −25% cost and build time (team bonus).
- Champion cavalry: 260 HP, 5/6/20 armor, spear 12 hack + 10 pierce,
  capture 3.5 (generic: 240 HP, 5/5 armor, and no melee weapon in the
  shared template).
- Champion swordsman: rhomphaia 10 hack + 6 splash, range 5 m (generic:
  sword 16 hack at 3 m).
- Citizen mercenaries (archer, slinger, cavalry javelineer): metal-only
  costs, +10% damage, ×0.7 training time, no gathering, Advanced rank on
  spawn. Mace's cavalry javelineer: 19.8 pierce (generic 18) at 30 m, 20 food
  + 90 metal, 10.5 s (generic citizen: 100 food + 50 wood, 15 s).
- Arsenal: Town-phase requirement (generic: City).
- All other mace variants of shared units are identity-only overrides of
  the generic templates — no further stat differences.

## Non-gameplay

- Culture `hele` (Hellenic music set, emblem), 11 AI names, the skirmish
  replacements (house, cavalry, melee infantry), and the `catafalque`
  template are cosmetic only.
