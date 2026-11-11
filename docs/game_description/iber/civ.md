# Iberians vs a generic civilisation

Synthesis of **everything that differs between the iberian civilisation and a
generic (non-civ-specific) civilisation** in 0 A.D. 0.28.0. The baseline
"generic civ" is defined as: the shared entity pool documented in
[`generic/`](../generic/) (units, buildings, technologies, auras with no
civ-specific content), the standard tech tree (`phase_town_generic` /
`phase_city_generic`, all techs with no civ requirement), the standard
`StartEntities` pattern, and no civ or team bonuses. Per-entity details are
in this folder's [`auras/`](auras/), [`buildings/`](buildings/),
[`technologies/`](technologies/) and [`units/`](units/) directories
(iber-only entities) and in [`generic/`](../generic/)
(shared entities with per-civ variants); this file is the complete delta.

Data sources: `civs/iber.json`, `templates/structures/iber/`,
`templates/units/iber/`, `data/technologies/`,
`data/auras/`, `special/players/iber.xml`.

## Narrative

The Iberians are the **guerrilla-and-monument civilisation**: a fast,
raiding army that fights around cheap damage-buffing monoliths. The
citizen roster is the broadest melee-and-javelin mix in the game — sword,
spear and sling infantry plus javelineer and spearman cavalry, all fast
(16.2 m/s cavalry, quick infantry) — with **no archers at all**, no
chariots, no elephants, and exactly one siege engine, the battering ram.
Its champion line follows the same shape: a champion swordsman
(Leial Ezpatari) and a champion cavalry *javelineer* rather than a lancer.
The team bonus ("Saripeko") makes every ally's citizen javelineers 10%
cheaper, and Indibil's global aura shaves another 15% off every soldier,
so the Iberian army is cheap to mass and fast to field.

The defining structure is the **Revered Monument**: a 100 stone + 100
metal stone, five per player, that grants every soldier within 50 m +20%
melee and ranged damage — and cannot be captured, so enemies must raze it.
Iberian play revolves around planting monuments at the front and fighting
under their auras, which is why the civ starts with walls around its base
on skirmish maps and gets **massive stone towers** (2400 HP, 8 garrison,
+1 arrow) to anchor a defensive front. The heroes double down on the
theme: Caros buffs armor (or, garrisoned, a building's arrow count by
75%), Indibil cuts all soldier costs globally, and Viriato adds +20% move
speed and **double loot** to the army around him — a raiding force under
Viriato and a monument hits fast, hits +20% harder, and pays for itself
in plunder.

The holes follow from the design. No archers (and no
`archer_attack_spread`), no cavalry archers, no chariots or elephants,
the entire siege park is one ram (no bolt shooters — the accuracy and
pack/unpack techs are unavailable), and the navy is a raiding navy:
fishing, merchant, scout, arrow and **fire** ships — no ram or siege
warships (both attack techs are unavailable). The economy is otherwise
standard — no trickles, no farming or mining bonuses, no cheap buildings.
In short: the Iberians are a fast, cheap, raiding-and-defending civ that
converts stone and metal into monuments, buffs its army with auras, and
relies on fire ships, javelineers and speed instead of archers, chariots
or siege power.

## Civ bonuses (things a generic civ does not have)

- **Team bonus — "Saripeko"**
  (`data/auras/teambonuses/iber_player_teambonus.json`, attached by
  `special/players/iber.xml`): **Citizen Javelineers −10% resource costs**
  for every ally (`MutualAlly`, iber included) — infantry and cavalry
  javelineers alike.
- **"Massive Towers"** (`structures/iber/defense_tower`, "Dorre"): the
  Iberian stone tower vs the generic one (1000 HP, 100 wood + 100 stone,
  150 s, 5 garrison, 10×10 m): **50 wood (−50%), 250 stone (+150%), 200 s
  (+33%), 2400 HP, 8 garrison (+3), +1 default arrow**, Circle r 8 m
  footprint, 12 m minimum range. (The `civs/iber.json` description says
  "+60% health"; the template's 2400 HP is what the engine actually
  uses.)
- **"Starting Walls"** (map-level, via `SkirmishReplacements` in
  `civs/iber.json`): on skirmish maps the Iberian player starts with
  **stone walls around the base** (the map's `iber_wall_*` templates are
  the Iberian stone wall segments). No mechanical effect beyond the
  placed segments.
- **The Revered Monument** (`structures/iber/monument`): the aura
  building — see Buildings.
- **No civ-specific technologies** — every Iberian difference is
  template-level or map-level (see
  [`technologies/README.md`](technologies/README.md)).

## Starting entities

`civs/iber.json` — the standard pattern (1 CC, 4 women, 2 melee, 2 ranged,
1 cavalry), with iber's picks:

