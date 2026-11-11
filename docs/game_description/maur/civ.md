# Mauryas vs a generic civilisation

Synthesis of **everything that differs between the mauryan civilisation and a
generic (non-civ-specific) civilisation** in 0 A.D. 0.28.0. The baseline
"generic civ" is defined as: the shared entity pool documented in
[`generic/`](../generic/) (units, buildings, technologies, auras with no
civ-specific content), the standard tech tree (`phase_town_generic` /
`phase_city_generic`, all techs with no civ requirement), the standard
`StartEntities` pattern, and no civ or team bonuses. Per-entity details are
in this folder's [`auras/`](auras/), [`buildings/`](buildings/),
[`technologies/`](technologies/) and [`units/`](units/) directories
(maur-only entities) and in [`generic/`](../generic/)
(shared entities with per-civ variants); this file is the complete delta.

Data sources: `civs/maur.json`, `templates/structures/maur/`,
`templates/units/maur/`, `data/technologies/`,
`data/auras/`, `special/players/maur.xml`.

## Narrative

The Mauryas are the **elephant empire** — the only civilisation that
starts with an elephant (a Worker Elephant, a mobile dropsite and
builder), fields a whole **citizen elephant archer line** (200 HP
platforms shooting 15 pierce every second from 60 m), and caps it with
the biggest war elephant variant in the game. Around the elephants, the
army is a narrow bow-and-blade mix: bamboo spearmen, swordsmen and
longbow archers as citizens, a maceman champion at the barracks, a
scythed chariot at the stable, and — uniquely — the **Maiden Guard**, a
pair of ultra-fast champions (sword and bow, walk ~12 m/s) trained at the
palace with the heroes. There is **no champion cavalry at all**
(`unlock_champion_cavalry` is `notciv: maur`) and no slingers,
javelineer infantry or cavalry archers — ranged work belongs to archers,
elephants and chariots.

The economy and research tree are the civ's other signature. The team
bonus halves temple costs and temple-research costs for every ally, the
hero **Chanakya** (a healer with no attack) cuts **all** technology costs
−20% and research time −30% globally, and the farmstead offers a unique
food pair — "Wicker Baskets" (+50% fruit) and "Ahimsa" (×2 fruit, −80%
meat/fish) — both stackable, village-phase. The late-game pivot is the
**Ashoka package**: the chariot hero Ashoka gates the **Edict Pillars**
(the `Pillar` build limit is 0 until he is owned, then 5), and each
pillar speeds traders +20% within 75 m — so keeping Ashoka alive unlocks
a trade network that no other civ can match. His "Buddhism" aura also
repeats the temple discount for the Mauryas themselves, and Chandragupta
(the elephant hero) buffs every elephant map-wide (+15% attack rate,
+10% speed) and soldiers +1 armor around him.

The weaknesses follow from the design: no citizen cavalry beyond
javelineers and swordsmen, no fire/ram/siege warships (a scouting and
fishing navy only), no bolt shooters (the ram is the siege park), and a
food-heavy roster — elephants at 2 population and 175+ food each — that
must keep farming or hunting. In short: the Mauryas are a slow-moving
elephant-and-archer juggernaut with the cheapest temples and research in
the game, that converts a surviving Ashoka into a trade empire and a
Chanakya into a tech lead.

## Civ bonuses (things a generic civ does not have)

- **Team bonus — "Ashoka's Religious Support"**
  (`data/auras/teambonuses/maur_player_teambonus.json`, attached by
  `special/players/maur.xml`): **Temples −50% resource costs and build
  time, and temple technologies −50% resource costs and research time**
  for every ally (`MutualAlly`, maur included).
- **Starting Worker Elephant** (`civs/maur.json` StartEntities): the
  Mauryas are the only civilisation whose starting units include
  `units/maur/support_elephant` — a mobile resource dropsite and builder
  from turn one.
- **The Edict Pillar** (`structures/maur/pillar_ashoka`): the trade aura
  building, gated on the hero Ashoka — see Buildings.
