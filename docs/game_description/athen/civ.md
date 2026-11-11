# Athens vs a generic civilisation

Synthesis of **everything that differs between the athenian civilisation and a
generic (non-civ-specific) civilisation** in 0 A.D. 0.28.0. The baseline
"generic civ" is defined as: the shared entity pool documented in
[`generic/`](../generic/) (units, buildings, technologies, auras with no
civ-specific content), the standard tech tree (`phase_town_generic` /
`phase_city_generic`, all techs with no civ requirement), the standard
`StartEntities` pattern, and no civ or team bonuses. Per-entity details are
in this folder's [`auras/`](auras/), [`buildings/`](buildings/),
[`technologies/`](technologies/) and [`units/`](units/) directories
(athen-only entities) and in [`generic/`](../generic/)
(shared entities with per-civ variants); this file is the complete delta.

Data sources: `civs/athen.json`, `templates/structures/athen/`,
`templates/units/athen/`, `data/technologies/`,
`data/auras/`, `special/players/athen.xml`.

## Narrative

Athens is the **maritime democracy with the earliest champions and the
cheapest research in the game**. Its army is built around the hoplite —
the armoured spearman (phalanx formation, the classic Greek line) — plus
slings, and its ranged citizen infantry is **bought, not raised**: the
archer and javelineer are metal-paid mercenaries (60 metal each, no
gathering), so Athenian ranged power is a metal expense like Carthage's.
The defining building is the **Gymnasium**: a Town-phase structure that
trains all three champions — the fast Marine swordsman, the City Guard
spearman and the Scythian Archer — with no unlock tech, putting 200 HP
fast champions on the field while other civs are still on citizens.
Around it, the **Prytaneion** (City phase) trains three of the four
heroes, heals garrisoned heroes +6 HP/s, and offers the civ's signature
techs: `long_walls` (stone walls in neutral territory) and `ostracism`
(citizen soldiers +5% health, heroes −40% — a deliberate trade).

The other half of the design is **navy and speed**. "Iphicratean
Reforms" turns the docks into training grounds (marines and Cretan
mercenary archers at sea), "Arsenal of Philon" makes warships
self-repair (+1 HP/s), and Themistocles' auras halve ship and wall
costs; the team bonus "Democracy" halves civic-centre research time for
every ally. The economy leans on **Silver Owls** (+10% metal gathering
per phase, in the phase techs — Athens mines the premium resource
faster than anyone) and on Pericles, whose global aura halves research
time and whose defensive aura strips loot from everything near him. The
four heroes are the strongest support corps in the game: Hippocrates (a
healer hero who buffs every ally's healers +60%), Iphicrates (+2 armor
and faster javelineers), Pericles (research + loot denial) and
Themistocles (navy + walls) — Athens wins by out-researching and
out-building, not by raw unit strength.

The holes: no citizen swordsmen, no cavalry archers or spearmen, **no
champion cavalry** (the stable tops out at citizen javelineers and
swordsmen), no fire ships, and the siege park is bolt shooters and
lithobolos plus the ram. Several pieces are vestigial in 0.28 — the
0-population Slave (no trainer), the standalone Cretan archer template
(no trainer), the hero Xenophon (no trainer), and the Pheidian Workshop
tech (no researcher). In short: Athens is a metal-hungry hoplite
democracy that fields champions in the Town phase, researches at double
speed, walls in neutral territory, and owns the water — as long as the
metal keeps flowing for its mercenary archers.

## Civ bonuses (things a generic civ does not have)

- **Team bonus — "Democracy"**
  (`data/auras/teambonuses/athen_player_teambonus.json`, attached by
  `special/players/athen.xml`): **Civic-centre technologies −50%
  research time and −30% resource cost** for every ally (`MutualAlly`,
  athen included) — applied via `Researcher/TechCostMultiplier` on the
  `CivilCentre` class.
- **"Silver Owls"** (the athen phase techs `phase_town_athen` /
  `phase_city_athen`): **Workers +10% metal gather rate per phase**
  (`ResourceGatherer/Rates/metal.ore` ×1.1 at Town, again at City —
  ×1.21 combined). Implemented in the phase techs, not an auto-tech.
