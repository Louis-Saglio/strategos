# champion_healer

Germanic-specific unit of 0 A.D. 0.28.0 — only the germans can train it. See `docs/game_description/germ/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/germ/champion_healer` (full germ template chain).

## Guide

The Seeress is germ's champion healer, trained at the temple only from the City phase for 100 food, 50 wood and 100 metal (20 s, 1 pop) — the metal makes her a premium support unit to field a few of with the main army rather than mass. She heals Humans within 20 m for 10 HP every 2 s (the citizen priest heals 5 HP per 2 s within 12 m), but has only 200 HP and 2/4/20 hack/pierce/crush armor with no damaging attack, so she must stay behind the line. Her value is in her auras: Prophecy of Death takes 2 HP/s from every enemy Human within 15 m (units normally have 0 health regeneration, so this is pure damage — it finishes 25-HP civilians in about 13 s and wears down any enemy army fighting near her), and Sacrificial Rites gives your own Humans within 30 m −20% experience needed to rank up. The third aura, Human Sacrifice, is advertised as unlocked by Grove of Fetters (temple, City, 600 wood + 300 metal) but never activates in 0.28.0, because it waits for a technology named `healer_aura` that does not exist; Grove of Fetters only gives Healers (priests and Seeresses) +50% maximum health, i.e. a 300 HP Seeress.

## Basic stats

- **Generic name:** Seeress
- **Specific name:** Vǫlva
- **Health:** 200 HP
- **Armor:** 2 hack / 4 pierce / 20 crush
- **Attack:** Capture — strength 5 — range 4 m — repeat 1 s — restricted Field Palisade Wall
- **Speed:** walk 9 m/s, run 15.03 m/s
- **Vision:** 60 m
- **Cost:** 100 food, 50 wood, 100 metal
- **Build time:** 20 s
- **Population:** 1
- **Heal:** 10 HP per 2 s, range 20 m
- **Requirements:** phase_city
- **Auras:** units/germ_seer_1 units/germ_seer_2 units/germ_seer_1_buff
- **Loot:** 10 food, 5 wood, 10 metal, 150 xp
- **Classes:** Unit Organic ConquestCritical Human
- **Visible classes:** Champion Healer

## Trained by

- **germ** — `units/germ/champion_healer` (temple)