- **The Maiden Guard** (`units/maur/champion_maiden*`): fast, cheap
  champions trained at the palace with no unlock tech — see Units.
- **The Ahimsa / Wicker Baskets pair** (`gather_ahimsa`,
  `gather_wicker_baskets_maur`): the village-phase food choice — see
  Technologies.
- `civs/maur.json` declares **no `CivBonuses`** — every Mauryan
  difference is template-, tech- or map-level.

## Starting entities

`civs/maur.json` — the standard pattern plus an elephant (1 CC, 4 women,
2 melee, 2 ranged, 1 cavalry, 1 support unit):

- 1 × `structures/maur/civil_centre`
- 4 × `units/maur/support_civilian` (women)
- 2 × `units/maur/infantry_spearman_b` (Bamboo Spearmen)
- 2 × `units/maur/infantry_archer_b` (Longbowmen — the ranged pair)
- 1 × `units/maur/cavalry_javelineer_b`
- 1 × `units/maur/support_elephant` (Worker Elephant)

## Buildings

- **Maur-only building — Palace / Harmya** (`structures/maur/palace`):
  200 stone + 200 metal, 200 s, **City phase**; 3000 HP, 30 × 30 m,
  **territory root** (38 m radius), and — uniquely among palaces — **no
  build limit** (it keeps the generic `Structure` category, so several
  can be planted). Trains the two Maiden Guard champions and the three
  heroes (Chanakya, Chandragupta, Ashoka) at ×0.7 batch time, and
  researches `unlock_spies` and `spy_counter`. Built only by Mauryan
  women and the three citizen infantry types (spearman, swordsman,
  archer).
- **Maur-only building — Edict Pillar of Ashoka / Śāsana Stambha Aśokā**
  (`structures/maur/pillar_ashoka`): 100 stone + 100 metal, 80 s, City
  phase; 1000 HP, 7 × 7 m, **uncapturable**, no territory influence, no
  decay, no trainer/researcher, 4 m vision. Its "Edict of Ashoka" aura
  gives traders within 75 m +20% walk speed. **Gated on the hero
  Ashoka**: the `Pillar` build limit is 0 by default and +5 while an
  `Ashoka`-class entity is owned. Built by Mauryan women and the three
  citizen infantry types, min 75 m from another pillar.
- **Maur-only building, vestigial — Rampart Tower / Udarka**
  (`structures/maur/tower_double`): a City-phase stone-tower variant
  (1200 HP, 100 wood + 200 stone, 2 default arrows, 16 visible turret
  points) that **no builder lists** — unreachable through the build UI
  (the buildable stone tower is the standard `structures/maur/defense_tower`).
- **The buildable Mauryan house** is the standard +5 house on an 11 × 11
  m footprint (see [`generic/buildings/house.md`](../generic/buildings/house.md)).
- **Stone walls** are the standard own-territory set with maur-specific
  sizes (short 13×5 (h 10.5), medium 25×5 (h 10.5), long 37×5 (h 10.5),
  tower 8×8 (h 20), gate 37×8 (h 22) — see
  [`generic/buildings/wallset_stone.md`](../generic/buildings/wallset_stone.md)).
- **Shared buildings maur lacks entirely**: crannog, military colony,
  encampment, kennel, great hall, ministry, academy, ice house, tachara,
  the Greek theater, and the civ-unique buildings of other civs.
  Everything else is the standard shared roster, with maur identity-only
  overrides (the civil centre 40 × 34 m, the fortress — which, like
  pers/ptol, trains **no heroes**).

## Units

### Maur-only units (trained by no other civ)

