# Carthage vs a generic civilisation

Synthesis of **everything that differs between the carthaginian civilisation and a
generic (non-civ-specific) civilisation** in 0 A.D. 0.28.0. The baseline
"generic civ" is defined as: the shared entity pool documented in
[`generic/`](../generic/) (units, buildings, technologies, auras with no
civ-specific content), the standard tech tree (`phase_town_generic` /
`phase_city_generic`, all techs with no civ requirement), the standard
`StartEntities` pattern, and no civ or team bonuses. Per-entity details are
in this folder's [`auras/`](auras/), [`buildings/`](buildings/),
[`technologies/`](technologies/) and [`units/`](units/) directories
(cart-only entities) and in [`generic/`](../generic/)
(shared entities with per-civ variants); this file is the complete delta.

Data sources: `civs/cart.json`, `templates/structures/cart/`,
`templates/units/cart/`, `data/technologies/`,
`data/auras/`, `special/players/cart.xml`.

## Narrative

Carthage is the **mercenary trade empire**. Its citizen army is the narrowest
in the game — spearmen, a long-range archer and the Numidian cavalry
javelineers, nothing else — and in exchange almost its whole fighting force
is bought, not raised: eight mercenary unit types recruited at three
embassy buildings from the Town phase, paid in **metal** (60–90 metal each),
trained 30% faster than the norm and hitting +10% harder than their citizen
equivalents. Mercenaries are the civ's defining trade-off: pure soldiers
that **cannot gather**, so every one trained is a permanent metal expense
rather than a worker that pays for itself. The team bonus doubles down —
"Mercenary Transports" halves mercenary-infantry training time for every
ally — and the city-phase "Celtic Auxiliaries" tech re-prices the sword
line from metal to food. Around the mercenaries, Carthage fields champions
and heroes at the top end: the **Sacred Band** infantry and cavalry from
the temple (available without the usual champion-unlock techs, at City
phase), war elephants from the elephant stable, and three heroes including
**Hannibal**, an elephant-mounted hero whose "Tactician" aura boosts every
nearby own and allied soldier's damage and capture strength.

Economically Carthage is built for **expansion and trade**. "Colonization"
(20 s, at the civil centre) makes civic centres, temples and houses 25%
cheaper and faster to build, the house is a double-size variant (+10 pop,
upgradeable to a +20-pop apartment), and "Mining Economy" grants the stone
mining techs automatically for free at every phase (×1.25 each), so stone
for those civic centres and walls comes in fast. On the water, trade ships
are available from the Village phase with a +25% sea-trade bonus
("Trademasters"), the **Cothon** super dock claims territory from any
coastline and repairs garrisoned ships, and the navy fields ramming and
siege warships — but **no fire ship**. Defensively the "Triple Walls" bonus
triples the health of the stone walls (at double stone cost and build
time), but those walls only build in own territory, so the civ relies on
its village-phase Low Wall set for neutral-territory fencing.

The weaknesses follow from the design. The citizen roster has no
swordsmen, javelineers, slingers or pikemen, so a Carthage denied metal
(and its embassies) has almost no army; mercenaries never feed the
economy; two of the eight mercenary types are only on a vestigial embassy
and unreachable through the build UI; and the Sacred Bands wait for the
City phase. In short: Carthage is a metal-hungry, expansionist sea power
that must keep its trade and stone flowing to keep buying the army that
fights for it.

## Civ bonuses (things a generic civ does not have)

- **Team bonus — "Mercenary Transports"**
  (`data/auras/teambonuses/cart_player_teambonus.json`, attached by
  `special/players/cart.xml`): **Mercenary Infantry −50% training time**
  for every ally (`MutualAlly`, cart included). Mercenary cavalry is not
  affected.
- **"Trademasters"** (`units/cart/ship_merchant`): trade ships are
  available in the **Village phase** (the template removes the standard
  `phase_town` requirement) and get **+25% trade gain**
  (`Trader/GainMultiplier` ×1.25).
- **"Mining Economy"** (auto techs `civbonuses/cart_stone_01/02/03`,
  requirement `cart` + the phase): Workers get **+25% stone gather rate**
  per phase, auto-researched for free. The three generic stone-mining
  techs (`gather_mining_servants/serfs/slaves`, same +25% stone.rock
  each) are `notciv: cart`, so this replaces them entirely — same effect,
  zero cost. Cumulative ×1.25 (village) / ×1.56 (town) / ×1.95 (city).
- **"Numidian Cavalry"** (`units/cart/cavalry_javelineer_*`): all cavalry
  javelineers get **+10% walk speed** (template-level ×1.1: walk 17.82 /
  run 24.95 vs 16.2 / 22.68 generic).
