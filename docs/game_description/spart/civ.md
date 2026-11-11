# Spartans vs a generic civilisation

Synthesis of **everything that differs between the spartan civilisation and a
generic (non-civ-specific) civilisation** in 0 A.D. 0.28.0. The baseline
"generic civ" is defined as: the shared entity pool documented in
[`generic/`](../generic/) (units, buildings, technologies, auras with no
civ-specific content), the standard tech tree (`phase_town_generic` /
`phase_city_generic`, all techs with no civ requirement), the standard
`StartEntities` pattern, and no civ or team bonuses. Per-entity details are
in this folder's [`auras/`](auras/), [`buildings/`](buildings/),
[`technologies/`](technologies/) and [`units/`](units/) directories
(spart-only entities) and in [`generic/`](../generic/)
(shared entities with per-civ variants); this file is the complete delta.

Data sources: `civs/spart.json`, `templates/structures/spart/`,
`templates/units/spart/`, `data/technologies/`,
`data/auras/`, `special/players/spart.xml`.

## Narrative

The Spartans are **Hellenic Laconia: the hoplite state — the only civ
whose champion infantry arrives in the Village phase, and whose heroes
arrive in the Town phase**. The whole design is the spear: the citizen
line is the **Perioikoi Hoplite** spearman (50 food + 50 wood, the
standard 2.5× vs Cavalry) screened by **Helot Skirmisher** javelineers —
there is no slinger, no archer, no citizen swordsman — and the power
unit is the **Spartan Hoplite**, trained at the syssiton from the
Village phase: 200 HP, 6/6/20 armor and a spear that swings every
**0.9 s** (10 hack + 8.5 pierce), the fastest champion spear in the
game, which at 150 XP promotes to the **Olympic Hoplite** (×1.2 health
and melee damage). The rival sword line is the **Skiritai Commando**,
the only champion in the game trained at **Elite rank** (barracks, Town
phase) — and the unit that builds the civ's special buildings.

The hero economy is the earliest and cheapest in the game. The
**gerousia** — a Town-phase senate — trains Leonidas, Brasidas and Agis
one phase before anyone else, and the team bonus **"Peloponnesian
League" makes every ally's heroes completely free**. Each hero is a
doctrine: Leonidas buffs the spear line (+25% melee damage within 30 m),
Brasidas the Helot screen (+25% javelin damage, +1 armor within 60 m),
and Agis the whole economy (global −25% soldier metal cost and training
time). Around them, the tech tree is a hoplite program: Tyrtean Paeans
(Village, +10% champion speed), Krypteia (Town, champions +10% melee
damage at the price of +30% skirmisher training time), Helot Economy
(Village, skirmishers double as farmers at −10% javelin damage), and
Unlock Neodamodes (City) — the freed-helot hoplite at 30 food + 20
metal, the cheapest metal melee unit in the game.

The weaknesses are as famous as the strengths. **Sparta cannot build
stone walls at all**: every Spartan builder's list explicitly removes
the stone wallset (`-structures/{civ}/wallset_stone`), so only palisades
remain — the men are the walls. The ranged line is one unit deep (the
Helot Skirmisher), and the civ's own techs tax it. There are **no
archers, no slingers, no citizen swordsmen**, no cavalry archers or
swordsmen, no pikemen, and the **arsenal trains only the oxybeles and
the siege ram** (no stone throwers, no siege tower); the navy has no
fire or siege ship. Two of the civ's data artifacts are broken: the
**Agoge** tech (+25% champion health) has no researcher anywhere — it
is unreachable — and Agis' second aura ("Last Stand") carries no
modifications, so it does nothing. In short: the Spartans are a
stone-built, spear-stacked, wall-less war machine — win with the
Village-phase champion spike, free heroes, and the fastest spear swing
in the game, and defend with soldiers because there is nothing else to
defend with.

## Civ bonuses (things a generic civ does not have)

- **Team bonus — "Peloponnesian League"**
  (`data/auras/teambonuses/spart_player_teambonus.json`, attached by
  `special/players/spart.xml`): **heroes train for free** for every ally
  (`MutualAlly`, spart included) — a global aura that `replace 0`s all
  four `Cost/Resources` of every `Hero`. The strongest hero-economy
  bonus in the game; it stacks with the gerousia's Town-phase hero
  training.
- **"Laws of Lycurgus"** (no tech — structural): the **syssiton is a
  Village-phase building** and the Spartan Hoplite's requirement
  resolves to `phase_village`, making it the only Village-phase champion
  in the game; it also promotes to the Olympic Hoplite at 150 XP.