| Unit | Trained at | Phase | Notable stats |
|---|---|---|---|
| Worker Elephant (`support_elephant`) | civil centre + elephant stable | Village | 300 HP, 100 food, 1 pop; **mobile resource dropsite** + builder, no gathering |
| Elephant Archer (`elephant_archer_b`) | elephant stable | Town | 200 HP, bow 15 pierce @ 60 m (1 s repeat), 175 food + 75 wood, 2 pop, promotes at 150 XP |
| Maiden Guard (`champion_maiden`) | palace | City | 160 HP, 8/4/20, sword 16 hack, **walk 11.7 m/s**, 100 food + 90 metal, 15 s |
| Maiden Guard Archer (`champion_maiden_archer`) | palace | City | 90 HP, 1/4/20, bow 15.5 @ 45 m, **walk 12.3 m/s**, 100 wood + 90 metal, 15 s |
| Hero Ashoka (`hero_ashoka`) | palace | City | 1500 HP chariot archer (28 pierce @ 60 m), 360/250/300; global "Buddhism" (temples −50%); `Ashoka` class gates the pillars |
| Hero Chanakya (`hero_chanakya`) | palace | City | 1000 HP **healer** (15 HP/2 s, 20 m), no attack; global "Teacher" (all techs −20% cost, −30% time) + "Regeneration" (Humans within 35 m +0.8 HP/s) |
| Hero Chandragupta (`hero_chandragupta`) | palace | City | 1500 HP elephant hero, trunk 60 + 90, 600/400; "Empire Maker" (soldiers + elephants within 60 m +1 armor) + global "Elephant Corps" (elephants +15% attack rate, +10% speed) |

Heroes cost 0 population, require the City phase, and are subject to the
global limit of **1 hero alive at a time**.

### Training roster (what maur's buildings train)

- CC: women, spearman_b, archer_b, cavalry_javelineer_b, support_elephant.
- Barracks: spearman_b, swordsman_b, archer_b,
  **champion_infantry_maceman** (the Mauryan mace champion).
- Stable: cavalry_swordsman_b, cavalry_javelineer_b, **champion_chariot**
  (scythed chariot, `unlock_champion_chariots`).
- Elephant stable (Town): support_elephant, elephant_archer_b,
  **champion_elephant** (the big 1100 HP variant).
- Palace (City): the two Maidens + the 3 heroes.
- Fortress (City): nothing — maur adds no heroes to the generic (empty)
  fortress trainer.
- Temple: healers.
- Arsenal (City): **siege_ram only** — maur has no other siege templates.
- Dock: fishing, merchant, scout and arrow ships — **no fire, ram or
  siege ship** (no `ship_fire`/`ship_ram`/`ship_siege` templates exist
  for maur).
- Market: support_trader.
- House: support_civilian_house (after `unlock_civilians_house_generic`).

### Shared unit classes maur does NOT have

- **No slingers, no infantry javelineers**, no pikemen/macemen (citizen)/
  axemen/clubmen; no cavalry archers or citizen cavalry spearmen; **no
  champion cavalry of any kind** (`unlock_champion_cavalry` is `notciv:
  maur`, and no champion cavalry templates exist).
- Navy: no fire, ram or siege warship; `warship_fireship_attack`,
  `warship_ramming_attack` and `warship_siege_attack` are not
  researchable (`notciv: maur`).
- Siege: **no bolt shooters, catapults or siege towers** — the battering
  ram is the entire siege park (and `siege_bolt_accuracy` and
  `siege_pack_unpack` are `notciv: maur`).
- **Vestigial unit templates, not trainable by anything**: the three
  infantry hero twins `hero_ashoka_infantry`, `hero_chandragupta_infantry`
  and `hero_bindusara_infantry` (foot versions of the heroes — no trainer
  references them and no upgrade path links them), the 25 HP dagger woman
  `support_female_citizen`, and the `catafalque` (every civ has one).

## Technologies

- **Maur-only techs**: `gather_ahimsa` (Units ×2 fruit, ×0.2 meat/fish),
  `gather_wicker_baskets_maur` (Workers +50% fruit — the replacement for
  the generic `gather_wicker_baskets`, which is `notciv: maur`), and
  `pair_gather_food_maur` (the UI pair presenting them) — all at the
  farmstead, Village phase. See the per-tech files in
  [`technologies/`](technologies/).
