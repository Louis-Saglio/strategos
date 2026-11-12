# tools/

Development tooling for Strategos. Not part of the bot.

| Tool | What it does |
|---|---|
| `run.sh` (`run.py`) | run batches of headless matches on every available host |
| `harness/` | the `strategos-harness` mod mounted in every match: game settings, statistics, map snapshots, time limit |
| `hosts.json` | match hosts: ssh name, slot count, determinism verification, calibration |
| `analyze.py` | one-line-per-match summary of a batch, optional end-of-game metrics |
| `compare.py` | paired comparison of two batches run on the same matches |
| `viz.py` + `vizmod/` | replay a recorded match in the GUI and capture camera-directed frames |
| `frames.py` | contact sheets / time-lapse from `viz.py` frames |
| `mapview.py` | top-down map pictures from the harness map snapshots (no GPU) |
| `check_bot.py` | bot code rules: JS parses, no comments |
| `install-local.sh` | install a commit's `bot/` into the local 0 A.D. |
| `gamedata/` | game data loader and per-civ doc generator |

## Running matches

### run.sh — headless batches

```sh
tools/run.sh -l MIN [options] OUTDIR SEED...   # SEED: N, A-B, TAG=N
tools/run.sh -h                                # full usage
```

Every match runs the documented `pyrogenesis` command line
(`docs/pyrogenesis_cli.md` §3) in its own HOME, under `nice -n 10` /
`ionice -c 3`, observer, `seed = aiseed`. Players are given in order with
`-p AI[/DIFF[/BEHAVIOR]]:CIV[:TEAM]` (default `strategos:athen:1` vs
`petra/3:rome:2`); a civ `*`, a map list `-M a,b` or a biome `*` picks one
per seed with a fixed hash of the seed, so a seed range samples civs, maps
and biomes reproducibly. Any number of players and teams; `--matches
FILE.jsonl` runs an explicit list of match specs instead.

Duration (AGENTS.md, "Game duration"): `-l MIN` (in-game limit) is
mandatory and must be > 0 — pick the shortest one that answers the
question. The wall-clock cap per match defaults to `60 + 300·MIN/20`
seconds, i.e. a game running slower than 20 turns/s (≈3× slower than the
slowest calibrated slot) is killed; `-t` above that prints a warning.
Before starting, the runner prints the batch's worst-case duration from
the calibrated host throughput; at the end it reports every game killed
by the cap as a failure, and `analyze.py` labels them `killed`.

```sh
tools/run.sh -l 10 tmp/probe 7 23 51                                 # default 1v1, 10 in-game min
tools/run.sh -l 15 -p strategos:*:1 -p petra/5:*:2 -b '*' tmp/mix 1-40  # civs and biomes sampled per seed
tools/run.sh -l 20 -p strategos:mace:1 -p strategos:pers:1 -p petra/5:rome:2 -p petra/5:cart:2 \
    -P river tmp/2v2 1-10                                            # team game
tools/run.sh -l 20 -p strategos:athen:1 -p brennus:gaul:2 tmp/vs-brennus 1-20
tools/run.sh -l 15 -m strategos=tmp/variant/bot tmp/ab/variant 1-40  # A/B: a modified copy
```

Mods: `strategos` is this repo's `bot/` (`-m strategos=DIR` for a copy),
`brennus` is `~/Work/brennus` at a commit (`-m brennus=DIR@REV`, default
`HEAD`) with its own `maps/` scripts removed so only its AI is mounted;
Petra is built in. Every mod is snapshotted once into `OUTDIR/mods/` and
its JS syntax-checked, so editing sources during a batch cannot leak into
it; `OUTDIR/batch.json` records provenance (commits, dirty flags, content
hashes, build, hosts, slots, every match spec).

Hosts (`tools/hosts.json`): `local` plus ssh hosts. A remote host is used
only if it is reachable, runs the same `0ad`/`0ad-data` versions
(`pacman` or `dpkg`), is on mains power when `requires_ac`, and is
`verified` — its games proved bit-identical to boobynator's. Each slot is a
worker pulling from one queue; a match whose ssh transport fails is
requeued (a host failing twice is dropped, leftovers run locally).

