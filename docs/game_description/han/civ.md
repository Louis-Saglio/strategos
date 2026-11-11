# Han vs a generic civilisation

Synthesis of **everything that differs between the han civilisation and a
generic (non-civ-specific) civilisation** in 0 A.D. 0.28.0. The baseline
"generic civ" is defined as: the shared entity pool documented in
[`generic/`](../generic/) (units, buildings, technologies, auras with no
civ-specific content), the standard tech tree (`phase_town_generic` /
`phase_city_generic`, all techs with no civ requirement), the standard
`StartEntities` pattern, and no civ or team bonuses. Per-entity details are
in this folder's [`auras/`](auras/), [`buildings/`](buildings/),
[`technologies/`](technologies/) and [`units/`](units/) directories
(han-only entities) and in [`generic/`](../generic/)
(shared entities with per-civ variants); this file is the complete delta.

Data sources: `civs/han.json`, `templates/structures/han/`,
`templates/units/han/`, `data/technologies/`,
`data/auras/`, `special/players/han.xml`.

## Narrative

Han is the **administrative, crossbow-and-champion civilisation**. Its
economy is built around the **Imperial Minister**, a support unit from the
Village phase whose two 20 m auras give every nearby worker +10% gathering
rate and +10% build rate (up to 9 ministers, one in the starting group,
100 food + 100 metal each). Ministers are trained at the **Imperial
Ministry** — an early, stone-heavy (200 stone) territory-root building that
also researches the civ's Civil Engineering and Civil Service tech pairs.
Around that core han farms cheaply: rice paddies cost 60 wood and 30 s (but
take only 3 gatherers), houses give +10 population for 150 wood, the
automatic "Federated States" bonus raises the population cap by 10%, and a
han-only three-step farming chain (seed drill, water weeding, chain pump)
adds up to ×1.728 grain gathering. Metal and stone are spent where the civ's
premium things are: ministers, the ministry, the academy, champions.

The army is **ranged-heavy and champion-driven**. The citizen line is
spearmen and Halberdiers (a pole-arm pikeman with an 8 m reach) in front,
with the crossbowman (24 pierce per 3 s at 45 m, available in the Village
phase for 50 food + 50 wood) as the bulk damage dealer, plus archers in the
Town phase; the cavalry is swordsmen, spearmen and cavalry archers. There
are **no citizen swordsmen, javelineers or slingers**. All of han's champions
come from a single building: the **Imperial Academy** (City
phase, 150 stone + 150 metal) trains the Tiger Guard spearman, the champion
crossbowman, the Youzhou cavalry and the war chariot with **no champion
unlock tech** (han cannot research `unlock_champion_infantry`/`_cavalry`).
Three fortress techs push the whole army: Poison Blades (+20% melee damage,
paid in food and wood), Poison Arrows (+20% ranged damage, food and metal)
and Art of War (−20% promotion XP, food and metal) — han is the one civ that
cannot research the generic Soldier's Will (+25% attack), these replace it.

Heroes are all **cavalry/chariot** and come from the fortress or the
**Imperial Court**, a one-per-player upgrade of the civil centre (300 wood +
300 stone in the City phase) that makes it much sturdier (4500 HP, 30
garrison slots, +30 population) and adds the hero trainers. **Liu Bang** is
the cavalry-swordsman hero (+20% cavalry attack within 40 m, walls +10 health
regeneration), **Han Xin** the cavalry-spearman hero (citizen soldiers −20%
promotion XP within 30 m, +25% vision for own and allied soldiers) and **Wei
Qing** the chariot-crossbowman hero (champions +20% attack and +2 capture
within 60 m, enemy cavalry −10% attack within 30 m). Only one hero can be
alive at a time.