- **"Triple Walls"** (auto tech `civbonuses/cart_walls`, requirement
  `cart`): **Wall-class** structures get **×3 health, ×2 build time and
  ×2 stone cost**. This is the stone wall set's segments (long segment
  3000 → 9000 HP, 36 → 72 stone) — the palisade and the cart-unique Low
  Wall segments carry no `Wall` class and are unaffected.
- **"Colonization"** (tech `colonization`, civil centre, 200 wood + 200
  metal, 20 s, no phase requirement): **Civic-class** structures (civic
  centre, temples, houses) get **−25% build time and −25% all resource
  costs** — a civic centre drops from 300/300/250 to 225/225/187.5.
- **"Celtic Auxiliaries"** (tech `celtic_auxiliaries`, celtic embassy,
  City phase, 550 metal): mercenary **swordsmen** (Gallic infantry and
  cavalry) get **−50% metal cost, +50 food cost** (and half metal loot,
  +5 food loot) — 60 metal → 30 metal + 50 food, 90 metal + 20 food → 45
  metal + 70 food.

## Starting entities

`civs/cart.json` — the standard pattern (1 CC, 4 women, 2 melee, 2 ranged,
1 cavalry), with cart's picks:

- 1 × `structures/cart/civil_centre`
- 4 × `units/cart/support_civilian` (women)
- 2 × `units/cart/infantry_spearman_b` (Libyan Spearmen)
- 2 × `units/cart/infantry_archer_b` (Mauritanian Archers — the ranged pair)
- 1 × `units/cart/cavalry_javelineer_b` (Numidian Cavalry)

## Buildings

- **Cart-only building — Cothon / Naval Shipyard** (`structures/cart/super_dock`):
  300 wood + 200 stone, 500 s, Town phase; 5000 HP, 5 garrison slots,
  shore placement in **own/ally/neutral territory**, **territory root**
  (200 m radius). Trains the warships (scout, arrow, ram, siege — no
  fishing/merchant ships) and researches the warship techs plus
  `exploration` and `dock_efficiency`; its "Dockyard Repairs" aura heals
  garrisoned ships +10 HP/s.
- **Cart-only buildings — the three embassies** (Town phase, built by
  women and infantry; 150 s, 6 garrison slots, 24 m vision, non-root
  territory radius 25 m):
  - `embassy_celtic` (200 wood, 1200 HP): trains the Gallic Mercenary
    Swordsman and Cavalry; researches `celtic_auxiliaries`.
  - `embassy_iberian` (100 wood + 100 stone, 2000 HP): trains the Iberian
    Mercenary Skirmisher and the Balearic Slinger.
  - `embassy_italic` (100 wood + 100 stone, 1500 HP): trains the Samnite
    Spearman and the Italic Cavalry.
- **Cart-only building — Apartment** (`structures/cart/apartment`): the
  +20-pop house upgrade (175 wood + 50 stone, 90 s, 1800 HP, 12 garrison).
  Buildable directly by any builder (the generic builder list contains
  `structures/{civ}/apartment`, which only cart resolves) or as the 55 s /
  50 wood + 50 stone upgrade of a house. The basic cart house is itself
  the **big house** variant: 150 wood, 50 s, 1200 HP, **+10 population**
  (double the generic +5), 6 garrison slots.
- **Cart-only building — Low Wall wallset** (`structures/cart/wallset_short`):
  a **third wall set** for cart (alongside the generic palisade and the
  stone walls), **Village phase**, wood-only segments (4/8/12/14 wood,
  long segment 600 HP, palisade-class armor), buildable in **own + neutral
  territory**. Not affected by Triple Walls.
- **Stone walls are own-territory only** (`structures/cart/wall_*`:
  `BuildRestrictions/Territory` = `own`, unlike the palisade/low-wall
  `own neutral`) — with Triple Walls, 9000 HP per long segment at 72 stone.
- **Vestigial cart templates, not buildable by anything**: the all-in-one
  `embassy` (400 wood + 200 stone, trains all seven mercenary types that
  have cart templates — its only live effect is that the Samnite Swordsman
  and the Iberian Heavy Cavalry, which no other trainer lists, are
  unreachable through the build UI), the `tophet` (a second temple variant
  with no territory decay), the archery `range`, `tower_artillery`,
  `tower_bolt`, and the `catafalque`.
- **Shared buildings cart lacks entirely** (no cart template, no builder):
  military colony (ptol/sele), theater (the five Greek civs), and the
  civ-unique buildings of other civs. Cart gets the standard shared roster
  including the **elephant stable** (City phase, trains its war
  elephants).