- **"Epilektoi Infantry"** (`units/athen/infantry_spearman_e.xml`): the
  Athenian **elite spearman promotes to `champion_infantry` at 250 XP**
  (the promotion-mechanics special case) — veteran hoplites become
  champions for free.
- **Mercenary ranged citizens** (`units/athen/infantry_archer_b`,
  `infantry_javelineer_b`): the citizen archer and javelineer carry the
  `merc_inf` mixin — **60 metal each, no gathering, ×0.7 build time,
  +10% damage**, auto-promotion at 0 XP — Athens' ranged line is paid
  in metal like Carthage's mercenaries.

## Starting entities

`civs/athen.json` — the standard pattern (1 CC, 4 women, 2 melee, 2 ranged,
1 cavalry), with athen's picks:

- 1 × `structures/athen/civil_centre`
- 4 × `units/athen/support_civilian` (women)
- 2 × `units/athen/infantry_spearman_b` (Hoplites)
- 2 × `units/athen/infantry_slinger_b` (the ranged pair)
- 1 × `units/athen/cavalry_javelineer_b`

## Buildings

- **Athen-only building — Gymnasium / Gymnasion**
  (`structures/athen/gymnasium`): 150 stone + 100 metal, 200 s, **Town
  phase**; 2000 HP, 30 × 30 m, 10 garrison, 38 m territory influence
  (non-root), **no build limit**. Trains all three champions
  (`champion_marine`, `champion_infantry`, `champion_ranged`) at ×0.7
  batch time and researches `iphicratean_reforms`. Built by every
  Athenian unit (the `civ/athen` mixin adds it to all builder lists).
- **Athen-only building — Council Chamber / Prytaneion**
  (`structures/athen/prytaneion`): 100 stone + 200 metal, 200 s, **City
  phase**; 2000 HP, Circle r 16 m, 5 garrison, 38 m territory influence,
  **no build limit**. Trains three heroes (Themistocles, Pericles,
  Iphicrates) at ×0.7 batch time, researches `long_walls` and
  `ostracism`, and its "Officer Accommodation" aura heals garrisoned
  heroes +6 HP/s. Built by every Athenian unit (the `civ/athen` mixin).
- **Royal Stoa** (`structures/athen/royal_stoa`, shared with mace and
  spart, not in the generic docs): Town phase, 100 stone + 150 metal,
  150 s, 2500 HP, 29 × 21 m, 10 garrison, 40 m territory influence — a
  garrison/territory civic building with no trainer or researcher.
- **Theater**: the standard Greek theater (shared with mace, ptol, sele,
  spart — see [`generic/buildings/theater.md`](../generic/buildings/theater.md)).
- **The buildable Athenian house is the big-house variant**: 150 wood,
  50 s, 1200 HP, **+10 population**, 6 garrison slots (see
  [`generic/buildings/house.md`](../generic/buildings/house.md)).
- **Stone walls** are the standard own-territory set with athen-specific
  sizes (short 13×6 (h 12.5), medium 25×6 (h 12.5), long 37×6 (h 9),
  tower 8×8 (h 19), gate 37×8 (h 15.5) — see
  [`generic/buildings/wallset_stone.md`](../generic/buildings/wallset_stone.md))
  — and `long_walls` extends them to neutral territory.
- **Shared buildings athen lacks entirely**: elephant stable (no
  elephants), crannog, military colony, encampment, kennel, great hall,
  ministry, academy, ice house, tachara, and the civ-unique buildings of
  other civs. Everything else is the standard shared roster, with athen
  identity-only overrides (the civil centre, the fortress — which
  trains **no heroes**, like pers/ptol/maur).

## Units

### Athen-only units (trained by no other civ)

