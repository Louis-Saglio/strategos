# Persia vs a generic civilisation

Synthesis of **everything that differs between the persian civilisation and a
generic (non-civ-specific) civilisation** in 0 A.D. 0.28.0. The baseline
"generic civ" is defined as: the shared entity pool documented in
[`generic/`](../generic/) (units, buildings, technologies, auras with no
civ-specific content), the standard tech tree (`phase_town_generic` /
`phase_city_generic`, all techs with no civ requirement), the standard
`StartEntities` pattern, and no civ or team bonuses. Per-entity details are
in this folder's [`auras/`](auras/), [`buildings/`](buildings/),
[`technologies/`](technologies/) and [`units/`](units/) directories
(pers-only entities) and in [`generic/`](../generic/)
(shared entities with per-civ variants); this file is the complete delta.

Data sources: `civs/pers.json`, `templates/structures/pers/`,
`templates/units/pers/`, `data/technologies/`,
`data/auras/`, `special/players/pers.xml`.

## Narrative

Persia is the **cavalry empire with a passive-income economy**. Its citizen
army is built around four mounted lines — javelineers, archers, axemen and
spearmen — all trained from the very first minute at the civil centre, and
its champions push the same theme: a heavy lancer, a heavy cavalry archer
and a scythed chariot, all from the stable, plus war elephants. The
Infantry is deliberately narrow — a spearman (Sparabara), an archer
(Sogdian) and a javelineer (Lydian), no swordsmen, slingers or pikemen —
so the Persian answer to most problems is a horse. "Times of War" makes
that cavalry flood cheaper to produce the longer the game runs: each phase
tech permanently lowers the stable's batch-time modifier (batches of N
train in `N × base / N^0.2` by the City phase), and the team bonus
"Training Regimes" shaves 20% wood, stone and build time off every
barracks and stable unit for every ally.

The other half of the design is **free resources**. The Ice House — a
village-phase, 100 wood + 100 stone building, five allowed — trickles
food forever, and the City-phase Winter Palace (the Persian "fortress",
territory root, hero trainer) upgrades itself through the "Satrapy
Tribute" into a 5/s trickle of whichever resource you pick. On top:
"Great King's Levy" gives +10% population for free, "Darics" gives land
traders +25% trade gain, and "Achaemenid Architecture" (researched at the
civil centre from the start) makes every structure +25% HP and +25%
capture points at the cost of +20% build time — the Persians are slow to
build but hard to dig out.

The roster's holes are the price. There is no citizen swordsman, slinger
or pikeman; the **only** siege engine is the battering ram (no bolt
shooters, catapults or siege towers), and the ram is all the more
important for being +20% stronger and 2 garrison slots bigger than
anyone else's; the navy has no fire ship and no siege ship. The Persian
champions are the mass-produced **Immortals** — a spear/bow
switchable line, 50/30/50 cost, halved to 10 s train time by the
`immortals` tech — rather than heavy individual bruisers. And several
units (Kardakes hoplites and skirmishers, the Apple Bearer royal guard)
exist in the data but are trained by nothing: leftovers of an older
Persian design. In short: Persia is a slow-building, food-hungry cavalry
empire that converts stone and wood into trickles, floods the field with
cheap horses and Immortals, and leans on rams and elephants — plus one
well-chosen hero — to break what its army cannot.

## Civ bonuses (things a generic civ does not have)

- **Team bonus — "Training Regimes"**
  (`data/auras/teambonuses/pers_player_teambonus.json`, attached by
  `special/players/pers.xml`): **Barracks and Stable units −20% wood and
  stone cost and −20% build time** for every ally (`MutualAlly`, pers
  included).
- **"Great King's Levy"** (auto tech `civbonuses/pers_population`,
  requirement `pers`): **+10% maximum population** (300 → 330), free from
  the start of the match.
- **"Darics"** (`units/pers/support_trader`): land traders get **+25%
  trade gain** (template-level `Trader/GainMultiplier` ×1.25).
- **"Large Rams"** (`units/pers/siege_ram`): the battering ram gets
  **+20% attack damage** (Melee Crush ×1.2) and **+2 garrison capacity**
  (template-level, on top of the generic ram).
- **"Times of War"** (the pers phase techs, see below): **stable batch
  training time decreases each phase advance** — `Trainer/BatchTimeModifier
  −0.1` at Town and another −0.1 at City (a batch of N trains in
  `N × base / N^0.1` at Town, `/ N^0.2` at City). The generic
  `stable_batch_training` and `barracks_batch_training` techs are
  `notciv: pers`, so this phase bonus is the Persians' only batch-time
  discount (and only for stables, not barracks).
