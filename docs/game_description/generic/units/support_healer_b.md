# support_healer_b

Trained by **15** civilisations. Generic (non-civ-specific) unit of 0 A.D. 0.28.0 — see `docs/game_description/generic/units/README.md` for the method.

Generic stats resolved from the shared template `simulation/templates/template_unit_support_healer` (deepest template common to all civilisation variants; variants may override, see below).

## Guide

The Healer is a non-combat support unit that restores health to nearby Human units (5 HP every 2 s at 12 m range), letting an army recover after fights without retreating wounded units home. It has no attack and only 85 HP with 1/1/1 armor, so it must be kept behind the fighting line. Train a few from the temple once Town phase is reached (it requires `phase_town`) for 100 food / 30 metal each; the metal cost is a premium resource, so healers are an investment rather than a unit to mass. They promote with XP to gain heal strength and range.

## Basic stats

- **Generic name:** Healer
- **Health:** 85 HP
- **Armor:** 1 hack / 1 pierce / 1 crush
- **Speed:** walk 9 m/s, run 15.03 m/s
- **Vision:** 30 m
- **Cost:** 100 food, 30 metal
- **Build time:** 15 s
- **Population:** 1
- **Classes:** Unit Organic Human
- **Visible classes:** Support Healer
- **Rank:** Basic

## Civilisations that can train it

- **athen** — `units/athen/support_healer_b` (temple)
- **brit** — `units/brit/support_healer_b` (temple)
- **cart** — `units/cart/support_healer_b` (temple)
- **gaul** — `units/gaul/support_healer_b` (temple)
- **germ** — `units/germ/support_healer_b` (temple)
- **han** — `units/han/support_healer_b` (temple)
- **iber** — `units/iber/support_healer_b` (temple)
- **kush** — `units/kush/support_healer_b` (temple)
- **mace** — `units/mace/support_healer_b` (temple)
- **maur** — `units/maur/support_healer_b` (temple)
- **pers** — `units/pers/support_healer_b` (temple)
- **ptol** — `units/ptol/support_healer_b` (temple, temple_2)
- **rome** — `units/rome/support_healer_b` (temple, temple_vesta)
- **sele** — `units/sele/support_healer_b` (temple)
- **spart** — `units/spart/support_healer_b` (temple)

## Ranks

### Advanced — `units/{civ}/support_healer_a`
Requires 150 XP.
- Health: ×1.25 → 106.25 HP
- Build time: ×1.2 → 18 s
- Loot: ×1.2
- Heal range: +3 m
- Heal strength: +5

### Elite — `units/{civ}/support_healer_e`
Requires 150 XP.
- Health: ×1.25 (total ×1.56) → 132.81 HP
- Build time: ×1.2 (total ×1.44) → 21.6 s
- Loot: ×1.2 (total ×1.44)
- Heal range: +3 m (total +6 m)
- Heal strength: +5 (total +10)