Defence leans on structures: the automatic "Great Wall" gives walls +50%
health (Liu Bang adds wall regeneration), the stone **Great Tower** (a
one-per-player upgrade of the defense tower with 2000 HP and up to 16
arrows) anchors a position, and the ministry is a second territory root that
keeps territory connected if the civil centre falls. Siege is thin: the **ram**, the
**siege tower** and the **mangonel** (230 crush at 85 m) — no bolt shooters,
no other catapults — and the navy is arrow ships and the siege
ship, with no ramming or fire ships. The team bonus "Silk Road" raises the
international trade bonus of every ally's markets by 20% (it does not apply
to han itself, which gets the equivalent from its own `silk_road` tech).

In short: Han plays a **boom-then-champions** game — a ministry-boosted
farming economy and mass crossbows in the early game, a stone/metal-funded
academy of champions with a cavalry hero in the City phase — and its
weaknesses are the premium-resource appetite (stone for the ministry/academy/
court, metal for everything elite), the missing citizen swordsmen/skirmishers
and siege breadth, and a thin navy.

## Civ bonuses (things a generic civ does not have)

`civs/han.json` has an empty `CivBonuses` list; han's bonuses are the player
template's auras, limits and formation plus two auto-researched techs:

- **Team bonus — "Silk Road"** (`data/auras/teambonuses/han_player_teambonus.json`,
  attached by `special/players/han.xml`): `Market/InternationalBonus` ×1.2 for
  the markets of every **`ExclusiveMutualAlly`** — i.e. mutual allies
  *excluding han itself* (`Diplomacy.js` `IsExclusiveMutualAlly`). The bonus
  only pays out when a trade route links markets of two different owners
  (see [`mechanics/trade_and_barter.md`](../mechanics/trade_and_barter.md)).
- **"Federated States"** (auto-researched tech `civbonuses/han_population`,
  requirement `han`): `Player/MaxPopulation` ×1.1 (+10% population limit).
- **"Great Wall"** (auto-researched tech `civbonuses/han_walls`, requirement
  `han`): Health/Max ×1.5 for every entity with the `Wall` class (the stone
  wall segments, towers and gates; palisade pieces carry the `Palisade`
  class instead and are not affected).
- **Imperial Ministers** (`units/han/support_minister`): the civ's signature
  unit with the `han_minister_gathering` and `han_minister_building` auras
  (see below); `Minister` is an entity-limit category of **9**.
- **Entity limits** (`special/players/han.xml`): `GreatTower` 1,
  `ImperialMinistry` 1, `ImperialCourt` 1, `Minister` 9 (plus the standard
  `Hero` 1).
- **Formation**: `special/formations/anti_cavalry` is added to the player's
  formations — a square formation for **16+ melee infantry** that han's
  spearmen and Halberdiers carry in their `UnitAI` formation list (germ also
  has this formation; han has no testudo or other civ-specific formation).

## Starting entities

`civs/han.json` — the standard pattern (1 CC, 4 civilians, 2 melee, 2
ranged, 1 cavalry) with han's picks and **one extra unit**:

- 1 × `structures/han/civil_centre`
- 4 × `units/han/support_civilian` ("Han Farmer", the standard civilian
  stats)
- 2 × `units/han/infantry_spearman_b`
- 2 × `units/han/infantry_crossbowman_b` (the ranged pair — other civs start
  with slingers, archers or javelineers here)
- 1 × `units/han/cavalry_swordsman_b`
- 1 × `units/han/support_minister` (extra unit, no equivalent in the
  standard pattern)

`SkirmishReplacements` map the skirmish-map placeholders to han units
(`special_starting_unit` → minister, `default_infantry_ranged_b` →
crossbowman, `default_cavalry` → cavalry swordsman), so skirmish maps that
pre-place those units hand han the same ones.

## Buildings