- 1 × `structures/iber/civil_centre`
- 4 × `units/iber/support_civilian` (women)
- 2 × `units/iber/infantry_swordsman_b` (Ezpatari — the melee pair)
- 2 × `units/iber/infantry_javelineer_b` (the ranged pair)
- 1 × `units/iber/cavalry_javelineer_b` (Kantabriako Zaldun)

## Buildings

- **Iber-only building — Revered Monument / Gur Oroigarri**
  (`structures/iber/monument`): 100 stone + 100 metal, 120 s, **Town
  phase**; 1200 HP, 8 × 8 m, max **5 per player** (`Monument` limit),
  min 150 m from another monument. **No territory influence**, no
  trainer/researcher/queue, 4 m vision, no territory decay, and
  **uncapturable** (`Capturable` disabled). Its "Religious Fervor" aura
  gives own soldiers within 50 m +20% melee and ranged damage. Built by
  the Iberian women and all four citizen infantry types (each template
  adds it to its builder list; cavalry and champions do not).
- **Massive stone towers** — `structures/iber/defense_tower` (see Civ
  bonuses); the buildable stone tower, Town phase as usual.
- **Stone walls** are the standard own-territory set with iber-specific
  sizes (short 13×8 (h 10), medium 25×8 (h 10), long 37×8 (h 10), tower
  **Circle r 6** (h 13), gate 37×8 (h 12.7) — see
  [`generic/buildings/wallset_stone.md`](../generic/buildings/wallset_stone.md)).
- **The archery range is buildable but useless**: the generic range has
  no `Researcher` (nothing to research) and Iberia has no archer
  templates to train — the range contributes nothing to an Iberian game.
- **Shared buildings iber lacks entirely**: elephant stable (no template
  exists for iber — no elephants), crannog, military colony, encampment,
  kennel, great hall, ministry, academy, ice house, tachara, the Greek
  theater, and the civ-unique buildings of other civs. Everything else is
  the standard shared roster with iber identity-only overrides (civil
  centre, house, fortress — the fortress trains the **three Iberian
  heroes**, unlike pers and ptol whose fortresses train none).

## Units

### Iber-only units (trained by no other civ)

| Unit | Trained at | Phase | Notable stats |
|---|---|---|---|
| Hero Caros (`hero_caros`) | fortress | City | 1000 HP swordsman (26 hack, 0.75 s repeat), 200/150/200; "Battle Fervor" (soldiers within 50 m +1 all armor) + "Valiant Defender" (garrisoned: building arrow count ×1.75) |
| Hero Indibil (`hero_indibil`) | fortress | City | 1200 HP cavalry spearman (16 + 12, 1.75× vs Cavalry), 300/200/250; global "Mobilization" (soldiers −15% costs, −20% train time) |
| Hero Viriato (`hero_viriato`) | fortress | City | 1000 HP swordsman (26 hack), 200/150/200; "Guerrilla Tactics" (soldiers within 60 m +20% speed) + "Swag" (soldiers + siege within 60 m ×2 loot) |
| Indibil, unmounted (`hero_indibil_infantry`) | nothing (vestigial) | City | 1000 HP spearman (15 + 12, 2.5× vs Cavalry); same global aura — no trainer, no upgrade path |

Heroes cost 0 population, require the City phase, and are subject to the
global limit of **1 hero alive at a time**.

### Training roster (what iber's buildings train)

- CC: women, swordsman_b, javelineer_b, cavalry_javelineer_b.
- Barracks: spearman_b, swordsman_b, javelineer_b, slinger_b,
  **champion_infantry_swordsman** (Leial Ezpatari).
- Stable: cavalry_spearman_b, cavalry_javelineer_b, **champion_cavalry**
  — which for iber is a **javelin** champion (Leial Zalduneria: 25 pierce
  @ 30 m, walk 16.2 m/s), not a lancer.
- Fortress (City): the 3 heroes.
- Temple: healers.
- Arsenal (City): **siege_ram only** — iber has no other siege templates.
- Dock: fishing, merchant, scout, arrow and **fire** ships — **no ram and
  no siege ship** (no `ship_ram`/`ship_siege` templates exist for iber).
- Market: support_trader (Merkatari).
- House: support_civilian_house (after `unlock_civilians_house_generic`).
- Range: nothing (no archers, no researcher).

### Shared unit classes iber does NOT have

- **No archers** (infantry or cavalry), no pikemen/macemen/axemen/clubmen,
  no cavalry swordsmen; no chariots; no elephants (and no elephant
  stable); no camel units.
- Navy: no ram and no siege warship; neither `warship_ramming_attack`
  nor `warship_siege_attack` is researchable (`notciv: iber`). The fire
  ship is present and `warship_fireship_attack` is researchable.