- **Phase techs**: maur researches the generic ones (`phase_town_generic`,
  `phase_city_generic`) — no maur-specific phase techs.
- **Generic techs maur CANNOT research** (civ requirements exclude it —
  everything else in [`generic/technologies/`](../generic/technologies/) is
  available): `gather_wicker_baskets`, `soldier_attack_melee_03`
  (replaced by the variant), `siege_bolt_accuracy`, `siege_pack_unpack`,
  `unlock_champion_cavalry`, `warship_fireship_attack`,
  `warship_ramming_attack`, `warship_siege_attack` (all `notciv: maur`),
  `ship_health`, `ship_movement_speed`, `warship_health`, plus every
  other civ's civ-gated techs (`exploration`, `hellenistic_metropolis`,
  `hoplite_tradition`, `roman_reforms`, etc.).
- **Restricted techs maur DOES get**: `archery_tradition` (kush + maur +
  pers, archers +10 range), `archer_attack_spread`,
  `soldier_attack_melee_03_variant` (iber + maur — soldiers +20% melee
  damage, swordsmen an extra +20%), `unlock_champion_chariots` (brit +
  maur + pers + sele), `warship_arrow_attack`, `barracks_batch_training`,
  `stable_batch_training`, `tower_health`, `ship_capture_resistance`, and
  the standard unlock techs (`unlock_champion_infantry`,
  `unlock_shared_dropsites`, `unlock_shared_los`, `unlock_spies`,
  `unlock_civilians_house_generic`, `unlock_females_house`). Maur also
  gets the full standard soldier/armor/economic tech lines.

## Auras (summary)

| Aura | Carrier | Effect |
|---|---|---|
| `teambonuses/maur_player_teambonus` | the player (teambonus) | Temples −50% costs/build time, temple techs −50% cost/time, all allies |
| `structures/maur_pillar` | Edict Pillar | own traders within 75 m: +20% walk speed |
| `units/heroes/maur_hero_ashoka` | Ashoka | global: own temples −50% costs/build time, temple techs −50% (same as the teambonus, own-only) |
| `units/heroes/maur_hero_chanakya_1` | Chanakya | global: all technologies −20% resource cost, −30% research time |
| `units/heroes/maur_hero_chanakya_2` | Chanakya | own Humans within 35 m: +0.8 HP/s regeneration (applies in combat) |
| `units/heroes/maur_hero_chandragupta_1` | Chandragupta | own soldiers + elephants within 60 m: +1 hack, pierce and crush armor |
| `units/heroes/maur_hero_chandragupta_2` | Chandragupta | global: own elephants ×0.85 attack repeat time, +10% walk speed |

## Stat deltas on otherwise shared content

- Champion elephant: the **big** war elephant — 1100 HP, trunk 33 hack +
  49.5 crush, 330 food + 220 metal, 39.6 s (generic 1000 HP / 30 + 45 /
  300 + 200 / 36 s).
- Champion chariot: 300 HP, armor 1/5/20, bow 15 pierce @ 60 m, walk 17
  m/s, 180/100/120, 30 s.
- Champion infantry maceman (Maurian mace champion): 200 HP, armor 5/6/20,
  mace 10 hack + 14 crush, walk 9.5 m/s.
- Civil centre: footprint Square 40 × 34 m; its trainer adds the
  support_elephant.
- House: footprint Square 11 × 11 m.
- Stone walls: maur-specific segment sizes (see Buildings).
- All other maur variants of shared units (spearmen, swordsmen, archers,
  cavalry, healers, women, traders, ships, the ram) are identity-only
  overrides of the generic templates — no further stat differences.

## Non-gameplay

- Culture `maur` (Indian music set, emblem), 9 AI names, the skirmish
  replacements (the default ranged infantry becomes the Longbowman, the
  special starting unit the Worker Elephant, the house the maur house)
  and the maur-specific unit names (Bamboo Spearman, Longbowman, Maiden
  Guard, Worker Elephant) are cosmetic only. The player template adds no
  extra formations.