```sh
tools/run.sh --verify-host vps2 -l 30 tmp/verify 1-3     # bit-identical check, marks it verified
tools/run.sh --calibrate local 8,12,16,24 -l 45 -p petra/5:athen:1 -p petra/5:rome:2 tmp/cal
```

`--calibrate` runs K matches at once for each K and keeps the K with the
highest total throughput (turns per wall second summed over the games) as
the host's slot count.

#### Game settings

Every setting is explicit (AGENTS.md, "Every game setting is explicit").
The defaults of a batch:

| Setting | Option | Default |
|---|---|---|
| map | `-M` | `random/mainland` |
| map size | `-s` | 192 tiles ("Small") |
| biome | `-b` | `generic/temperate` (`*` = one generic biome per seed) |
| player placement | `-P` | `circle` |
| victory conditions | `-V` (repeatable) | `conquest_civic_centers` |
| map and AI seed | `SEED` | the seed |
| players, civs, teams, AI difficulty/behaviour | `-p` | see above |
| `PopulationCapType` / `PopulationCap` | `-S` | `player` / 300 |
| `StartingResources` | `-S` | 300 |
| `Ceasefire` (minutes) | `-S` | 0 |
| `ExploreMap` / `RevealMap` / `AllyView` | `-S` | false / false / false |
| `DisableTreasures` | `-S` | **true** |
| `DisableSpies` | `-S` | false |
| `Nomad` | `-S` | false |
| `LockTeams` / `LastManStanding` | `-S` | false / false |
| `CheatsEnabled` | `-S` | false (the public autostart turns it on) |
| `WonderDuration` / `RelicCount` / `RelicDuration` | `-S` | 10 / 2 / 10 (kept only with their victory condition) |
| `RegicideGarrison` | `-S` | false (kept only with regicide) |
| `gameSpeed` | `-S` | 1 |

`-S KEY=VALUE` takes the engine's own setting name and a JSON value
(`-S PopulationCap=200`, `-S PopulationCapType=team`, `-S
DisableTreasures=false`); an unknown key or a value of the wrong type is
refused. The `-S` settings reach the engine through
`harness/autostart/harness_settings.js` (see below). After each match,
`run.py` reads the settings the engine wrote into the replay
(`commands.txt`) and compares them with the spec: a setting the engine did
not apply as asked (e.g. last man standing with locked teams, which the
game refuses) is a FAILURE at the end of the batch; a setting the replay
carries that the batch did not choose (a map-specific option such as
`Daytime` or `TriggerDifficulty`) is a WARNING, to be added to
`GAME_SETTINGS`. `compare.py` warns when paired matches differ in
anything but their mods (settings, limit, map, players).

Per match, in `OUTDIR/TAG/`: `stdout.log` (engine output: harness lines,
bot telemetry, statistics JSON), `result.json` (spec, host, exit code,
wall seconds, turns, `applied` settings, `settings_mismatch`,
`settings_uncontrolled`), `home/` (engine logs, the replay; cache and mod
copies dropped). The batch ends with an `analyze.py` summary. Run batches
as background jobs with a completion notification.

### harness/ — the strategos-harness mod

`maps/scripts/NonVisualTrigger.js` replaces the public script in every
headless match (mounted last). It prints `[HARNESS] start` (map size in
metres, players with civ and engine team — 0-based, -1 for none),
`[HARNESS] map` snapshots of every player's units and buildings (every
30 s by default, `--map-interval` ms, 0 = off), `[HARNESS] eco` every
minute (each player's cumulative resources gathered and population, read
from the statistics tracker) and the per-player
statistics JSON at game end. At the time limit (`-l` minutes) it prints `[HARNESS] time limit reached` and marks every active
player as won, so the game ends cleanly (statistics, replay metadata)
without favouring a side; `analyze.py` reports it as a timeout. Nothing
else is changed before the limit.

