# AGENTS.md — Strategos

Strategos is an in-engine JavaScript AI for 0 A.D., shipped as a 0 A.D. mod
and developed against **0.28.0 only**. Petra is the reference
implementation of the engine's AI interface.

## The goal

Strategos plays **every civilisation, on every map and every biome**, in
1v1 and in team games, **under every reasonable game setting** — every
victory condition, map size, population cap, starting resources, map
visibility, ceasefire, player count (degenerate combinations, such as
eight players on a tiny map or a population cap of 50, are out of
scope) — and wins: it beats Petra Very Hard clearly and
consistently, and it beats Brennus. It wins by playing well — sound
economy, timing, army composition, positioning, use of each civ's own
units, buildings, technologies and bonuses — not by exploiting the
blind spots of a particular opponent AI: everything it does must still
make sense against a strong human player. It plays an interesting game
that uses the full range of 0 A.D. features.

**Only this goal matters.** Intermediate step goals are means to it: set
them, measure against them, and revise or drop them whenever the results
say so. Step goals are tracked as GitHub milestones and issues of the
repository, never in a file.

## Layout

- `bot/` — the mod: `mod.json` + `simulation/ai/strategos/`.
- `scenarios/` — a separate mod of scenario maps and trigger scripts
  that set up a specific situation and measure one behaviour; mounted
  only by the harness.
- `tools/` — development tooling: match runner, analyzers, visual
  replay, game data generators (see `tools/README.md`).
- `docs/game_description/` — game mechanics and entity data for all 15
  civilisations, grounded in the 0 A.D. source reference. Consult it
  before writing bot logic.
- `docs/ai_engine_api.md` — the AI scripting API.
- `docs/pyrogenesis_cli.md` — the engine command line, headless usage.

## Hard constraints

- **Determinism**: same seed → identical game. The bot never uses
  unseeded randomness; game settings that resolve randomly (biome,
  player placement, civs) are pinned on the command line.
- **Every game setting is explicit.** No match runs on an implicit
  default: `tools/run.sh` sets every setting, checks after the match that
  the engine applied it, and records it with the match. Which settings a
  batch covers is a step goal, widened toward the full scope of the goal.
