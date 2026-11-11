# Rome vs a generic civilisation

Synthesis of **everything that differs between the roman civilisation and a
generic (non-civ-specific) civilisation** in 0 A.D. 0.28.0. The baseline
"generic civ" is defined as: the shared entity pool documented in
[`generic/`](../generic/) (units, buildings, technologies, auras with no
civ-specific content), the standard tech tree (`phase_town_generic` /
`phase_city_generic`, all techs with no civ requirement), the standard
`StartEntities` pattern, and no civ or team bonuses. Per-entity details are
in this folder's [`auras/`](auras/), [`buildings/`](buildings/),
[`technologies/`](technologies/) and [`units/`](units/) directories
(rome-only entities) and in [`generic/`](../generic/)
(shared entities with per-civ variants); this file is the complete delta.

Data sources: `civs/rome.json`, `templates/structures/rome/`,
`templates/units/rome/`, `data/technologies/`,
`data/auras/`, `special/players/rome.xml`.

## Narrative

Rome is the **professional late-game power**: it starts as a standard
swordsman civilisation and transforms, in the City phase, into the
Marian army. The centrepiece is the **Marian Reforms** (`roman_reforms`,
researched at the fortress for 1000 food + 800 metal): the reform zeroes
every soldier's promotion requirement, so the existing army converts on the
spot and the same training buttons produce the new units — Hastati become
**Legionaries** (Elite-rank, no further promotion), spearmen become levy
auxiliaries, cavalry become **Auxiliaries**, javelineers become
**Antesignani**, and the champion swordsman becomes the First Cohort. The
same tech unlocks **onagers** and the **Centurion** champion. Rome is
therefore weakest in the Town phase, before the reform has been paid for,
and strongest in the late game, when every citizen unit has been
professionalised.

The infantry line is swordsman-centric — the civic centre trains Hastati
from the start, and the team bonus ("Conscription") cuts citizen-infantry
training time by 10% for every ally — but the line is narrow: **no archers
and no slingers**, with javelineers as the only ranged support. What Rome
lacks in variety it makes up for in formation and leadership: the
**Testudo** (a shield-shell for 16+ melee infantry, unique to Rome), and
the **Centurion** champion, which carries two auras (nearby soldiers +10%
attack damage, −25% promotion XP; Legionaries and Centurions +10% speed)
and can be trained at the fortress after the reforms or **upgraded from any
elite-rank spearman or swordsman**.

Rome is also the **siege civilisation**. It fields four engines — ballista,
scorpio, onager and ram — builds cheap wooden **siege walls** in the City
phase, packs and unpacks its bolt shooters, and its onagers fire faster and
move quicker ("Legionary Engineers", automatic). The navy follows the same
profile: ramming and siege warships backed by the ramming/siege and warship
health techs, with **no fire ship**. The Army Camp reinforces the aggressive
picture: a Town-phase forward base buildable in **neutral or enemy
territory** that produces elite infantry, onagers and rams behind enemy
lines.

Defensively, Rome forgoes palisades for stone and siege walls, and the
**Temple of Vesta** hardens its territory: +3 HP/s garrison healing and the
Eternal Fire aura, +50% capture points on structures within 75 m. Mobility
comes from **Roman Roads** (+5% speed for all land units, Town phase), and
the three cavalry heroes add force multipliers: Marcellus (cavalry +15%
attack nearby), Maximus (+1 armor for all humans and structures, global)
and Scipio (+2 capture strength and +20% attack for nearby soldiers and
siege engines).

In short: Rome trades early-game flexibility for the best siege, a strong
navy and a fully professional army — if it survives to the Marian Reforms.

## Civ bonuses (things a generic civ does not have)

- **Team bonus — "Conscription"** (`data/auras/teambonuses/rome_player_teambonus.json`,
  attached by `special/players/rome.xml`): Citizen Infantry **−10% training
  time** for every ally (`MutualAlly`, rome included).
