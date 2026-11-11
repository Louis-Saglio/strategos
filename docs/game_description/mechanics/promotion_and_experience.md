# Promotion and experience (XP)

How units gain experience and promote to higher ranks in 0 A.D. 0.28.0. Grounded in `binaries/data/mods/public/simulation/components/Promotion.js`, `binaries/data/mods/public/simulation/helpers/Attack.js`, `binaries/data/mods/public/simulation/components/Health.js`, `binaries/data/mods/public/simulation/components/Loot.js`, `binaries/data/mods/public/simulation/components/Heal.js`, `binaries/data/mods/public/simulation/helpers/Transform.js`, the rank technologies `binaries/data/mods/public/simulation/data/technologies/unit_advanced.json` / `unit_elite.json`, and unit templates under `binaries/data/mods/public/simulation/templates/`. All paths below are relative to the root of the 0 A.D. source reference (see `AGENTS.md`).

## The Promotion component

Units that can promote carry a `Promotion` component with three template fields (`binaries/data/mods/public/simulation/components/Promotion.js:3-14`):

- `Entity` — the template this unit promotes into (required).
- `RequiredXp` — XP needed to trigger the promotion (positive integer).
- `TrickleRate` — optional, XP gained passively per second (see below).

XP is **per entity**, not per player or per template: each entity's component holds its own `currentXp`, initialised to 0 (`Promotion.js:16-20`).

## How XP is gained

### Combat: XP proportional to damage dealt

XP is awarded per hit, proportional to the damage actually dealt — a kill is **not** required:

- When an attack lands, `AttackHelper.HandleAttackEffects` collects the attack results and credits the attacker: `cmpPromotion.IncreaseXp(targetState.xp)` (`binaries/data/mods/public/simulation/helpers/Attack.js:342-344`). The attacker is the entity that performed the attack (`binaries/data/mods/public/simulation/components/Attack.js:655`).
- The `xp` value is produced by the target's `Health.TakeDamage` (`binaries/data/mods/public/simulation/components/Health.js:188-202`):

  ```
  xp gained = target's Loot/xp × (HP actually removed / target's max HP)
  ```

  So fully destroying a target yields exactly its `Loot/xp`, spread across everyone who damaged it in proportion to the damage each dealt. Overkill damage cannot yield extra XP — only HP actually removed counts.
- The target's `Loot/xp` comes from its template `<Loot><xp>`, modified by technologies and floored (`binaries/data/mods/public/simulation/components/Loot.js:13-16`). Targets without a `Loot` component or with `xp = 0` give no XP — most structures and siege have no XP loot.

Exclusions:

- Damage ticks from active status effects (fire, poison) award no XP (`helpers/Attack.js:338-340`).
- Capture attacks award no XP — `Capturable` produces no `xp` field; only health damage does.

### Healing

Healers gain XP from healing, by the same proportional rule (`binaries/data/mods/public/simulation/components/Heal.js:226-231`):

```
xp gained = (HP healed / healed target's max HP) × healed target's Loot/xp
```

### Trickle

`TrickleRate` is passive XP per second: `ComputeTrickleRate` applies value modifications to the template value (0 when absent), and a non-zero result starts a 1-second interval timer that adds that much XP (`Promotion.js:101-130`, recomputed on `OnValueModification`). No 0.28 template sets `TrickleRate` itself, but the `structures/xp_trickle` aura ("Rigorous Training", type `garrisonedUnits`, `Promotion/TrickleRate` +1, see [`generic/auras/structures__xp_trickle.md`](../generic/auras/structures__xp_trickle.md)) does: units garrisoned in a building carrying it gain **+1 XP per second** while inside.

## Promotion trigger

On every XP gain (`Promotion.js:57-99`):

1. `currentXp += amount`. If `currentXp < RequiredXp`, done.
2. Otherwise `RequiredXp` is subtracted and the target template's *own* `Promotion/RequiredXp` is checked against the leftover; the loop repeats, so a single large XP grant can promote a unit **multiple ranks at once**. Leftover XP carries over to the new rank.
3. `Promote()` swaps the entity's template (below). A unit at 0 HP does not promote (`Promotion.js:39-44`).

`RequiredXp` is read through `ApplyValueModificationsToEntity("Promotion/RequiredXp", ...)` (`Promotion.js:22-25`), so technologies and auras can modify it.

## What a promotion actually does

Promotion is a full **template swap** via `ChangeEntityTemplate` (`Promotion.js:37-47`, `binaries/data/mods/public/simulation/helpers/Transform.js:4-172`):

- A **new entity with a new entity ID** is created from the promoted template; the old entity is destroyed (`Transform.js:7`, `Transform.js:169`). An `EntityRenamed` message is broadcast and the AI receives an `EntityRenamed` event (`binaries/data/mods/public/simulation/components/AIInterface.js:188-192`) — a bot must remap any stored entity ID when this fires.
- **Health percentage** is preserved: new HP = new max HP × old HP fraction (`Transform.js:80-86`). Since the rank tech raises max health ×1.25, promotion heals the unit in absolute terms.
- Carried over: leftover XP (`Transform.js:88-95`), carried resources, ownership, position/rotation, stance and order queue, guard assignments, active status effects, control groups, and units garrisoned *inside* the promoted entity (`Transform.js:138`, `Transform.js:283-302`).
- XP that arrives for the old entity while it awaits destruction is forwarded to the new one (`Promotion.js:57-67`).

