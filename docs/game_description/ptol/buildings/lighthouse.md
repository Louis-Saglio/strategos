# lighthouse

Ptolemaic-specific building of 0 A.D. 0.28.0 — only the ptolemies can build it. See `docs/game_description/ptol/buildings/README.md` for the method; shared buildings are documented in `docs/game_description/generic/buildings/`.

Stats resolved from `simulation/templates/structures/ptol/lighthouse` (full ptol template chain).

## Guide

The Lighthouse (Pharos) is the Ptolemaic super-watchtower: a City-phase
shore building with the game's largest vision radius — **325 m**, over
four times a civic centre's — placed in **own, ally or neutral
territory** (any coastline), so it lights up half the map from a forward
beachhead. It is a pure scouting investment: 200 stone + 200 metal, 2000
HP, no trainer, no researcher, no territory influence, and it never
decays (no territory decay even outside owned land). One per player
(`Lighthouse` limit). It is built only by the Ptolemaic women and the
mercenary infantry (their builder lists carry `lighthouse`, `library` and
`temple_2` — no other unit can build them), so planting one requires
walking a woman or a mercenary to the chosen shore. For a bot it is a
map-control and raid-warning tool: place it where you need to watch an
enemy coastline or a contested strait.

## Basic stats

- **Generic name:** Lighthouse
- **Health:** 2000 HP
- **Armor:** 24 hack / 30 pierce / 3 crush
- **Cost:** 200 stone, 200 metal
- **Build time:** 200 s
- **Garrison:** 5 slots
- **Vision:** 325 m
- **Capture points:** 500
- **Build territory:** own ally neutral
- **Build category:** Lighthouse (one per player)
- **Placement:** shore
- **Requirements:** phase_city
- **Classes:** Structure CivSpecific
- **Visible classes:** City Lighthouse
- **Footprint:** Circle r 14 m (height 8 m)
- **Obstruction:** Static 20 m × 25 m

## Built by

- **ptol** — `structures/ptol/lighthouse` (ptol women and mercenary infantry; construct directly otherwise)