- **"Satrapy Tribute"** (`structures/pers/tachara`): the Winter Palace
  upgrades (free, 10 s, repeatable) into a **free trickle of 10 of one
  resource every 2 s** (5/s) — see Buildings below.
- **"Achaemenid Architecture"** (tech `architecture_pers`, civil centre,
  200 wood + 200 stone, 60 s, Village phase): **Structures +25% health
  and capture points, +20% build time** (`Structure !Wonder`). Available
  from the start of the match.

## Starting entities

`civs/pers.json` — the standard pattern (1 CC, 4 women, 2 melee, 2 ranged,
1 cavalry), with pers's picks:

- 1 × `structures/pers/civil_centre`
- 4 × `units/pers/support_civilian` (women)
- 2 × `units/pers/infantry_spearman_b` (Shield Bearers / Sparabara)
- 2 × `units/pers/infantry_archer_b` (Sogdian Archers — the ranged pair)
- 1 × `units/pers/cavalry_javelineer_b` (Median Light Cavalry)

## Buildings

- **Pers-only building — Ice House / Yakhchāl** (`structures/pers/ice_house`):
  100 wood + 100 stone, 60 s, **Village phase**; 800 HP, no garrison, 20 m
  vision, Circle r 10 m footprint. **Trickles 1 food every 2 s** (0.5/s)
  and researches `subterranean_aqueducts` (City phase: +1 food per trickle
  tick → 1/s). Max **5 per player** (`Yakhchal` limit).
- **Pers-only building — Winter Palace / Taçara** (`structures/pers/tachara`):
  200 stone + 200 metal, 300 s, **City phase**; 3000 HP, 10 garrison, 40 m
  vision, Square 32 m footprint, **territory root** (48 m radius). Max **1
  per player** (`Palace` limit). Trains the three heroes (×0.8 batch time)
  and researches `immortals`. The "Satrapy Tribute" upgrade switches it to
  one of the four forms `tachara_food/wood/stone/metal` (identical except
  for the trickle): 10 of the chosen resource every 2 s.
- **Pers-only building, vestigial — Gate of All Nations** (`structures/pers/hall`):
  a City-phase 250 stone + 250 metal special building (3000 HP, 10
  garrison, 38 m territory influence, **no territory decay**) that trains
  and researches **nothing** — no builder lists it, so it is unreachable
  through the build UI (the buildable Persian special building is the
  Winter Palace).
- **Pers-only buildings, vestigial** (no builder lists them; construct
  directly only): the house variants `house_a` (+5 pop), `house_b` (+10
  pop), `warehouse` (+5 pop, 30 m territory), `apartment_block` (+15 pop),
  `inn` (+15 pop, 2500 HP) and the stone-tower variant `tower_babylon`
  (identical stats to the buildable `defense_tower`; visual actor only).
- **The buildable Persian house is the big-house variant**: 150 wood, 50 s,
  1200 HP, **+10 population**, 6 garrison slots (see
  [`generic/buildings/house.md`](../generic/buildings/house.md)).
- **Stone walls** are the standard own-territory set with pers-specific
  sizes (short 13×7, medium 25×7, long 37×7, tower 8×8, gate 37×7 — see
  [`generic/buildings/wallset_stone.md`](../generic/buildings/wallset_stone.md));
  no civ-specific wall techs or cost/HP modifiers.
- **Shared buildings pers lacks entirely**: crannog, military colony
  (ptol/sele), encampment, kennel (brit), great hall (brit), ministry
  (han), academy, theater (the five Greek civs), the wallset_siege set
  (rome), and the civ-unique buildings of other civs. Everything else is
  the standard shared roster, with pers identity-only overrides (the
  civil centre "Provincial Governor" 40×24 m, the stable 22×20 m, the
  barracks "Padgan", the fortress "Didā" — which, unlike other civs'
  fortresses, trains **no heroes**).

## Units

### Pers-only units (trained by no other civ)

| Unit | Trained at | Phase | Notable stats |
|---|---|---|---|
| Hyrcanian Cavalry (`cavalry_axeman_b`) | civil centre + stable | Town | 160 HP, axe 10 hack + 3.5 crush, walk 18 m/s, 100 food + 40 wood + 10 metal, 15 s, 1 pop — the cheap citizen melee cavalry |
| Persian Immortal, bow (`champion_infantry_archer_upgrade`) | barracks | City | 120 HP, bow 12.24 pierce @ 60 m, 50/30/50, 20 s; spear/bow switchable |
| Bactrian Heavy Cavalry Archer (`champion_cavalry_archer`) | stable | City | 240 HP, bow 15 pierce @ 60 m, walk 15.3 m/s, 150/80/100, 25 s |
| Hero Cyrus II (`hero_cyrus_ii`) | tachara | City | 1200 HP cavalry spearman (16 + 12, 1.75× vs Cavalry); "Forefront Leader" aura (cavalry within 45 m: +1 capture, +20% damage); trains `champion_infantry` himself |
| Hero Darius I (`hero_darius_i`) | tachara | City | 1500 HP chariot archer (28 pierce @ 60 m), 360/250/300; global "Leadership" aura (own soldiers, siege, traders, merchant ships +15% speed) |
| Hero Xerxes I (`hero_xerxes_i`) | tachara | City | 1000 HP archer (27 pierce @ 60 m), 200/200/150; "Administrator" (workers within 100 m: +25% build, +15% gather) + "Invader of Greece" (siege, elephants, champion infantry within 60 m: +25% health) |

