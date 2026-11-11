# Britons vs a generic civilisation

Synthesis of **everything that differs between the briton civilisation and a
generic (non-civ-specific) civilisation** in 0 A.D. 0.28.0. The baseline
"generic civ" is defined as: the shared entity pool documented in
[`generic/`](../generic/) (units, buildings, technologies, auras with no
civ-specific content), the standard tech tree (`phase_town_generic` /
`phase_city_generic`, all techs with no civ requirement), the standard
`StartEntities` pattern, and no civ or team bonuses. Per-entity details are
in this folder's [`auras/`](auras/), [`buildings/`](buildings/),
[`technologies/`](technologies/) and [`units/`](units/) directories
(brit-only entities) and in [`generic/`](../generic/)
(shared entities with per-civ variants); this file is the complete delta.

Data sources: `civs/brit.json`, `templates/structures/brit/`,
`templates/units/brit/`, `data/technologies/`,
`data/auras/`, `special/players/brit.xml`.

## Narrative

The Britons are **Celtic Britain: a chariot-and-war-dog island kingdom
built around the fastest infantry and the only pop-free army in the
game**. The citizen line is a skirmish force — the **spearman** holds
melee, the **slinger** (start unit, 11.5 pierce at 45 m) and **javelineer**
provide the ranged fire, and there is **no archer, no pikeman and no
citizen swordsman** — and it is permanently quick: the "Woad Warriors"
civ bonus gives all infantry +5% walk speed, and Caratacus' global
"Guerrilla Chief" aura stacks another +15% speed and +1 armor on every
soldier and siege engine while he lives. On top of that, the **war dog**
is the civ's signature: a 0-population, 100-food chaser (27 m/s run, the
fastest land unit in the game) trained at the kennel from the Village
phase — one
starts the match with the Britons. Dogs turn surplus food into army size
no other civ can express — capped at 10 per kennel and 20 total, but
still pop-free — so the Britons never run out of population room,
only food (and kennels).

The elite is small but sharp: **two champion lines** — the Brythonic
champion swordsman (the only heavy infantry) and the **Celtic chariot**,
a 36-pierce javelin chariot and the hardest-hitting champion chariot in
the game — both unlocked by ordinary City-phase techs, and both
amplified by Boudicca's "Champion Army" aura (+20% damage, +10% speed
within 40 m of her chariot). The three heroes all train at the
**fortress** (City phase): Boudicca the chariot assault hero, Caratacus
the global speed-and-armor chief, Cunobeline the passive +0.8 HP/s
regeneration king — and the **druid** healer carries the "Deas Celtica"
aura (+5% soldier damage within 10 m), so British healers double as
micro battle-standards.

The economy is wood-first and fast. "Wooden Construction" (shared with
gaul) makes every structure except the wonder build **20% faster** at the
cost of 20% less health and capture points; the military buildings swap
stone for wood entirely (barracks 300 wood, stable 250, temple 300), so
the British war machine runs on trees. The **crannog** — a floating
civic centre built on shorelines from the Town phase — extends that
economy onto water: it claims territory, trains the CC roster **and** the
dock's ships, and researches `phase_city`, letting the Britons age up
from a lake. The team bonus ("Druids") discounts healers 20% for every
ally.

The weaknesses follow from the same design: **no archers** (and no
archer techs), no pikemen, no melee cavalry beyond the citizen
swordsman; **the arsenal trains only the siege ram** (no stone throwers
or bolt shooters at all); the navy has the fire ship but **no ram or
siege ships**; the siege and warship tech lines are largely cut off
(`siege_pack_unpack`, `siege_bolt_accuracy`, `warship_ramming_attack`,
`warship_siege_attack`, `warship_health` are all unavailable); and every
building is 20% flimsier and easier to capture. In short: the Britons
are a wood-fed, dog-swarming, chariot-raiding island power — fight fast,
fight everywhere, and never stop producing dogs.

## Civ bonuses (things a generic civ does not have)

