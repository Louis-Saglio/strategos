# Ptolemies vs a generic civilisation

Synthesis of **everything that differs between the ptolemaic civilisation and a
generic (non-civ-specific) civilisation** in 0 A.D. 0.28.0. The baseline
"generic civ" is defined as: the shared entity pool documented in
[`generic/`](../generic/) (units, buildings, technologies, auras with no
civ-specific content), the standard tech tree (`phase_town_generic` /
`phase_city_generic`, all techs with no civ requirement), the standard
`StartEntities` pattern, and no civ or team bonuses. Per-entity details are
in this folder's [`auras/`](auras/), [`buildings/`](buildings/),
[`technologies/`](technologies/) and [`units/`](units/) directories
(ptol-only entities) and in [`generic/`](../generic/)
(shared entities with per-civ variants); this file is the complete delta.

Data sources: `civs/ptol.json`, `templates/structures/ptol/`,
`templates/units/ptol/`, `data/technologies/`,
`data/auras/`, `special/players/ptol.xml`.

## Narrative

The Ptolemies are **Hellenistic Egypt: a phalanx-and-mercenary kingdom on
the best farmland in the game**. The army is Macedonian in shape — the
basic melee line is the **pikeman** (Egyptian Pikeman, trained at the CC
from the first minute, plus the Royal Guard champion pikemen), backed by
Judean slingers and Nabataean camel archers — and its firepower and
speed come from **bought soldiers**: four mercenary types (Thureos
spearman, Gallic swordsman, Macedonian settler cavalry, Tarantine
cavalry) hired for **metal** at the military colony from the Town phase.
Mercenaries are the civ's defining trade-off: pure soldiers that hit +10%
harder and train 30% faster than citizens, but **cannot gather**, and
every one is permanent metal spending. Two levers feed that metal habit:
Ptolemy I's global "Mercenary Patron" aura (−35% mercenary costs while he
lives) and the "Serapis Cult" (+2 metal/s trickle) from the Temple of
Isis — pick Ptolemy I first and the whole hireling roster becomes a
bargain.

The economy is built to **farm and expand cheaply**. "Nile Delta" makes
all three grain technologies researchable in the Village phase (×1.728
grain gathering long before anyone else), the team bonus "Breadbasket of
the Mediterranean" trickles +1 food/s to every ally, and "Sun-dried Mud
Bricks" makes houses and economy buildings cost 40% less wood — at the
price of +50% build time and −40% health and capture points, so Ptolemaic
towns go up fast on wood but are flimsy until upgraded. Expansion has a
unique gate: the second civic centre requires the Town phase **and a live
hero**, so the Temple of Isis (City phase, trains all three heroes and
offers the two cults) is the true economic milestone. Around the map, the
lighthouse (325 m vision, placeable on any shoreline) and the library
(−15% tech costs, shared with mace and sele) — buildable only by women
and mercenary infantry — give the Ptolemies the best map awareness and
cheapest research in the game.

The army's other edge is artillery: the **Polybolos**, a rapid-fire bolt
shooter (132 pierce every 3 s with splash, vs the generic 240/6 s), the
only bolt shooter the Ptolemies get. The navy is complete except the fire
ship, and the "Juggernauts" tech makes it +25% tougher; the 4000 HP
Juggernaut super-ship itself exists only as an untrainable vestige. The
weaknesses follow from the design: no citizen spearmen, swordsmen or
cavalry beyond the camel archers (melee power is pikemen + metal-bought
mercenaries), flimsy mud-brick buildings that raiders level fast, and a
metal economy that must keep flowing or the army shrinks. In short: the
Ptolemies are a farming, metal-hungry phalanx kingdom — buy the army with
metal, hold the line with pikes, and use Ptolemy I, the lighthouse and
the Nile to out-build everyone else.

## Civ bonuses (things a generic civ does not have)

- **Team bonus — "Breadbasket of the Mediterranean"**
  (`data/auras/teambonuses/ptol_player_teambonus.json`, attached by
  `special/players/ptol.xml`): **+1.0 food trickle per second** for every
  ally (`MutualAlly`, ptol included) — a player-level aura modifying
  `ResourceTrickle/Rates/food`.
- **"Sun-dried Mud Bricks"** (auto tech `civbonuses/ptol_structures`,
  requirement `ptol`): **Houses and Economic structures −40% wood cost,
  health, capture points and wood loot, +50% build time** (affects
  `Economic !CivCentre !Naval` — farmstead, field, corral, market,
  storehouse — plus `House`; the dock is `Naval` and excluded).