- Siege: **no bolt shooters, catapults or siege towers** — the battering
  ram is the entire siege park (and `siege_bolt_accuracy` and
  `siege_pack_unpack` are `notciv: iber`).
- **Vestigial unit templates, not trainable by anything**:
  `hero_indibil_infantry` (the unmounted Indibil twin),
  `support_female_citizen` (a 25 HP dagger woman), and the `catafalque`
  (every civ has one).

## Technologies

- **No iber-only techs** — there is no `civbonuses/iber_*` auto-tech and
  no tech with an exclusive `civ: iber` gate. The civ bonuses are
  template- and map-level (Massive Towers, Starting Walls, the monument).
- **Phase techs**: iber researches the generic ones (`phase_town_generic`,
  `phase_city_generic`) — no iber-specific phase techs.
- **Generic techs iber CANNOT research** (civ requirements exclude it —
  everything else in [`generic/technologies/`](../generic/technologies/) is
  available): `archer_attack_spread`, `soldier_attack_melee_03`,
  `siege_bolt_accuracy`, `siege_pack_unpack`, `warship_ramming_attack`,
  `warship_siege_attack` (all `notciv: iber` — the archery, siege and
  ram/siege-warship lines Iberia lacks), `ship_movement_speed`,
  `warship_health`, `archery_tradition`, plus every other civ's civ-gated
  techs (`exploration`, `hellenistic_metropolis`, `hoplite_tradition`,
  `roman_reforms`, etc.).
- **Restricted techs iber DOES get**: `ship_health` (brit + gaul + iber),
  `soldier_attack_melee_03_variant` (iber + maur — soldiers +20% melee
  damage, swordsmen an extra +20%: the replacement for the excluded
  `soldier_attack_melee_03`), `warship_arrow_attack`,
  `warship_fireship_attack`, `barracks_batch_training`,
  `stable_batch_training`, `tower_health`, `ship_capture_resistance`,
  and the standard unlock techs (`unlock_champion_infantry`,
  `unlock_champion_cavalry`, `unlock_shared_dropsites`, `unlock_shared_los`,
  `unlock_spies`, `unlock_civilians_house_generic`, `unlock_females_house`).
  Iberia also gets the full standard soldier/armor/economic tech lines
  (gathering, farming, blacksmith, pop-cap techs).

## Auras (summary)

| Aura | Carrier | Effect |
|---|---|---|
| `teambonuses/iber_player_teambonus` | the player (teambonus) | Citizen Javelineers −10% resource costs, all allies |
| `structures/iber_monument` | Revered Monument | own soldiers within 50 m: +20% melee and ranged damage |
| `units/heroes/iber_hero_caros_1` | Caros (garrisoned) | the garrisoning Structure/SiegeTower: arrow count ×1.75 |
| `units/heroes/iber_hero_caros_2` | Caros | own soldiers within 50 m: +1 hack, pierce and crush armor |
| `units/heroes/iber_hero_indibil` | Indibil | global: own soldiers −15% resource costs, −20% train time |
| `units/heroes/iber_hero_viriato_1` | Viriato | own soldiers within 60 m: +20% walk speed |
| `units/heroes/iber_hero_viriato_2` | Viriato | own soldiers + siege within 60 m: ×2 resource loot |

## Stat deltas on otherwise shared content

- Stone tower: 50 wood + 250 stone, 200 s, 2400 HP, 8 garrison, +1
  default arrow, Circle r 8 m footprint, 12 m minimum range (Massive
  Towers).
- Champion cavalry: a **javelin** champion — 25 pierce @ 30 m, walk 16.2
  m/s, armor 3/3/20 (the generic champion cavalry is a spearman), and
  its javelins are **flaming**: each hit applies a stacking Burning
  status (+2 fire damage every 3 s for 9 s).
- Stone walls: iber-specific segment sizes, tower a circle (see
  Buildings).
- All other iber variants of shared units (swordsmen, spearmen,
  javelineers, slingers, healers, women, traders, ships, the ram) are
  identity-only overrides of the generic templates — no further stat
  differences.

## Non-gameplay

- Culture `iber` (Iberian music set, emblem), 9 AI names, the skirmish
  replacements (the default melee infantry becomes the Ezpatari swordsman,
  the house the iber house, and the `iber_wall_*` wall templates the iber
  stone walls — the "Starting Walls" bonus) and the iber-specific unit
  names (Ezpatari, Lusitano Ezpatari, Ezkutari, Habailari, Kantabriako
  Zaldun, Lantzari, Leial Ezpatari, Leial Zalduneria, Merkatari, Iltiŕse)
  are cosmetic only. The player template adds no extra formations.