- **Team bonus — "Druids"**
  (`data/auras/teambonuses/brit_player_teambonus.json`, attached by
  `special/players/brit.xml`): **Healers −20% resource cost** for every
  ally (`MutualAlly`, brit included) — a global aura affecting the
  `Healer` class (the druid's 100 food + 30 metal drops to 80 + 24).
- **"Woad Warriors"** (auto tech `civbonuses/brit_woad_warriors`,
  requirement `brit`): **all Infantry +5% walk speed and +1 loot of
  every resource per corpse looted** (affects `Infantry`; war dogs are
  `Human`, not `Infantry`, so they get neither).
- **"Wooden Construction"** (auto tech `civbonuses/celt_structures`,
  shared with gaul — see
  [`generic/technologies/civbonuses__celt_structures.md`](../generic/technologies/civbonuses__celt_structures.md)):
  **all Structures except the Wonder ×0.8 build time, ×0.8 health, ×0.8
  capture points** — British buildings go up 20% faster but are 20%
  weaker and easier to capture.
- **War dogs** (`units/brit/war_dog`): the only 0-population combat unit
  in the game, trained at the brit-only kennel from the Village phase —
  capped at **10 per kennel, 20 total** (the player's `WarDog` limit is 0
  base + 10 per completed kennel, and kennels are limited to 2 — see
  Buildings and Units).

## Starting entities

`civs/brit.json` — the standard pattern (1 CC, 4 women, 2 melee, 2 ranged,
1 cavalry) **plus a free war dog**, the civ's extra starting unit:

- 1 × `structures/brit/civil_centre`
- 4 × `units/brit/support_civilian` (women)
- 2 × `units/brit/infantry_spearman_b` (Brythonic Spearmen — the melee pair)
- 2 × `units/brit/infantry_slinger_b` (Brythonic Slingers — the ranged pair)
- 1 × `units/brit/cavalry_javelineer_b` (Brythonic Cavalry Javelineer)
- 1 × `units/brit/war_dog`

## Buildings

- **Brit-only building — Kennel / Cunattegia**
  (`structures/brit/kennel`): the war-dog factory — 100 wood, 50 s,
  **Village phase**; 500 HP, 20 m territory influence (weight 30000),
  10 garrison slots (dogs only), max **2 per player** (the player
  template's `EntityLimits` sets `<Kennel>2</Kennel>` on the `Kennel`
  category). Trains `war_dog` at ×0.7 batch time, and **each completed
  kennel raises the war-dog cap by 10** (`LimitChangers/WarDog/Kennel =
  10` on a base `WarDog` limit of 0 — so 10 dogs with one kennel, 20
  with two). It sits in the generic
  builder list (`structures/{civ}/kennel`), so every British builder unit
  can place it.
- **Brit-only building — Crannog / Cranogion** ("Island Settlement",
  `structures/brit/crannog`): a **floating civic centre** — 300 wood +
  300 stone + 250 metal, 500 s, **Town phase**, shore placement in
  own/ally/neutral territory, min 200 m from a `CivilCentre`; 3000 HP,
  **+20 population**, 140 m territory root, 20 garrison slots (+1/s
  heal), 6 default arrows. Trains women, spearman, slinger and cavalry
  javelineer **plus the dock roster** (fishing, merchant, scout, arrow
  and fire ships — no ram/siege ships), and researches `phase_city` and
  the shared-LOS/spies techs (the Town-phase tech is removed). It
  carries the `CivilCentre` category and class, so it enforces CC
  spacing and counts toward the CC limit — which `phase_town` has already
  lifted by the time one can be built. In effect: a CC on water.
- **Cost swaps — stone is replaced by wood** on the three military/civic
  buildings that cost stone generically (same pattern as gaul):
  - barracks: 200 wood + 100 stone → **300 wood** (0 stone)
  - stable: 200 wood + 50 stone → **250 wood** (0 stone)
  - temple / Nemeton: 300 stone → **300 wood** (0 stone)
  - (fortress, civic centre, wonder and stone walls keep their generic
    stone costs.)
- **Vestigial brit templates, not buildable by anything** (no `Builder`
  list references them — see [`buildings/README.md`](buildings/README.md)):
  the rotary mill (`structures/brit/rotarymill`, same as gaul's) and the
  archery range (`structures/brit/range`).
- **Circular footprints**: the civil centre is a Circle r 15 m (generic
  32 × 32 m square), the fortress a Circle r 17 m (h 18), the house a
  Circle r 6 m.
- **Stone walls** are the standard own-territory set with brit-specific
  sizes: short 13×7 (h 10.3), medium 25×7 (h 10.3), long 37×7 (h 10.3),
  tower 11×10 (h 20), gate 37×8 (h 18) — see
  [`generic/buildings/wallset_stone.md`](../generic/buildings/wallset_stone.md).
- **Shared buildings brit lacks entirely**: elephant stable
  (cart/kush/maur/pers/ptol/sele), military colony (ptol/sele), theater
  (the five Greek civs), and the civ-unique buildings of other civs
  (no other civ has a crannog or kennel). Everything else is the standard
  shared roster, with brit identity-only overrides (the fortress "Dunon",
  the temple "Nemeton", the stable "Eposton", the house "Tegia").

## Units

### Brit-only units (trained by no other civ)

| Unit | Trained at | Phase | Notable stats |
|---|---|---|---|
| War Dog (`war_dog`) | kennel | Village | 110 HP, 1/1/1 armor, fangs 7 + 2 (cannot attack Structure/Ship/Siege), run 27 m/s, 100 food, 15 s, **0 pop** |
| Hero Boudicca (`hero_boudicca`) | fortress | City | 1500 HP chariot hero, javelin 60 pierce @ 30 m; "Champion Army" (champions +20% damage, +10% speed) |
| Hero Caratacus (`hero_caratacos`) | fortress | City | 1000 HP infantry swordsman, sword 26 hack; global "Guerrilla Chief" (all soldiers + siege +1 armor, +15% speed) |
| Hero Cunobeline (`hero_cunobelin`) | fortress | City | 1200 HP cavalry swordsman, sword 26 hack; "Britannorum Rex" (+0.8 HP/s regen for Humans within 30 m) |

Heroes cost 0 population, require the City phase, and are subject to the
global limit of **1 hero alive at a time**. Unlike ptol/sele, the brit
player template has no hero-gated civic-centre limit — expansion is the
generic `phase_town`-only rule. Vestigial hero-variant templates exist
(`hero_boudicca_sword`, `hero_boudicca_cavalry_javelineer`,
`hero_cunobelin_infantry`) but nothing trains them.

### Training roster (what brit's buildings train)

- CC: women, spearman_b, slinger_b, cavalry_javelineer_b.
- Crannog (Town): the CC roster + fishing/merchant/scout/arrow/fire ships.
- Barracks: spearman_b, javelineer_b, slinger_b,
  **champion_infantry_swordsman** (Brythonic Champion, gated on
  `unlock_champion_infantry`) — **no clubman, pikeman, maceman, axeman,
  swordsman_b or archer**.
- Stable: cavalry_swordsman_b, cavalry_javelineer_b,
  **champion_chariot** (Celtic Chariot, gated on
  `unlock_champion_chariots`) — no other cavalry (no spearman/archer/axeman).
- Fortress (City): the 3 heroes.
- Kennel (Village): war_dog.
- Temple: healer (the Druid — also carries the shared `units/celtic_healer`
  "Deas Celtica" aura, see Auras).
- Arsenal (City): siege ram only — **no lithobolos/ballista/onager/
  oxybeles/scorpio/polybolos, no siege tower**.
- Dock: fishing, merchant, scout, arrow and fire ships — **no ram or
  siege ship** (no `ship_ram`/`ship_siege` templates exist for brit).
- Market: support_trader.
- House: support_civilian_house (after `unlock_civilians_house_generic`).

### Shared unit classes brit does NOT have

- **No archer of any kind** (infantry or cavalry) — ranged fire is
  slingers, javelineers and the champion chariot; `archer_attack_spread`
  is not researchable (`notciv: brit`).
- **No pikeman, no citizen infantry swordsman/maceman/axeman/clubman** —
  melee infantry is the spearman plus the champion swordsman.
- **No cavalry spearman or cavalry archer** — citizen cavalry are the
  javelineer and the swordsman; no champion cavalry (and
  `unlock_champion_cavalry` is `notciv: brit`).
- **No siege tower**; the siege ram is the entire siege park.
- Navy: no ram or siege ships; `warship_ramming_attack` and
  `warship_siege_attack` are not researchable (`notciv: brit`), and
  neither is `warship_health` (civ-gated elsewhere). The fire ship is
  present, and `warship_fireship_attack` **is** researchable.
- **Vestigial unit templates, not trainable by anything**:
  `support_female_citizen` (no trainer references it); the `catafalque`
  exists as for every civ; `ship_fire_fire` is the fire ship's
  burning-state actor variant, not a trainable unit.

## Technologies

- **Brit-only techs**: `civbonuses/brit_woad_warriors` (auto) — see the
  per-tech file in [`technologies/`](technologies/). The shared Celtic
  auto-tech `civbonuses/celt_structures` ("Wooden Construction", brit +
  gaul) is documented in
  [`generic/technologies/`](../generic/technologies/).
- **Phase techs**: brit researches the generic ones (`phase_town_generic`
  — at the CC, and `phase_city_generic` — at the CC **or the crannog**).
- **Generic techs brit CANNOT research** (civ requirements exclude it —
  everything else in [`generic/technologies/`](../generic/technologies/) is
  available): `archer_attack_spread`, `siege_bolt_accuracy`,
  `siege_pack_unpack`, `unlock_champion_cavalry`,
  `warship_ramming_attack`, `warship_siege_attack`, `warship_health`,
  plus every other civ's civ-gated techs (`archery_tradition`,
  `hoplite_tradition`, `nisean_horses`, `hellenistic_metropolis`,
  `roman_reforms`, `roman_roads`, `exploration`, `juggernauts`,
  `equine_transports`, `iphicratean_reforms`, `arsenal_philon`,
  `warship_ranged_attack`, `unlock_civilians_house_kush`, etc.).
- **Restricted techs brit DOES get**: `unlock_champion_infantry`
  (barracks, City — unlocks the Brythonic Champion), `unlock_champion_chariots`
  (stable, City — unlocks the Celtic Chariot), `warship_fireship_attack`,
  `warship_arrow_attack`, `ship_capture_resistance`, `tower_health`,
  `barracks_batch_training`, `stable_batch_training`, and the standard
  unlock techs (`unlock_shared_dropsites`, `unlock_shared_los`,
  `unlock_spies`, `unlock_civilians_house_generic`, `unlock_females_house`
  — the last a no-op vestige: it carries no modifications and nothing
  gates on it). Brit also gets the full standard soldier/armor/economic
  tech lines, including both generic farming techs
  (`gather_farming_fertilizer`, `gather_farming_training`).

## Auras (summary)

| Aura | Carrier | Effect |
|---|---|---|
| `teambonuses/brit_player_teambonus` | the player (teambonus) | global, all allies: healers −20% resource costs |
| `units/heroes/brit_hero_boudicca` | Boudicca | own champions within 40 m: +2 capture, +20% melee/ranged damage, +10% speed |
| `units/heroes/brit_hero_caratacos` | Caratacus | global: own soldiers + siege +1 all armor, +15% speed |
| `units/heroes/brit_hero_cunobelin` | Cunobeline | own Humans within 30 m: +0.8 HP/s regeneration |
| `units/celtic_healer` | the Druid (shared with gaul, see [`generic/auras/`](../generic/auras/)) | own soldiers within 10 m: +5% melee and ranged damage |

## Stat deltas on otherwise shared content

- Champion chariot: the **Celtic Chariot** is a javelinist — 36 pierce at
  30 m (the maur/pers/sele variants all shoot 15 pierce bows at 60 m —
  the brit chariot is the only javelin chariot and the hardest-hitting),
  300 HP, 1/5/20 armor, 180 food + 100 wood + 120 metal.
- Barracks, stable, temple: stone components replaced by wood (see
  Buildings).
- All structures except the wonder: ×0.8 build time, health and capture
  points (Wooden Construction).
- Civil centre: Circle r 15 m footprint (generic 32 × 32 m square);
  otherwise generic (300 wood + 300 stone + 250 metal, +20 pop).
- Fortress: Circle r 17 m footprint (h 18).
- House: Circle r 6 m footprint; generic stats (75 wood, 30 s, +5 pop).
- Stone walls: brit-specific segment sizes (see Buildings).
- All other brit variants of shared units (spearmen, slingers,
  javelineers, cavalry javelineers/swordsmen, the druid healer, women,
  traders, the ships, the siege ram) are identity-only overrides of the
  generic templates — no further stat differences.

## Non-gameplay

- Culture `celt` (shared Celtic music set, emblem), 11 AI names, the
  skirmish replacements (the ranged infantry becomes the slinger, the
  special starting unit the war dog, the house the brit house) and the
  brit-specific unit names (Brythonic Spearman/Slinger/Cavalry
  Javelineer, Celtic Cavalry, Brythonic Champion, Celtic Chariot, War
  Dog, Druid) are cosmetic only.
