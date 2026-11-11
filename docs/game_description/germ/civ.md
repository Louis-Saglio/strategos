# Germ vs a generic civilisation

Synthesis of **everything that differs between the germ civilisation and a
generic (non-civ-specific) civilisation** in 0 A.D. 0.28.0. The baseline
"generic civ" is defined as: the shared entity pool documented in
[`generic/`](../generic/) (units, buildings, technologies, auras with no
civ-specific content), the standard tech tree (`phase_town_generic` /
`phase_city_generic`, all techs with no civ requirement), the standard
`StartEntities` pattern, and no civ or team bonuses. Per-entity details are
in this folder's [`auras/`](auras/), [`buildings/`](buildings/),
[`technologies/`](technologies/) and [`units/`](units/) directories
(germ-only entities) and in [`generic/`](../generic/)
(shared entities with per-civ variants); this file is the complete delta.

Data sources: `civs/germ.json`, `templates/structures/germ/`,
`templates/units/germ/`, `data/technologies/`,
`data/auras/`, `special/players/germ.xml`.

## Narrative

Germ is a **migrating, champion-and-ram-early civilisation** built around
the Cimbri. Its signature is a Town-phase power spike: the **Great Hall**
(200 stone + 200 metal, Town phase) trains the **Cimbri Raider** champion
axeman and the **Log Ram** (200 wood + 75 metal) in the Town phase, whereas
the generic path needs the City phase for both (the `unlock_champion_*`
techs and the arsenal; germ cannot research the unlock techs at all and does
not need them). A Town-phase army of axemen with rams can therefore pressure
buildings earlier than a generic civ's champion-and-arsenal timing allows.
The price is metal: every champion is
100 metal and the Great Hall itself costs 200 of each premium resource, so
the size of the germ champion force is capped by metal, not by food or wood.

The citizen infantry is a plain spear-and-sling line — spearmen and slingers
from the Village phase (the slinger costs 30 stone, so it is stone-limited),
javelineers and swordsmen (10 metal) from the Town phase — with no archers
and no pikemen. Its trump is the **Cimbrian Clubman**, a cheap barracks
unit from the Village phase (50 food, 30 wood, 20 stone) with a
crush-heavy mace and 15 crush armor. The germ spearman is classed Guerilla
and the civ can form a **shield wall** (10+ spearmen only) and the
**anti-cavalry** square (16+ melee infantry) — formations a generic civ does
not have. Cavalry is limited to javelineers (civil centre and stable) and
Town-phase spearmen at the stable, plus the City-phase **Noble Cavalry**
champion (a swordsman) that the Great Hall, not the stable, trains.

The economy leans on mobility and food. **Civilians move +0.5 m/s faster
and gather meat at double rate** (both automatic), houses are +10 population
for 150 wood, and the **Supply Wagon** (25 food + 50 wood) is a mobile
dropsite for all four resources that ignores territory limits. The
**Wagon Encampment** (350 wood + 150 stone, Town) is a second production
hub that can be built in neutral territory, trains civilians, spearmen,
slingers and wagons and adds +20 population; **Wagon Trains** turns every
wagon into a +5-population house wagon and gives encampments +10 more. The
temple is half price in stone (150 wood + 150 stone) and trains a unique
champion healer, the **Seeress**, in the City phase: a healer that also
drains 2 HP/s from every enemy Human within 15 m.

The late game rests on three cavalry/infantry heroes from the fortress.
Boiorix gives **every soldier +10% attack damage globally** and +5/+2 range
nearby, Lugius is a raider (extra food/wood loot, enemy vision −20 m) and
Teutobod is a 1500 HP infantry tank that speeds up melee citizen infantry.
The covered ram, trained at the arsenal, is the heavy siege option.

The weaknesses are narrow siege and navy and a thin ranged game. **No
archers** anywhere, **no siege beyond rams** (no bolt shooters, catapults or
siege towers; the bolt-shooter techs are unavailable), **no ramming or siege
warships** (the navy is the arrow ship and fire ship, with no ship health
techs and no `ship_movement_speed`), and **no tower health tech**. The
Great Hall, the encampment and the temple all draw on stone and metal, the
premium resources. The team bonus gives every ally −5 metal on swordsmen and
axemen, which rewards sword-using teammates.

