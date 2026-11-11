# Gaul vs a generic civilisation

Synthesis of **everything that differs between the gaul civilisation and a
generic (non-civ-specific) civilisation** in 0 A.D. 0.28.0. The baseline
"generic civ" is defined as: the shared entity pool documented in
[`generic/`](../generic/) (units, buildings, technologies, auras with no
civ-specific content), the standard tech tree (`phase_town_generic` /
`phase_city_generic`, all techs with no civ requirement), the standard
`StartEntities` pattern, and no civ or team bonuses. Per-entity details are
in this folder's [`auras/`](auras/), [`buildings/`](buildings/),
[`technologies/`](technologies/) and [`units/`](units/) directories
(gaul-only entities) and in [`generic/`](../generic/)
(shared entities with per-civ variants); this file is the complete delta.

Data sources: `civs/gaul.json`, `templates/structures/gaul/`,
`templates/units/gaul/`, `data/technologies/`,
`data/auras/`, `special/players/gaul.xml`.

## Narrative

Gaul is a **wood civilisation**: its barracks, stable and temple cost wood
instead of stone, and every structure (except the Wonder) builds 20% faster
but ends up with 20% less health and 20% fewer capture points ("Wooden
Construction", automatic). The civ therefore expands quickly and cheaply on
the map's most abundant resource, at the price of infrastructure that is
easier to burn down and easier to capture. Stone stays a premium reserved
for civic centres, fortresses, wonders and the (also 20%-weaker) stone
walls — the walls themselves are the standard stats, just wooden-looking.

Its army is built around **cavalry and momentum**. All cavalry hit 10%
harder in melee ("Superior Cavalry", automatic), so the cavalry javelineers
it starts with and the town-phase cavalry swordsmen scale well. The
infantry line is plain — spearmen, javelineers, slingers, no citizen
swordsmen and no archers at all — but Gaul compensates with a champion
available a full phase earlier than the usual city-phase unlock: the
**Naked Fanatic**, trained at the temple from the Town phase for only food
and wood. Cheap, extremely fast and doing
2.5× damage to cavalry, fanatics are massable anti-cavalry shock troops
rather than line-holders: with 3/2 armor they trade badly in straight melee
against other infantry.

Aura play is Gaul's other edge. **Druids** (the town-phase temple healers)
give nearby soldiers +5% attack damage, and the city-phase **Assembly**
trains the champion **Trumpeter** — a solid swordsman whose carnyx debuffs
every enemy soldier within 20 m by −10% attack damage and capture strength
— alongside the three heroes: Brennus (extra metal loot), the fast
Vercingetorix (+20% attack and +1 capture for nearby soldiers and siege)
and Viridomarus (+15% gather speed for all workers). In the City phase the
barracks also unlocks its champion swordsman and the stable its noble
champion cavalry, and the farmstead's Harvesting Machine tech adds +10%
grain gathering.

The weaknesses are all at the edges. **No archers** (the archery range is
vestigial, the archer tech unavailable), **no siege beyond the ram** (no
bolt shooters or catapults, so city-phase enemy fortifications are a
problem), and **no ramming or siege warships** — the navy tops out at arrow
and fire ships, though it does get the extra ship health. In exchange, the
team bonus makes every ally's forge research 15% cheaper and faster, which
rewards team games.

In short: Gaul plays as a fast, wood-fed, cavalry-and-aura civilisation
that should win the early and mid game with numbers and buffs before its
siege and naval limits catch up with it.

## Civ bonuses (things a generic civ does not have)

- **Team bonus — "Products from Gaul"** (`data/auras/teambonuses/gaul_player_teambonus.json`,
  attached by `special/players/gaul.xml`): every Forge **of every ally**
  (`MutualAlly`, gaul included) gets −15% technology resource costs and
  research time.
- **Civ bonus — "Deas Celtica"** (`civs/gaul.json`): druids carry the
  `units/celtic_healer` aura — soldiers within 10 m of a druid get **+5%
  attack damage**. (Shared with brit.)
- **"Wooden Construction"** (auto-researched tech
  `data/technologies/civbonuses/celt_structures.json`, requirement `brit|gaul`):
  all **Structures except Wonder** get **−20% build time, −20% health,
  −20% capture points**. (Shared with brit.)
- **"Superior Cavalry"** (auto-researched tech
  `data/technologies/civbonuses/gaul_cavalry.json`, requirement `gaul`):
  all cavalry (non-hero) get **+10% melee attack damage** (hack, pierce,
  crush).

## Starting entities

`civs/gaul.json` — the standard pattern (1 CC, 4 women, 2 melee, 2 ranged,
1 cavalry), with gaul's picks:

- 1 × `structures/gaul/civil_centre`
- 4 × `units/gaul/support_civilian` (women)
- 2 × `units/gaul/infantry_spearman_b`
- 2 × `units/gaul/infantry_javelineer_b` (the ranged pair — other civs start
  slingers/archers/crossbows here)
- 1 × `units/gaul/cavalry_javelineer_b`

## Buildings

- **Cost swaps — stone is replaced by wood** on the three military/civic
  buildings that cost stone generically (everything else matches the generic
  template):
  - barracks: 200 wood + 100 stone → **300 wood** (0 stone)
  - stable: 200 wood + 50 stone → **250 wood** (0 stone)
  - temple: 300 stone → **300 wood** (0 stone)
  - (fortress, civic centre, wonder and stone walls keep their generic
    stone costs.)
- **Gaul-only building — Assembly of Princes** (`structures/gaul/assembly`):
  400 wood, 200 s, **city phase**; 2000 HP, 20 garrison slots, non-root
  territory influence. Trains the champion trumpeter and all 3 heroes (see
  below). Built by gaul's builders (women and spearmen, who get the assembly
  added to their `<Builder>` list).