- **"Hellenic Architecture"** (auto tech `civbonuses/greek_structures`,
  shared with athen and mace — see
  [`generic/technologies/civbonuses__greek_structures.md`](../generic/technologies/civbonuses__greek_structures.md)):
  **all Structures except the Wonder +10% health and +10% capture
  points** — Spartan stone builds stronger than the generic baseline.
- **"Ritualistic Exercise"** (display text in `civs/spart.json` only):
  the claimed "+40% health, +50% melee hack for citizen-soldiers" has
  **no implementing tech** in 0.28 — no auto tech for spart carries
  those modifications, so it is vestigial flavour text (see
  Non-gameplay).
- **No stone walls** (structural): every Spartan builder's list removes
  `structures/{civ}/wallset_stone`, and the skirmish wall replacements
  are emptied — the civ can only build palisades in-game (the stone
  wallset template still exists and map scripts may still use it).

## Starting entities

`civs/spart.json` — the standard pattern (1 CC, 4 women, 2 melee, 2 ranged,
1 cavalry), with spart's picks:

- 1 × `structures/spart/civil_centre`
- 4 × `units/spart/support_civilian` (women)
- 2 × `units/spart/infantry_spearman_b` (Perioikoi Hoplites — the melee pair)
- 2 × `units/spart/infantry_javelineer_b` (Helot Skirmishers — the ranged pair)
- 1 × `units/spart/cavalry_javelineer_b` (Perioikoi Cavalryman)

## Buildings

- **Spart-only building — Syssition / Military Mess Hall**
  (`structures/spart/syssiton`): the champion mess hall — 150 stone +
  150 metal, 200 s, **Village phase**; 2000 HP, **+10 population**, 38 m
  territory influence (weight 40000), 10 garrison slots, no player limit.
  Trains the **Spartan Hoplite** (×0.7 batch time) and researches
  `tyrtean_paeans`.
- **Spart-only building — Gerousia / Spartan Senate**
  (`structures/spart/gerousia`): the hero senate — 100 stone + 200
  metal, 200 s, **Town phase**; 2000 HP, Circle r 12 m, 38 m territory
  influence (weight 40000), 5 garrison slots. Trains the **three
  heroes** (×0.7 batch time; the heroes themselves still require the
  City phase) and researches `krypteia` and `unlock_neodamodes`. Its
  `Council` build category is **unenforced** (no `Council` limit in the
  player template), so it is not capped.
- **Special builders**: every Spartan builder unit (women, spearmen,
  javelineers, the Skiritai Commando, even the vestigial
  `support_female_citizen`) explicitly adds `structures/spart/gerousia`
  and `structures/spart/syssiton` to its builder list — and explicitly
  removes the stone wallset. The generic builder list does not carry
  either special.
- **Stone walls are unbuildable** (see Civ bonuses): the palisade
  (`structures/wallset_palisade`) is the only wall the civ can place;
  the `structures/spart/wallset_stone` template and its wall pieces
  (short 13×6 h 12.5, medium 25×6 h 12.5, long 37×6 h 12.5, tower 8×8
  h 19, gate 37×7 h 15.5) exist in the data and remain in `civs.json`
  `WallSets` — map wall scripts may still place them, but no player
  builder can.
- **Vestigial spart templates, not buildable by anything** (no `Builder`
  list references them — see [`buildings/README.md`](buildings/README.md)):
  the two stoas (`royal_stoa`, a 27 × 24.5 m garrison-territory
  building, and `persian_stoa`, 28 × 14 m — both Town-phase
  `template_structure_civic_stoa` children), the archery range
  (`structures/spart/range`) and the bolt tower
  (`structures/spart/tower_bolt`, shared in data with
  cart/rome/mace/ptol/athen, never referenced).
- **Shared buildings spart lacks entirely**: crannog, encampment,
  kennel, great hall, ministry, academy, ice house (pers), tachara
  (pers), elephant stable, military colony, and the civ-unique buildings
  of other civs. Everything else is the standard shared roster (the
  theater "Theatron" is the shared Greek theater), with spart
  identity-only overrides (house "Oikos" 16 × 16 m, 1200 HP, 150 wood,
  +10 pop; fortress "Phrourion" 26 × 28 m).

## Units

### Spart-only units (trained by no other civ)

