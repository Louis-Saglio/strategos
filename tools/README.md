# tools/

Development tooling for Strategos. Not part of the bot.

## Game data ↔ docs (`tools/gamedata/`)

Works against the 0 A.D. source reference (the v0.28.0 checkout, default
`~/Work/0ad`, override with `ZEROAD_SRC`).

### zad.py — game data loader

Library used by the generators (and usable from any analysis script:
`sys.path.insert(0, "tools/gamedata"); import zad`).

- `zad.template(name)` — the fully merged entity template, built with the
  engine's own rules: `CParamNode::ApplyLayer`
  (`source/simulation2/system/ParamNode.cpp`: `disable`, `replace`,
  `filtered`, `merge`, `op="add|mul|mul_round"`, `datatype="tokens"` with
  `-token` removal) and `CTemplateLoader::LoadTemplateFile`
  (`source/ps/TemplateLoader.cpp`: `A|B` parents, lookup in
  `special/filter/`, `mixins/`, then the root). Arithmetic is
  `CFixed_15_16` fixed point (`zad.fx`, `zad.fx_str`). Returns a node:
  `.text("Health/Max")`, `.tokens("Identity/Classes")`, `.get(path)`.
- `zad.tech(name)`, `zad.aura(name)`, `zad.civ_data(civ)`, `zad.civs()` —
  technology / aura / civ JSON.
- `zad.ownership(civ)` — what a civ can obtain in a skirmish game: closure
  from its `StartEntities` and skirmish-map replacements over `Trainer`,
  `Builder` and `Upgrade` lists (`{civ}` = owner civ, `{native}` = the
  producing entity's `Identity/Civ`, entries kept only if the template
  exists). `.trained`, `.built`, `.upgraded` map each entity to its
  producers; `.techs()` resolves `Researcher` lists like
  `Researcher.js` (`{civ}` → civ tech if it exists, else `generic`), adds
  pair choices and auto-researched techs, and applies the civ gates of the
  tech requirements (`civ`, `notciv`, `all`, `any`); `.auras()` collects
  the `Auras` tokens of every owned entity's template chain and the
  player template.

### gen_civ.py — per-civ entity docs

```sh
tools/gamedata/gen_civ.py [--out DIR] [--guides-from DIR] [--no-readme] CIV...
```

Writes `docs/game_description/<civ>/{units,buildings,technologies,auras}/`
for every entity that only that civ can obtain, plus each folder's
`README.md` index. Unit and building files get a `## Guide` section: an
existing file keeps its paragraph, a new one gets `TODO` to write by hand.
`civ.md` is handwritten and never generated.

The athen, brit, cart, gaul, iber, maur, pers, ptol, rome, sele and spart
folders were written before this generator and contain hand additions
(vestigial entities, trailing notes, annotated producer lists) that a
regeneration would drop; regenerate them into a scratch `--out` and diff
before overwriting. The `generic/` files have no generator.
