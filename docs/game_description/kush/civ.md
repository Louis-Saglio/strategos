# Kush vs a generic civilisation

Synthesis of **everything that differs between the kushite civilisation and a
generic (non-civ-specific) civilisation** in 0 A.D. 0.28.0. The baseline
"generic civ" is defined as: the shared entity pool documented in
[`generic/`](../generic/) (units, buildings, technologies, auras with no
civ-specific content), the standard tech tree (`phase_town_generic` /
`phase_city_generic`, all techs with no civ requirement), the standard
`StartEntities` pattern, and no civ or team bonuses. Per-entity details are
in this folder's [`auras/`](auras/), [`buildings/`](buildings/),
[`technologies/`](technologies/) and [`units/`](units/) directories
(kush-only entities) and in [`generic/`](../generic/)
(shared entities with per-civ variants); this file is the complete delta.

Data sources: `civs/kush.json`, `templates/structures/kush/`,
`templates/units/kush/`, `data/technologies/`,
`data/auras/`, `special/players/kush.xml`.

## Narrative

Kush is a **temple-and-monument civilisation with a strong champion core and
a metal-hungry mercenary option**. Its citizen army is deliberately
conventional — spearmen, archers and a light javelin cavalry from the civil
centre on minute one, then swordsmen, pikemen and heavy spear cavalry in the
Town phase — and the civ's identity comes from what is bolted on top. The
two **Pyramids** are passive aura buildings: the Small Pyramid (Village
phase) gives workers within 50 m +15% gather speed, and the Large Pyramid
(City phase, max 2) gives *all your soldiers within 100 m* +10% attack
damage and +1 hack/pierce/crush armor. Stone and metal are spent on these
instead of on military production buildings, so Kush converts its premium
resources into multipliers rather than into more units.

The **temples** are the champion factories. The ordinary Temple (Town
phase, 300 stone) trains healers and, from the City phase, the Meroitic
Temple Guard (axeman); the one-per-player **Grand Temple of Amun** (City
phase, 600 stone) trains the Napatan Temple Guard (swordsman) and *elite*
priests that need no XP, garrisons 40 units with +3 HP/s healing and gives
Humans within 70 m +1 HP/s regeneration. The price is that **all heroes lose
5% health** while the Grand Temple stands. Behind them sit the barracks'
Noble Archer (a champion archer — the only barracks champion kush has), the
stable's Noble Cavalry and the elephant stable's War Elephant, all City
phase. Elephants are cheaper for the whole team (the team bonus gives every
ally −20% elephant cost and training time). The three heroes are an elephant
(Arakamani, who discounts the Apedemak temple and its guards and silences
enemy healers), a chariot archer (Amanirenas, whose aura boosts champions)
and a fast spearman (Nastasen, whose aura buffs soldiers and elephants).

The second pillar is **mercenaries**. Two cheap-to-build camps (100 wood +
100 metal, Town phase, buildable in own *or neutral* territory) train
mercenaries paid for in metal only (60 metal for infantry, 20 food + 90 metal
for the camel cavalry), at a 30% faster build time and automatically at
Advanced rank. They cannot gather, so they are a way to turn a metal surplus
into an immediate army, not an economy. Kush has **no slingers and no
citizen javelineers**, so its ranged power comes from 60 m archers (boosted by
`archery_tradition`, +10 range, which only kush, maur and pers can research),
the Noble Archer champion and Amanirenas's champion aura.

The weaknesses are the stone/metal appetite and the siege/navy gaps. Almost
every kush speciality (Grand Temple 600 stone, Large Pyramid 450 stone + 150
metal, Small Pyramid 100 stone + 100 metal, Monumental Architecture 600
stone, all champions, all mercenaries, all heroes, elephants) draws on the
two premium resources, and metal gets squeezed by champions and
mercenaries at the same time. Siege is **ram and siege tower only** — no
bolt shooters or catapults (so no `siege_bolt_accuracy` / `siege_pack_unpack`)
— although the "Large Rams" bonus makes the ram +20% damage and 2 slots
larger; the navy tops out at the **arrow ship** (the "Kushite trireme"):
no ram, siege or fire ships, and no ship health/movement techs.