| Unit | Trained at | Phase | Notable stats |
|---|---|---|---|
| Spartan Hoplite (`champion_infantry_spear`) | syssiton | **Village** | 200 HP, 6/6/20, spear 10 + 8.5 @ 0.9 s (2.5× vs Cav), 80 food + 60 wood + 80 metal, 15 s; promotes to Olympic Hoplite at 150 XP |
| Neodamodes Hoplite (`infantry_spearman_neodamodes`) | barracks | City (tech) | 100 HP, 3/3/15, spear 4.5 + 4 (2.5× vs Cav), **30 food + 20 metal**, 12 s, no builder/ranks |
| Hero Leonidas (`hero_leonidas`) | gerousia | City | 1000 HP spear hero, spear 15 + 12; "Last Stand" (spearmen +25% melee damage) |
| Hero Brasidas (`hero_brasidas`) | gerousia | City | 1000 HP sword hero, sword 26 hack; "Helot Reforms" (javelineers +25% pierce, +1 armor) |
| Hero Agis (`hero_agis`) | gerousia | City | 1500 HP spear hero; global "Great Revolt" (soldiers −25% metal cost, −25% train time) |
| Spartan Pikeman (`champion_infantry_pike`) | nothing (vestigial) | City | 200 HP, 8/8/20, pike 8 + 15 — no trainer references it |

Heroes cost 0 population, require the City phase, and are subject to the
global limit of **1 hero alive at a time**; the brit-style hero-gated CC
limit does not exist for spart (generic `phase_town`-only rule), and the
team bonus makes all heroes free. The Skiritai Commando is a shared
champion swordsman variant (see
[`generic/units/champion_infantry_swordsman.md`](../generic/units/champion_infantry_swordsman.md)):
Town-phase, trained at **Elite rank** (already receives the rank techs),
and its builder list adds the gerousia/syssiton and drops the stone
wallset.

### Training roster (what spart's buildings train)

- CC: women, spearman_b, javelineer_b, cavalry_javelineer_b.
- Barracks: spearman_b, javelineer_b, **champion_infantry_swordsman**
  (Skiritai Commando, gated on `phase_town`), **infantry_spearman_neodamodes**
  (gated on `unlock_neodamodes`) — **no clubman, pikeman, maceman,
  axeman, swordsman_b, slinger or archer**.
- Stable: cavalry_spearman_b, cavalry_javelineer_b — no other cavalry.
- Syssiton (Village): champion_infantry_spear.
- Gerousia (Town): the 3 heroes.
- Fortress (City): nothing — researches the generic fortress techs only.
- Temple: healer (the Surgeon).
- Arsenal (City): oxybeles, siege ram — **no lithobolos/ballista/onager/
  scorpio/polybolos, no siege tower**.
- Dock: fishing, merchant, scout, arrow and ram ships — **no fire or
  siege ship** (no `ship_fire`/`ship_siege` templates exist for spart).
- Market: support_trader.
- House: support_civilian_house (after `unlock_civilians_house_generic`).

### Shared unit classes spart does NOT have

- **No archer or slinger** — the Helot Skirmisher is the entire ranged
  infantry; `archer_attack_spread` is not researchable (`notciv: spart`).
- **No citizen swordsman, pikeman, maceman, axeman or clubman** — melee
  infantry is the spearman line (Perioikoi, Neodamodes) plus the two
  champion infantry.
- **No cavalry archer or swordsman** — citizen cavalry are the spearman
  (Greek Allied Cavalry) and the javelineer; no champion cavalry
  (`unlock_champion_cavalry` is `notciv: spart`).
- **No fire or siege ship**; `warship_fireship_attack` and
  `warship_siege_attack` are not researchable (`notciv: spart`).
- **Vestigial unit templates, not trainable by anything**:
  `champion_infantry_pike` (no trainer references it),
  `hero_leonidas_300` (no trainer), `support_female_citizen` (no
  trainer); the `catafalque` exists as for every civ.

## Technologies

- **Spart-only techs**: `tyrtean_paeans` (syssiton, Village: Champion
  Melee Infantry !Hero +10% walk speed), `helot_economy` (civil centre,
  no phase: Infantry Javelineers ×2 grain gather, −10% pierce damage),
  `krypteia` (gerousia, Town: Champions +10% melee damage; Citizen
  Infantry Javelineers +30% training time), `unlock_neodamodes`
  (gerousia, City: unlocks the Neodamodes at the barracks), and `agoge`
  (City: Champion Infantry Spearmen +25% health, +5% training time —
  **but no building researches it**, so it is unreachable in normal
  play) — see the per-tech files in [`technologies/`](technologies/).
