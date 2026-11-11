# Seleucid-specific buildings of 0 A.D. 0.28.0

**There are none.** Every structure the Seleucids can actually build in a
skirmish game is shared with at least one other civilisation and is
documented in `docs/game_description/generic/buildings/` (the generic
analysis found no structure type buildable by sele alone; the
sele-exclusive-seeming candidates are all vestigial — see below). The
Seleucid variants of shared buildings (footprints, trainers, the colony,
the fortress) and the vestigial templates are covered in
[`../civ.md`](../civ.md).

Vestigial sele templates, not buildable by anything (no `Builder` list
references them):

- `structures/sele/library` — the Library, shared in data with mace and
  sele, is in the `Builder` lists of **ptol units only** (and as
  absolute `structures/ptol/...` paths), so no sele unit can place it.
  Its "Center of Scholarship" aura (−15% tech costs/time) never applies
  to a sele player.
- `structures/sele/range` — the archery range, present for
  athen/mace/pers/sele/han but never referenced (archers train from the
  barracks).
- `structures/sele/tower_artillery` — the artillery tower, present for
  athen/cart/mace/ptol/rome/sele but never referenced by any builder.