In short: Kush plays as a build-up civilisation that invests in healing
temples, aura monuments and champions (with elephants and mercenaries as
metal-powered reinforcements), and wants to fight near its pyramids and
temples with a cheap food/wood citizen core in front.

## Civ bonuses (things a generic civ does not have)

- **Team bonus — "Elephant Suppliers"** (`data/auras/teambonuses/kush_player_teambonus.json`,
  attached by `special/players/kush.xml`): every Elephant **of every ally**
  (`MutualAlly`, kush included) gets −20% resource costs and −20% build time
  (champion elephants and Arakamani are Elephants).
- **Civ bonus — "Large Rams"** (`civs/kush.json`, implemented in
  `units/kush/siege_ram`): battering rams get **+20% crush attack damage**
  (150 → 180) and **+2 garrison capacity** (10 → 12). (Shared with pers.)
- **"Monumental Architecture"** (`architecture_kush`, researched at the civil
  centre in the Town phase, 600 stone, 60 s; requirement `civ: kush`): all
  *Civic* structures (civil centre, houses, temples, pyramids, Temple of
  Amun) get **+20% health and +20% capture points, but +20% build time**.
- **Pyramid auras** (see Auras): Small Pyramid "Patriotism" (workers +15%
  gather speed within 50 m), Large Pyramid "Exhortative Presence" (soldiers
  +10% damage, +1 armor within 100 m). Same-name auras do not stack.
- **Grand Temple of Amun** (see Buildings): elite priests, a champion
  swordsman, +1 HP/s regen for Humans within 70 m — and −5% hero health.
