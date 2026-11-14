# tools/

Development tooling for Strategos. Not part of the bot.

| Tool | What it does |
|---|---|
| `run.sh` (`run.py`) | run batches of headless matches on every available host |
| `harness/` | the `strategos-harness` mod mounted in every match: game settings, statistics, map snapshots, standings, resignation, time limit |
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
`petra/3:rome:2`). Any number of players and teams; `--matches FILE.jsonl`
runs an explicit list of match specs instead (tag, seed and players
required; whatever else a line leaves out is drawn as for a seed).

Sampling: every choice of a batch is one value or a set from which each
seed draws one with a fixed hash of the seed, so a seed range covers the
set reproducibly and two batches on the same seeds play the same matches.

| Choice | One value | A set drawn per seed |
|---|---|---|
| civ | `-p strategos:athen:1` | `-p 'strategos:*:1'` (all 15) |
| map | `-M random/mainland` | `-M a,b`, `-M '*'` (the 82 random maps, demo maps excluded), `-M '*land'` (67), `-M '*naval'` (15, by the map's `naval` keyword) |
| biome | `-b generic/temperate` | `-b a,b`, `-b '*'` (the biomes the drawn map supports) |
| size | `-s 192` | `-s 128,192,256` |
| placement | `-P circle` | `-P circle,river`, `-P '*'` (the placements the drawn map supports) |
| victory | `-V conquest -V wonder` (one combination) | `-V conquest,conquest_units,conquest+wonder` (alternatives, `+` joins a combination) |
| setting | `-S PopulationCap=200` | `-S PopulationCap=150,200,300` |
| player slot | the `-p` order | `--rotate` (the `-p` list rotated; team and civ follow the player) |

A draw outside the scope of the goal (`SCOPE` in `run.py`: fewer than
128 / 192 / 256 / 320 tiles for 2 / 3-4 / 5-6 / 7-8 players, fewer than
100 population a player once a team or world cap is shared out, last man
standing with locked teams, a nomad start with treasures disabled and
fewer than 300 starting resources — the treasures the map generator puts
beside the units are then the only way to afford a civic centre) is
redrawn; a combination that cannot be
redrawn (nothing sampled) runs with a warning. Before the batch starts the
runner prints the draw counts of every choice that took more than one
value (`run: draws size: 128 18, 192 26, ...`): hash picks are uneven on
short ranges, so read them before trusting a per-value result.

Each map gets only what it supports, read from its `.json` in the 0 A.D.
source checkout (`ZEROAD_SRC`, default `~/Work/0ad`) or in `scenarios/`: a
biome only when the map declares `SupportedBiomes` (47 random maps have
none), a placement only when it declares `PlayerPlacements` (57 have none
and refuse one), and its own options — `Daytime` (danubius, polar_sea),
`Landscape` (unknown), `SeaLevelRiseTime` (extinct_volcano),
`TriggerDifficulty` (jebel_barkal), `waterLevel` (flood). The engine would
pick `Daytime` and `Landscape` at random, so they are drawn per seed; the
others take the map's default; `-S` overrides any of them for the maps
that have the option. A biome or placement the map does not offer is an
error, not a fallback.

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
tools/run.sh -l 30 -p 'strategos:*:1' -p 'petra/5:*:2' -M '*' -b '*' -P '*' tmp/maps 1-164   # every map
tools/run.sh -l 30 -p 'strategos:*:1' -p 'petra/5:*:2' -b '*' -P '*' --rotate -s 128,192,256 \
    -V conquest,conquest_units,conquest+wonder -S PopulationCap=150,200,300 \
    -S StartingResources=300,1000,3000 tmp/settings 1-64                                    # settings sampled
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
| biome | `-b` | `generic/temperate` (none on a map without biomes) |
| player placement | `-P` | `circle` (none on a map without placements) |
| victory conditions | `-V` (repeatable) | `conquest` |
| `Daytime` / `Landscape` | `-S` | one of the map's per seed (maps that have them) |
| `SeaLevelRiseTime` / `TriggerDifficulty` / `waterLevel` | `-S` | the map's default (maps that have them) |
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
carries that the batch did not choose is a WARNING, to be added to
`GAME_SETTINGS` or `MAP_OPTIONS`. `compare.py` warns when paired matches differ in
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
from the statistics tracker), `[HARNESS] kills` every 30 s when something
died (`{"t","k":[[t,victimOwner,victimKind,x,z,killerOwner,killerKind],...]}`,
kinds as in the map snapshots: 0 other, 1 worker, 2 soldier, 3 cavalry,
4 siege, 5 structure, 6 civic centre, 7 ship; a killer of kind 5 or 6 is
defensive fire; read by wrapping `Health.prototype.KilledBy`, which leaves
the game identical: 64 of 64 games bit-identical with and without it) and
`[HARNESS] refused` for every construction command the engine did not
carry out (`{"t","p","template","x","z","why"}` with the message of the
failed placement check — terrain, obstruction, territory, distance — or
`{"t","p","why","detail"}` with `why` = `limit` (entity limit, `detail`
the category), `requirement` (`detail` the template) or `cost`; the AI
gets no such feedback from the engine; read by wrapping
`BuildRestrictions.prototype.CheckPlacement`,
`EntityLimits.prototype.AllowedToBuild`,
`TechnologyManager.prototype.CanProduce` and
`Player.prototype.TrySubtractResources`, which return exactly as before:
139 of 246 games bit-identical to games of the previous harness, the
others differing by the bot) and
the per-player statistics JSON at game end. At the time limit (`-l` minutes) it prints `[HARNESS] time limit reached` and marks every active
player as won, so the game ends cleanly (statistics, replay metadata)
without favouring a side; `analyze.py` reports it as a timeout, or as
`T<n> ahead` when one side's assets are at least 3x every other side's
(see below).