- **Vestigial gaul templates, not buildable by anything**: the tavern
  (`structures/gaul/tavern`), the archery range (`structures/gaul/range`)
  and the rotary mill (`structures/gaul/rotarymill`) exist as templates but
  are referenced by no builder.
- **Shared buildings gaul lacks entirely** (no gaul template, no builder):
  elephant stable (cart/kush/maur/pers/ptol/sele), military colony
  (ptol/sele), theater (the five Greek civs).
- **Stone walls**: gaul gets the standard palisade + stone wallset
  (`structures/gaul/wallset_stone`, wooden reskin of the generic walls —
  same stats: long 3000 HP / 36 stone, tower 4000 HP / 48 stone), but
  Wooden Construction applies, so effective −20% HP / build time / capture
  points.

## Units

### Gaul-only units (trained by no other civ)

| Unit | Trained at | Phase | Notable stats |
|---|---|---|---|
| Naked Fanatic (`champion_fanatic`) | temple | **Town** | 200 HP, 3/2 armor, spear 10 hack + 8.5 pierce, **2.5× vs Cavalry**, walk 13.3 / run 22.2 m/s, 120 food + 100 wood, 15 s, 1 pop |
| Champion Trumpeter (`champion_infantry_trumpeter`) | assembly | City | 200 HP, 5/5 armor, sword 18 hack, 180 food + 120 metal, 18 s, 1 pop; carries the carnyx aura (see below) |
| Hero Brennus (`hero_brennus`) | assembly | City | 1000 HP, 12/12 armor, sword 26 hack; aura: +15 metal loot on humans/siege/ships within 60 m |
| Hero Vercingetorix (`hero_vercingetorix`) | assembly | City | 1200 HP, cavalry-speed (walk 18 m/s); aura: soldiers + siege within 60 m get +1 capture strength, +20% attack damage |
| Hero Viridomarus (`hero_viridomarus`) | assembly | City | 1000 HP, 12/12 armor, spear 15 hack + 12 pierce, 2.5× vs Cavalry; aura: workers +15% gather speed (global) |

Heroes cost 0 population, require city phase, and are subject to the global
limit of **1 hero alive at a time** (`EntityLimits`).

- **Druids** (`units/gaul/support_healer_b`, trained at the temple from Town
  phase) are gaul's healers: generic healer stats plus the Deas Celtica
  attack aura. The healer itself is shared with brit (celtic healer); a
  generic civ's priest has the same stats but no aura.
- **The Fanatic is the only champion available before the City phase**
  (Town phase, no unlock tech); all other champions are gated behind
  `unlock_champion_infantry` / `unlock_champion_cavalry` (city phase).

### Training roster (what gaul's buildings train)

- CC: spearman_b, javelineer_b, cavalry_javelineer_b.
- Barracks: spearman_b, javelineer_b, slinger_b, + champion swordsman
  `champion_infantry_swordsman` ("Soliduros") once
  `unlock_champion_infantry` is researched (city).