`autostart/harness_settings.js` applies `-harness-settings=JSON` (the
`-S` settings) on top of the public autostart command line. The engine
loads every file of `autostart/` in name order, so it wraps the public
`parseCmdLineArgs` without copying it, and sets each setting as the game
setup screen would; an unknown key aborts the game start.

### analyze.py, compare.py

```sh
tools/analyze.py OUTDIR [TAG...] [--metrics] [--player N] [--at MIN] [--tsv F] [--det A,B]
tools/compare.py BASE_DIR VARIANT_DIR [TAG...] [--player N] [--at MIN]
```

`analyze.py`: per match the outcome (`T<n> won`, `P<n> won`, `timeout`,
`none`), each player's `ai/civ:team=W|L|T`, map/biome, game minutes, error
lines, failed AI creation, host, exit, wall seconds, turns/s and a hash of
the statistics (equal hash = identical game). `--metrics` adds player N's
end-of-game resources gathered (per resource, total, and `gath_ratio`: the
total over the best other player's total), units trained/lost/killed,
kill/loss value ratio, buildings, population and map control. `--at MIN`
reads the gathered resources, total, ratio and population from the
harness eco line at minute MIN instead, so one batch can be judged at
several minutes.

`compare.py`: pairs two batches by tag; identical-game count, outcome
transitions of player N's side, and for each metric the means, the mean
paired delta and the paired t-test p-value.

## Seeing a match

### viz.py + vizmod/ — visual replay with a camera director

```sh
tools/viz.py OUTDIR/TAG                                   # default plan, hidden window
tools/viz.py OUTDIR/TAG --every 10 --from 8 --to 14 -T fight,army:1
tools/viz.py OUTDIR/TAG --every 0 --shot 12.5:ent:4242@20 --shot 13:area:300,420,60
tools/viz.py OUTDIR/TAG --show --hud --every 60          # watch it live
```

Replays the match's own `commands.txt` with `-replay-visual`, mounting the
batch's `mods/` snapshots in the recorded order (so the harness, and its
time limit, are part of the replay). The camera is driven from inside the
game by the `strategos-viz` GUI mod (`vizmod/`): no synthetic input, no
window focus. Every `--every` game seconds the director pauses the
simulation, frames each target, and prints `[VIZ] shot {...}` once the
frame is rendered; `viz.py` grabs the window with `grim -T`. All frames of
a group show the same instant; `frames.jsonl` records where the camera
looked. The run ends after the last group, including when the replay stops
at its last recorded turn.

Targets (`-T`): `overview`, `base:P`, `army:P`, `fight`, `ent:ID` (ids
from the `[HARNESS] map` snapshots), `xy:X,Z`, `area:X,Z,R`; camera suffix
`@R[/PITCH[/YAW]]` on any target. Coordinates are world metres. By default
the window lives on a private Hyprland headless output (`BRENNUS-VIZ`, the
name shared with the brennus tool so Omarchy remembers a single output);
`--show` puts it on the current workspace. One viz at a time, not during a
batch.

### frames.py — contact sheets and time-lapse

```sh
tools/frames.py OUTDIR/TAG/viz [--rows 10] [--thumb 400] [--from MIN] [--to MIN]
tools/frames.py OUTDIR/TAG/viz --targets overview --video overview.mp4
```

One table per page (row = instant, column = target), top-down frames
gridded in world metres.

### mapview.py — top-down maps from the snapshots

```sh
tools/mapview.py OUTDIR/TAG/stdout.log [-o mapview.png] [--tracks tracks.png] [--video clip.mp4]
```

Renders the `[HARNESS] map` snapshots (one colour per player, z upwards
like a top-down viz frame): exact, no GPU, scales to whole batches.

## Bot code

```sh
tools/check_bot.py [MOD_DIR]        # default bot/
tools/install-local.sh [COMMIT]     # default HEAD
```

`check_bot.py` fails when a bot JS file does not parse or contains a
comment. `install-local.sh` copies a commit's `bot/` to
`~/.local/share/0ad/mods/strategos` (recording the commit) and enables the
mod, so Strategos appears in the game setup's AI list; it refuses while
the game is running.

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
