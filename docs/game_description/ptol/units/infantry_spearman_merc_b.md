# infantry_spearman_merc_b

Ptolemaic-specific unit of 0 A.D. 0.28.0 — only the ptolemies can train it. See `docs/game_description/ptol/units/README.md` for the method; shared units are documented in `docs/game_description/generic/units/`.

Stats resolved from `simulation/templates/units/ptol/infantry_spearman_merc_b` (full ptol template chain).

## Guide

The Mercenary Thureos Spearman (Thureophóros Misthophóros) is the Ptolemaic
mercenary spearman — the only ptol-exclusive mercenary among the four the
civilisation can hire. Like all mercenaries it is **paid in metal** (60
metal, zero food/wood/stone), trains fast (7 s), hits +10% harder than a
citizen spearman (4.95 + 4.4 vs 4.5 + 4), **cannot gather** (the mercenary
mixin disables ResourceGatherer), carries the `Mercenary` visible class and
auto-promotes to Advanced at 0 XP. The hoplite mixin also gives it the
phalanx formation. It is hired at the mercenary camp and the military
colony from the Town phase — the cheapest metal-only spearman line in the
game — and it is one of the two units (with the mercenary swordsman) that
can build the Ptolemaic special buildings (lighthouse, library, Temple of
Isis), so you need one on hand to plant those.

## Basic stats

- **Generic name:** Mercenary Thureos Spearman
- **Health:** 100 HP
- **Armor:** 3 hack / 3 pierce / 15 crush
- **Attack:** Capture — strength 2.5 — range 4 m — repeat 1 s — restricted Field Palisade Wall
- **Attack:** Melee "Spear" — damage 4.95 hack + 4.4 pierce — range 4 m — prepare 0.5 s — repeat 1 s — bonus 2.5× vs Cavalry — preferred Unit+!Ship
- **Speed:** walk 9.5 m/s, run 15.86 m/s
- **Vision:** 80 m
- **Cost:** 60 metal
- **Build time:** 7 s
- **Population:** 1
- **Classes:** Unit Organic ConquestCritical Human CitizenSoldier
- **Visible classes:** Builder Citizen Worker Soldier Infantry Melee Spearman Mercenary
- **Rank:** Basic

## Ranks

### Advanced — `units/{civ}/infantry_spearman_merc_a` (Mercenary Thureos Spearman)
Requires 100 XP.
- Health: ×1.25 → 125 HP
- Melee attack damage: ×1.1 → 5.44 hack + 4.84 pierce
- Capture strength: +0.7 → 3.2
- Build time: ×1.2 → 8.4 s
- Gather base speed: ×0.7 → 0.7
- Loot: ×1.2

### Elite — `units/{civ}/infantry_spearman_merc_e`
Requires 100 XP.
- Health: ×1.25 (total ×1.56) → 156.25 HP
- Melee attack damage: ×1.1 (total ×1.21) → 5.99 hack + 5.32 pierce
- Capture strength: +0.8 (total +1.5) → 4
- Build time: ×1.2 (total ×1.44) → 10.08 s
- Gather base speed: ×0.7 (total ×0.49) → 0.49
- Loot: ×1.2 (total ×1.44)

- Note: mercenary variants promote at 0 XP (the auto-researched `upgrade_rank_advanced_mercenary` tech replaces RequiredXp with 0).

## Trained by

- **ptol** — `units/ptol/infantry_spearman_merc_b` (mercenary_camp, military_colony)