- **"Fertility"** (`civs/rome.json`): women are trainable from houses with
  the standard `unlock_civilians_house_generic` tech only — rome does not
  have the legacy `unlock_females_house` ("Fertility Festival") tech at all
  (it is `notciv: rome`). Net gameplay effect is nil in 0.28 (both are
  village-phase researches); the difference is that rome has no such tech.
- **"Testudo Formation"** (`special/players/rome.xml` adds
  `special/formations/testudo` to the player's formations): a compact
  shield-shell formation for **16+ melee infantry** (Basic to Hero ranks) —
  no other civ can form a testudo.
- **"Centurions"**: elite-rank spearmen or swordsmen can be **upgraded into
  Champion Centurions** (an `<Upgrade>` on the elite templates, 8 s) —
  another way to obtain centurions besides training them at the fortress
  after the Marian Reforms (see below).
- **"Legionary Engineers"** (auto-researched tech
  `data/technologies/civbonuses/rome_siege.json`, requirement `rome`):
  stone throwers (the onager) get **−10% attack repeat time and +20%
  movement speed**.

## Starting entities

`civs/rome.json` — the standard pattern (1 CC, 4 women, 2 melee, 2 ranged,
1 cavalry), with rome's picks:

- 1 × `structures/rome/civil_centre`
- 4 × `units/rome/support_civilian` (women)
- 2 × `units/rome/infantry_swordsman_b` (Hastati — the melee pair)
- 2 × `units/rome/infantry_javelineer_b` (the ranged pair)
- 1 × `units/rome/cavalry_spearman_b`

## Buildings

- **Rome-only building — Army Camp** (`structures/rome/army_camp`): 400
  wood + 150 stone, 250 s, **Town phase**; 1750 HP, 15/35 armor, bow attack
  (8 pierce, range 60 m), 20 garrison slots. **Buildable in neutral and
  enemy territory** (min 80 m from another camp) — a forward military base.
  Trains elite units and siege: swordsman_a, spearman_a, antesignanus,
  onager, siege ram.
- **Rome-only building — Temple of Vesta** (`structures/rome/temple_vesta`):
  300 stone, 200 s, Town phase; 2000 HP, 20 garrison slots healing +3 HP/s,
  trains healers; carries the "Eternal Fire" aura (+50% capture points on
  structures within 75 m). An alternative temple alongside the standard one.
- **Rome-only building — Siege Walls** (`structures/rome/wallset_siege`):
  **City phase**, wood-based and cheap (long 60 wood / 30 s vs stone walls'
  36 stone / 36 s; tower 80 wood / 40 s with only 75% of a stone tower's HP
  and no garrison). Rome is the only civ with a second wall set.
- **No palisades**: rome's wall sets are stone walls + siege walls only
  (`civs/rome.json` `WallSets`); a generic civ builds palisade + stone.
- **Fortress trains heroes and the Centurion** (`structures/rome/fortress`
  overrides the trainer — the generic fortress trains nothing): the 3 heroes
  plus `champion_infantry_swordsman_centurion` (centurions require the
  Marian Reforms).
- **Vestigial roman templates, not buildable by anything**: temple of Mars
  (`structures/rome/temple_mars`), archery range (`structures/rome/range`),
  artillery/bolt towers (`tower_artillery`, `tower_bolt`), the gladiator
  champions (`champion_infantry_sword_gladiator`,
  `champion_infantry_spear_gladiator`) and the decorative amphitheater,
  arch and tent.
- **Shared buildings rome lacks entirely** (no roman template, no builder):
  elephant stable (cart/kush/maur/pers/ptol/sele), military colony
  (ptol/sele), theater (the five Greek civs).

## Units

### Rome-only units (trained by no other civ)

| Unit | Trained at | Phase | Notable stats |
|---|---|---|---|
| Champion Centurion (`champion_infantry_swordsman_centurion`) | fortress (+ upgrade from elite spearmen/swordsmen) | City (after Marian Reforms) | 200 HP, 6/6 armor, sword 16 hack, 120 food + 60 wood + 100 metal, 25 s, 1 pop; two auras (see below) |
| Elite swordsman (`infantry_swordsman_a`) | army camp / barracks promotion | — | 156.25 HP, 50 food + 40 wood + 10 metal, 1 pop |
| Veteran spearman (`infantry_spearman_a`) | army camp / barracks promotion | — | 156.25 HP, 50 food + 50 wood, 1 pop |
| Levy Auxiliary Spearman (`infantry_spearman_conscript`) | CC | City (after Marian Reforms) | 100 HP, 50 food + 50 wood, 1 pop — the reformed spearman |
| Antesignanus (`infantry_antesignanus`) | army camp (+ javelineer promotion) | City (after Marian Reforms) | 50 HP, 50 food + 50 wood + 15 metal, 1 pop — the reformed skirmisher |
| Scorpio (`siege_scorpio_packed`) | arsenal | City | bolt shooter (packs/unpacks via `siege_pack_unpack`) |
| Onager (`siege_onager_packed`) | arsenal / army camp | City (after Marian Reforms) | stone thrower |
| Hero Marcellus (`hero_marcellus`) | fortress | City | 1200 HP cavalry swordsman; aura: cavalry within 60 m +15% attack damage |
| Hero Maximus (`hero_maximus`) | fortress | City | 1200 HP cavalry swordsman; aura: all humans + structures +1 hack/pierce/crush armor (global) |
| Hero Scipio (`hero_scipio`) | fortress | City | 1200 HP cavalry swordsman; aura: soldiers + siege within 30 m +2 capture strength, +20% attack damage |

All three heroes are cavalry heroes (300 food + 150 wood + 300 metal, 50 s,
0 population), subject to the global limit of 1 hero alive. Each hero also
has an unused dismounted infantry template (no building trains them);
Marcellus's carries a different aura (enemy infantry −10% attack damage).

### The Marian Reforms conversion (`roman_reforms`)

Researched at the fortress in the **City phase** (1000 food + 800 metal,
60 s). It sets `Promotion/RequiredXp` to 0 for all soldiers, which converts
both existing units and the training buttons (trainer tokens resolve along
the now-free promotion chains):

- swordsman (Hastātus) → **Marian Legionary** (`infantry_legionary`, Elite
  rank, +5 metal / +10 wood cost, no further promotion)
- spearman → **Levy Auxiliary Spearman** (conscript)
- cavalry → **Auxiliary cavalry** (`cavalry_*_auxiliary_*`)
- javelineer → **Antesignanus** (Legionary Skirmisher)
- champion swordsman → **First Cohort** (`champion_infantry_swordsman_first`)
- also unlocks **onagers** and **centurions** (fortress)

The champion swordsman additionally promotes through the Marian stages
(150 XP each): Marian Legionary → Centurio → **Praetorianus**
(`champion_infantry_swordsman_02…05`).

### Training roster (what rome's buildings train)

- CC: swordsman (→ legionary post-reform), javelineer (→ antesignanus),
  cavalry spearman (→ auxiliary), + conscript spearman (post-reform).
- Barracks: swordsman, spearman (Town), javelineer + champion swordsman
  (after `unlock_champion_infantry`, City).
- Stable: cavalry javelineer, cavalry spearman, champion cavalry (after
  `unlock_champion_cavalry`, City; 260 HP — +20 over the generic 240).
- Temple (and Temple of Vesta): healers (the roman "doctor", standard
  stats, no aura — unlike gaul's druids).
- Arsenal: ballista (shared with cart), scorpio, onager, siege ram.
- Army camp (Town): elite swordsman, veteran spearman, antesignanus,
  onager, siege ram.
- Fortress (City): 3 heroes + centurion (post-reform).
- Dock: fishing, merchant, scout, arrow, **ram** and **siege** warships —
  no fire ship.
- House: women (after `unlock_civilians_house_generic`).

### Shared unit classes rome does NOT have

- **No archers** (the archery range template is vestigial;
  `archer_attack_spread` is not researchable).
- **No slingers** (`infantry_slinger_b` does not exist for rome).
- No pikemen, macemen, axemen or clubmen (nor their champion variants).
- Cavalry: no cavalry archer, no cavalry swordsman.
- No chariots, no war elephants.
- Navy: no fire ship (`ship_fire` absent);
  `warship_fireship_attack` is not researchable.

## Technologies

- **Rome-only techs**: `civbonuses/rome_siege` (auto, see above),
  **"Marian Reforms"** (`roman_reforms`, fortress, City — see above) and
  **"Roman Roads"** (`roman_roads`, civil centre, Town, 500 stone): all
  land units **+5% movement speed**.
- **Phase techs**: rome researches the generic ones (`phase_town_generic`,
  `phase_city_generic`) — no rome-specific phase techs.
- **Unlock techs**: rome can research `unlock_champion_infantry`,
  `unlock_champion_cavalry`, `unlock_civilians_house_generic` (all
  standard); it lacks `unlock_females_house` entirely (the Fertility
  bonus).
- **Generic techs rome CANNOT research** (civ requirements exclude it —
  everything else in [`generic/technologies/`](../generic/technologies/) is
  available): `archer_attack_spread`, `archery_tradition`, `exploration`,
  `hellenistic_metropolis`, `hoplite_tradition`, `nisean_horses`,
  `ship_capture_resistance`, `ship_health`, `ship_movement_speed`,
  `unlock_champion_chariots`, `unlock_females_house`, `warship_arrow_attack`,
  `warship_fireship_attack`.
- **Restricted techs rome DOES get** (civ-gated inclusions): `siege_bolt_accuracy`,
  `siege_pack_unpack` (the pack/unpack mechanic for its bolt shooters),
  `warship_ramming_attack`, `warship_siege_attack` (its ramming and siege
  warships), `warship_health`.

## Auras (summary)

| Aura | Carrier | Effect |
|---|---|---|
| `teambonuses/rome_player_teambonus` | the player (teambonus) | Citizen Infantry −10% training time, all allies |
| `structures/eternal_fire` | Temple of Vesta | structures within 75 m +50% capture points |
| `units/centurion_1` | Champion Centurion | soldiers within 30 m +10% attack damage, −25% promotion XP |
| `units/centurion_2` | Champion Centurion | Legionaries + Centurions within 30 m +10% movement speed |
| `units/heroes/rome_hero_marcellus_1` | Marcellus (mounted) | cavalry within 60 m +15% attack damage |
| `units/heroes/rome_hero_marcellus_2` | Marcellus (dismounted, unused) | enemy infantry within 30 m −10% attack damage |
| `units/heroes/rome_hero_maximus` | Maximus | humans + structures +1 hack/pierce/crush armor (global) |
| `units/heroes/rome_hero_scipio` | Scipio | soldiers + siege within 30 m +2 capture strength, +20% attack damage |

## Stat deltas on otherwise shared content

- Citizen Infantry: −10% training time (team bonus).
- Stone throwers: −10% attack repeat time, +20% movement speed (Legionary
  Engineers, auto).
- All land units: +5% movement speed after researching Roman Roads.
- Champion cavalry: 260 HP (generic: 240).
- Roman variants of shared units are otherwise identity-only overrides of
  the generic templates; unlike gaul there are **no global structure stat
  modifiers** (no wooden-construction penalty or similar).

## Non-gameplay

- Culture `rome` (Roman music set, emblem), 13 AI names, the skirmish
  replacements (house, cavalry, melee infantry), and the `catafalque`
  template are cosmetic only.
