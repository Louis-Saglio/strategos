# pair_unlock_champions_sele

Seleucid-specific technology of 0 A.D. 0.28.0 — only the seleucids can get it. See `docs/game_description/sele/technologies/README.md` for the method; shared technologies are documented in `docs/game_description/generic/technologies/`.

Data file: `simulation/data/technologies/pair_unlock_champions_sele.json`.

## Basic stats

- **Name:** Traditional Army vs Reform Army
- **Top:** `traditional_army_sele`
- **Bottom:** `reformed_army_sele`
- **Requirements:** `{"civ": "sele"}`

## Seleucids

- barracks

Note: a **pair tech** — not a researchable technology itself but a UI
grouping: the Researcher returns it as a `{pair, top, bottom}` object, so
the barracks presents the two army doctrines ("Traditional Army" and
"Reform Army") as one paired City-phase slot. The two halves are
**mutually exclusive, engine-enforced**: each half's template carries a
`"pair"` back-reference to this tech, and `CanResearch` refuses a half
unless the pair tech itself can still be researched — the pair is blocked
while either half is queued (in progress), and it is auto-marked
researched the moment either half completes (`UpdateAutoResearch`). So
only one doctrine can ever be researched, and only its champion infantry
becomes trainable; the other champion template's requirement can never
be met.