- **The 0 A.D. source reference** is a checkout of the official
  repository (https://gitea.wildfiregames.com/0ad/0ad) at tag `v0.28.0`,
  at `~/Work/0ad` on boobynator. Its text files are identical to the
  installed game data. Trust it over general 0 A.D. knowledge, and trust
  the source over the docs when they disagree. Paths the docs cite are
  relative to its root and resolve at
  `https://gitea.wildfiregames.com/0ad/0ad/src/tag/v0.28.0/<path>`. Keep
  the checkout on the tag.
- **The game stays stock.** Strategos plays the unmodified 0.28.0 game
  (`0ad 0.28.0-3` / `0ad-data 0.28.0-1`): never change gameplay, in the
  engine or in the public mod, and the bot mod contains only the AI.
  Development tooling may go further — harness and scenario mods, and
  engine (C++) patches for instrumentation, profiling, visual inspection
  or faster headless runs — provided a patched engine is built
  separately from the installed package and leaves the simulation
  unchanged: its games must reproduce the stock binary's games
  bit-for-bit on the same seeds before any of its results are used.
- **Original work.** Do not copy code from Brennus, Petra or any other
  bot. Reading them to understand the AI interface or how an opponent
  plays is fine; Strategos code that looks similar must be so by
  coincidence, never by transcription.
- **Decision cadence**: the bot decides on one turn out of 8, staggered
  by player id like Petra (`simulation/ai/petra/_petrabot.js`,
  `(turn + player) % 8 == 5`), so several Strategos players never decide
  on the same turn.
- **Performance**: the bot must not slow the simulation. No full-map or
  full-entity scans per decision; use cached entity collections and the
  shared maps of the AI interface. Measure the time spent per decision
  turn and keep it bounded.

## No comments, no knowledge files

Ideas about the game that were true at one point of development, or never
true, must not survive in the repository and steer later work.

- **Bot code has no comments.** Names, structure and data carry the
  meaning.
- **Never edit `AGENTS.md` or `docs/`.** They are the project's fixed
  reference, owned by Louis; if something there seems wrong, report it to
  him.
- **No knowledge files**: no lessons-learned log, no design notes, no
  changelog. An experiment that failed at one stage of the bot may work
  at a later one; retrying it is expected.
- **Commit messages are the narrative**: what changed, why, and the
  measurement that justified it (command, seeds, numbers). A commit is
  tied to one version of the bot, so it never claims to describe the
  current one.
- Tooling (`tools/`, `scenarios/`) is outside the bot: comments and
  `tools/README.md` are allowed there and must be kept accurate.
- **No unit tests.** The only test is the game: matches and scenarios
  run in the engine, observed through telemetry and replays.

## Architecture

The architecture exists to keep the bot changeable forever: adding or
changing a behaviour must not silently change unrelated behaviours.

- **One allocator decides all spending.** Everything scarce — resources,
  population, workers, soldiers, production-queue slots, builders — is
  granted by a single central decision maker. Subsystems (economy,
  construction, expansion, military, defense, naval, technology,
  diplomacy/team play...) never spend: they submit requests (what, cost,
  value, urgency, deadline) and act only on what the allocator grants.
- **Layers, one direction**: a world model (built once per decision
  turn, read-only for everyone else) → a strategy layer that sets
  priorities → subsystems that emit requests → the allocator → executors
  that issue engine commands.
- **Subsystems do not touch each other.** They communicate only through
  the world model and the allocator, never by reading or writing another
  subsystem's state.
- **Generic first, specific where it pays.** Unit roles, costs,
  counters, production sites and technologies are read from the game
  templates at runtime, and the generic logic plays any civ under any
  setting. Play that only works in a given context — a civ's own units,
  buildings or bonuses, a victory condition (wonder, relics, regicide...),
  a map type, a game setting — is expected, as named game plans that the
  strategy layer selects from the observed context (civ, settings, map,
  state). A plan sets priorities and data on top of the generic
  subsystems and goes through the allocator like everything else; the
  context test lives in the plan's selection, never as civ names or
  setting checks scattered through the subsystems.
- **Stable decisions.** A small change to the bot or the game must cause
  a small, attributable change in behaviour: decisions use smoothed
  state, hysteresis and minimum commitment durations, and avoid
  knife-edge thresholds where one resource unit flips a choice. Chaotic
  sensitivity is a defect to fix, not a property to work around.

## Telemetry

Understanding what happened is a first-class requirement. The bot's own
telemetry lives in the AI scripts; the harness can add more through
trigger scripts and tooling engine builds (see "The game stays stock").

- The allocator ledger — every request, grant and denial with its reason
  — is the main window on the bot's behaviour.
- `print()` goes to stdout: tag lines (`[ALLOC]`, `[STRAT]`, ...), keep
  them coarse and rate-limited; the engine prints per-player statistics
  JSON at game end; trigger scripts can measure scenario outcomes.
- Logging costs simulation time: measure the turn rate with and without
  it when in doubt.

## Running games

- **Headless** with `tools/run.sh`: one isolated HOME per match, settings
  pinned, under `nice`/`ionice`. Run batches as background jobs with a
  completion notification — never poll. Syntax-check the mod before a
  batch: a broken JS file wastes every slot.
- **Use all available CPU**: boobynator (16 threads), the thinkpad
  (`ssh thinkpad`, 8 threads, when it is on and on mains power) and vps2
  (`ssh vps2`, 4 cores, 7 GB, shared with its services). Slot counts come
  from measured throughput, not habit. A host joins a batch only once its
  games are verified bit-identical to boobynator's on the same seeds.
- **Visual**: when telemetry is not enough, replay the recorded game in
  the GUI (`tools/viz.py`: in-game camera director, frames and contact
  sheets), or run a live game with the GUI. Louis can also play against
  the installed bot.
- **Scenarios**: when a behaviour needs to be measured in isolation,
  write a scenario map (`scenarios/`) that sets up the situation and
  reports the outcome; these are the tests of the project.

## Game duration

Compute and iteration time are the project's scarcest resources.

- **Every game has a limit set before it starts**: an in-game time limit
  and a wall-clock cap. `tools/run.sh` refuses to run without `-l`.
- **Be aggressively short.** Use the shortest in-game limit that can show
  what the run is for (an opening or economy question does not need a
  full game). Lengthen it only on solid, measured evidence that the extra
  minutes change the answer — e.g. results at the longer limit differ
  from results at the shorter one on the same seeds.
- **A game that lasted longer than necessary is a development failure**,
  not a cost of doing business: shorten the limit, make the scenario end
  itself as soon as its outcome is known, or fix whatever kept the game
  from ending.
- A game that hits the wall-clock cap is a defect to investigate (hang,
  stalled match, runaway slowdown), never something to retry with a
  bigger cap.

## Evaluating changes

- Compare a change against the committed bot on the same seeds (paired),
  with enough games for the difference to be real, and judge first on
  the metric the change targets, then on results.
- Rotate seeds, civs, maps, biomes and settings while iterating; never
  tune on one configuration.
- Opponents: Petra (Very Hard = difficulty 5, which also gathers 56%
  faster; every behaviour), Brennus (`~/Work/brennus` at a pinned
  commit), Strategos itself and its previous versions. Self-play is the
  main way to find flaws once Petra stops being a challenge.
- A win that relies on an opponent AI's blind spot does not count as
  progress.

## Sharing progress

- **Commit and push** to `main` on GitHub (Louis-Saglio/strategos) at
  each significant step; one concern per commit.
- **After each bot commit, install the mod into the local 0 A.D.**
  (`tools/install-local.sh`) so Louis can play against it.