In short: Germ plays as a fast, metal-limited rush civilisation that should
reach a champion axeman and ram timing in the Town phase, expand through
wagon encampments, and finish with hero-buffed armies before its siege and
naval limits catch up with it.

## Civ bonuses (things a generic civ does not have)

- **Team bonus — "Stolen Arms"** (`data/auras/teambonuses/germ_player_teambonus.json`,
  attached by `special/players/germ.xml`): Swordsmen and Axemen of all kinds
  cost **−5 metal** for every ally (`MutualAlly`, germ included). It also
  affects the germ champion cavalry and the swordsman heroes (they carry the
  Swordsman class).
- **Civ bonus — "Seeresses"** (`civs/germ.json`): a unique champion healer,
  the Seeress, is available in the City phase at the temple (see below).
- **"Bovine Tradition"** (auto-researched tech
  `data/technologies/civbonuses/germ_meat.json`, requirement `germ`):
  Civilians get **+100% meat gather rate** (×2).
- **"Cimbrian Caravans"** (auto-researched tech
  `data/technologies/civbonuses/germ_women.json`, requirement `germ`):
  Civilians get **+0.5 walk speed**.
- **Formations** (`special/players/germ.xml`): the player gets
  `special/formations/shield_wall` (Infantry Spearmen only, 10+) and
  `special/formations/anti_cavalry` (Melee Infantry only, 16+) in addition to
  the standard formations. The germ spearman also lists both formations.
- No global structure stat modifiers (no wooden-construction penalty or
  similar).

## Starting entities

`civs/germ.json` — the standard pattern (1 CC, 4 civilians, 2 melee,
2 ranged, 1 cavalry) plus a supply wagon, with germ's picks:

- 1 × `structures/germ/civil_centre`
- 4 × `units/germ/support_civilian` (Germanic workers)
- 2 × `units/germ/infantry_spearman_b`
- 2 × `units/germ/infantry_slinger_b` (the ranged pair)
- 1 × `units/germ/support_wagon` (mobile dropsite — also the skirmish
  `special_starting_unit` replacement)
- 1 × `units/germ/cavalry_javelineer_b`

## Buildings

- **Cost changes**: temple 300 stone → **150 wood + 150 stone** (halves the
  stone). **House** is the big house: **150 wood, 50 s, +10 population, 6
  garrison slots, territory radius 20 m** (vs 75 wood / +5 / 30 s / 3 slots
  generically). Barracks (200 wood + 100 stone), stable (200 wood + 50 stone)
  and everything else match the generic template.
- **Germ-only building — Great Hall** (`structures/germ/great_hall`): 200
  stone + 200 metal, 150 s, **Town phase**; 2000 HP, 24/30/3 armor, 10
  garrison slots, only 500 capture points, non-root territory influence
  (radius 38). Trains the Cimbri Raider (Town), Noble Cavalry (City) and the
  Log Ram (Town), batch ×0.7. Built by germ's builders (civilians,
  spearmen, slingers, swordsmen, javelineers).
- **Germ-only building — Wagon Encampment** (`structures/germ/encampment`):
  350 wood + 150 stone, 220 s, **Town phase**; 1750 HP, 15/35/3 armor, 20
  garrison slots, **+20 population**, dropsite for all resources, **buildable
  in own or neutral territory** (min 1 m from a civil centre), no territory
  influence and no territory decay. Trains civilians, spearmen, slingers and
  supply wagons (batch ×0.8) and researches `wagon_trains`, shared LOS,
  spies and spy counter.
- **Germ-only building — Fortified Wagon Encampment**
  (`structures/germ/encampment_fortified`): not placeable directly; a City-
  phase upgrade of the encampment (200 wood + 200 metal, 30 s). 2625 HP,
  +5 hack armor, 3000 capture points; also trains the Log Ram.
- **Fortress trains the heroes** (`structures/germ/fortress`): Boiorix,
  Teutobod and Lugius (the generic fortress trains nothing).
- **Arsenal trains rams only** (`structures/germ/arsenal`): the Log Ram and
  the Covered Gate Smasher.
- **Stable** is restricted to cavalry spearman and cavalry javelineer
  (`structures/germ/stable` removes the champion cavalry).
