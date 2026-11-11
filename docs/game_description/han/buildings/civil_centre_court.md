# civil_centre_court

Han-specific building of 0 A.D. 0.28.0 — only the han can build it. See `docs/game_description/han/buildings/README.md` for the method; shared buildings are documented in `docs/game_description/generic/buildings/`.

Stats resolved from `simulation/templates/structures/han/civil_centre_court` (full han template chain).

## Guide

The Imperial Court (Cháotíng) is not built from scratch but upgraded from han's civil centre: in the City phase it costs 300 wood and 300 stone and takes 40 s, one per player, and the centre cannot train while upgrading. It gains the three hero trainers (Han Xin, Liu Bang, Wei Qing — the fortress also trains them), a faster batch time (×0.6 instead of ×0.8) and a sturdier body: 4500 HP, 3750 capture points, 30 garrison slots, +30 population (instead of +20) and the civil centre's arrows (6 plus 1 per garrisoned Soldier). Since the fortress costs 300 wood and 600 stone generically, the Court is the cheaper route to heroes while also hardening the home base. It stays a territory root (140 m, weight 10000) and still trains civilians, spearmen, crossbowmen and cavalry swordsmen.

## Basic stats

- **Generic name:** Imperial Court
- **Specific name:** Cháotíng
- **Health:** 4500 HP
- **Armor:** 29 hack / 35 pierce / 3 crush
- **Attack:** Ranged "Bow" — damage 8 pierce — range 60 m — prepare 0.4 s — repeat 4 s — spread 2 — preferred Human
- **Attack:** Arrows — default 6 arrow(s), +1 per garrisoned Soldier, max ∞
- **Vision:** 90 m
- **Cost:** 300 wood, 300 stone, 250 metal
- **Build time:** 500 s
- **Population bonus:** +30
- **Territory influence:** radius 140 m, weight 10000, territory root
- **Garrison:** 30 slots (+1/s heal) — accepts Support Infantry Cavalry Minister
- **Capture points:** 3750
- **Build territory:** own neutral
- **Placement:** land
- **Build category:** ImperialCourt (one per player)
- **Build distance:** min 200 m from CivilCentre
- **Requirements:** phase_city
- **Trains:** units/{native}/support_civilian units/{civ}/infantry_spearman_b units/{civ}/infantry_crossbowman_b units/{civ}/cavalry_swordsman_b units/{civ}/hero_han_xin_horse units/{civ}/hero_liu_bang_horse units/{civ}/hero_wei_qing_chariot
- **Train batch time:** ×0.6
- **Researches:** phase_city_generic unlock_shared_los
- **Loot:** 60 wood, 60 stone, 50 metal
- **Classes:** Structure ConquestCritical CivCentre CivSpecific
- **Visible classes:** Civic Defensive CivilCentre ImperialCourt City
- **Footprint:** Square 43 m × 35 m (height 8 m)
- **Obstruction:** Static 41 m × 33 m

## Built by

- **han** — `structures/han/civil_centre_court` (upgrade of `structures/han/civil_centre`) — not placeable directly