Every 30 s it prints `[HARNESS] standing {"t","teams":{"<key>":{"players",
"assets","military"}}}`: per side (engine team, `p<id>` for a player
without team) the summed resource cost of every unit and structure owned
(foundations at their built fraction) plus the resource stock; `military`
is the units with Soldier, Siege or Ship (4 of 4 games bit-identical with
and without these lines). Resignation (`-R RATIO`, default 0.1, 0 = off):
a side whose assets stay below RATIO x the strongest other side's for
2 minutes is defeated, as a player resigning in the GUI, and the line
`[HARNESS] resign {"t","team","players","ratio"}` is printed; the game
then ends as the other side's win. This is the only way the harness acts
on a game before the limit.

`autostart/harness_settings.js` applies `-harness-settings=JSON` (the
`-S` settings) on top of the public autostart command line. The engine
loads every file of `autostart/` in name order, so it wraps the public
`parseCmdLineArgs` without copying it, and sets each setting as the game
setup screen would; an unknown key aborts the game start.

### scenarios/ — the strategos-scenarios mod

`scenarios/` (repo root) holds scenario maps: a random-map script that
builds the situation and a trigger script that plays the side without an
AI, prints `[SCENARIO]` lines and ends the game as soon as the outcome is
known. `run.sh` mounts the mod when a map of the batch comes from it, and
`none` as a player's AI leaves that player to the trigger script:

```sh
tools/run.sh -l 8 -p 'strategos:*:1' -p 'none:*:2' \
    -M random/strategos_assault_a60_g20_d0 -b '*' -H local OUTDIR 1-12
```

`strategos_assault_aA_gG_dD`: player 1 gets A extra basic infantry beside
its civic centre; player 2 is a lone civic centre with G soldiers
garrisoned and D standing around it. Outcomes: player 1 wins when the
centre is captured or destroyed, player 2 wins when a quarter of the army
or less is left, anything else is a timeout — so `analyze.py` and
`compare.py` read a scenario batch like a batch of matches. The protocol
and the meaning of each field are in the header of
`scenarios/maps/random/strategos_assault_triggers.js`; a new case is a new
`.json` with a matching name.

`strategos_battle_dD_aA[_cC][_w][_lL]`: the defensive battle. Player 1 gets
D extra basic infantry (at its centre, or with `_w` cutting a woodline
~115 m out toward player 2, outside the centre's arrows); at second L
(default 90) player 2's wave of A basic infantry and C basic cavalry
attack-walks to player 1's centre and fights the way Petra's attack plans
do (target choice re-written in the trigger script: counters, support
units first, at most 3 attackers per target, retaliation). Outcomes: held
(player 1 wins) when 10 % of the wave or less is left, overrun when player
1's centre falls; the `tick`/`result` lines carry soldiers and civilians
lost and attackers killed with their value, the quantities a defence
change is judged on. Run with `-R 0` (no harness resignation: the trigger
script ends the game itself):

```sh
tools/run.sh -l 7 -R 0 -p 'strategos:*:1' -p 'none:*:2' \
    -M random/strategos_battle_d30_a45_w_l90 -b '*' -H local OUTDIR 1-16
```

### analyze.py, compare.py

```sh
tools/analyze.py OUTDIR [TAG...] [--metrics] [--player WHO] [--at MIN] [--by KEYS] [--tsv F] [--det A,B]
tools/compare.py BASE_DIR VARIANT_DIR [TAG...] [--player WHO] [--at MIN] [--by KEYS]
```

`--player WHO` is a player number or an AI name (that AI's first player,
wherever `--rotate` put it); the default is the first `strategos` player,
else player 1. `--by KEY[,KEY...]` breaks WHO's results down per value of
`map`, `biome`, `size`, `placement`, `victory`, `civ`, `slot`, `opponent`,
`opponent_civ` or any game setting (`PopulationCap`, `Landscape`, ...):
`analyze.py` prints games / win / loss / timeout / fail / mean score per
value, `compare.py` the pairs and both batches' W/L/T and score.

`analyze.py`: per match the outcome (`T<n> won`, `P<n> won`, `timeout`,
`T<n> ahead` / `P<n> ahead` — a timeout where that side's assets in the
last standing line are at least `POINTS_RATIO` (3) x every other side's,
which `compare.py` scores as that side's win — `none`), the side the
harness made resign, each player's `ai/civ:team=W|L|T`, map/biome, the
setup (size, placement, victory, non-default settings; shown when the
matches differ in it), game minutes, error
lines, failed AI creation, host, exit, wall seconds, turns/s and a hash of
the statistics (equal hash = identical game). `--metrics` adds WHO's
end-of-game resources gathered (per resource, total, and `gath_ratio`: the
total over the best other player's total), units trained/lost/killed,
kill/loss value ratio, buildings, population and map control. `--at MIN`
reads the gathered resources, total, ratio and population from the
harness eco line at minute MIN instead, so one batch can be judged at
several minutes.

`compare.py`: pairs two batches by tag; identical-game count, outcome
transitions of WHO's side, and for each metric the means, the mean
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
like a top-down viz frame) over the `[HARNESS] terrain` line of the same
log (deep water, shallow water, land on an 8 m grid, printed once at the
start): exact, no GPU, scales to whole batches. A log from before the
terrain line draws on a plain background.

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