- **Han-only building — Imperial Ministry** (`structures/han/ministry`): 50
  wood + 200 stone + 50 metal, 200 s, **Village phase**, one per player; 3000
  HP, 3000 capture points, +20 population, 9 garrison slots (+1 HP/s), **a
  territory root** (60 m, weight 30000), counts as a `Village` structure for
  the Town-phase requirement. Trains ministers; researches the two Civil
  Engineering / Civil Service pairs and the spy techs `unlock_spies` and
  `spy_counter` (han's civil centre has them removed).
- **Han-only building — Imperial Academy** (`structures/han/academy`): 150
  stone + 150 metal, 200 s, **City phase**, no entity limit; 2000 HP, 10
  garrison slots (Infantry, Minister, Cavalry) with the `xp_trickle` aura.
  Trains the four academy champions (batch ×0.8). It does not research the
  barracks' batch-training or champion-unlock techs (removed in the
  template).
- **Han-only building — Imperial Court** (`structures/han/civil_centre_court`):
  not placeable, **upgraded from the civil centre** (`<Upgrade>`: 300 wood +
  300 stone, 40 s, City phase, one per player). 4500 HP, 3750 capture points,
  30 garrison slots (accepts Support, Infantry, Cavalry, Minister), +30
  population, still a territory root (140 m). Trains the three heroes, plus
  the civil-centre roster at a ×0.6 batch time. The civil centre cannot
  train while upgrading.
- **Han-only building — Great Tower** (`structures/han/defense_tower_great`):
  not placeable, **upgraded from the defense tower** (200 stone, 40 s, City
  phase, one per player). 2000 HP, 70 m range, 6 default arrows +1 per
  garrisoned Infantry (10 slots), +10 m vision and territory radius.
- **No cost swaps**: barracks, stable, temple, fortress, arsenal and the
  other shared buildings keep their generic costs; han only changes the
  trainer lists and footprints (below) plus the two differences under
  "Stat deltas".
- **Trainer / researcher swaps on shared buildings**:
  - barracks: spearman, crossbowman (Village), Halberdier (Town), archer
    (Town); researches `crossbow_training` and `archer_attack_spread`.
  - civil centre: civilian, spearman, crossbowman, cavalry swordsman.
  - arsenal: ram, siege tower, mangonel (all City); no bolt-shooter tech.
  - fortress: trains the 3 han heroes (the generic fortress trains nothing)
    and researches `art_of_war`, `poison_arrows`, `poison_blades` (plus the
    generic tower techs).
  - stable: trains cavalry only (no champion cavalry at the stable).
- **Walls**: han builds the standard stone wall set and the palisade set
  (`structures/han/wallset_stone`, `wallset_palisade`); `civs/han.json`
  lists only the stone set under `WallSets`. The "Great Wall" bonus applies
  to the stone set only.
- **Vestigial han templates, not buildable by anything**:
  `structures/han/laozigate` (Laozi Gate: 200 wood + 100 stone, Town phase,
  uncapturable, trains and researches nothing), `structures/han/fortress_old`,
  `structures/han/practice_range` and `structures/han/field_grain` (a plain
  "Tián" field variant, replaced by the rice paddy). The archery
  `structures/han/range` exists only when a skirmish map pre-places it (it
  trains citizen crossbowmen) and is not in any builder list.
- **Shared buildings han lacks entirely** (no han template, no builder):
  elephant stable (cart/kush/maur/pers/ptol/sele), military colony
  (ptol/sele), theater (the five Greek civs).

## Units

### Han-only units (trained by no other civ)