The two Immortal units (`champion_infantry` spear mode is a shared entity
with a pers variant — see
[`generic/units/champion_infantry.md`](../generic/units/champion_infantry.md))
carry the `Immortal` class and switch between bow and spear with a free 4
s in-place upgrade; the `immortals` tech halves both their train times.
Heroes cost 0 population, require the City phase, and are subject to the
global limit of **1 hero alive at a time**.

### Equine Transports (pers-only naval feature)

The Persian arrow and ram warships (`ship_arrow`, `ship_ram`) carry a
`Trainer` for two cavalry-in-transport units —
`units/pers/cavalry_axeman_b_trireme` and
`units/pers/cavalry_javelineer_b_trireme` — gated on the `equine_transports`
tech (dock, City phase, 300 wood + 300 metal). The trireme cavalry are
identical to the land versions (same stats, own promotion chain `_a/_e`
at 150 XP), letting a Persian fleet drop cavalry raiders without a
transport fleet.

### Training roster (what pers's buildings train)

- CC: women, spearman_b, archer_b, cavalry_javelineer_b, cavalry_axeman_b,
  cavalry_spearman_b, cavalry_archer_b (the generic trainer's other
  entries — swordsmen, crossbowmen — don't exist for pers).
- Barracks: spearman_b, archer_b, javelineer_b, **champion_infantry** and
  **champion_infantry_archer_upgrade** (the two Immortals).
- Stable: cavalry_axeman_b, cavalry_spearman_b, cavalry_javelineer_b,
  cavalry_archer_b, **champion_cavalry**, **champion_cavalry_archer**,
  **champion_chariot**.
- Fortress (City): nothing — pers adds no heroes to the generic (empty)
  fortress trainer.
- Tachara (City): the 3 heroes.
- Elephant stable (City): champion_elephant.
- Arsenal (City): **siege_ram only** — pers has no other siege templates.
- Dock: fishing, merchant, scout, arrow and ram ships — **no fire ship, no
  siege ship** (no `ship_fire`/`ship_siege` templates exist for pers).
- Warships after `equine_transports`: the two trireme cavalry.
- Market: support_trader (the +25% Aramaean Merchant).
- House: support_civilian_house (after `unlock_civilians_house_generic`).

### Shared unit classes pers does NOT have

- **No citizen swordsman, slinger, pikeman, maceman, axeman or clubman**
  (pers citizen infantry is spearman + archer + javelineer only; the
  pers champion roster likewise has no champion swordsman/javelineer/etc.).
- Cavalry: no citizen cavalry swordsman; chariots only as the champion
  (unlocked by `unlock_champion_chariots`, City phase).
- Navy: **no fire ship and no siege ship**; neither `warship_fireship_attack`
  nor `warship_siege_attack` is researchable (`notciv: pers`).
- Siege: **no bolt shooters, catapults or siege towers** — the battering
  ram is the entire siege park (and `siege_bolt_accuracy` and
  `siege_pack_unpack` are `notciv: pers`).
- **Vestigial unit templates, not trainable by anything**: `kardakes_hoplite`
  (a champion-grade mercenary hoplite) and `kardakes_skirmisher` (its
  javelineer twin) — the Gate of All Nations trained them in older
  versions but no trainer references them in 0.28; `arstibara` (the
  "Apple Bearer" royal spearman, a cheaper-train-time variant of the
  spear Immortal); `hero_xerxes_i_chariot` (a chariot-mounted Xerxes, no
  upgrade path leads to it); `support_female_citizen` (a 25 HP dagger
  woman — no trainer references it); and the `catafalque` (every civ has
  one; spawned when a hero dies).

## Technologies

- **Pers-only techs**: `architecture_pers` (CC, Village), `immortals`
  (tachara, City), `equine_transports` (dock, City + `dock_efficiency`),
  `subterranean_aqueducts` (ice house, City), `phase_town_pers` /
  `phase_city_pers` (the phase techs), and the auto civ bonus
  `civbonuses/pers_population` — see above and the per-tech files in
  [`technologies/`](technologies/).
- **Phase techs**: pers researches its own (`phase_town_pers`,
  `phase_city_pers`), which replace the generic ones and add the stable
  batch-time modifier — all other effects are identical to the generic
  phase techs.
- **Generic techs pers CANNOT research** (civ requirements exclude it —
  everything else in [`generic/technologies/`](../generic/technologies/) is
  available): `barracks_batch_training`, `stable_batch_training`,
  `siege_bolt_accuracy`, `siege_pack_unpack`, `warship_fireship_attack`,
  `warship_siege_attack` (all `notciv: pers`), plus every other civ's
  civ-gated techs (`exploration`, `hellenistic_metropolis`,
  `hoplite_tradition`, `roman_reforms`, etc.).
- **Restricted techs pers DOES get**: `archery_tradition` (kush + maur +
  pers, archers +10 range), `ship_movement_speed` (cart + pers, Town
  phase), `unlock_champion_chariots` (brit + maur + pers + sele),
  `nisean_horses` (pers + sele — Champion Cavalry Spearmen +10% health,
  +10% train time; see [`generic/technologies/nisean_horses.md`](../generic/technologies/nisean_horses.md)).
  Pers also gets the full standard set of soldier/armor/economic techs
  (blacksmith lines, `soldier_attack_melee_03` included), the warship
  ramming tech, and the standard unlock techs (`unlock_champion_infantry`,
  `unlock_champion_cavalry`, `unlock_shared_dropsites`, `unlock_shared_los`,
  `unlock_spies`, `unlock_civilians_house_generic`).

## Auras (summary)

| Aura | Carrier | Effect |
|---|---|---|
| `teambonuses/pers_player_teambonus` | the player (teambonus) | Barracks + Stable units −20% wood/stone cost and build time, all allies |
| `units/heroes/pers_hero_cyrus_ii` | Cyrus II | own cavalry within 45 m: +1 capture attack, +20% melee and ranged damage |
| `units/heroes/pers_hero_darius_i` | Darius I | global: own soldiers, siege and traders (incl. merchant ships) +15% walk speed |
| `units/heroes/pers_hero_xerxes_i_1` | Xerxes I | own workers within 100 m: +25% build rate, +15% gather speed |
| `units/heroes/pers_hero_xerxes_i_2` | Xerxes I | own siege, elephants, champion infantry within 60 m: +25% health |
| `structures/satrapy_tribute` | Winter Palace | label only (no modifications) — the actual trickle is the palace's `ResourceTrickle` |

## Stat deltas on otherwise shared content

- Land traders: +25% trade gain (Darics).
- Battering ram: melee crush ×1.2, garrison +2, footprint 7×15 m (Large
  Rams).
- Houses: +10 population, 1200 HP, 150 wood, 50 s (the big-house variant).
- Civil centre: footprint Square 40×24 m (h 18); its trainer adds the
  cavalry lines (axeman, spearman, archer).
- Stable: footprint Square 22×20 m (h 5) — smaller than the generic 25×25.
- Champion infantry (spear Immortal): 120 HP (generic 200), 4/5/20 armor,
  8.5 hack + 7.225 pierce, 50 food + 30 wood + 50 metal, trained at the
  barracks, bow/spear switchable.
- Champion cavalry (Bactrian Heavy Lancer): 260 HP, 8/9/20 armor, spear
  12 + 10 (1.75× vs Cavalry), 150/80/110, walk 14.4 m/s (cataphract
  mixin).
- Champion chariot (Babylonian Scythed Chariot): 300 HP, 1/5/20 armor,
  bow 15 pierce @ 60 m, 180/100/120, 30 s.
- Champion elephant (Indian War Elephant): 1100 HP, trunk 33 hack + 49.5
  crush, 330 food + 220 metal, 39.6 s.
- Arrow and ram warships: footprint 9×42 m and the cavalry trainer
  (Equine Transports); otherwise the standard warship stats.
- Stone walls: pers-specific segment sizes (see Buildings).
- All other pers variants of shared units (spearmen, archers, javelineers,
  healers, women, fishing/merchant/scout ships) are identity-only
  overrides of the generic templates — no further stat differences.

## Non-gameplay

- Culture `pers` (Persian music set, emblem), 9 AI names, the skirmish
  replacements (the default ranged infantry becomes the Sogdian Archer,
  the default house the pers house) and the pers-specific unit names
  (Shield Bearer, Sogdian Archer, Lydian Auxiliary, Median Light Cavalry,
  Cappadocian Cavalry, Parthian Horse Archer, Persian Laborer) are
  cosmetic only. The player template adds the `phalanx` formation.