- **"Syntagma"** (`special/players/kush.xml` adds `special/formations/syntagma`
  to the player's formations): a pikemen-only formation needing 16+ members;
  kush has the pikeman. (Kush does not get the `phalanx` formation.)

## Starting entities

`civs/kush.json` — the standard pattern (1 CC, 4 civilians, 2 melee, 2
ranged, 1 cavalry), plus a healer, with kush's picks:

- 1 × `structures/kush/civil_centre`
- 4 × `units/kush/support_civilian` (Kushite Laborer)
- 2 × `units/kush/infantry_spearman_b` (the melee pair)
- 2 × `units/kush/infantry_archer_b` (the ranged pair)
- 1 × `units/kush/cavalry_javelineer_b`
- 1 × `units/kush/support_healer_b` (**extra**: no other civ starts with a
  healer; it is also the skirmish "special starting unit" replacement)

## Buildings

- **Kush-only buildings** (details in [`buildings/`](buildings/)):
  - **Small Pyramid** (`pyramid_small`): 100 stone + 100 metal, 100 s,
    **Village phase**, 2000 HP, no build limit; aura: workers +15% gather
    speed within 50 m; 30 m non-root territory influence. Not conquest-critical.
  - **Large Pyramid** (`pyramid_large`): 450 stone + 150 metal, 300 s,
    **City phase**, 3000 HP, **max 2** per player; aura: soldiers +10% damage
    and +1 armor within 100 m; 40 m non-root territory influence. Not
    conquest-critical.
  - **Grand Temple of Amun** (`temple_amun`): 600 stone, 400 s, **City
    phase**, **one per player**, 4000 HP, 40 garrison slots (+3 HP/s heal),
    1000 capture points, territory radius 80 m. Trains elite priests and the
    Napatan Temple Guard; two auras (heroes −5% health; Humans +1 HP/s within
    70 m). Conquest-critical.
  - **Noba Village** (`camp_noba`) and **Blemmye Camp** (`camp_blemmye`):
    100 wood + 100 metal, 150 s, **Town phase**, 1000 HP, 6 garrison slots,
    **buildable in own or neutral territory**, no territory influence,
    batches ×0.8 time. Noba trains the Noba Maceman and Noba Skirmisher;
    Blemmye trains the Blemmye Desert Raider (camel javelin cavalry).
- **Overrides of shared buildings**:
  - **Temple** (the "Temple of Apedemak", `structures/kush/temple`): generic
    stats (300 stone, Town) but trains healers **and the Meroitic Temple
    Guard** (`champion_infantry_apedemak`).
  - **House**: the big house — 150 wood, 50 s, **+10 population**, 1200 HP,
    6 garrison slots, 20 m territory radius (generic: 75 wood, +5 pop). Kush
    houses train `support_civilian_house` only after
    `unlock_civilians_house_kush`.
  - **Fortress**: trains the three heroes only (no other training); generic
    costs.
  - **Corral**: trains Sanga Cattle instead of cows (`gaia/fauna_cattle_sanga_trainable`
    differs from the cow template only in name and art — cosmetic).
  - Barracks, stable, elephant stable, arsenal, dock, market, forge etc. use
    generic costs/stats; `elephant_stable` is **City phase** and
    `arsenal` is **City phase** in this version.
- **Walls**: palisade + stone wall set (`structures/kush/wallset_stone`,
  standard stats).
- **Vestigial kush templates, not buildable by anything**: the archery range
  (`structures/kush/range`; it exists only on skirmish maps that pre-place
  it), the shrine (`structures/kush/shrine`), and the unused
  `units/kush/catafalque` (its auras are enemy civilians −15% gather speed
  and temples +1 garrison heal).
- **Shared buildings kush lacks entirely** (no kush template, no builder):
  military colony (ptol/sele), theater (the five Greek civs). The archery
  range exists as a template but nothing builds it (see above).

## Units

### Kush-only units (trained by no other civ)

| Unit | Trained at | Phase | Notable stats |
|---|---|---|---|
| Napatan Temple Guard (`champion_infantry_amun`) | Grand Temple of Amun | City | 200 HP, 6/6/20 armor, sword 16 hack /0.75 s, 80 food + 60 wood + 80 metal, 15 s, 1 pop |
| Meroitic Temple Guard (`champion_infantry_apedemak`) | Temple | City | 200 HP, 5/6/20 armor, axe 18 hack + 6 crush /1 s, 80 food + 60 wood + 80 metal, 15 s, 1 pop |
| Noble Archer (`champion_infantry_archer`) | barracks | City (`unlock_champion_infantry`) | 120 HP, 3/3/20 armor, bow 14.4 pierce, 60 m, 80 food + 60 wood + 80 metal, 20 s |
| Noba Maceman (`infantry_maceman_merc_b`) | Noba Village | Town | 100 HP, mace 5.5 hack + 7.7 crush, **60 metal**, 7 s, mercenary |
| Noba Skirmisher (`infantry_javelineer_merc_b`) | Noba Village | Town | 50 HP, javelin 17.6 pierce, 30 m, **60 metal**, 7 s, mercenary |
| Priest (`support_healer_e`) | Grand Temple of Amun | City | elite healer; template 85 HP, 100 food + 30 metal; with rank bonuses ≈132.8 HP, ≈15 HP/2 s, ≈18 m |
| Hero Nastasen (`hero_nastasen`) | fortress | City | 1200 HP, 11/10/25, spear 16 hack + 12 pierce (1.75× vs Cavalry), walk 18 m/s; auras: soldiers + elephants within 60 m +15% damage, +50% loot; kush triremes −50 wood/−50 metal |
| Hero Amanirenas (`hero_amanirenas`) | fortress | City | 1500 HP, chariot archer, bow 28 pierce 60 m, walk 17 m/s; aura: champions within 60 m +2 capture, +20% damage |
| Hero Arakamani (`hero_arakamani`) | fortress | City | 1500 HP, 10/10/25, elephant, trunk 60 hack + 90 crush + splash, 600 food + 400 metal; auras: Temple of Apedemak and Apedemak guards −30% cost/time; enemy healers within 60 m heal nothing |

Heroes cost 0 population, require the City phase, and are subject to the
global limit of **1 hero alive at a time** (`EntityLimits`). With the Grand
Temple built they have −5% health. Hero costs: Nastasen 300 food + 200 wood
+ 250 metal (50 s), Amanirenas 360 food + 250 wood + 300 metal (60 s),
Arakamani 600 food + 400 metal (50 s).

- **Mercenaries** (Noba Maceman/Skirmisher; also the Blemmye Desert Raider,
  shared with ptol) cannot gather (`ResourceGatherer` disabled) but can
  build. The auto-researched `upgrade_rank_advanced_mercenary` sets their
  promotion XP to 0, so the training button yields the Advanced-rank unit;
  Elite needs 100 XP.
- **All kush champions are available only from the City phase**: the temple
  champions need only `phase_city`, the barracks champion archer needs
  `unlock_champion_infantry`, the stable champion needs
  `unlock_champion_cavalry`, and the elephant stable itself requires the City
  phase.

### Training roster (what kush's buildings train)

- CC: civilians, spearman_b, archer_b, cavalry_javelineer_b.
- Barracks: spearman_b, archer_b, + swordsman_b and pikeman_b (Town), +
  Noble Archer after `unlock_champion_infantry` (City).
- Stable: cavalry_javelineer_b, cavalry_spearman_b (Town), + Noble Cavalry
  (`champion_cavalry`) after `unlock_champion_cavalry` (City).
- Elephant stable (City): War Elephant (`champion_elephant`) only.
- Temple: basic healers + Meroitic Temple Guard (City).
- Grand Temple of Amun (City): elite priests + Napatan Temple Guard.
- Noba Village (Town): maceman, skirmisher. Blemmye Camp (Town): camel
  javelineer.
- Arsenal (City): siege ram and siege tower.
- Dock: fishing, merchant (Nile Trading Barge, 100 metal), scout and arrow
  ships.
- Fortress: the three heroes.
- Market: traders. House: civilians (after `unlock_civilians_house_kush`).

### Shared unit classes kush does NOT have

- **No slingers, no citizen javelineers, no citizen axemen/macemen/clubmen**:
  the javelineer and maceman are mercenaries (metal only), the axeman a
  champion.
- No champion infantry other than the three kush champions; no champion
  chariots (`unlock_champion_chariots` is not researchable).
- Cavalry: no cavalry swordsman, axeman or archer.
- **Siege: ram and siege tower only** — no bolt shooters, catapults or
  stone throwers; `siege_bolt_accuracy` and `siege_pack_unpack` are not
  researchable.
- **Navy: no ram, siege or fire ships**; `warship_ramming_attack`,
  `warship_siege_attack` and `warship_fireship_attack` are not researchable.
- No hoplite, longsword or Greek-style units; no `phalanx` formation.

## Technologies

- **Kush-only techs** (see [`technologies/`](technologies/)):
  - **"Monumental Architecture"** (`architecture_kush`, civil centre, Town,
    600 stone): Civic structures +20% HP, +20% capture points, +20% build time.
  - **"Fertility Festival"** (`unlock_civilians_house_kush`, house, Village,
    250 food + 100 wood + 100 metal): unlocks civilian training from houses.
    This is the kush variant of `unlock_civilians_house_generic` (same
    stats; the generic one is `notciv: kush`).
  - **"Flaming Projectiles"** (`warship_ranged_attack`, dock, City, 400 wood
    + 300 metal; supersedes `dock_efficiency`): ranged warships +10% attack
    damage (pierce and crush).
- **Phase techs**: kush researches the generic ones (`phase_town_generic`,
  `phase_city_generic`) — no kush-specific phase techs.
- **Unlock techs**: `unlock_champion_infantry` (barracks; unlocks the Noble
  Archer), `unlock_champion_cavalry` (stable), `unlock_civilians_house_kush`.
- **Restricted techs kush DOES get** (civ-gated inclusions):
  `archery_tradition` (civil centre, Village, 400 food + 200 metal; archers
  +10 attack range — only kush, maur and pers),
  `archer_attack_spread`, `warship_arrow_attack` (arrow ships),
  `unlock_champion_infantry`/`unlock_champion_cavalry`.
- **Generic techs kush CANNOT research** (civ requirements exclude it —
  everything else in [`generic/technologies/`](../generic/technologies/) is
  available): `exploration`, `hellenistic_metropolis`, `hoplite_tradition`,
  `nisean_horses`, `ship_health`, `ship_movement_speed`,
  `siege_bolt_accuracy`, `siege_pack_unpack`,
  `soldier_attack_melee_03_variant`, `unlock_champion_chariots`,
  `unlock_civilians_house_generic`, `warship_fireship_attack`,
  `warship_health`, `warship_ramming_attack`, `warship_siege_attack`, and
  the culture bonuses `civbonuses/celt_structures` and
  `civbonuses/greek_structures`.
- **Vestigial**: `unlock_females_house` and `health_females_01` exist and
  are not forbidden to kush by their requirements, but no building's
  `Researcher` lists them and `units/kush/support_female_citizen_house` (which
  requires the former) is trained by nothing; kush uses
  `unlock_civilians_house_kush` and `support_civilian_house` instead.

## Auras (summary)

| Aura | Carrier | Effect |
|---|---|---|
| `teambonuses/kush_player_teambonus` | the player (teambonus) | Elephants −20% cost and build time, all allies |
| `structures/kush_pyramids_economic` | Small Pyramid | Workers within 50 m +15% gather speed |
| `structures/kush_pyramids_military` | Large Pyramid | Soldiers within 100 m +10% damage (melee and ranged), +1 hack/pierce/crush armor |
| `structures/kush_temple_amun` | Grand Temple of Amun | Heroes −5% health (global) |
| `structures/kush_temple_amun_heal` | Grand Temple of Amun | Humans within 70 m +1 HP/s regeneration (replaces the generic `temple_heal`, 40 m) |
| `units/heroes/kush_hero_amanirenas` | Amanirenas | Champions within 60 m +2 capture strength, +20% damage |
| `units/heroes/kush_hero_arakamani_1` | Arakamani | Temple of Apedemak and Apedemak guards −30% cost and build/train time (global) |
| `units/heroes/kush_hero_arakamani_2` | Arakamani | enemy healers within 60 m heal nothing |
| `units/heroes/kush_hero_nastasen_1` | Nastasen | soldiers and elephants within 60 m +15% damage, +50% loot |
| `units/heroes/kush_hero_nastasen_2` | Nastasen | kush triremes −50 wood and −50 metal (global) |

Shared auras kush also carries: `units/ram_garrison` (infantry and champion
infantry, +0.15 m/s per garrisoned soldier on rams — the Large Rams bonus
adds 2 slots), `units/heroes/hero_garrison`, `structures/temple_heal`
(Temple of Apedemak), `structures/xp_trickle`, `structures/arsenal_repair`,
`structures/wall_garrisoned`, `structures/wonder_population_cap`.

## Stat deltas on otherwise shared content

- Elephants (all allies): −20% cost and build time (team bonus).
- Battering ram: +20% crush damage (180 vs 150), 12 garrison slots (vs 10).
- Champion elephant (African elephant mixin): 900 HP (vs 1000), trunk 27 hack
  + 40.5 crush (vs 30 + 45), 270 food + 180 metal (vs 300 + 200), 32.4 s
  (vs 36 s) — 90% of generic across the board.
- Champion cavalry: 260 HP, 5/6/20 armor (generic: 240 HP). Spear 12 hack +
  10 pierce, 1.75× vs Cavalry.
- House: 150 wood, +10 population, 1200 HP (generic: 75 wood, +5 pop).
- Blemmye Desert Raider (shared with ptol): 20 food + 90 metal, 10.5 s,
  19.8 pierce javelin, cannot gather.
- Civic structures: +20% HP/capture points, +20% build time after
  Monumental Architecture.
- Heroes: −5% health while the Grand Temple of Amun stands.
- All other kush variants of shared units and buildings are identity-only
  overrides of the generic templates — no further stat differences.

## Non-gameplay

- Culture `egyptian` (Egyptian music set, emblem), 13 AI names and the
  skirmish replacements (ranged infantry → archer, special starting unit →
  healer, house) are cosmetic only.