| Unit | Trained at | Phase | Notable stats |
|---|---|---|---|
| Athenian Marine (`champion_marine`) | gymnasium | Town | 200 HP, sword 16 hack (0.75 s), **walk 11.4 m/s**, 60/40/60, 15 s |
| Athenian Marine, dock (`champion_marine_dock`) | dock (after `iphicratean_reforms`) | Town+ | identical stats — the amphibious twin |
| Scythian Archer (`champion_ranged`) | gymnasium | Town | 120 HP, bow 14.4 pierce @ 60 m, **walk 10.3 m/s**, 80/60/80, 15 s |
| Cretan Mercenary Archer, dock (`infantry_archer_b_dock`) | dock (after `iphicratean_reforms`) | Town+ | 50 HP, bow 7.92 @ 60 m, 60 metal, 7 s — mercenary package |
| Hero Hippocrates (`hero_hippocrates`) | temple | City | 600 HP healer (7.5 HP/s @ 20 m), no attack; "Father of Medicine" + global "Hippocratic Oath" (all healers +3/tick, allies included) |
| Hero Iphicrates (`hero_iphicrates`) | prytaneion | City | 1000 HP javelineer, **62 pierce** @ 30 m; "Formation Reforms" (soldiers within 40 m +2 all armor) + global "Peltast Reforms" (infantry javelineers +15% speed) |
| Hero Pericles (`hero_pericles`) | prytaneion | City | 1000 HP hoplite (15 + 12, 2.5× vs Cavalry); "Defensive Strategy" (60 m: own units/structures no loot, +50% capture points) + global "Scholarship" (techs −10% cost, −50% time) |
| Hero Themistocles (`hero_themistocles`) | prytaneion | City | 1000 HP swordsman (26 hack); global "Naval Preparation" (ships −50% metal/build, +15% speed) + global "Themistoclean Walls" (walls/palisades −50% costs, −20% build) |
| Cretan Mercenary Archer (`infantry_marine_archer_b`) | nothing (vestigial) | — | identical stats to the dock archer — no trainer |
| Slave (`support_slave`) | nothing (vestigial) | — | **0-pop** worker, 50 metal, wood/stone/metal 1.0/s, −0.25 HP/s lifespan (~400 s), unhealable |

The mercenary archer and javelineer citizens carry the full mercenary
package (metal-paid, no gathering, ×0.7 build time, +10% damage,
auto-promotion at 0 XP). Heroes cost 0 population, require the City
phase, and are subject to the global limit of **1 hero alive at a
time**; Hippocrates trains at the temple, the other three at the
prytaneion. A fifth hero, `hero_xenophon` (a 1000 HP javelineer with no
auras), is vestigial — nothing trains him.

### Training roster (what athen's buildings train)

- CC: women, spearman_b, slinger_b, cavalry_javelineer_b.
- Barracks: spearman_b, javelineer_b (60 metal), slinger_b, archer_b (60
  metal) — the generic trainer's other entries (swordsmen, pikemen,
  champions) don't exist for athen.
- Stable: cavalry_swordsman_b, cavalry_javelineer_b — **no champion
  cavalry** (no `champion_cavalry` template exists for athen).
- Gymnasium (Town): champion_marine, champion_infantry, champion_ranged.
- Prytaneion (City): the 3 heroes.
- Temple: healers + hero_hippocrates.
- Fortress (City): nothing — athen adds no heroes to the generic (empty)
  fortress trainer.
- Arsenal (City): oxybeles, lithobolos, siege ram.
- Dock: fishing, merchant, scout, arrow and ram ships — **no fire ship**
  (no `ship_fire` template exists for athen); after
  `iphicratean_reforms`, also `champion_marine_dock` and
  `infantry_archer_b_dock`.
- Market: support_trader.
- House: support_civilian_house (after `unlock_civilians_house_generic`).

### Shared unit classes athen does NOT have

- **No citizen swordsman, pikeman, maceman, axeman or clubman** (the
  melee citizen is the hoplite spearman); no cavalry archer or citizen
  cavalry spearman; **no champion cavalry of any kind**; no chariots;
  no elephants (and no elephant stable); no camel units.
- Navy: **no fire ship**; `warship_fireship_attack` is not researchable
  (`notciv: athen`), nor is `warship_siege_attack`.
- Siege: no siege towers — the arsenal's oxybeles + lithobolos + ram is
  the full park (athen does get `siege_bolt_accuracy` and
  `siege_pack_unpack`).
- **Vestigial unit templates, not trainable by anything**:
  `support_slave`, `infantry_marine_archer_b`, `hero_xenophon`, the 25
  HP dagger woman `support_female_citizen`, and the `catafalque`.

## Technologies