- **Phase techs**: spart researches the generic ones (`phase_town_generic`,
  `phase_city_generic`) — no spart-specific phase techs.
- **Generic techs spart CANNOT research** (civ requirements exclude it —
  everything else in [`generic/technologies/`](../generic/technologies/) is
  available): `unlock_champion_infantry` (the champions are unlocked by
  buildings/other techs instead), `unlock_champion_cavalry`,
  `archer_attack_spread`, `warship_fireship_attack`,
  `warship_siege_attack`, plus every other civ's civ-gated techs
  (`archery_tradition`, `nisean_horses`, `hellenistic_metropolis`,
  `unlock_champion_chariots`, `roman_reforms`, `roman_roads`,
  `exploration`, `juggernauts`, `equine_transports`,
  `iphicratean_reforms`, `arsenal_philon`, `warship_ranged_attack`,
  `unlock_civilians_house_kush`, etc.).
- **Restricted techs spart DOES get**: `hoplite_tradition` (athen +
  spart, see
  [`generic/technologies/hoplite_tradition.md`](../generic/technologies/hoplite_tradition.md)),
  `warship_health` (athen/cart/mace/rome/spart), `siege_pack_unpack`,
  `siege_bolt_accuracy` (spart has the oxybeles to use it),
  `warship_ramming_attack`, `warship_arrow_attack`,
  `ship_capture_resistance`, `tower_health`, `barracks_batch_training`,
  `stable_batch_training`, and the standard unlock techs
  (`unlock_shared_dropsites`, `unlock_shared_los`, `unlock_spies`,
  `unlock_civilians_house_generic`, `unlock_females_house` — the last a
  no-op vestige). Spart also gets the full standard soldier/armor/
  economic tech lines, including both generic farming techs.

## Auras (summary)

| Aura | Carrier | Effect |
|---|---|---|
| `teambonuses/spart_player_teambonus` | the player (teambonus) | global, all allies: heroes train for free |
| `units/heroes/spart_hero_leonidas` | Leonidas | own spearmen within 30 m: +25% melee damage, +1 capture |
| `units/heroes/spart_hero_brasidas` | Brasidas | own citizen infantry javelineers within 60 m: +25% pierce damage, +1 all armor |
| `units/heroes/spart_hero_agis_1` | Agis | global: own soldiers −25% metal cost, −25% training time |
| `units/heroes/spart_hero_agis_2` | Agis | **broken — no modifications, does nothing** |

## Stat deltas on otherwise shared content

- Champion swordsman: the **Skiritai Commando** — trained at **Elite**
  rank (rank techs pre-applied), Town-phase requirement, and a
  spart-specific builder list (gerousia + syssiton, no stone wallset).
- House: 16 × 16 m footprint, 1200 HP, 150 wood, +10 pop, 6 garrison
  (the generic house is 75 wood / +5 pop).
- All structures except the wonder: ×1.1 health and capture points
  (Hellenic Architecture).
- Champion hoplite: the Village-phase Spartan Hoplite with the 0.9 s
  spear repeat and the Olympic promotion (see
  [`units/champion_infantry_spear.md`](units/champion_infantry_spear.md)).
- Neodamodes: the metal-based citizen spearman (see
  [`units/infantry_spearman_neodamodes.md`](units/infantry_spearman_neodamodes.md)).
- Stone walls: unbuildable (see Buildings); the wall templates keep the
  standard Greek sizes.
- All other spart variants of shared units (the Perioikoi hoplites and
  cavalry, the Helot skirmishers, the Surgeon healer, women, traders,
  the ships, the oxybeles/ram) are identity-only overrides of the
  generic templates — no further stat differences.

## Non-gameplay

- Culture `hele` (shared Hellenic music set, emblem), 15 AI names, the
  skirmish replacements (the house; the wall templates are replaced with
  empty entries — map scripts place no walls for spart) and the
  spart-specific unit names (Perioikoi Hoplite/Cavalryman, Helot
  Skirmisher, Greek Allied Cavalry, Neodamodes Hoplite, Spartan Hoplite,
  Spartan Olympic Hoplite, Skiritai Commando, Surgeon) are cosmetic
  only. The player template adds the `phalanx` formation (no
  `syntagma`). The civs.json bonus descriptions are partially stale:
  "Ritualistic Exercise" has no implementing tech at all, and "Agoge"
  describes a −10% attack-time effect while the actual `agoge` tech
  gives +25% health (and is itself unreachable).