- **"Nile Delta"** (techs `gather_farming_fertilizer_ptol` and
  `gather_farming_training_ptol`, both Village phase + `ptol`): the three
  farming technologies are available in the **Village phase** — plows
  (already village-phase for everyone), fertilizer (generic is City-phase,
  `notciv: ptol`) and training (generic is Town-phase, `notciv: ptol`).
  All three are +20% grain gather rate each (×1.728 combined).
- **"Polybolos"** (`units/ptol/siege_polybolos_packed`): the Ptolemaic
  bolt shooter fires **−45% damage and −50% attack time** relative to the
  generic bolt shooter — 132 pierce (+44 splash) every 3 s vs 240 pierce
  every 6 s, same cost, range and population.
- **Civil-centre limit quirk** (`special/players/ptol.xml`
  `EntityLimits/LimitRemovers`): the generic `CivilCentre` limit of 1 is
  lifted only when **both** `phase_town` is researched **and** the player
  owns at least one entity of class `Hero` (the generic civ needs only
  the Town phase). In practice: no second CC before the City phase (when
  the Temple of Isis can train a hero), and losing the last hero
  re-imposes the limit until another is trained.

## Starting entities

`civs/ptol.json` — the standard pattern (1 CC, 4 women, 2 melee, 2 ranged,
1 cavalry), with ptol's picks:

- 1 × `structures/ptol/civil_centre`
- 4 × `units/ptol/support_civilian` (women)
- 2 × `units/ptol/infantry_pikeman_b` (Egyptian Pikemen)
- 2 × `units/ptol/infantry_slinger_b` (Judean Slingers — the ranged pair)
- 1 × `units/ptol/cavalry_archer_b` (Nabataean Camel Archer)

## Buildings

- **Ptol-only building — Lighthouse / Pharos** (`structures/ptol/lighthouse`):
  200 stone + 200 metal, 200 s, City phase; 2000 HP, Circle r 14 m, shore
  placement in **own/ally/neutral territory**, **325 m vision** (the
  largest in the game), no territory decay, no trainer/researcher. Max **1
  per player** (`Lighthouse` limit).
- **Ptol-only building — Temple of Isis / Naos** (`structures/ptol/temple_2`):
  the ×1.5 temple — 450 stone, 300 s, City phase; 3000 HP, 30 garrison
  slots (+3/s heal), 30 × 33 m footprint, 40 m territory influence. Max
  **1 per player** (`TempleOfIsis` limit). Trains the **three heroes**
  plus healers and researches the healing techs and the
  `pair_unlock_cult_ptol` pair (Pharaonic Cult / Serapis Cult).
- **Ptol-only building, vestigial — Mercenary Camp** (`structures/ptol/mercenary_camp`):
  100 wood + 100 stone + 100 metal, 300 s, Town phase; 1200 HP, 25.5 m
  footprint, own+neutral territory, **no territory influence**, min 100 m
  from another MercenaryCamp. Trains the four mercenaries (on top of the
  inherited citizen barracks roster) and researches the barracks techs —
  but **no builder lists it**, so it is unreachable through the build UI,
  and it is redundant anyway: the military colony trains the same four
  mercenaries.
- **Special buildings built only by women and mercenary infantry**: the
  lighthouse, the library and the Temple of Isis are in the `Builder`
  lists of `support_civilian`, `infantry_spearman_merc_b` and
  `infantry_swordsman_merc_b` — **no other unit can build them**. Walking
  a woman or a mercenary to the site is mandatory.
- **The library** (`structures/ptol/library`, shared with mace and sele,
  not in the generic docs): 200 stone + 200 metal, 200 s, City phase;
  2000 HP, 29 × 34 m, max **1 per player** (`Library` limit). No trainer
  or researcher — its value is the global "Center of Scholarship" aura:
  **own structures −15% technology resource costs and research time**.
- **Military colony / Klērouchia** (shared with sele, see
  [`generic/buildings/military_colony.md`](../generic/buildings/military_colony.md)):
  Town phase, 200 wood + 200 stone + 150 metal, 300 s, 2000 HP,
  own+neutral territory, min 120 m from a civic centre; the ptol variant
  replaces the trainer with the four mercenaries and uses a 34 × 33 m
  footprint.
- **Theater**: ptol gets the standard Greek theater (shared with athen,
  mace, sele, spart — see
  [`generic/buildings/theater.md`](../generic/buildings/theater.md)).
- **Stone walls** are the standard own-territory set with ptol-specific
  sizes (short 16×6 (h 10.8), medium 26×6 (h 10.8), long 39×6 (h 10.8),
  tower 10×10 (h 16), gate 40×12 (h 17.8) — see
  [`generic/buildings/wallset_stone.md`](../generic/buildings/wallset_stone.md)).