- **Athen-only techs**: `iphicratean_reforms` (gymnasium, Town — gate
  tech), `arsenal_philon` (dock, City — warships +1 HP/s regen),
  `long_walls` (prytaneion, City — walls in neutral territory),
  `ostracism` (prytaneion, City — citizens +5% HP, heroes −40% HP),
  `pheidian_workshop` (**vestigial** — temples/wonder −50% stone cost
  and build time, but no researcher offers it), and the phase techs
  `phase_town_athen` / `phase_city_athen` (the generic effects plus the
  "Silver Owls" metal bonus). See the per-tech files in
  [`technologies/`](technologies/).
- **Phase techs**: athen researches its own (`phase_town_athen`,
  `phase_city_athen`), which replace the generic ones and add the metal
  gather bonus — all other effects identical to the generic phase techs.
- **Generic techs athen CANNOT research** (civ requirements exclude it —
  everything else in [`generic/technologies/`](../generic/technologies/) is
  available): `archery_tradition`, `hoplite_tradition`,
  `hellenistic_metropolis`, `ship_health`, `ship_movement_speed`,
  `unlock_champion_chariots`, `warship_fireship_attack`,
  `warship_siege_attack`, `warship_health`, plus every other civ's
  civ-gated techs (`exploration`, `roman_reforms`, etc.).
- **Restricted techs athen DOES get**: the full standard
  soldier/armor/economic lines, the siege techs (`siege_bolt_accuracy`,
  `siege_pack_unpack` — for the oxybeles), `warship_arrow_attack`,
  `warship_ramming_attack`, `barracks_batch_training`,
  `stable_batch_training`, `tower_health`, `ship_capture_resistance`,
  and the standard unlock techs (`unlock_champion_infantry` — though
  nothing athen-specific gates on it: the gymnasium champions need only
  the building, and the elite-spearman promotion is a pure XP check;
  `unlock_shared_dropsites`, `unlock_shared_los`, `unlock_spies`,
  `unlock_civilians_house_generic`, `unlock_females_house`).

## Auras (summary)

| Aura | Carrier | Effect |
|---|---|---|
| `teambonuses/athen_player_teambonus` | the player (teambonus) | CC techs −50% research time, −30% cost, all allies |
| `structures/athen_prytaneion_hero_heal` | Prytaneion | garrisoned heroes +6 HP/s regeneration |
| `units/heroes/athen_hero_hippocrates_1` | Hippocrates | own Humans within 35 m: +0.5 HP/s regeneration |
| `units/heroes/athen_hero_hippocrates_2` | Hippocrates | global: own + allied healers +3 heal per tick |
| `units/heroes/athen_hero_iphicrates_1` | Iphicrates | own soldiers within 40 m: +2 hack, pierce and crush armor |
| `units/heroes/athen_hero_iphicrates_2` | Iphicrates | global: own infantry javelineers +15% walk speed |
| `units/heroes/athen_hero_pericles_1` | Pericles | own soldiers/ships/siege/structures within 60 m: loot = 0; structures +50% capture points |
| `units/heroes/athen_hero_pericles_2` | Pericles | global: all technologies −10% resource cost, −50% research time |
| `units/heroes/athen_hero_themistocles_1` | Themistocles | global: ships −50% metal cost and build time, +15% speed |
| `units/heroes/athen_hero_themistocles_2` | Themistocles | global: walls and palisades −50% resource costs, −20% build time |

## Stat deltas on otherwise shared content

- Worker metal gather: ×1.1 per phase (Silver Owls — ×1.21 by City).
- Citizen archer and javelineer: 60-metal mercenary package (no
  gathering, ×0.7 build time, +10% damage) — the athen archer does 7.92
  pierce (generic 9).
- Champion infantry (City Guard): 15 s build time (generic 20), trained
  at the gymnasium with no unlock tech; elite hoplites promote into it
  at 250 XP.
- House: +10 population, 1200 HP, 150 wood, 50 s (the big-house
  variant).
- Stone walls: athen-specific segment sizes (see Buildings).
- All other athen variants of shared units (hoplites, slingers, cavalry,
  healers, women, traders, ships, siege engines) are identity-only
  overrides of the generic templates — no further stat differences.

## Non-gameplay

- Culture `hele` (Greek music set, emblem — shared with mace, ptol, sele,
  spart), 19 AI names, the skirmish replacements (the default ranged
  infantry becomes the slinger, the house the athen big house) and the
  athen-specific unit names (Hoplite, Athenian Marine, Scythian Archer,
  Slave) are cosmetic only. The player template adds the `phalanx`
  formation.