| Unit | Trained at | Phase | Notable stats |
|---|---|---|---|
| Imperial Minister (`support_minister`) | ministry | Village | 50 HP, 100 food + 100 metal, 15 s; auras: +10% gathering rate and +10% build rate for workers within 20 m; limit 9 |
| Infantry Crossbowman (`infantry_crossbowman_b`) | barracks, CC, court | Village | 50 HP, 50 food + 50 wood, 10 s; 24 pierce / 3 s at 45 m |
| Tiger Guard Spearman (`champion_infantry_spearman_academy`) | academy | City | 200 HP, 6/6/20 armor, spear 10 hack + 8.5 pierce, 2.5× vs Cavalry; 80 food + 60 wood + 80 metal, 15 s |
| Champion Crossbowman (`champion_infantry_crossbowman_academy`) | academy | City | 120 HP, 3/3/20 armor, 30 pierce / 3 s at 60 m, spread 0.8; 80 food + 60 wood + 80 metal, 15 s |
| Youzhou Cavalry (`champion_cavalry_spearman_academy`) | academy | City | 260 HP, 5/6/20 armor, spear 12 hack + 10 pierce, 1.75× vs Cavalry; run 25.2 m/s; 150 food + 80 wood + 100 metal, 18.75 s |
| Han War Chariot (`champion_chariot_academy`) | academy | City | 300 HP, 1/5/20 armor, 15 pierce bow, 60 m; run 23.8 m/s; 180 food + 100 wood + 120 metal, 22.5 s |
| Mangonel (`siege_mangonel_packed`) | arsenal | City | 375 HP, 230 crush + 120 crush splash at 85 m (min 26 m), 7 s repeat; 400 wood + 250 stone, 25 s, 3 pop |
| Hero Liu Bang (`hero_liu_bang_horse`) | court, fortress | City | 1200 HP, sword 26 hack / 0.75 s; auras: cavalry +20% attack (40 m), walls +10 regen (global) |
| Hero Han Xin (`hero_han_xin_horse`) | court, fortress | City | 1200 HP, spear 16 hack + 12 pierce, 1.75× vs Cavalry; auras: citizen soldiers −20% promotion XP (30 m), allied + own soldiers +25% vision (global) |
| Hero Wei Qing (`hero_wei_qing_chariot`) | court, fortress | City | 1500 HP, crossbow 45 pierce + 3 crush at 55 m / 3 s; auras: champions +2 capture and +20% attack (60 m), enemy cavalry −10% attack (30 m) |

Heroes cost 0 population (Han Xin 300 food + 200 wood + 250 metal, 50 s;
Liu Bang 300 food + 150 wood + 300 metal, 50 s; Wei Qing 360 food + 250 wood
+ 300 metal, 60 s) and share the global limit of **1 hero alive at a time**
(`Hero` category, `MatchLimit` 1). Heroes carry the `hero_garrison` aura
(+1 capture-point regeneration to a structure they garrison). Wei Qing's
champion aura does not reach heroes or citizen soldiers, only units with the
`Champion` class.

Han also shares some units with only a few civs — the **Halberdier**
(`infantry_pikeman_b`, han's pikeman variant, Town phase: 3/3/15 armor, "Ji"
10 hack + 3.5 pierce, 8 m reach, 2 s repeat, 2.5× vs Cavalry), archers
(`infantry_archer_b`, Town), cavalry archers (`cavalry_archer_b`, Town) and
the siege tower (shared with kush/mace/ptol/sele).

### Training roster (what han's buildings train)

- CC: civilian, spearman_b, crossbowman_b, cavalry_swordsman_b. The court
  adds the three heroes.
- Barracks: spearman_b, crossbowman_b (Village), pikeman_b (Halberdier,
  Town), archer_b (Town).
- Stable: cavalry_swordsman_b (Village), cavalry_spearman_b (Town),
  cavalry_archer_b (Town) — 100 food + 50 wood for the spearman and archer,
  no metal.
- Academy (City): 4 champions (see table).
- Ministry (Village): ministers.
- Fortress (City): 3 heroes.
- Temple (Town): healer.
- Arsenal (City): siege ram, siege tower, mangonel.
- Dock: fishing, merchant, scout, **arrow ship** (Town), **siege ship**
  (City).
- Market: trader. House: civilians (after `unlock_civilians_house_generic`).

### Shared unit classes han does NOT have