## Units

### Cart-only units (trained by no other civ)

| Unit | Trained at | Phase | Notable stats |
|---|---|---|---|
| Gallic Mercenary Swordsman (`infantry_swordsman_gaul_b`) | embassy_celtic (+ vestigial embassy) | Town | 100 HP, sword 8.8 hack, 60 metal, 7 s, 1 pop — no gathering |
| Samnite Swordsman (`infantry_swordsman_ital_b`) | vestigial embassy only | Town | identical stats — unreachable through the build UI |
| Samnite Spearman (`infantry_spearman_ital_b`) | embassy_italic | Town | 100 HP, spear 4.95 + 4.4 (2.5× vs Cavalry), 60 metal, 7 s |
| Iberian Mercenary Skirmisher (`infantry_javelineer_iber_b`) | embassy_iberian (+ vestigial embassy) | Town | 50 HP, javelin 17.6 pierce @ 30 m, 80 metal, 7 s — flaming javelins (stacking Burning status, +1 fire/3 s for 9 s) |
| Balearic Slinger (`infantry_slinger_iber_b`) | embassy_iberian (+ vestigial embassy) | Town | 50 HP, sling 14.55 pierce + 1.39 crush @ 50 m, 75 metal, 7 s |
| Gallic Mercenary Cavalry (`cavalry_swordsman_gaul_b`) | embassy_celtic (+ vestigial embassy) | Town | 160 HP, sword 9.9 hack, 20 food + 90 metal, 10.5 s |
| Iberian Heavy Cavalry (`cavalry_swordsman_iber_b`) | vestigial embassy only | Town | identical stats — unreachable through the build UI |
| Italic Cavalry (`cavalry_spearman_ital_b`) | embassy_italic (+ vestigial embassy) | Town | 160 HP, spear 6.6 + 6.05 (1.75× vs Cavalry), 20 food + 90 metal, 10.5 s |
| Hero Hannibal (`hero_hannibal`) | fortress | City | 1500 HP elephant hero, trunk 60 hack + 90 crush; "Tactician" aura (allies' soldiers + siege within 60 m: +1 capture, +20% damage) |
| Hero Hamilcar (`hero_hamilcar`) | fortress | City | 1200 HP cavalry swordsman, sword 26 hack; two auras: "Lightning General" (soldiers + siege +15% speed), "Subduer of Mercenaries" (enemy mercenaries −20% damage) |
| Hero Maharbal (`hero_maharbal`) | fortress | City | 1200 HP cavalry spearman, 16 + 12 (1.75× vs Cavalry); "Cavalry Commander" aura (melee cavalry +30% melee damage) |

All mercenaries share the mercenary package: **metal-based cost** (the
food/wood components are zeroed), **+10% melee/ranged damage** (the
`mixins/mercenary` multipliers), **no gathering at all**
(`ResourceGatherer` disabled), 7 s (infantry) / 10.5 s (cavalry) build
time, `Mercenary` visible class, and **auto-promotion to Advanced at 0
XP** (the `upgrade_rank_advanced_mercenary` tech). Infantry mercenaries
need 100 XP for their Elite promotion; the cavalry mercenaries 300 XP.
Heroes cost 0 population, require the City phase, and are subject to the
global limit of **1 hero alive at a time**.

### Training roster (what cart's buildings train)

- CC: women, spearman_b, archer_b, cavalry_javelineer_b.
- Barracks: spearman_b, archer_b (the generic trainer's other entries —
  swordsman, javelineer, slinger, champions — don't exist for cart).
- Stable: cavalry_javelineer_b only (`champion_cavalry` is explicitly
  removed from the stable's list).
- Temple: healers + **champion_infantry + champion_cavalry** (the Sacred
  Bands — where most civs unlock their champions at the barracks or
  stable, cart gets both straight from the temple, gated on the City
  phase).
- Elephant stable (City): champion_elephant.
- Arsenal (City): oxybeles, ballista, siege ram.
- Fortress (City): the 3 heroes.
- Embassies (Town): the mercenaries, as above.
- Dock: fishing, merchant, scout, arrow, ram and siege ships — **no fire
  ship** (no `ship_fire` template exists for cart).
- Super dock (Town): scout, arrow, ram, siege warships.
- House: support_civilian_house (after `unlock_civilians_house_generic`).

### Shared unit classes cart does NOT have

- **No citizen swordsman** (`infantry_swordsman_b` does not exist for
  cart — the only sword-wielding units are the mercenary swordsmen and
  the hero Hamilcar).
- No citizen javelineers or slingers (only the mercenary versions), no
  pikemen, macemen, axemen or clubmen (nor their champion variants).
- Cavalry: no citizen cavalry spearman, no cavalry archer, no cavalry
  swordsman (mercenaries only); no chariots.
- Navy: **no fire ship**; `warship_fireship_attack` is not researchable
  (`notciv: cart`), and neither is `warship_arrow_attack`.
- **Vestigial unit templates, not trainable by anything**:
  `champion_pikeman` (the "Sacred Band Pikeman" — no trainer references
  it) and `support_female_citizen` (a 25 HP dagger-armed woman — no
  trainer references it).

## Technologies

- **Cart-only techs**: `colonization` (CC, see above), `celtic_auxiliaries`
  (celtic embassy, see above), and the four auto civ bonuses:
  `civbonuses/cart_stone_01/02/03` and `civbonuses/cart_walls` (see
  above).
- **Phase techs**: cart researches the generic ones (`phase_town_generic`,
  `phase_city_generic`) — no cart-specific phase techs.
- **Unlock techs**: cart can research `unlock_civilians_house_generic`
  (and the standard `unlock_shared_los`, `unlock_shared_dropsites`,
  `unlock_spies`). It **cannot** research `unlock_champion_infantry` or
  `unlock_champion_cavalry` (both `notciv: cart`) — its champions come
  from the temple instead, gated directly on `phase_city`.
- **Generic techs cart CANNOT research** (civ requirements exclude it —
  everything else in [`generic/technologies/`](../generic/technologies/) is
  available): `archery_tradition`, `gather_mining_serfs`,
  `gather_mining_servants`, `gather_mining_slaves`,
  `hellenistic_metropolis`, `hoplite_tradition`, `nisean_horses`,
  `ship_health`, `soldier_attack_melee_03_variant`,
  `unlock_champion_cavalry`, `unlock_champion_chariots`,
  `unlock_champion_infantry`, `warship_arrow_attack`,
  `warship_fireship_attack`.
- **Restricted techs cart DOES get**: `exploration` (only cart + han,
  researched at the dock / super dock), `ship_movement_speed` (only cart +
  pers, Town phase), `archer_attack_spread` (cart is not in the notciv
  list), `siege_bolt_accuracy`, `siege_pack_unpack` (its bolt shooters),
  `warship_health`, `warship_ramming_attack`, `warship_siege_attack`,
  `ship_capture_resistance`.

## Auras (summary)

| Aura | Carrier | Effect |
|---|---|---|
| `teambonuses/cart_player_teambonus` | the player (teambonus) | Mercenary Infantry −50% train time, all allies |
| `structures/cart_super_dock_repair` | Cothon (super dock) | garrisoned ships +10 HP/s regeneration |
| `units/heroes/cart_hero_hannibal` | Hannibal | own + allied soldiers and siege within 60 m: +1 capture attack, +20% melee and ranged damage |
| `units/heroes/cart_hero_hamilcar_1` | Hamilcar | soldiers + siege within 60 m +15% walk speed |
| `units/heroes/cart_hero_hamilcar_2` | Hamilcar | enemy mercenaries within 60 m −20% melee and ranged damage |
| `units/heroes/cart_hero_maharbal` | Maharbal | melee cavalry within 60 m +30% melee damage |

## Stat deltas on otherwise shared content

- Cavalry javelineers: walk +10% (Numidian Cavalry).
- Merchant ships: +25% trade gain, village phase (Trademasters).
- Wall-class structures: ×3 HP, ×2 build time, ×2 stone cost (Triple
  Walls).
- Workers: +25% stone gather rate per phase, free (Mining Economy).
- Civic structures: −25% build time and resource costs after Colonization.
- Champion cavalry: 260 HP (generic 240) and 18.75 s build time, trained
  at the temple with no unlock tech.
- Champion infantry: 15 s build time (generic 20), trained at the temple
  with no unlock tech.
- Champion elephant: the **smaller** war elephant — 900 HP, 27 hack +
  40.5 crush, 270 food + 180 metal, 32.4 s (generic 1000 HP / 30 + 45 /
  300 + 200 / 36 s).
- Houses: +10 population and 1200 HP (the big-house variant; generic +5 /
  1000 HP).
- All other cart variants of shared units (ships, siege engines, healers,
  women, spearmen, archers) are identity-only overrides of the generic
  templates — no further stat differences.

## Non-gameplay

- Culture `cart` (Carthaginian music set, emblem), 13 AI names, and the
  skirmish replacements (the default ranged infantry becomes the
  Mauritanian Archer, the default house the cart house) are cosmetic
  only. The player template adds the `phalanx` formation.