- **Barracks** trains spearman, swordsman (Town), javelineer (Town), slinger
  and the Cimbrian Clubman, with **no champion unlock tech** and no
  champion swordsman (`structures/germ/barracks` removes
  `champion_infantry_swordsman` and `champion_infantry_axeman`).
- **Walls**: standard palisade + `structures/germ/wallset_stone`; wall stats
  are identical to the generic stone walls (long 3000 HP / 36 stone, tower
  4000 HP / 48 stone, gate 2500 HP / 12 wood + 18 stone).
- **Vestigial germ templates, not buildable by anything**: the archery
  range (`structures/germ/range`, only placed by skirmish-map replacement),
  the blacksmith (`structures/germ/blacksmith`) and the Cerannus totem
  (`structures/germ/totem`, a Monument with the iberian monument aura).
- **Shared buildings germ lacks entirely** (no germ template, no builder):
  elephant stable (cart/kush/maur/pers/ptol/sele), military colony
  (ptol/sele; germ has the encampment instead), theater (the five Greek
  civs).

## Units

### Germ-only units (trained by no other civ)

| Unit | Trained at | Phase | Notable stats |
|---|---|---|---|
| Cimbri Raider (`champion_infantry_axeman`) | great hall | **Town** | 160 HP, 6/5/20 armor, axe 18 hack + 6 crush (1 s), walk 11.4 / run 19.04 m/s, 60 food + 60 wood + 100 metal, 15 s, 1 pop |
| Seeress (`champion_healer`) | temple | City | 200 HP, 2/4/20 armor, heals 10 HP / 2 s within 20 m, 100 food + 50 wood + 100 metal, 20 s; three auras (see below) |
| Covered Gate Smasher (`siege_ram_covered`) | arsenal | City | 400 HP, 7/35/5 armor, ram 150 crush (1.5 s, 6.5 m), 7.2 m/s, garrison 10 Support/Infantry, 300 wood + 150 metal, 30 s, 3 pop |
| Supply Wagon (`support_wagon`) | CC, encampments | Village | mobile dropsite (all four resources), 200 HP, 4/4/10 armor, 5 m/s, 25 food + 50 wood, 12 s, 1 pop; promotes to `support_wagon_house` (+5 pop) at 5000 XP, or at once after `wagon_trains` |
| Hero Boiorix (`hero_boiorix`) | fortress | City | 1200 HP cavalry swordsman, 11/9/25 armor, sword 26 hack, run 25.2 m/s, 300 food + 150 wood + 300 metal; aura: all soldiers +10% attack damage (global) |
| Hero Lugius (`hero_lugius`) | fortress | City | 1200 HP cavalry spearman, 11/10/25 armor, spear 16 hack + 12 pierce (1.75× vs Cavalry), 300 food + 200 wood + 250 metal; aura: +15 food/wood loot within 60 m; enemy vision −20 m within 100 m |
| Hero Teutobod (`hero_teutobod`) | fortress | City | 1500 HP infantry swordsman, 12/12/25 armor, sword 26 hack, walk 11.25 m/s, 200 food + 150 wood + 200 metal; aura: melee citizen infantry +25% speed within 30 m |

Heroes cost 0 population, require city phase, and are subject to the global
limit of **1 hero alive at a time** (`EntityLimits`).

- **Germ variants of shared unit classes**: the **Log Ram**
  (`units/germ/siege_ram`: 300 HP, 1/10/8 armor, 120 crush per 2 s, 8.64 m/s,
  200 wood + 75 metal, 20 s, 3 pop; no garrison; **Town phase**, at the great
  hall, the arsenal and the fortified encampment), the **Cimbrian Noble
  Cavalry** (`units/germ/champion_cavalry`: swordsman champion, 260 HP,
  6/5/20 armor, sword 18 hack, 150 food + 80 wood + 100 metal, 18.75 s,
  City phase, great hall, no unlock tech) and the **Cimbrian Clubman**
  (`units/germ/champion_infantry_maceman`: a Village-phase citizen-grade
  mace unit, 100 HP, 1/2/15 armor, mace 5 hack + 7 crush, 50 food + 30 wood
  + 20 stone, 10 s; it cannot gather, build or promote and carries the
  `Champion` visible class). The maceman is shared with maur but its stats
  here are completely different.