- Stable: cavalry_swordsman_b (town), cavalry_javelineer_b, +
  `champion_cavalry` ("Gallic Noble Cavalry", a spear-armed champion) once
  `unlock_champion_cavalry` (city).
- Temple: druids + Fanatics.
- Arsenal: **siege ram only** (no other siege weapon exists for gaul).
- Assembly (city): trumpeter + 3 heroes.
- Dock: fishing, merchant, scout, arrow and fire ships.
- House: women (`unlock_civilians_house_generic`, standard).
- Fortress: defensive/tech only, trains nothing (generic behavior).

### Shared unit classes gaul does NOT have

- **No archers of any kind**: no `infantry_archer_b`, no champion archer
  (the archery range template is vestigial); `archer_attack_spread` is not
  researchable.
- **No citizen swordsman** (`infantry_swordsman_b` does not exist for gaul);
  the only sword infantry are the city-phase champion and the trumpeter.
- No pikemen, macemen, axemen or clubmen (nor their champion variants).
- Cavalry: no cavalry archer, no citizen cavalry spearman.
- No chariots, no war elephants.
- Siege: **ram only** — no bolt shooters, catapults or siege towers;
  `siege_bolt_accuracy` and `siege_pack_unpack` are not researchable.
- Navy: no ramming or siege warships (`ship_ram`, `ship_siege` absent);
  `warship_ramming_attack` and `warship_siege_attack` are not researchable.

## Technologies

- **Gaul-only techs**: `civbonuses/gaul_cavalry` (auto, see above) and
  **"Harvesting Machine"** (`gather_farming_harvester`, farmstead, Town
  phase, 200 wood + 100 metal): workers **+10% grain gather rate**.
- **Shared-with-brit tech**: `civbonuses/celt_structures` (Wooden
  Construction, auto).
- **Phase techs**: gaul researches the generic ones (`phase_town_generic`,
  `phase_city_generic`) — no gaul-specific phase techs.
- **Unlock techs**: gaul can research `unlock_champion_infantry`,
  `unlock_champion_cavalry`, `unlock_civilians_house_generic`,
  `unlock_females_house` (all standard).
- **Generic techs gaul CANNOT research** (civ requirements exclude it —
  everything else in [`generic/technologies/`](../generic/technologies/) is
  available): `archer_attack_spread`, `archery_tradition`, `exploration`,
  `hellenistic_metropolis`, `hoplite_tradition`, `nisean_horses`,
  `ship_movement_speed`, `siege_bolt_accuracy`, `siege_pack_unpack`,
  `unlock_champion_chariots`, `warship_health`, `warship_ramming_attack`,
  `warship_siege_attack`.
- **Restricted techs gaul DOES get**: `ship_health` (only brit, gaul, iber)
  and `warship_fireship_attack` (excluded for most other civs, not gaul).

## Auras (summary)

| Aura | Carrier | Effect |
|---|---|---|
| `teambonuses/gaul_player_teambonus` | the player (teambonus) | Forges −15% tech cost/time, all allies |
| `units/celtic_healer` | druids | soldiers within 10 m +5% attack damage |
| `units/carnyx` | champion trumpeter | enemy soldiers within 20 m −10% attack damage and capture strength |
| `units/heroes/gaul_hero_brennus` | Brennus | humans/siege/ships within 60 m +15 metal loot |
| `units/heroes/gaul_hero_vercingetorix` | Vercingetorix | soldiers + siege within 60 m +1 capture strength, +20% attack damage |
| `units/heroes/gaul_hero_viridomarus` | Viridomarus | workers +15% gather speed (global) |

## Stat deltas on otherwise shared content

- Cavalry: +10% melee attack damage (Superior Cavalry, auto).
- Structures (except Wonder): −20% build time, −20% health, −20% capture
  points (Wooden Construction, auto).
- Arrow warship (`units/gaul/ship_arrow`): +200 HP (1200 total) and 40
  garrison slots vs the generic 1000 HP / 30, with −10% walk speed and
  acceleration. Shared with brit and iber (the Celtic/Iberian warship);
  the fire ship and other ships are standard.
- All other gaul variants of shared units are identity-only overrides of
  the generic templates — no further stat differences.

## Non-gameplay

- Culture `celt` (Celtic music set, emblem), 8 AI names, and the
  skirmish-replacement house are cosmetic only.