- **Shared buildings ptol lacks entirely**: crannog, encampment, kennel,
  great hall, ministry, academy, ice house (pers), tachara (pers), and
  the civ-unique buildings of other civs. Everything else is the standard
  shared roster, with ptol identity-only overrides (the civil centre
  "Agora" 41 × 33 m, the house 15 × 14 m, the fortress — which, like
  pers, trains **no heroes**).

## Units

### Ptol-only units (trained by no other civ)

| Unit | Trained at | Phase | Notable stats |
|---|---|---|---|
| Mercenary Thureos Spearman (`infantry_spearman_merc_b`) | military colony (+ vestigial mercenary camp) | Town | 100 HP, spear 4.95 + 4.4 (2.5× vs Cavalry), 60 metal, 7 s, phalanx formation — no gathering |
| Polybolos (`siege_polybolos_packed`) | arsenal | City | 200 HP bolt shooter, 132 pierce + 44 splash @ 80 m, repeat 3 s, 250 wood + 250 metal, 2 pop |
| Juggernaut (`champion_juggernaut`) | nothing (vestigial) | City | 4000 HP siege warship, 220 crush @ 80 m, 100 garrison, 800 wood + 400 metal, 5 pop |
| Hero Ptolemy I (`hero_ptolemy_i`) | temple_2 | City | 1500 HP elephant hero, trunk 60 + 90; "Patron of Construction" (builders +10%) + global "Mercenary Patron" (mercenaries −35% costs) |
| Hero Ptolemy IV (`hero_ptolemy_iv`) | temple_2 | City | 1200 HP cavalry swordsman, sword 26 hack; "Raphia" (pikemen within 60 m +40% health); +4 Juggernaut limit while alive |
| Hero Cleopatra VII (`hero_cleopatra_vii`) | temple_2 | City | 1000 HP archer, bow 27 @ 60 m; "Patriot" (soldiers + siege −20% attack repeat time), "Consort" (allied heroes +10% HP / enemy heroes −10% HP) |

All four mercenary types (the Thureos Spearman above plus the shared
Gallic Mercenary Swordsman, Macedonian Settler Cavalry and Tarantine
Cavalry — see [`generic/units/`](../generic/units/)) share the mercenary
package: **metal-based cost** (60 metal infantry, 90 metal + 20 food
cavalry — the food/wood/stone components are zeroed), **+10% melee and
ranged damage**, **no gathering at all** (`ResourceGatherer` disabled —
though the infantry keep the `Builder` class, which is how they build the
special buildings), ×0.7 build time (7 s infantry), the `Mercenary`
visible class, and **auto-promotion to Advanced at 0 XP** (the
auto-researched `upgrade_rank_advanced_mercenary` tech). Heroes cost 0
population, require the City phase, and are subject to the global limit
of **1 hero alive at a time** — which also gates the second civic centre
(see Civ bonuses).

### Training roster (what ptol's buildings train)

- CC: women, pikeman_b, slinger_b, cavalry_archer_b.
- Barracks: pikeman_b, javelineer_b, slinger_b, archer_b,
  **champion_infantry_pikeman** (Royal Guard).
- Stable: cavalry_archer_b, **champion_cavalry** (Royal Guard Cavalry).
- Fortress (City): nothing — ptol adds no heroes to the generic (empty)
  fortress trainer.
- Temple of Isis (City): the 3 heroes + healers.
- Elephant stable (City): champion_elephant (the smaller 900 HP variant).
- Arsenal (City): polybolos, lithobolos, siege ram, siege tower — **no
  oxybeles/ballista/onager/scorpio**.
- Dock: fishing, merchant, scout, arrow, ram and siege ships — **no fire
  ship** (no `ship_fire` template exists for ptol).
- Military colony (Town): the 4 mercenaries.
- Market: support_trader (Émporos).
- House: support_civilian_house (after `unlock_civilians_house_generic`).

### Shared unit classes ptol does NOT have

- **No citizen spearman, swordsman, maceman, axeman or clubman** (the
  basic melee infantry is the pikeman); no citizen cavalry javelineers,
  spearmen or swordsmen — the only citizen cavalry is the camel archer
  (melee cavalry comes from the mercenary stable-mates and the champion).
- No chariots (nor `unlock_champion_chariots`), no elephant archers.
- Navy: **no fire ship**; `warship_fireship_attack` is not researchable
  (`notciv: ptol`), and neither is `warship_health` or `ship_health`.
- Siege: **no oxybeles/ballista/onager/scorpio** — the Polybolos is the
  entire bolt-shooter park (and it does get `siege_bolt_accuracy` and
  `siege_pack_unpack`, unlike pers).
- **Vestigial unit templates, not trainable by anything**:
  `champion_juggernaut` (the super-ship — no trainer references it) and
  `support_female_citizen` (a 25 HP dagger woman — no trainer references
  it); the `catafalque` exists as for every civ.

## Technologies