- **The Cimbri Raider is germ's only Town-phase champion** and its only
  champion infantry; the other champions (healer, cavalry) are City phase.
- **Priests** (`units/germ/support_healer_b`, temple, Town) are the generic
  healer with no aura; the Seeress is the aura-carrying upgrade.

### Training roster (what germ's buildings train)

- CC: civilians, spearman_b, slinger_b, cavalry_javelineer_b, support_wagon.
- Encampment (Town): civilians, spearman_b, slinger_b, support_wagon; the
  fortified encampment also trains the Log Ram.
- Barracks: spearman_b, slinger_b, Cimbrian Clubman, + swordsman_b and
  javelineer_b (both Town phase).
- Stable: cavalry_javelineer_b, cavalry_spearman_b (Town).
- Great hall (Town): Cimbri Raider, Log Ram (both Town), Noble Cavalry (City).
- Temple (Town): priests (Town) and Seeress (City).
- Arsenal (City): Log Ram and Covered Gate Smasher.
- Fortress (City): the 3 heroes.
- Dock: fishing, merchant (Town), scout, **arrow ship** and **fire ship**
  (both Town) — no ram or siege ships.
- Market: traders. Corral: sheep, goats, pigs, cattle. House: civilians
  (after `unlock_civilians_house_generic`, 30 s each).

### Shared unit classes germ does NOT have

- **No archers of any kind**: no `infantry_archer_b`, no cavalry archer, no
  champion archer (the archery range template is vestigial);
  `archer_attack_spread` is not researchable.
- **No pikemen, no champion swordsman/spearman/pikeman/javelineer/slinger**
  (barracks and unlock tech excluded): the Raider and Noble Cavalry are the
  only champions besides the healer.
- No cavalry archer, citizen cavalry swordsman/axeman, or mercenaries
  (merc infantry/cavalry).
- No chariots, no war elephants.
- Siege: **rams only** — no ballista, scorpio, onager, lithobolos, oxybeles,
  polybolos or siege tower; `siege_bolt_accuracy` and `siege_pack_unpack` are
  not researchable.
- Navy: no ramming or siege warships (`ship_ram`, `ship_siege` absent);
  `warship_ramming_attack` and `warship_siege_attack` are not researchable.

## Technologies

- **Germ-only techs**:
  - `civbonuses/germ_meat` and `civbonuses/germ_women` (auto, see above).
  - **"Migratory Resettlement"** (`resettlement`, civil centre, Town phase,
    200 wood + 200 stone + 200 metal, 40 s): all structures except walls no
    longer decay in neutral or enemy territory (`TerritoryDecay/DecayRate ×0`).
  - **"Wagon Trains"** (`wagon_trains`, wagon encampment, Town phase,
    400 wood + 100 metal, 40 s): wagons promote at 0 XP (so all wagons become
    +5-population house wagons) and encampments get +10 population (30 for a
    single encampment). The tooltip says the wagon also unlocks training of
    workers; the house-wagon template has no `Trainer`, so no such unlock
    exists in the data.
  - **"Grove of Fetters"** (`grove_of_fetters`, temple, City phase, 600 wood
    + 300 metal, 40 s): Healers get **+50% maximum health**. It is advertised
    as unlocking the Seeress's "Human Sacrifice" aura, but that aura waits for
    a tech `healer_aura` that no data file defines, so it never activates.
- **Phase techs**: germ researches the generic ones (`phase_town_generic`,
  `phase_city_generic`) — no germ-specific phase techs.
- **Unlock techs**: germ can research `unlock_civilians_house_generic` only;
  `unlock_champion_infantry`, `unlock_champion_cavalry` and
  `unlock_champion_chariots` are closed to germ (not needed: the champions are
  trained directly).