- **No citizen swordsman** (`infantry_swordsman_b`), **no javelineer**
  (`infantry_javelineer_b`), **no slinger** (`infantry_slinger_b`) — the
  citizen line is spearman, Halberdier, crossbowman, archer.
- No cavalry javelineers; no mercenaries of any kind.
- No generic champions: no champion swordsman, pikeman, maceman, axeman, no
  stable champion cavalry, no `champion_chariot` (only the academy
  versions), no war elephants.
- Siege: **no bolt shooters** (ballista/oxybeles, `siege_shoushe` is a
  vestigial template), no onager/lithobolos (the mangonel is han's catapult).
- Navy: no ram ship and no fire ship (`ship_ram`, `ship_fire` absent).

## Technologies

- **Han-only techs** (all in [`technologies/`](technologies/)):
  - `civbonuses/han_population`, `civbonuses/han_walls` (auto, see above).
  - **Civil Engineering pair** (ministry, a permanent choice, 100 wood + 300
    stone, 40 s each): `civil_engineering_01` "Improved Construction" (all
    structures −10% cost and build time) or `civil_engineering_02` "Robust
    Architecture" (all structures +20% health). Note: the second members'
    tooltips say "Unlocked in City Phase" but their `requirements` only
    demand `phase_town` (and `civ: han`), so they are available in the Town
    phase (same for `civil_service_02`).
  - **Civil Service pair** (ministry, a permanent choice, 100 food + 100
    wood, 40 s each): `civil_service_01` "Efficient Bureaucracy" (ministers
    −50% train time) or `civil_service_02` "Intensive Training" (ministers
    +50% health).
  - **Farming chain** (farmstead): `gather_farming_seed_drill` (Village,
    200 wood + 100 metal, 40 s), `gather_farming_water_weeding` (Town, 300
    wood + 200 metal, 50 s), `gather_farming_chain_pump` (City, 400 wood +
    300 metal, 60 s) — each +20% grain rate for workers (×1.728 total); same
    costs and effects as the generic plow/training/fertilizer line, which
    han cannot research.
  - `crossbow_training` (barracks, Town, 400 food + 400 wood, 40 s):
    Crossbowman-class units −20% training time (also the champion
    crossbowman and Wei Qing, which carry the class).
  - `art_of_war` (fortress, City, 1200 food + 1200 metal, 50 s): all
    promotion XP requirements ×0.8. `poison_blades` (fortress, City, 1200
    food + 1200 wood): melee soldiers +20% damage. `poison_arrows`
    (fortress, City, 1200 food + 1200 metal): ranged soldiers +20% damage.
  - `silk_road` (market, City, 500 food + 500 wood, 50 s, supersedes
    `trade_gain_02`): own markets' international bonus ×1.2.
- **Shared with cart only**: `exploration` (dock, Village, traders and ships
  +20% vision).
- **Phase techs**: han researches the generic ones (`phase_town_generic`,
  `phase_city_generic`) — no han-specific phase techs. Town needs five
  `Village` structures (the ministry counts), City three `Town` structures.
- **Unlock techs**: han can research `unlock_civilians_house_generic`
  (houses). It cannot research the champion unlocks — not needed, the
  academy champions only require `phase_city`. The legacy
  `unlock_females_house` tech is not offered either (no han building lists
  it; it only gates the untrained `support_female_citizen_house`).
- **Generic techs han CANNOT research** (civ requirements exclude it, or
  its buildings have the tech removed; everything else in
  [`generic/technologies/`](../generic/technologies/) is available):
  `archery_tradition`, `attack_soldiers_will`, `gather_farming_fertilizer`,
  `gather_farming_plows`, `gather_farming_training`, `hellenistic_metropolis`,
  `hoplite_tradition`, `nisean_horses`, `ship_health`, `ship_movement_speed`,
  `siege_bolt_accuracy` (removed from han's arsenal),
  `soldier_attack_melee_03_variant`, `unlock_champion_cavalry`,
  `unlock_champion_chariots`, `unlock_champion_infantry`,
  `warship_fireship_attack`, `warship_health`, `warship_ramming_attack`.
  `ship_capture_resistance` and the `celt_structures` / `greek_structures`
  civ-bonus techs are also unavailable (the first is listed by no building
  of any civ, the others are gated to other civs).
- **Restricted techs han DOES get**: `archer_attack_spread` (barracks and
  stable; it affects the `Archer` class — archers, cavalry archers and the
  war chariot, not crossbowmen), `siege_pack_unpack` (for the mangonel),
  `warship_arrow_attack` and `warship_siege_attack` (its arrow and siege
  ships), `exploration`.

## Auras (summary)

| Aura | Carrier | Effect |
|---|---|---|
| `teambonuses/han_player_teambonus` | the player (teambonus) | Mutual allies' (not han's) markets: international trade bonus ×1.2 |
| `units/han_minister_gathering` | minister | workers within 20 m: gathering rate ×1.1 (non-stackable) |
| `units/han_minister_building` | minister | workers within 20 m: build rate ×1.1 (non-stackable) |
| `units/heroes/han_hero_han_xin_1` | Han Xin | citizen soldiers within 30 m: promotion XP ×0.8 |
| `units/heroes/han_hero_han_xin_2` | Han Xin | own and allied soldiers: vision range ×1.25 (global) |
| `units/heroes/han_hero_liu_bang_1` | Liu Bang | all walls: +10 health regeneration (global) |
| `units/heroes/han_hero_liu_bang_2` | Liu Bang | cavalry within 40 m: +20% attack damage (melee and ranged) |
| `units/heroes/han_hero_wei_qing_1` | Wei Qing | champions within 60 m: +2 capture strength, +20% attack damage |
| `units/heroes/han_hero_wei_qing_2` | Wei Qing | enemy cavalry within 30 m: −10% attack damage |

Shared auras han also uses: `units/heroes/hero_garrison` (heroes),
`structures/xp_trickle` (barracks, stable and academy: garrisoned units gain
+1 XP/s) and `units/ram_garrison` (infantry inside rams speed them up).

## Stat deltas on otherwise shared content

- **House** (`structures/han/house`): 150 wood, +10 population, 1200 HP, 50 s,
  6 garrison slots, territory 20 m weight 40000 (generic: 75 wood, +5 pop,
  800 HP, 30 s, 3 slots, 16 m, 65535) — the same "big house" as athen, cart
  and germ.
- **Field** (`structures/han/field`, "Rice Paddy"): **60 wood and 30 s** (generic
  100 wood, 50 s) and **`MaxGatherers` 3** instead of 5
  (`templates/structures/han/field.xml`; the generic field doc lists the
  cost and time but not the lower gatherer cap).
- **Halberdier** (`units/han/infantry_pikeman_b`, Town phase): armor 3 hack /
  3 pierce / 15 crush (generic pikeman 5/5/15); attack "Ji" 10 hack + 3.5
  pierce at 8 m / 2 s (generic pike 4 hack + 7.5 pierce); carries the
  `anti_cavalry` formation.
- Stone wall pieces: +50% health (Great Wall, auto); all structures
  optionally −10% cost/build time or +20% health (the Civil Engineering
  pair).
- Population cap +10% (Federated States, auto).
- Heroes and champions are han's own templates (academy champions use the
  generic champion templates with ×0.75 build time; the chariot champion
  adds the standard chariot multipliers).
- All other han variants of shared units and buildings are identity-only
  overrides of the generic templates (names, footprints, garrison lists
  that add `Minister`) — no further stat differences.

## Non-gameplay

- Culture `china` (Chinese music set: Red Dawn, Hill of Sorrows; the
  `emblem_han` emblem), 28 AI names (27 distinct — "Liu Hong" appears twice),
  and the skirmish replacements are cosmetic only.