- **Ptol-only techs**: `civbonuses/ptol_structures` (auto),
  `gather_farming_fertilizer_ptol` and `gather_farming_training_ptol`
  (farmstead, Village), `juggernauts` (dock, City: Warships +25% health,
  −10% speed), `pharaonic_cult` and `serapis_cult` (temple_2, City),
  `pair_unlock_cult_ptol` (the UI pair that presents them) — see above and
  the per-tech files in [`technologies/`](technologies/).
- **Phase techs**: ptol researches the generic ones (`phase_town_generic`,
  `phase_city_generic`) — no ptol-specific phase techs.
- **Generic techs ptol CANNOT research** (civ requirements exclude it —
  everything else in [`generic/technologies/`](../generic/technologies/) is
  available): `archery_tradition`, `gather_farming_fertilizer`,
  `gather_farming_training` (replaced by the ptol variants),
  `hoplite_tradition`, `nisean_horses`, `ship_health`, `ship_movement_speed`,
  `unlock_champion_chariots`, `warship_fireship_attack`, `warship_health`,
  plus every other civ's civ-gated techs (`exploration`, `roman_reforms`,
  `hoplite_tradition`, `tyrtean_paeans`, etc.).
- **Restricted techs ptol DOES get**: `hellenistic_metropolis` (mace +
  ptol + sele, civil centre, City phase: Civic Centres ×2 health and
  capture points, double default arrows), `barracks_batch_training`,
  `stable_batch_training`, `siege_bolt_accuracy`, `siege_pack_unpack`,
  `ship_capture_resistance`, `warship_arrow_attack`, `warship_ramming_attack`,
  `warship_siege_attack`, `tower_health`, and the standard unlock techs
  (`unlock_champion_infantry`, `unlock_champion_cavalry`,
  `unlock_shared_dropsites`, `unlock_shared_los`, `unlock_spies`,
  `unlock_civilians_house_generic`, `unlock_females_house` — the last a
  no-op vestige: it carries no modifications and nothing gates on it).
  Ptol also gets the full standard soldier/armor/economic tech lines.

## Auras (summary)

| Aura | Carrier | Effect |
|---|---|---|
| `teambonuses/ptol_player_teambonus` | the player (teambonus) | +1 food/s player trickle, all allies |
| `units/heroes/ptol_hero_ptolemy_i_1` | Ptolemy I | own builders within 60 m: +10% build rate |
| `units/heroes/ptol_hero_ptolemy_i_2` | Ptolemy I | global: own mercenaries −35% resource costs |
| `units/heroes/ptol_hero_ptolemy_iv` | Ptolemy IV | own pikemen within 60 m: +40% health |
| `units/heroes/ptol_hero_cleopatra_vii_1` | Cleopatra VII | own soldiers + siege within 60 m: −20% melee and ranged attack repeat time |
| `units/heroes/ptol_hero_cleopatra_vii_2` | Cleopatra VII | allied (not own) heroes within 30 m: +10% health |
| `units/heroes/ptol_hero_cleopatra_vii_3` | Cleopatra VII | enemy heroes within 30 m: −10% health |
| `structures/library` | Library (shared mace/ptol/sele) | global: own structures −15% tech costs and research time |

## Stat deltas on otherwise shared content

- Economic structures and houses: ×0.6 wood cost/HP/capture points, ×1.5
  build time (Sun-dried Mud Bricks).
- Champion elephant: the **smaller** war elephant — 900 HP, 27 hack +
  40.5 crush, 270 food + 180 metal, 32.4 s (generic 1000 HP / 30 + 45 /
  300 + 200 / 36 s).
- Civil centre: footprint Square 41 × 33 m (h 8).
- House: footprint Square 15 × 14 m.
- Military colony: trainer replaced with the four mercenaries.
- Mercenary units: metal-based cost, ×0.7 build time, +10% damage, no
  gathering (the mercenary mixin), auto-promotion at 0 XP.
- Stone walls: ptol-specific segment sizes (see Buildings).
- All other ptol variants of shared units (pikemen, slingers, archers,
  camel archers, healers, women, traders, ships, the lithobolos/ram/
  tower) are identity-only overrides of the generic templates — no
  further stat differences.

## Non-gameplay

- Culture `ptol` (Egyptian-Greek music set, emblem), 17 AI names, the
  skirmish replacements (the default melee infantry becomes the Egyptian
  Pikeman, the ranged the Judean Slinger, the cavalry the Nabataean Camel
  Archer, the house the ptol house) and the ptol-specific unit names
  (Royal Guard Infantry/Cavalry, Egyptian Pikeman, Judean Slinger,
  Nabataean Camel Archer, Egyptian Laborer) are cosmetic only. The player
  template adds the `phalanx` and `syntagma` formations.