- **Generic techs germ CANNOT research** (civ requirements exclude it —
  everything else in [`generic/technologies/`](../generic/technologies/) is
  available): `archer_attack_spread`, `archery_tradition`, `exploration`,
  `hellenistic_metropolis`, `hoplite_tradition`, `nisean_horses`,
  `ship_health`, `ship_movement_speed`, `siege_bolt_accuracy`,
  `siege_pack_unpack`, `soldier_attack_melee_03_variant`, `tower_health`,
  `unlock_champion_cavalry`, `unlock_champion_chariots`,
  `unlock_champion_infantry`, `warship_health`, `warship_ramming_attack`,
  `warship_siege_attack` (plus the other civs' `civbonuses/celt_structures`
  and `civbonuses/greek_structures`).
- **Restricted techs germ DOES get**: `warship_arrow_attack`,
  `warship_fireship_attack` (excluded for most other civs), and
  `soldier_attack_melee_03` (excluded for iber and maur, which get the
  variant instead).

## Auras (summary)

| Aura | Carrier | Effect |
|---|---|---|
| `teambonuses/germ_player_teambonus` | the player (teambonus) | Swordsmen and Axemen −5 metal cost, all allies |
| `units/germ_seer_1` ("Prophecy of Death") | Seeress | enemy Humans within 15 m −2 health regeneration rate (net −2 HP/s) |
| `units/germ_seer_1_buff` ("Human Sacrifice") | Seeress | enemy Humans within 15 m −1 more regen — requires tech `healer_aura`, which does not exist, so **never active** |
| `units/germ_seer_2` ("Sacrificial Rites") | Seeress | own Humans within 30 m −20% experience required to rank up |
| `units/heroes/germ_hero_boiorix_1` ("High Ground") | Boiorix | soldiers within 60 m +5 ranged range, +2 melee range |
| `units/heroes/germ_hero_boiorix_2` ("Hero of Arausio") | Boiorix | all soldiers +10% attack damage (melee hack/pierce, ranged pierce/crush; global) |
| `units/heroes/germ_hero_lugius_1` ("Plundering Raids") | Lugius | Humans, Siege and Ships within 60 m +15 food and wood loot |
| `units/heroes/germ_hero_lugius_2` ("Terror Cimbricus") | Lugius | enemy soldiers, rams, heroes and structures within 100 m −20 m vision |
| `units/heroes/germ_hero_teutobod_1` ("Furor Teutonicus") | Teutobod | melee Citizen Infantry within 30 m +25% walk speed |
| `units/heroes/germ_hero_teutobod_2` ("Warrior King") | Teutobod | description only (no modifications) — the +500 health and ×1.25 speed come from the template |

Shared auras carried by germ units: `units/ram_garrison` (Cimbri Raider,
Teutobod: +0.15 walk speed per garrisoned carrier to a ram), and
`units/heroes/hero_garrison` (all three heroes: +1 capture regeneration to a
structure they are garrisoned in).

## Stat deltas on otherwise shared content

- Civilians: +0.5 walk speed and ×2 meat gather rate (auto techs).
- Swordsmen and Axemen (all allies' too): −5 metal cost (team bonus).
- House: 150 wood, +10 population, 50 s, 6 garrison slots, territory radius
  20 m.
- Temple: 150 wood + 150 stone.
- Log Ram (`units/germ/siege_ram`) vs the generic ram: 300 HP (400),
  1/10/8 armor (7/35/5), 120 crush per 2 s at 7.5 m (150 per 1.5 s at 6.5 m),
  8.64 m/s (7.2), 200 wood + 75 metal (300 + 150), 20 s (30), Town phase.
- Champion cavalry (`units/germ/champion_cavalry`): 260 HP, 6/5/20 armor,
  sword 18 hack — a swordsman, trained at the great hall in the City phase.
- Spearman: Guerilla visible class, shield-wall and anti-cavalry formations.
- Wagons: `wagon_trains` turns them into +5 population house wagons.
- Arrow warship (`units/germ/ship_arrow`) and fire ship: standard stats
  (1000 HP arrow ship; no `ship_health` and no `warship_health`).
- All other germ variants of shared units are identity-only overrides of the
  generic templates — no further stat differences.

## Non-gameplay

- Culture `germ` (Germanic music set, emblem), 3 AI names (Claodicus,
  Divico, Caesorix), the catafalque (`units/germ/catafalque`, with the
  "Sacred Groves" auras `catafalques/germ_1` and `germ_2`, held by no
  trainable entity) and the skirmish replacements are cosmetic only.
