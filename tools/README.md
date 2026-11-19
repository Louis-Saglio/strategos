# tools/

Development tooling for Strategos. Not part of the bot.

| Tool | What it does |
|---|---|
| `run.sh` (`run.py`) | run batches of headless matches on every available host |
| `harness/` | the `strategos-harness` mod mounted in every match: game settings, statistics, map snapshots, standings, command census, resignation, time limit |
| `hosts.json` | match hosts: ssh name, slot count, determinism verification, calibration |
| `analyze.py` | one-line-per-match summary of a batch, optional end-of-game metrics |
| `census.py` | what each AI used in a batch against what its civ offers: command types, technologies, structures, units |
| `league.py` + `league.json` | play the bot against a set of named opponents (Petra's behaviours, Brennus, past versions, plan variants) on the same seeds; one table |
| `forecast.py` + `forecast_eval.mjs` | check the bot's combat forecast against the battles of recorded games; fit its constants |
| `duel.py` | check the core of the combat forecast against the duels of the duel scenario; fit its constants |
| `compare.py` | paired comparison of two batches run on the same matches |
| `rejoin.py` | check that a game restored from a save plays the rest as the unsaved game: the engine's rejoin test against the same games played without it |
| `identity.py` + `identity.jsonl` | the identity set: play a fixed list of short games, compare two plays command by command, list the kinds of request (source and purpose) the set grants |
| `timeline.py` | per game of a batch, any number of players: population, gathered, military of every team at given minutes, the bot's launches and returns |
| `viz.py` + `vizmod/` | replay a recorded match in the GUI and capture camera-directed frames |
| `frames.py` | contact sheets / time-lapse from `viz.py` frames |
| `mapview.py` | top-down map pictures from the harness map snapshots (no GPU) |
| `check_bot.py` | bot code rules: JS parses, no comments |
| `constants.py` | count the numbers written in the bot's code, by file and kind |
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
died (`{"t","k":[[t,victimOwner,victimKind,x,z,killerOwner,killerKind],...],"ids":[...]}`,
kinds as in the map snapshots: 0 other, 1 worker, 2 soldier, 3 cavalry,
4 siege, 5 structure, 6 civic centre, 7 ship; a killer of kind 5 or 6 is
defensive fire; `ids` is the entity id of each victim, in the order of
`k`; read by wrapping `Health.prototype.KilledBy`, which leaves
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
on a game before the limit (besides `--full-ai-view`, below, which changes
what the AIs see).

At game end it prints `[HARNESS] census {"<player id>": {"commands":
{<type>: n}, "train": {<template>: units}, "construct": {<template>: n},
"research": {<tech>: n}, "detail": {"formation:<name>"|"stance:<name>":
n}}}`: every command each player issued, AI commands included (the replay
does not record those), counted from the `OnPlayerCommand` trigger event.
A command the engine then refuses is counted too. Read-only: 233 of 246
games bit-identical to games of the previous harness, the 13 others
differing by the bot. `census.py` reads it.

With `run.sh --commands` it also prints `[HARNESS] cmd {"turn","p","c"}`
for every command of every player, in the order the simulation receives
them, from the same trigger event: `turn` is the replay's turn number,
`p` the player, `c` the command as issued. The replay (`commands.txt`)
holds the commands of human players only — an AI's commands never reach
it — so these lines are the one place where the orders of the AIs can be
read turn by turn. Off by default (a few thousand lines a game);
`identity.py` plays with it. `run.py` stops before any game when it cannot
set the harness constant that turns them on (`HARNESS_COMMANDS`).
Read-only: the 10 games of the identity set that had been played at the
same limit without it (2 against two Petra, 8 naval) are bit-identical
with it.

Wrappers of the public `AIInterface`, `AIProxy` and `Trainer` serve the
rejoin test (below). A simulation restored from a saved state differs
from the unsaved one in four ways, which the harness repairs on that path
only (a game that is never restored never takes it). It runs one turn,
then gives its AIs the full representation of the game
(`GetFullRepresentation(false)`; the game start calls it with `true`) with
that turn's events, and:

- the entities changed during the turn stay marked as changed in
  `AIInterface` (sent again next turn; the serialised states differ):
  cleared, as `GetRepresentation` does every turn;
- it describes every entity, also those `AIProxy` never reports because
  they have no owner (the finished units of a batch that could not spawn:
  `Trainer.Item.Spawn` gives the others their owner at once): removed;
- an entity the AIs knew that is destroyed during the turn is in no
  representation, so its `Destroy` event names an entity the restored AIs
  never had (seen: a soldier's death missing from the bot's losses, and
  its modifications left in the shared script): its representation, taken
  when its owner becomes `INVALID_PLAYER`, is added with a `Create` event
  before the turn's others, so the shared script knows it and destroys it
  as in the unsaved game;
- the stock `Trainer` does not save an item's `spawnNotified`
  (`Trainer.Item.SerializableAttributes`), so a batch that could not spawn
  before the save notifies "Can't find free space to spawn trained units"
  again in the restored simulation only (a GUI notification, part of the
  serialised state): `Trainer.Deserialize` sets it again as `Spawn` left
  it, on every item still holding units it created and could not spawn.

With `run.sh --full-ai-view` (`HARNESS_FULL_AI_VIEW`), every turn sends the
AIs the full representation of every entity they already know instead of
the changes the engine reported.

`autostart/harness_settings.js` applies `-harness-settings=JSON` (the
`-S` settings) on top of the public autostart command line. The engine
loads every file of `autostart/` in name order, so it wraps the public
`parseCmdLineArgs` without copying it, and sets each setting as the game
setup screen would; an unknown key aborts the game start. It also applies
`-harness-player-names=JSON`: every player is named after its AI and slot
(`strategos-1`, `petra-2`, `none-2`; no space, which the chat command
`/msg NAME` would split), where the engine would draw an AI's name at
random and Petra's chat commands would differ between two plays of the
same game; `run.py` checks each name in the replay like the other settings
(`player1.Name`).

### Saved games: the rejoin test

A saved game holds what each AI's `Serialize` returns; loading it calls
`Deserialize` on a new AI object, then `Init`. The engine tests this
itself (`source/simulation2/Simulation2.cpp`, `CSimulation2Impl::Update`):
`-serializationtest` restores a second simulation from the first one's
state before every turn and compares the two after that one turn;
`-rejointest=N` restores it once, at turn N, then runs both to the end and
compares their whole serialised state, AIs included
(`CCmpAIManager.cpp`, `SerializeState`), every turn — the check that a game
resumed from a save at turn N plays the rest as the unsaved game does.
`run.sh --rejoin-test N` runs it (`"rejoin_test": N` in a `--matches` line
sets it per match), and `tools/rejoin.py PLAIN TEST` reads the result:

```sh
tools/run.sh -l 14 --commands --full-ai-view -H local --matches M.jsonl OUT/plain
tools/run.sh -l 14 --commands -H local --matches M_with_rejoin_test.jsonl OUT/test
tools/rejoin.py OUT/plain OUT/test
```

What the engine and the public AI interface allow:

- **Not on random maps**: the second simulation loads the map file and does
  not regenerate a random map (`Simulation2.cpp`: "Serialization test mode
  does not support random maps", an assertion). The identity set is all
  random maps; the test runs on the skirmish maps (`-M skirmishes/NAME`).
- **Not with Petra**: right after the second simulation is restored the
  engine serialises it again, before any AI has run `Init`, and Petra's
  `Serialize` then throws (`this.queueManager is undefined`) and aborts
  the game. A test game has Strategos players only (or `none`).
- **The view of the AIs** (`--full-ai-view`, implied by `--rejoin-test`):
  the engine reports to the AIs the changes of each entity, and misses
  some (UnitAI rewrites its order queue in several places without
  `MT_UnitAIOrderDataChanged`), so what an AI believes depends on the
  history of the game, while the restored simulation starts from the full
  representation. Without the option the test fails at the first decision
  after N on that alone (seen: a worker's order target read as its tree in
  the first simulation and as the civic centre it was walking to in the
  restored one). With it, every turn gives every AI the full
  representation of every entity it knows, in both simulations, so the
  view is a function of the game state alone; it changes the games, so a
  test game is compared with the same match played with `--full-ai-view`
  and no test. It also means a game loaded on the stock engine is not the
  unsaved game bit for bit, whatever the AI saves.
- The first difference is an engine assertion (`debug_warn`) whose prompt
  never returns in a headless game (it forks for `/usr/bin/xmessage`;
  without it the child hangs): `run.py` stops the game, with its process
  group and core dumps off, as soon as `Serialization test failure` is in
  its log. The engine has then written both states before and after that
  turn to `home/.local/state/0ad/log/serializationtest/*/` (`state.*`
  binary, `debug.*` text, `hash.*`). The rejoin test runs on `local` only.
- After N both simulations print to the same log, the first one's lines of
  each turn followed by the second's. `rejoin.py` checks, per game, that
  the second simulation started and the engine found no difference, that
  both games exited cleanly without an ERROR or WARNING line, and that every
  turn before N prints what the plain game prints and every turn from N on
  prints it twice (harness and bot lines, commands and end statistics
  included, `[PERF]` excepted): the test does not change the first
  simulation, and the restored one plays the same game.
- The restore turn itself: the AIs of a restored simulation get the game
  after its first turn with that turn's events, which the harness repairs
  (above); a game loaded on the stock engine has these differences too.
- The stock `Trainer` does not save whether a blocked batch has notified
  (above): without the harness's repair, the restored simulation itself
  diverges from the first one the turn after N whenever a batch could not
  spawn before N (seen: a dock's ship, "Can't find free space to spawn
  trained units" in the restored simulation only, both bots' states
  equal). A game loaded on the stock engine notifies again too.
- The cost: from N on both simulations run and the whole state is
  serialised four times and hashed four times a turn: 2 to 3 turns/s for
  a 1v1 on a 2-player skirmish map (about 20 times slower than the plain
  game), about 1 for a 2v2 late in the game. `run.py` derives the wall cap of a rejoin game
  from N and `-l` (the turns before N at 20 turns/s, those after at
  `REJOIN_MIN_RATE`, 1 turn/s) and refuses a `-t` below it; keep the
  restored part short (N late, or `-l` just after it): every turn after N
  costs a second or so.
- What it cannot see: state a bot never saves and never uses again before
  the end of the game, and anything the chosen turn N does not hold.

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

`strategos_harass_aA`: enemy archers harassing the base. On the battle
map, at 60 s, player 2 gets A basic archers of its civ (pin it: `-p
none:maur:2`; a civ without `infantry_archer_b` aborts the game), set to
standground and posted on an arc facing it, 10 m beyond the reach of
player 1's centre, where they shoot what comes in their own range. The
game ends when they are all dead (`repelled`) or 180 s after their launch
(`endured`); the `tick`/`result` lines carry player 1's soldiers and
civilians lost and the archers killed. Run with `-R 0`:

```sh
tools/run.sh -l 5 -R 0 -p 'strategos:*:1' -p 'none:maur:2' \
    -M random/strategos_harass_a10 -b '*' -H local OUTDIR 1-8
```

`strategos_hunt_<fauna>_nN_dD[_cC]`: how much meat the bot gets out of a
herd and where it kills it. On the assault map, the trigger script places
N gaia animals of `gaia/fauna_<fauna>` (deer, horse, boar,
elephant_african_bush, ...) in a clump D metres from player 1's centre, on
the side away from player 2, and gives player 1 C more units of its
starting cavalry gatherer. The `kill` lines carry, for each death, the
distance of the corpse to the nearest food dropsite (`drop`) and how far
the animal moved from its spawn point; the `tick`/`result` lines carry the
herd meat harvested, hunters alive and lost, and the result's `t` is the
time the herd was used up (`harvested`), or 480 s (`unfinished`). Cases:
`deer_n8_d80_c2`, `horse_n6_d90_c2`, `boar_n4_d70_c2`,
`elephant_african_bush_n2_d90_c3`, and with the starting cavalry only,
`deer_n12_d80` and `horse_n8_d90`. Run with `-R 0`:

```sh
tools/run.sh -l 9 -R 0 -p 'strategos:*:1' -p 'none:*:2' \
    -M random/strategos_hunt_deer_n8_d80_c2 -b '*' -H local OUTDIR 1-8
```

`strategos_duel`: what a fight between two groups of soldiers costs each
side with nothing else around. No AI plays; the trigger script fights 40
duels one after the other at the centre of the map, out of reach of every
structure — equal and unequal sizes (10 to 90 against 10 to 30), basic
melee infantry, basic ranged infantry or half of each — and prints the
forces and, every second, the units and hit points left (`[DUEL]` lines;
the protocol is in the header of `strategos_duel_triggers.js`). A game is
the whole list and takes about a second of wall time; the seed draws the
two civs. `tools/duel.py` reads the batch:

```sh
tools/run.sh -l 40 -R 0 -p 'none:*:1' -p 'none:*:2' \
    -M random/strategos_duel -b '*' -H local OUTDIR 1-24
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

After the outcome counts `analyze.py` prints the minutes to victory of
WHO: the wins concluded before the limit (median length, how many before
15 min), the mean of the game's length for those and of the limit for
every game not won before it (ahead on points, undecided or lost), and the
number of games not won before the limit. Against an opponent the bot
nearly always beats, wins and losses no longer move from one version to
the next; this measure does.

The same line gives the games decided on the field and the minutes it
took: the first standing line from which every other side's military
value stays at or below a quarter of WHO's side's until the end
(`DECIDED_RATIO`), a game never decided counted at the limit. It is the
moment an opponent that resigns a lost game would. The AIs never resign,
and the harness resignation (`-R`, assets below 0.1 of the strongest
side's for 2 minutes) rarely comes before the conquest, so the minutes to
victory also measure how long a beaten opponent takes to finish — four
to eight minutes for a garrisoned centre. Read the two together.

`compare.py`: pairs two batches by tag; identical-game count, outcome
transitions of WHO's side, and for each metric the means, the mean
paired delta and the paired t-test p-value. Besides `score` it compares
`win_min` (the minutes to victory above), `concluded` (the share of
games won before the limit), `dec_min` and `decided` (the minutes until a
game is decided on the field and the share of games that are).

### identity.py — the identity set

```sh
tools/identity.py play OUTDIR [-H HOSTS] [-m strategos=SOURCE]   # OUTDIR must not exist
tools/identity.py compare BASE_DIR NEW_DIR    # exit 1: a game differs or is unfit; 2: not comparable
tools/identity.py coverage DIR [--bot MOD_DIR]
```

A refactoring of the bot is right when it plays the games the commit
before it played. `tools/identity.jsonl` is the list of those games: 19
complete match specs (map, size, biome, placement, victory, every game
setting, players each as `AI/DIFF/BEHAVIOR:CIV:TEAM` — `play` and `compare`
refuse a list with a line that leaves anything to a default or to a draw,
a player's difficulty, behaviour and team included), all played at one
in-game limit (`LIMIT_MINUTES` in `identity.py`, 14) with the harness
resignation at 0.1 and the command log on.

| Games | What they are there for |
|---|---|
| `duel-9601..9603` | 1v1 against Petra/5 on mainland, 300 resources |
| `two-9601`, `two-9602` | one against two allied Petra/4 |
| `aegean_sea-2001` ... `migration-2137` (8) | naval maps against Petra/5: docks, fishing, warships, transports, landings |
| `regicide-4301` | regicide, 3000 resources: the hero's guard; Rome's upgrades of soldiers to centurions; healers |
| `relic-4302` | capture the relic, 3000 resources, Strategos as player 2: the relic squad |
| `wonder-sele-4303`, `wonder-kush-4303` | wonder, 50000 resources: a wonder ordered before minute 6, a hero, champions and rams trained (sele), a stalled foundation abandoned (kush) |
| `nomad-4304` | nomad start with 100 resources and treasures enabled: the treasures collected, the civic centre founded |
| `team-4305` | five players on 256 tiles, 3000 resources: two Strategos and a Petra/5 against two Petra/5; attacks, captures, razing, rams |

The five-player game is the first line, so that the longest game starts
first when there are fewer slots than games. On boobynator alone (19 games
on its 20 slots, the other hosts unused) a play takes 105 to 110 s of
wall time.

`play` runs the list through `run.py` into a new directory (`-H` and `-m`
are passed on, e.g. `-m strategos=tmp/variant/bot`), then checks that
every game is fit — finished with exit code 0 and statistics, at least one
`[HARNESS] cmd` line, no `ERROR` or `WARNING` line in its log, the settings
applied as asked, the spec played equal to the line of the list. It prints
the wall time and each unfit game with the reason, then the coverage
table, and exits 1 when a game is unfit or the coverage table cannot be
trusted (below). It never writes into an existing directory, so a base
cannot be overwritten.

A base is the play of a commit, kept in `tmp/ident/<commit>`
(`tmp/ident/d1c8f01` is the first one). `tmp/` is untracked: a base exists
only on the machine that played it, and is played again when it is lost or
when the list has changed since (`compare` refuses a play that is not a
play of the present list). The base of any commit is rebuilt from the
repository root with the bot of that commit and the present tools:

```sh
tools/identity.py play tmp/ident/d1c8f01 -m strategos=.@d1c8f01
```

(`-m strategos=GIT_DIR@REV` is `run.py`'s: the `bot/` of that revision,
archived by git, whatever the working tree holds; `batch.json` records the
commit and the content hash of the bot played.)

`compare` first checks that both directories are plays of the committed
list — the same matches in the same order, at `LIMIT_MINUTES`, with the
command lines — and exits 2 otherwise. It prints what it compares: for
each play the commit and content hash of the bot and the content hash of
the harness recorded in its `batch.json`, then whether the two plays ran
the same bot content (a play made with the base's bot by mistake compares
as identical: this line is where it shows) and the same harness content.
It applies the fitness checks of `play` to both plays, then reads them
game by game and prints one line each:

- **hash** — the statistics of every player at the end of the game
  (`analyze.py`);
- **commands** — every command of every player, turn by turn (the
  `[HARNESS] cmd` lines), and the replay's `commands.txt` from its first
  turn on (the turns, and the commands of human players if there were
  any);
- **telemetry** — the bot's own lines (`[TAG] {"p":...`) other than
  `[PERF]`, which carries wall-clock times.

For a game that differs it prints the two hashes with the outcomes, the
first differing command of each play with its turn and player, and the
first differing telemetry line; for a game that is unfit, `UNFIT` on its
line and, below, the play, the game and the reason. A game is identical
when its hash and its commands are the same and it is fit in both plays:
`compare` refuses a play with an error — an exit code, an `ERROR` or
`WARNING` line, a setting not applied, a game not played, a game without
a command line — however equal the two plays are. The exit status is 1
when a game is not identical. Telemetry is reported apart and does not
change the status: a refactoring may change telemetry on purpose. Status
2 means the directories cannot be compared (one is not a play of the
committed list at its limit, or was played without `--commands`).

`coverage` (also printed at the end of `play`) reads the `[ALLOC]` ledgers
of a play. The allocator counts every request it grants or denies, and the
bot prints the counts every 60 s:
`"outcomes": {"construction/house/construct!:granted": 3, "recruitment/soldiers/train:resources-food": 2, ...}`.
A key is `source/purpose/action:outcome`:

- `source` — the subsystem asking;
- `purpose` — what the request is for (a house is not a dropsite, a
  soldier is not a worker);
- `action` — the type of the request's action (`train`, `construct`,
  `walk`, `hold`, `attack-walk`...), or `reserve` for a reservation: a
  request that claims resources or population and orders nothing, so it
  has no action and never reaches the executor (`construction/colony-fund`,
  `recruitment/ship-room`); followed by `!` when the request is of the production
  tier;
- `outcome` — `granted`, or the reason of the denial (`unit-taken`,
  `slot-taken`, `population`, `resources-CODE`).

The requests of the last, unfinished minute of a game are in no ledger.

A kind of request is `source/purpose`: the table sums a kind over its
actions and tiers. It gives, per kind, the times it was granted and denied,
the games granting it and the actions it was granted under — the action
alone when there is one, each with its count otherwise (`hold 491, walk
3`, `train 510, train! 421`), so a kind granted is not read as every
action of that purpose granted. Then come the kinds the bot's code can
emit that the play never granted, each as never requested or as requested
and denied. The kinds of the code are read from the bot the play
snapshotted (`DIR/mods/strategos`, or `--bot`): every `.js` file under
`simulation/ai/strategos`, in whatever subdirectory. Every request is built by a
builder of `requests.js` (an exported function whose first parameters are
`source, purpose`); a class names its source as the first argument of the
builders it calls, and a purpose as the second, or as the `purpose`
argument of one of its own methods that hands it on (`this.order("stray",
...)`). A purpose is read when it is a string literal or a choice between
two (`yard ? "shipyard" : "dock"`). A subsystem may be composed of parts,
each a class in a file of its own that builds its requests under the
subsystem's source (`Naval` in `naval.js`: the fishing, the convoys, the
crossings, the hunt... in `naval-*.js`): every part is read as a class like
any other, and the class that composes them builds no request and adds no
kind. A purpose may also be data: a building need (`construction-needs.js`)
is a record made by `buildingNeed("house", {...})`, and `Construction`
builds the request of whichever need it is running,
`buildRequest("construction", need.purpose, ...)`. The reader follows that
one form. A maker of needs is a function of `construction-needs.js`
declared `export function NAME(purpose, ...)` before any class, whose body
names the purpose once, as the whole value of a key (`"purpose": purpose`);
a need is a call of a maker by its own name, in whatever file — the table,
a need kept beside it, a need a plan brings — and its purpose is the first
argument of that call, a string literal or a choice between two; a class
that hands `need.purpose`, in those words, to a builder or to one of its
own methods that hands it on is given, besides the purposes it names, the
purposes of every need the bot declares. What a kind is made of is known to
two functions only, `ledger_kind` (the key of the ledger) and `source_kinds`
(the code).

The table is worth what that reading is worth, so `coverage` says when it
is not whole and exits 1:

- in a subsystem: a source or a purpose that is neither of those forms,
  the word `purpose` used where no request is built (a variable, a field
  written), a request built outside a class or written by hand
  outside `requests.js` (`"claims":` or `"purpose":`; one record is let
  through, in `allocator.js` only and in this form only: an assignment,
  which copies the kind of the request a unit was granted to, `"source":
  request.source, "purpose": request.purpose,`, and names none of its
  own, and the same assignment saved for a saved game, which keeps of the
  claims only the units, `"claims": { "units": request.claims.units }`), a class with a `requests(` method that names no purpose, unless it
  is composed: it creates (`new NAME(`) at least one class of the bot that
  names purposes, and those classes are each declared once and all name
  the same source (a class handed its parts instead of creating them and
  parts of two sources are refused);
- in the building needs: `construction-needs.js` named otherwise than in a
  plain named import (an alias, a namespace), a maker named otherwise than
  called by its own name (`const make = buildingNeed`,
  `Needs.buildingNeed(...)`, `buildingNeed.call(...)`), a need whose purpose
  is not a literal (`buildingNeed(prefix + "house", ...)`, a constant), a
  need written by hand instead of made, in the table or anywhere else
  (`{ "purpose": "tower", ... }`, refused as every request written outside
  `requests.js`; so is a `"purpose":` in the record handed to a maker, and
  in a copy of a need), a purpose assigned to a need once it is made
  (`need.purpose = ...`, `need["purpose"] = ...`), a function that takes a
  purpose and is not a maker (declared in another file, as an arrow
  function, with the purpose elsewhere than first, or doing anything with
  it but writing it once), a purpose handed to a builder otherwise than as
  `need.purpose` (through a variable, of a record of another name,
  computed from it), needs declared when no class hands `need.purpose` to
  a builder, `need.purpose` handed outside a class, by classes of two
  sources (the needs are the requests of one subsystem) or when no need is
  declared;
- between classes: a method that is handed a purpose is read where it is
  called as `this.NAME(` in the class that declares it, and every other
  call that names it is refused, in every file and on whatever object:
  `this.tug.haul("tow", ...)` or `this.convoys.member(convoy, "tow", ...)`
  written in `Naval`, `tug.haul(`, `tug["haul"](`, `haul(` on its own,
  each of them through `.call(`, `.apply(` or `.bind(` too, and
  `this.haul` otherwise than called in the class that declares it. The
  purpose handed there would be in no list, and the reader does not know
  of which class an object is, so it is the name that is refused: once a
  class has a method `unload` that is handed a purpose, `.unload(` cannot
  be written on any other object. One call is let through, `this.NAME(` in
  a class that declares a method `NAME` of its own that takes no purpose
  (`this.unload(action)` in `Executor`, beside `Convoys.unload`): it is a
  call of that class's own method;
- between a subsystem and `requests.js`: the module named otherwise than
  in `import { NAME, ... } from "simulation/ai/strategos/requests.js";` (a
  namespace import, an alias, a re-export, a dynamic import), or a builder
  named otherwise than called by its own name (`const make =
  goodsRequest`, `Requests.goodsRequest(...)`, `goodsRequest.call(...)`);
- in `requests.js`, where no source and no purpose may be named — both go
  from the parameters of a builder to the request: a function that is not
  declared `function NAME(...)` at the start of a line (an arrow function,
  a class), an export that is not such a function, `source` or `purpose`
  as parameters elsewhere than first and second, a call of a builder or of
  what the builders share (`compose`) whose first two arguments are not
  the `source, purpose` of the function it is in, such a function named
  otherwise than called, a request written (`"claims":`, `"purpose":`)
  otherwise than as `"source": source, "purpose": purpose`, and any other
  use of the words `source` and `purpose` (`"source"` as the key of an
  action is not one);
- in the ledgers: a kind that no class read emits, or an `[ALLOC]` line
  that cannot be parsed (reported with its file and line number). A play
  whose ledgers have another key is refused this way: that of a bot from
  before `requests.js` (`tmp/ident/d1c8f01`, `source/action:outcome`).

Three things pass that reading without a word:

- a method that is handed a purpose, taken from another object as a value
  and called under another name (`const pull = tug.haul`,
  `list.map(tug.haul)`, a destructuring that renames it), or reached under
  a computed name (`tug[name](...)`). A name that is not called is not
  looked at, because a record may have a field named as such a method is
  (`worker.haul`); a purpose handed that way is in no list;
- the one-source rule of a composed subsystem does not cross nesting. It
  is checked on the classes the composing class creates, not on those a
  part creates in turn: a part that names purposes and creates a class of
  another source (`Hunt` creating a class that builds `"sea", "stray"`)
  passes. That class is read as any other, so its kinds are in the table;
- a building need is known where a request is built by its name alone:
  a record that is no need handed to a builder as `need.purpose` (a
  request, in a loop `for (const need of requests)`) is read as the needs
  are, and the class is given their purposes instead of the one it hands.
  A purpose written under a computed key (`{ ["pur" + "pose"]: ... }`), in
  a need as in a request, is not seen either.

The set grants 68 of the 84 kinds. Never in a ledger within 14 minutes:

- `recruitment/trader`, `trade/goods`, `trade/route` — traders are trained once
  two finished land markets, one of ours and another of ours or of an
  ally, make a route that pays 0.5 a second, 0.3 when stone or metal runs
  out at home; in the three team games tried with 3000 resources the
  second market was missing or the route paid 0.43, and recorded
  30-minute games set their first route around minute 27;
  `construction/trade-post` is the second market, beside a far centre;
- `offense/occupy` — soldiers garrisoned in a captured structure to hold
  it: the earliest grant in recorded games is in the ledger of minute
  14.2;
- `offense/return` — no army of the set goes home before the limit (no
  `[ATTACK]` line with the mode `return`); `offense/storm` — an army
  overseas without a target it can capture;
- `offense/mop-up` — requested in `team-4305` from 13.9 minutes on, in the
  minute whose ledger the game does not print;
- `construction/colony-centre`, `construction/forward-base` — a civic
  centre founded by settlers landed on another island, or at the front of
  an invasion;
- `recruitment/siege-ship`, `naval/bombard` — ships that bombard structures;
  `recruitment/ship-room` — population kept for ships at the population limit;
- `naval/disembark`, `naval/stranded`, `naval/castaway` — a convoy that
  gives up its embarkation, a loaded ship outside any convoy, loaded ships
  of a player without a civic centre.

### league.py — the bot against a set of opponents

```sh
tools/league.py -l 30 tmp/league-NAME 9301-9332                 # working tree against every member
tools/league.py -l 30 --candidate .@c61665b tmp/league-base 9301-9332
tools/league.py -l 30 --members push,boom tmp/league-x 1-16 -- -M random/lake -H thinkpad,vps2
tools/league.py --table tmp/league-NAME                         # the table again
```

`tools/league.json` names the members: `"player"` is an AI the runner
knows (`petra/5/aggressive`, `brennus`); `"bot"` is a commit of this
repository, the bot as it was then; `"bot"` with `"set"` is that commit
with values of its strategy table overridden (dotted paths into `BASE`
of `strategy-plans.js`; of `strategy.js` in commits from before the strategy
was split, where the oldest name it `OPENING`), a plan variant. Commits are pinned so a member stays
the same opponent whatever the working tree becomes; a member that no
longer moves when the bot changes can be dropped, a new one is one entry.
`"civ"` and `"biome"` pin what a member needs (Brennus plays gaul on
temperate mainland only).

Bot members are built into `OUTDIR/members/NAME/bot` with the AI renamed
`lg_NAME`, then each member gets its own batch `OUTDIR/NAME` (run.py, one
after the other, same seeds, candidate as player 1 / team 1), so
`analyze.py`, `compare.py OUT_A/NAME OUT_B/NAME` and every other tool read
them as usual. A candidate given as a directory (the working tree by
default) is copied once into `OUTDIR/candidate`, so every member meets the
same bot even if the tree is edited meanwhile. Options after `--` go to run.py. The table gives per member
the candidate's games, wins / losses / undecided (a game ahead on points
counted as won or lost), the wins concluded before the limit, the minutes
to victory, the mean score, and the games decided on the field with the
minutes it took.

### forecast.py — the combat forecast against recorded battles

```sh
tools/forecast.py tmp/BATCH [tmp/BATCH2 ...] [--window 30] [--by cover,size,seq]
tools/forecast.py --fit tmp/BATCH ...
```

The bot prints `[FORECAST]` at the onset of every battle (4 or more
soldiers of each side within 60 m of a fight) and every 30 s while it
lasts: the forces as it sees them and what `forecast.js` predicts. Per
side, `groups` holds one `[template, count, hit points, ranged, cost,
engaged, at]` per template and wave: the soldiers within 60 m (`at` 0,
`engaged` of them fighting a unit of the other side) and those within
150 m that can join (`at`, the mean seconds they need; gathering enemies
left out); `rates` is what one unit of a group deals per second to each
group of the other side, `fire` the arrow damage per second the covering
structures would deal to each group, `ids` the units of each side in the
order of the groups. `marks` is the prediction (`[seconds, ours lost,
theirs lost]`). The lines of bots before #57 also carry `balance`, the dps
x hit points ratio the defence then used.

`forecast.py` takes as truth the listed units that the harness saw die
(the `ids` of `[HARNESS] kills`) in the `--window` seconds after the line,
and recomputes the prediction from the logged forces with the
`forecast.js` of `--bot` (default `bot/`), run under node by
`forecast_eval.mjs` — a change of the model is therefore read on games
already played (`--logged` takes the prediction the game printed). It
reports the error of the lost share of each side, how often the model
names the side that loses more, the correlation with the observed
difference of lost shares and with the units lost and their net
exchange, next to the head count, and to `balance` when every sample
carries it, where they can answer.
`--by cover,size,seq` splits the samples. `--fit` searches, by coordinate
descent on half of the games (split by a hash of their name) with the
error reported on the other half, the constants of `forecast.js` that a
duel cannot set: the share of an arriving wave that counts, the share of
the arrows that hit, the scale of the joining times. It prints the
constants, it does not edit the bot.

The truth of a recorded battle is not clean: a listed unit that dies was
not always killed by a listed unit (reinforcements beyond 150 m, arrows
met while chasing). The core of the model — who strikes, how fast, how
losses fall on a group — is set on duels instead.

### duel.py — the combat forecast against duels

```sh
tools/duel.py tmp/BATCH [tmp/BATCH2 ...] [--cases] [--set k=v,...]
tools/duel.py --fit tmp/BATCH ...
```

Reads batches of the `strategos_duel` scenario. A duel is one sample,
taken at the last tick before the first hit point is lost, and the truth
is the units each side has lost 5, 10, 20 and 40 s later. The prediction
is the `forecast.js` of `--bot` run under node on the forces the trigger
script printed (`--set` overrides constants). It prints, per class of duel
(or per duel with `--cases`), the units lost by each side at each mark,
observed and forecast, then the root mean square error of the lost shares
and how often the side losing more units is named. `--fit` searches the
core constants (efficiency and joining time of melee and ranged units,
focus) on every other game and reports the error on the rest. Equal duels
end with one side wiped out and the other half alive, either way round,
so their error cannot go to zero: judge a fit on the unequal ones.

### census.py — what an AI uses of what its civ offers

```sh
tools/census.py [--ai NAME] [--all] [--civ] BATCHDIR...
```

From the `[HARNESS] census` lines of the batches and the game data
(`gamedata/zad.py`): the command types of every AI family side by side
(in games using them), then per technology, structure and unit the games
where the AI (`--ai`, default `strategos`) ordered it over the games where
its civ could, with the other families' counts as a reference. Without
`--all` only what was ordered in fewer than 5 % of the possible games is
listed — the technologies never researched, the buildings never built,
the units never trained, the orders never given; `--civ` adds the per-civ
split.

### yields.py — realised gather rates

```sh
tools/yields.py OUTDIR [--player P] [--windows 0-4,4-8,8-12] [--by-map]
```

Reads the bot's `[YIELD]` lines (one a minute). For each source kind and
unit group (`food.fruit|civilian`, `food.grain|civilian`,
`food.meat.domestic|cavalry`, `food.meat.wild|cavalry`, `food.meat|…` for a
carcass first reached as a carcass, `food.fish|boat`, `wood.tree|infantry`,
...) the bot counts what was delivered at a dropsite and the seconds those
deliveries took from the unit's previous delivery (walking, chasing,
driving, gathering and returning included), the seconds spent idle after
working that kind, the seconds held by another subsystem's orders, and the
load thrown away on a change of resource type. The table prints, per
window of in-game minutes and summed over every game, the realised rate
(delivered / seconds), the idle and taken shares of the units' time and the
number of games. A delivery is seen as a drop of the carried load between
two decisions; a unit that filled up and delivered within one decision gap
is counted as delivering a full load. Each line also carries `foodRates`,
the smoothed food rate per unit group that the bot uses to weigh
non-civilian food workers; the table ignores it.

### timeline.py — when and how each game was decided

```sh
tools/timeline.py [--at 8,12,16,20,25,30,40] [--player N] BATCHDIR...
```

One block per game, for any number of players and teams: the outcome as
`analyze.py` reads it, civs, size and biome, the phases player N
researched (default 1), then at each minute of `--at` the population and
the resources gathered of every player and the military value of every
team (`[HARNESS] eco` and `standing`), and player N's attack launches and
returns with army size and reason (`[ATTACK]` lines of the bot). It is
the reading of the games of one Strategos against two allied Petra:

```sh
tools/run.sh -l 40 -p 'strategos:*:1' -p 'petra/4:*:2' -p 'petra/4:*:2' -b '*' -s 192,256 tmp/one-two 9501-9508
tools/timeline.py tmp/one-two
```

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
tools/constants.py [--list] [MOD_DIR]
tools/install-local.sh [COMMIT]     # default HEAD
```

`check_bot.py` fails when a bot JS file does not parse or contains a
comment. `constants.py [--list] [MOD_DIR]` counts the numbers written in
the bot: the numeric literals of the module-level `const NAME = ...`
declarations (every numeric leaf of a table such as `BASE`) and the
other numeric literals of the code apart from 0, 1 and 2, per file, with
the declared ones grouped by a kind guessed from their name and the names
declared in several files. A commit that removes or adds constants gives
the count before and after. `install-local.sh` copies a commit's `bot/` to
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
