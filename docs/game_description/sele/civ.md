# Seleucids vs a generic civilisation

Synthesis of **everything that differs between the seleucid civilisation and a
generic (non-civ-specific) civilisation** in 0 A.D. 0.28.0. The baseline
"generic civ" is defined as: the shared entity pool documented in
[`generic/`](../generic/) (units, buildings, technologies, auras with no
civ-specific content), the standard tech tree (`phase_town_generic` /
`phase_city_generic`, all techs with no civ requirement), the standard
`StartEntities` pattern, and no civ or team bonuses. Per-entity details are
in this folder's [`auras/`](auras/), [`buildings/`](buildings/),
[`technologies/`](technologies/) and [`units/`](units/) directories
(sele-only entities) and in [`generic/`](../generic/)
(shared entities with per-civ variants); this file is the complete delta.

Data sources: `civs/sele.json`, `templates/structures/sele/`,
`templates/units/sele/`, `data/technologies/`,
`data/auras/`, `special/players/sele.xml`.

## Narrative

The Seleucids are **Hellenistic Persia: the heir of Alexander's Asian
empire, built around the widest champion roster and the most mobile
economy in the game**. The army is Macedonian in shape — the **Phalangite**
pikeman is the citizen melee line (barracks from the first minute, 50 food
+ 50 wood), flanked by infantry javelineers (the only citizen ranged
infantry: there is no citizen archer or slinger) — but the civ's real
identity is **everything that costs metal**: three mercenaries hired at the
military colony from the Town phase (Thracian swordsman, Syrian archer,
Companion cavalry — the archer being the entire Seleucid bow line) and,
in the City phase, **five champion types** — the armored cataphract, the
scythed chariot, the armored war elephant, and the army-reform pair's
choice of champion infantry (Silver Shield pikemen under the "Traditional
Army", Romanized heavy swordsmen under the "Reform Army") — a five-line
champion roster matched only by pers, and "Parade of Daphne" (fortress)
makes them all train 20% faster.

The economy is built to **expand like no other civ**. The team bonus
"Syrian Tetrapolis" cuts civic-centre and colony costs by 20% and their
build time by 30% for every ally (sele included); the civ bonus "Fertile
Crescent" makes farms 25% cheaper in wood and four times faster to plant;
and "Hellenistic Metropolis" (City phase) doubles civic-centre health,
capture points and arrows. Expansion has one gate — the same hero-gated
rule as the Ptolemies: the second civic centre requires the Town phase
**and a live hero**. But where the Ptolemies must build a City-phase
temple for that, **the Seleucids train all three heroes at the civic
centre itself** (Seleucus I on his elephant, Antiochus III the cavalry
spearman, Antiochus IV the cavalry swordsman), each with an aura that
doubles as a battlefield multiplier — elephant buffs, cavalry armor,
enemy-structure health drain. The hero requirement and the training
building are the same building, which makes the Seleucid mid-game the
smoothest hero economy in the game.

The weaknesses follow from the design: metal is the currency of
everything — mercenaries are pure metal, champions are metal-heavy, the
best techs cost metal, and the citizen army has no swordsman, no citizen
cavalry melee (no spearman/swordsman cavalry), no archer or slinger, and
no bolt shooters at all. The navy is complete except the fire ship, but
misses the arrow-ship and warship-health techs. And the hero gate cuts
both ways: lose the last hero and the third civic centre cannot be
planted until another is trained. In short: the Seleucids are a
metal-hungry, expansion-first successor kingdom — buy the army with
metal, boom with cheap civic centres and farms, and ride the
champion-and-hero advantage into the City phase.

## Civ bonuses (things a generic civ does not have)

- **Team bonus — "Syrian Tetrapolis"**
  (`data/auras/teambonuses/sele_player_teambonus.json`, attached by
  `special/players/sele.xml`): **Civic centres and military colonies −20%
  resource cost and −30% build time** for every ally (`MutualAlly`, sele
  included) — a global aura affecting the `CivilCentre` class (the civic
  centre carries it as a visible class; the colony inherits it). The CC
  drops from 300 wood + 300 stone + 250 metal / 500 s to 240 + 240 + 200 /
  350 s; the colony from 200 + 200 + 150 / 300 s to 160 + 160 + 120 /
  210 s.
- **"Fertile Crescent"** (auto tech `civbonuses/sele_farms`, requirement
  `sele`): **Farms −25% wood cost, −75% build time, −25% wood loot**
  (affects `Field`). A field drops from 100 wood / 50 s to 75 wood /
  12.5 s.
- **Hero training at the civic centre** (`structures/sele/civil_centre`
  trainer): the three Seleucid heroes are trained at the **civic centre**,
  not a City-phase temple or fortress — the only civ whose CC trains
  heroes. Combined with the CC-limit rule below, hero access and expansion
  unlock live in the same building.
- **Civil-centre limit quirk** (`special/players/sele.xml`
  `EntityLimits/LimitRemovers`): identical to the ptol rule — the generic
  `CivilCentre` limit of 1 is lifted only when **both** `phase_town` is
  researched **and** the player owns at least one entity of class `Hero`.
  In practice: no second CC before a hero exists (heroes only become
  trainable in the City phase, so the hero — not the Town-phase tech — is
  the binding constraint), and losing
  the last hero re-imposes the limit until another is trained.

## Starting entities

`civs/sele.json` — the standard pattern (1 CC, 4 women, 2 melee, 2 ranged,
1 cavalry), with sele's picks:

- 1 × `structures/sele/civil_centre`
- 4 × `units/sele/support_civilian` (women)
- 2 × `units/sele/infantry_spearman_b` (Militia Thureos Spearmen — the melee pair)
- 2 × `units/sele/infantry_javelineer_b` (Arab Javelineers — the ranged pair)
- 1 × `units/sele/cavalry_javelineer_b` (Militia Cavalry)

## Buildings

- **No sele-exclusive buildable buildings** — every structure the
  Seleucids can build is shared (see
  [`buildings/README.md`](buildings/README.md)). The civ's building
  identity is in the trainers and the shared specials:
- **Military colony / Klērouchia** (shared with ptol, see
  [`generic/buildings/military_colony.md`](../generic/buildings/military_colony.md)):
  Town phase, 200 wood + 200 stone + 150 metal, 300 s, 2000 HP,
  own+neutral territory, min 120 m from a civic centre. The **sele variant
  keeps the inherited CC trainer (women) and adds the three mercenaries**
  (Thracian swordsman, Syrian archer, Companion cavalry) — unlike the ptol
  colony, which replaces the whole trainer with four mercenaries. Sele
  footprint 31 × 31 m (obstruction 29 × 29).
- **Civil centre / Agora** (`structures/sele/civil_centre`): the standard
  generic CC (32 × 32 m footprint, no override) with the sele trainer:
  women, spearman, javelineer, cavalry javelineer **and the three heroes**.
- **Fortress / Phrourion** (`structures/sele/fortress`, footprint 26 × 28 m):
  trains **nothing** (the generic fortress trainer has no entities and
  sele adds none — no heroes here, they are at the CC) and researches
  `parade_of_daphne` on top of the generic fortress techs.
- **Theater / Theatron**: sele gets the standard Greek theater (shared
  with athen, mace, ptol, spart — see
  [`generic/buildings/theater.md`](../generic/buildings/theater.md)).
- **Stone walls** are the standard own-territory set with sele-specific
  sizes: short 12×6 (h 11.4), medium 22×6 (h 11.4), long 35×6 (h 11.4),
  tower 8×8 (h 19), gate 35×8 (h 11.6) — see
  [`generic/buildings/wallset_stone.md`](../generic/buildings/wallset_stone.md).
- **Vestigial sele templates, unbuildable** (no `Builder` list references
  them — see [`buildings/README.md`](buildings/README.md)): the
  **library** (`structures/sele/library`, 26 × 26 m — the "Center of
  Scholarship" aura it would carry never applies, because only ptol units
  can build a library), the **archery range** (`structures/sele/range`,
  present for athen/mace/pers/sele/han, never referenced) and the
  **artillery tower** (`structures/sele/tower_artillery`, present for six
  civs, never referenced).
- **Shared buildings sele lacks entirely**: crannog, encampment, kennel,
  great hall, ministry, academy, ice house (pers), tachara (pers), and
  the civ-unique buildings of other civs. Everything else is the standard
  shared roster, with sele identity-only overrides (house "Oikos" 15 × 16
  m, 1200 HP, 150 wood, +10 pop; barracks "Stratopedon" 25 × 25 m).

## Units

### Sele-only units (trained by no other civ)

| Unit | Trained at | Phase | Notable stats |
|---|---|---|---|
| Syrian Archer (`infantry_archer_merc_b`) | military colony | Town | 50 HP, bow 7.92 pierce @ 60 m, 60 metal, 7 s — the civ's only archer, no gathering |
| Hero Seleucus I (`hero_seleucus_i`) | civil centre | City | 1500 HP elephant hero, trunk 60 + 90; "Zooiarchos" (elephant champions +20% damage, +20% speed) |
| Hero Antiochus III (`hero_antiochus_iii`) | civil centre | City | 1200 HP cavalry spearman, spear 16 + 12 (1.75× vs Cav); "Ilarchès" (cavalry +2 all armor) |
| Hero Antiochus IV (`hero_antiochus_iv`) | civil centre | City | 1200 HP cavalry swordsman, sword 26 hack; "Renowned Conqueror" (enemy structures/ships/siege −20% health) |

The three mercenaries (the Syrian Archer above plus the shared Thracian
Mercenary Swordsman and Companion Cavalry — see
[`generic/units/`](../generic/units/)) share the mercenary package:
**metal-based cost** (60 metal infantry, 20 food + 90 metal cavalry — the
other resource components are zeroed), **+10% melee and ranged damage**,
**no gathering at all** (`ResourceGatherer` disabled — the infantry keep
the `Builder` class), ×0.7 build time (7 s infantry), the `Mercenary`
visible class, and **auto-promotion to Advanced at 0 XP** (the
auto-researched `upgrade_rank_advanced_mercenary` tech). Heroes cost 0
population, require the City phase, are subject to the global limit of
**1 hero alive at a time** — which also gates the second civic centre
(see Civ bonuses) — and are trained at the civic centre.

### Training roster (what sele's buildings train)

- CC: women, spearman_b, javelineer_b, cavalry_javelineer_b, **the 3 heroes**.
- Barracks: spearman_b, pikeman_b, javelineer_b,
  **champion_infantry_pikeman** (Silver Shield, gated on
  `traditional_army_sele`) **or** **champion_infantry_swordsman**
  (Romanized Heavy Swordsman, gated on `reformed_army_sele`) — the
  two unlock techs are mutually exclusive, so pick one — and
  **no clubman, maceman, axeman, swordsman_b, slinger or archer_b**.
- Stable: cavalry_javelineer_b, cavalry_archer_b, **champion_cavalry**
  (Seleucid Cataphract, gated on `unlock_champion_cavalry`),
  **champion_chariot** (Scythed Chariot, gated on `unlock_champion_chariots`).
- Elephant stable (City): champion_elephant (the upgraded Armored War
  Elephant — 1100 HP, 33 hack + 49.5 crush, 330 food + 220 metal).
- Fortress (City): nothing — researches `parade_of_daphne` only.
- Temple: healer.
- Arsenal (City): lithobolos, siege ram, siege tower — **no
  oxybeles/ballista/onager/scorpio/polybolos**.
- Dock: fishing, merchant, scout, arrow, ram and siege ships — **no fire
  ship** (no `ship_fire` template exists for sele).
- Military colony (Town): women (inherited CC trainer) + the 3 mercenaries.
- Market: support_trader.
- House: support_civilian_house (after `unlock_civilians_house_generic`).

### Shared unit classes sele does NOT have

- **No citizen swordsman, maceman, axeman or clubman**; no citizen
  cavalry spearmen, swordsmen or axemen — the citizen cavalry are the
  javelineer and the horse archer (Dahae Horse Archer) only; melee cavalry
  starts with the mercenary Companions and the champion cataphract.
- **No citizen archer or slinger** — the Syrian Archer mercenary is the
  entire bow line and there is no slinger at all.
- No elephant archers (nor the `support_elephant`).
- Navy: **no fire ship**; `warship_fireship_attack` is not researchable,
  and neither are `warship_arrow_attack` or `warship_health` (sele is
  excluded from all three).
- Siege: **no oxybeles/ballista/onager/scorpio** — the lithobolos is the
  entire stone-thrower park, and `siege_bolt_accuracy` is not researchable
  (`notciv: sele` — consistent with having no bolt shooters).
- **Vestigial unit templates, not trainable by anything**:
  `support_female_citizen` (a 25 HP dagger woman — no trainer references
  it); the `catafalque` exists as for every civ.

## Technologies

- **Sele-only techs**: `civbonuses/sele_farms` (auto),
  `traditional_army_sele` and `reformed_army_sele` (barracks, City, free
  and instant — each unlocks its champion infantry via the unit's
  `Identity/Requirements`, and the two are **mutually exclusive**: only
  one can ever be researched, so exactly one of the two champion infantry
  types becomes trainable), `pair_unlock_champions_sele` (the UI pair
  that presents them, and the engine mechanism enforcing the exclusivity)
  and `parade_of_daphne` (fortress, City, 500 food + 300
  metal, 60 s: Champions −20% training time) — see the per-tech files in
  [`technologies/`](technologies/).
- **Phase techs**: sele researches the generic ones (`phase_town_generic`,
  `phase_city_generic`) — no sele-specific phase techs.
- **Generic techs sele CANNOT research** (civ requirements exclude it —
  everything else in [`generic/technologies/`](../generic/technologies/) is
  available): `unlock_champion_infantry` (replaced by the army-reform
  pair), `siege_bolt_accuracy`, `warship_arrow_attack`, `warship_health`,
  `warship_fireship_attack`, plus every other civ's civ-gated techs
  (`archery_tradition`, `hoplite_tradition`, `roman_reforms`, `exploration`,
  `juggernauts`, `equine_transports`, `iphicratean_reforms`,
  `arsenal_philon`, `warship_ranged_attack`, `unlock_civilians_house_kush`,
  etc.).
- **Restricted techs sele DOES get**: `hellenistic_metropolis` (mace +
  ptol + sele, civil centre, City phase: Civic Centres ×2 health and
  capture points, double default arrows), `unlock_champion_chariots`
  (brit/maur/pers/sele), `nisean_horses` (pers/sele, stable, gated on
  `unlock_champion_cavalry`, specific name "Nisioi": Champion Cavalry
  Spearmen +10% health, +10% training time — i.e. the cataphract),
  `barracks_batch_training`, `stable_batch_training`, `siege_pack_unpack`,
  `ship_capture_resistance`, `warship_ramming_attack`,
  `warship_siege_attack`, `tower_health`, and the standard unlock techs
  (`unlock_champion_cavalry`, `unlock_shared_dropsites`, `unlock_shared_los`,
  `unlock_spies`, `unlock_civilians_house_generic`, `unlock_females_house`
  — the last a no-op vestige: it carries no modifications and nothing
  gates on it). Sele also gets the full standard soldier/armor/economic
  tech lines, including both generic farming techs
  (`gather_farming_fertilizer`, `gather_farming_training`).

## Auras (summary)

| Aura | Carrier | Effect |
|---|---|---|
| `teambonuses/sele_player_teambonus` | the player (teambonus) | global, all allies: CCs and colonies −20% cost, −30% build time |
| `units/heroes/sele_hero_seleucus_i` | Seleucus I | own champion elephants within 60 m: +20% melee damage, +20% speed |
| `units/heroes/sele_hero_antiochus_iii` | Antiochus III | own cavalry within 45 m: +2 hack/pierce/crush armor |
| `units/heroes/sele_hero_antiochus_iv` | Antiochus IV | enemy structures/ships/siege within 80 m: −20% health |

## Stat deltas on otherwise shared content

- Champion cavalry: the **Seleucid Cataphract** — 260 HP (generic 240),
  8/9/20 armor (generic 5/5/20), spear 12 hack + 10 pierce at **7 m reach**
  (generic 4 m), 110 metal (generic 100), slower walk 14.4 m/s (generic
  18) — the `cataphract` mixin's armor-for-speed trade.
- Champion elephant: the **upgraded** war elephant — 1100 HP (generic
  1000), trunk 33 hack + 49.5 crush (generic 30 + 45), 330 food + 220
  metal, 39.6 s (the `elephant_indian` mixin's ×1.1).
- Champion chariot: the **Scythed Chariot** — 300 HP (generic 240), 1/5/20
  armor, bow 15 pierce @ 60 m, 180 food + 100 wood + 120 metal, 30 s.
- House: 15 × 16 m footprint, 1200 HP, 150 wood, 50 s, +10 population,
  20 m territory, 6 garrison slots.
- Civil centre: the standard generic 32 × 32 m (no override).
- Military colony: trainer = women + the three mercenaries (ptol replaces
  the trainer instead); 31 × 31 m footprint.
- Fortress: 26 × 28 m footprint; researches `parade_of_daphne`.
- Barracks: 25 × 25 m footprint.
- Stone walls: sele-specific segment sizes (see Buildings).
- All other sele variants of shared units (pikemen — "Phalangite" —,
  spearmen, javelineers, horse archers, healers, women, traders, ships,
  the lithobolos/ram/tower) are identity-only overrides of the generic
  templates — no further stat differences.

## Non-gameplay

- Culture `sele` (Hellenistic music set, emblem), 27 AI names, the
  skirmish replacement (the house) and the sele-specific unit names
  (Militia Thureos Spearman, Arab Javelineer, Militia Cavalry, Phalangite,
  Dahae Horse Archer, Silver Shield, Romanized Heavy Swordsman, Seleucid
  Cataphract, Scythed Chariot, Armored War Elephant, Syrian Archer,
  Thracian Mercenary Swordsman, Companion Cavalry) are cosmetic only. The
  player template adds the `phalanx` and `syntagma` formations.