## Ranks and templates

Rank is an `Identity/Rank` value (`Basic` | `Advanced` | `Elite`, `binaries/data/mods/public/simulation/components/Identity.js:102-106`). The rank string is appended to the entity's class list (`binaries/data/mods/public/globalscripts/Templates.js:50-51`), so an Advanced unit has the class `Advanced`.

Standard citizen-soldier ladder, e.g. the gaul spearman (`binaries/data/mods/public/simulation/templates/units/gaul/infantry_spearman_b.xml`, `_a.xml`, `_e.xml`):

- `_b` → `Promotion/Entity` = `_a`; `_a` sets `Identity/Rank = Advanced` and points to `_e`; `_e` sets `Rank = Elite` and disables `Promotion` (`<Promotion disable=""/>`).
- The `_a`/`_e` templates themselves change **only** `Identity/Rank`, the `Promotion` target and the visual actor. All stat differences come from the rank technologies (next section).

`RequiredXp` is inherited from the generic templates and is the same for each rank unless overridden:

| Template | RequiredXp per rank | Source |
|---|---|---|
| Infantry | 100 | `binaries/data/mods/public/simulation/templates/template_unit_infantry.xml:53-55` |
| Cavalry | 150 | `binaries/data/mods/public/simulation/templates/template_unit_cavalry.xml:48-50` |
| Healer | 150 | `binaries/data/mods/public/simulation/templates/template_unit_support_healer.xml:41-43` |
| Elephant | 150 | `binaries/data/mods/public/simulation/templates/template_unit_elephant.xml:20` |
| Mercenary cavalry | 300 | `binaries/data/mods/public/simulation/templates/mixins/merc_cav.xml:13-15` |

Not all ladders end at Elite. Examples of special promotions:

- athen elite spearman → champion infantry at 250 XP (`binaries/data/mods/public/simulation/templates/units/athen/infantry_spearman_e.xml:6-9`).
- Several rome elite units → champion/"First Cohort" templates at 2000 XP (e.g. `binaries/data/mods/public/simulation/templates/units/rome/infantry_spearman_e.xml:20`).

## Rank technologies: where the stat changes come from

Two technologies carry the rank bonuses; both have `"autoResearch": true` and **no requirements**, so every player researches them automatically at game start (`binaries/data/mods/public/simulation/components/TechnologyManager.js:210-217`, `TechnologyManager.js:261-271`; empty requirement lists pass `CheckTechnologyRequirements`, `TechnologyManager.js:336-340`).

- `unit_advanced` (`binaries/data/mods/public/simulation/data/technologies/unit_advanced.json`) affects classes `Advanced Unit` **and** `Elite Unit`.
- `unit_elite` (`binaries/data/mods/public/simulation/data/technologies/unit_elite.json`) affects `Elite Unit` only.

Modifications per technology (elite units get both, i.e. the multipliers stack):

| Value | unit_advanced | unit_elite |
|---|---|---|
| `Health/Max` | ×1.25 | ×1.25 |
| `Attack/Melee/Damage/*` (Melee class) | ×1.1 | ×1.1 |
| `Attack/Ranged/Projectile/Spread` (Ranged class) | ×0.8 | ×0.8 |
| `Attack/Capture/Capture` | +0.7 | +0.8 |
| `Cost/BuildTime` | ×1.2 | ×1.2 |
| `Heal/Health`, `Heal/Range` (Healer class) | +5, +3 | +5, +3 |
| `Loot/{food,wood,stone,metal,xp}` | ×1.2 | ×1.2 |
| `ResourceGatherer/BaseSpeed` | ×0.7 | ×0.7 |

Consequences a bot should note:

- Elite vs basic: health ×1.5625, melee damage ×1.21, gather speed ×0.49. Promotion makes units *worse* at gathering.
- `Cost/BuildTime` ×1.2 matters when higher-rank units are trained directly (see below): they take longer to train.
- `Loot/xp` ×1.2 means killing advanced/elite enemies yields more XP to your units.

`GetUpgradedTemplate` (`helpers/Transform.js:309-326`) walks the promotion chain and skips any rank whose tech-modified `RequiredXp` is ≤ 0; the `Trainer` uses it so that if a technology reduces a rank's required XP to 0, buildings train the higher-rank template directly (`binaries/data/mods/public/simulation/components/Trainer.js:557`). No vanilla 0.28 technology does this, but the mechanism exists.

## Garrisoned units

- Units garrisoned in defensive structures do **not** earn XP from the structure's fire: garrisoned-soldier arrows are performed by the building entity itself (`binaries/data/mods/public/simulation/components/BuildingAI.js:291`, `BuildingAI.js:384`), so any XP would go to the building, which has no `Promotion` component. Garrisoning archers in a tower boosts its arrow count but trains nobody.
- If a garrisoned unit does promote, the garrison link is preserved: on `EntityRenamed` the old entity is ungarrisoned and the new entity immediately re-garrisons into the same holder (`binaries/data/mods/public/simulation/components/Garrisonable.js:162-172`).

## Bot API surface

- Entity state exposes the promotion progress as `promotion: { curr, req }` (`binaries/data/mods/public/simulation/components/GuiInterface.js:556-561`); entities without the component have no such field.
- An `ExperienceChanged` message is posted on every XP change (`Promotion.js:98`).
- Promotion arrives as an `EntityRenamed` event with `entity` (old ID) and `newentity` (new ID).
