#!/usr/bin/env python3
"""The identity set: a fixed list of short games that a refactoring of the
bot must play exactly as the commit before it did.

    tools/identity.py play OUTDIR [-H HOSTS] [-m AI=SOURCE]
    tools/identity.py compare BASE_DIR NEW_DIR
    tools/identity.py coverage DIR [--bot MOD_DIR]

play runs every match of tools/identity.jsonl through tools/run.py at one
in-game limit (LIMIT_MINUTES), with the harness printing every command
(run.py --commands), into OUTDIR, which must not exist yet: a play is never
written over another one. It then checks that every game is fit (finished,
exit code 0, statistics printed, at least one command line, no error line,
the settings applied as asked, the spec played is the line of the list),
prints the wall time of the set, what is unfit, then the coverage table,
and exits 1 when a game is unfit or the coverage table cannot be trusted.

compare first checks that both directories are plays of the committed list
(the same matches in the same order at LIMIT_MINUTES, with the command
lines) and prints what it compares: for each play the bot's commit and
content hash and the harness content hash of its batch.json, and whether
the two plays ran the same bot content. It then applies the fitness checks
of play to both plays and reads them game by game:

- hash: the statistics of every player at the end of the game
  (tools/analyze.py);
- commands: every command of every player, turn by turn — the
  `[HARNESS] cmd` lines — and the replay's own commands.txt from its first
  turn on (it holds the turns and the commands of human players; the engine
  does not record an AI's commands there, which is why the harness prints
  them);
- telemetry: the bot's own lines (`[TAG] {"p":...`) other than `[PERF]`,
  which carries wall-clock times.

For a game that differs it prints the first differing turn and command of
each side, and the first differing telemetry line; for a game that is unfit
in a play, the play, the game and the reason. A game is identical when its
hash and its commands are the same and it is fit in both plays: a game with
an error or without a command line is never identical. The exit status is
1 when a game is not identical or is missing on one side; telemetry is
reported apart and does not change it, because a refactoring may change
telemetry on purpose. 2 means the two directories cannot be compared (one
is not a play of the committed list, or was played without --commands).

coverage reads the `[ALLOC]` ledgers of a play, whose keys are
`source/purpose/action:outcome` (see ledger_kind): every kind of request
(source/purpose) with how many times it was granted and denied, in how
many games, and under which actions it was granted, then the kinds the
bot's code can emit that the play never granted. The kinds of the code are
read from the bot that played (DIR/mods/strategos, or --bot): see
source_kinds. The table can be trusted only when that reading is whole: a
purpose or a source that the reading cannot follow in the code, a building
need whose purpose is not read where it is declared (see need_purposes), a method
that is handed a purpose and is called otherwise than as this.NAME( in the
class that declares it (see carrier_uses), a builder
of requests.js reached otherwise than by a plain named import and a call
by its own name, a request built in requests.js with a source or a purpose
of its own, a request written outside requests.js, a class with a
requests( method from which no kind is read and which is not composed of
classes that are read (see composition), a kind of the ledgers that the
reading does not know, or an `[ALLOC]` line that cannot be parsed, is
reported and the exit status is 1.

A line of tools/identity.jsonl is a complete match spec for run.py
--matches: tag, seed, map, size, biome, placement, victory, every game
setting, players each with difficulty, behaviour, civ and team. Nothing is
left to a default or to a draw; play and compare refuse a list with a line
that leaves something out.
"""
import argparse
import collections
import json
import os
import re
import subprocess
import sys
import time

TOOLS = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, TOOLS)
import analyze  # noqa: E402
import run  # noqa: E402

MATCHES = os.path.join(TOOLS, "identity.jsonl")
# One in-game limit for the whole set (issue #43: at most 14 minutes).
LIMIT_MINUTES = 14
# The harness resignation of the plays so far, pinned so that a change of
# run.py's default does not change the set.
RESIGN_RATIO = 0.1
SPEC_KEYS = ("tag", "seed", "map", "size", "biome", "placement", "victory", "settings", "players")
# A player of the list, as a string (AI/DIFF/BEHAVIOR:CIV:TEAM, nothing
# optional, no `*` civ) or as the object run.py records.
PLAYER_RE = re.compile(r"[\w-]+/\d/\w+:\w+:\d+")
PLAYER_KEYS = ("ai", "diff", "behavior", "civ", "team")
COMMAND_TAG = "[HARNESS] cmd "
ALLOC_TAG = "[ALLOC] "
# A telemetry line of the bot (telemetry.js, Telemetry.line).
TELEMETRY_RE = re.compile(r'\[([A-Z][A-Z0-9_]*)\] \{"p":\d+,"t":')
UNCOMPARED_TELEMETRY = {"PERF"}
# What must not appear in the log of a play (the engine's JS errors and
# warnings, on top of what analyze.py counts as errors).
PROBLEM_RE = re.compile(r"ERROR|WARNING|JavaScript error|script exception|Failed to create AI player")
WIDTH = 150


def complain(msg):
    """A line on stderr, after what stdout already holds."""
    sys.stdout.flush()
    print(f"identity: {msg}", file=sys.stderr)


def die(msg, code=2):
    complain(msg)
    sys.exit(code)


# ------------------------------------------------------------------ the list

def load_matches(path=MATCHES):
    """The lines of the list, each checked to be a complete spec."""
    with open(path, encoding="utf-8") as fh:
        lines = [json.loads(line) for line in fh if line.strip()]
    tags = [g.get("tag") for g in lines]
    if len(set(tags)) != len(tags):
        die(f"{path}: duplicate tags")
    for g in lines:
        missing = [k for k in SPEC_KEYS if k not in g]
        if missing:
            die(f"{path}: {g.get('tag')}: no {', '.join(missing)} (every spec is explicit)")
        wanted = set(run.GAME_SETTINGS) | set(run.map_info(g["map"])["options"])
        if set(g["settings"]) != wanted:
            die(f"{path}: {g['tag']}: settings must be exactly the game settings and the map's options: "
                f"missing {sorted(wanted - set(g['settings']))}, stray {sorted(set(g['settings']) - wanted)}")
        for p in g["players"]:
            if not explicit_player(p):
                die(f"{path}: {g['tag']}: player {p!r} leaves its difficulty, behaviour, civ or team implicit "
                    "(AI/DIFF/BEHAVIOR:CIV:TEAM, every spec is explicit)")
    return lines


def explicit_player(p):
    if isinstance(p, str):
        return bool(PLAYER_RE.fullmatch(p))
    return isinstance(p, dict) and all(p.get(k) is not None for k in PLAYER_KEYS) and p["civ"] != "*"


def played_spec(spec):
    """A result.json spec without what a play adds to the line of the list."""
    return {k: v for k, v in spec.items() if k not in ("mods", "limit_minutes")}


def line_spec(line):
    """A line of the list as run.py records it once played."""
    spec = dict(line)
    spec["players"] = [run.parse_player(p) if isinstance(p, str) else dict(p) for p in line["players"]]
    return spec


# ------------------------------------------------------------------ one game

def replay_path(game_dir):
    found = [os.path.join(root, "commands.txt") for root, _, files in os.walk(os.path.join(game_dir, "home"))
             if "commands.txt" in files]
    return found[0] if len(found) == 1 else None


def read_game(outdir, tag):
    """Everything compare and play need of one game, or None when it was not played."""
    d = os.path.join(outdir, tag)
    row = analyze.analyze(outdir, tag)
    if row is None or not os.path.isfile(os.path.join(d, "result.json")):
        return None
    with open(os.path.join(d, "result.json"), encoding="utf-8") as fh:
        result = json.load(fh)
    commands, telemetry, uncompared, problems = [], [], 0, []
    with open(os.path.join(d, "stdout.log"), errors="replace") as fh:
        for line in fh:
            line = line.rstrip("\n")
            if line.startswith(COMMAND_TAG):
                commands.append(line[len(COMMAND_TAG):])
                continue
            m = TELEMETRY_RE.match(line)
            if m and m.group(1) in UNCOMPARED_TELEMETRY:
                uncompared += 1
            elif m:
                telemetry.append(line)
            elif PROBLEM_RE.search(line):
                problems.append(line)
    replay = None
    path = replay_path(d)
    if path:
        with open(path, encoding="utf-8", errors="replace") as fh:
            replay = fh.read().split("\n", 1)[-1]
    return {"tag": tag, "hash": row["hash"], "outcome": row["outcome"], "game_min": row["game_min"],
            "result": result, "commands": commands, "telemetry": telemetry, "problems": problems, "replay": replay}


def batch_info(outdir):
    path = os.path.join(outdir, "batch.json")
    if not os.path.isfile(path):
        die(f"{outdir}: no batch.json, not a play")
    with open(path, encoding="utf-8") as fh:
        return json.load(fh)


def has_commands(batch):
    return bool(batch["mods"].get(run.mod_name(run.HARNESS), {}).get("commands"))


def clip(text):
    return text if len(text) <= WIDTH else text[:WIDTH - 3] + "..."


# ------------------------------------------------------------------ play

def play(a):
    lines = load_matches()
    outdir = os.path.abspath(a.outdir)
    if os.path.exists(outdir) and os.listdir(outdir):
        die(f"{outdir} exists: a play is never written over another one")
    cmd = [sys.executable, os.path.join(TOOLS, "run.py"), "-l", str(LIMIT_MINUTES), "-R", str(RESIGN_RATIO),
           "--commands", "--matches", MATCHES]
    if a.hosts:
        cmd += ["-H", a.hosts]
    for source in a.sources:
        cmd += ["-m", source]
    started = time.time()
    code = subprocess.run(cmd + [outdir]).returncode
    wall = time.time() - started
    if code:
        die(f"run.py exited {code}", 1)
    bad, longest = unfit(outdir, lines)
    print(f"\nidentity: {len(lines)} games at {LIMIT_MINUTES} in-game minutes played in {wall:.0f} s of wall time "
          f"(longest game {longest:.0f} s)")
    for tag, why in bad:
        complain(f"{tag}: {why}")
    if bad:
        complain(f"{len(bad)} of {len(lines)} games are unfit: {outdir} cannot serve as a base")
    else:
        print(f"identity: every game finished without an error: {outdir} can serve as a base")
    print()
    whole = coverage_table([outdir], None)
    sys.exit(1 if bad or not whole else 0)


def fitness(game, line):
    """Why a game of a play (read_game) is unfit to be compared or to serve as a base: [] when it is fit."""
    if game is None:
        return ["not played"]
    result = game["result"]
    why = []
    if result["exit_code"] != 0:
        why.append(f"exit code {result['exit_code']}")
    if game["hash"] == "-":
        why.append("no statistics")
    if not game["commands"]:
        why.append(f"no `{COMMAND_TAG.strip()}` line: the commands of the game were not printed, nothing to compare")
    if result.get("settings_mismatch"):
        why.append("settings not applied: " + "; ".join(result["settings_mismatch"]))
    if result.get("settings_uncontrolled"):
        why.append(f"settings nobody chose: {result['settings_uncontrolled']}")
    if played_spec(result["spec"]) != line_spec(line):
        why.append("the spec played is not the line of the list")
    if game["problems"]:
        why.append(f"{len(game['problems'])} error line(s), first: {clip(game['problems'][0])}")
    return why


def unfit(outdir, lines):
    """[(tag, why)] for the unfit games of a play, and the longest wall time of a game."""
    bad, walls = [], [0]
    for line in lines:
        game = read_game(outdir, line["tag"])
        if game is not None:
            walls.append(game["result"]["wall_seconds"])
        why = fitness(game, line)
        if why:
            bad.append((line["tag"], "; ".join(why)))
    return bad, max(walls)


# ------------------------------------------------------------------ compare

def first_difference(a, b):
    """Index of the first position where two lists differ, or None."""
    for i, (x, y) in enumerate(zip(a, b)):
        if x != y:
            return i
    return None if len(a) == len(b) else min(len(a), len(b))


def describe_command(commands, i):
    if i >= len(commands):
        return "nothing more (the play ends its commands here)"
    try:
        c = json.loads(commands[i])
        return clip(f"turn {c['turn']} player {c['p']} {json.dumps(c['c'], separators=(',', ':'))}")
    except (ValueError, KeyError):
        return clip(commands[i])


def describe_replay(replay, i):
    """The replay line at index i with the turn it belongs to."""
    lines = replay.split("\n")
    if i >= len(lines):
        return "nothing more"
    turn = next((l for l in reversed(lines[:i + 1]) if l.startswith("turn ")), "before the first turn")
    return clip(f"{turn}: {lines[i]}")


def not_the_list(batch, lines):
    """Why a batch.json is not a play of the list (same matches, same order, the set's limit), or None."""
    played = batch.get("matches")
    if not isinstance(played, list) or not all(isinstance(m, dict) for m in played):
        return "its batch.json lists no matches"
    tags, wanted = [m.get("tag") for m in played], [line["tag"] for line in lines]
    if tags != wanted:
        missing, stray = [t for t in wanted if t not in tags], [t for t in tags if t not in wanted]
        return (f"{len(tags)} matches for the {len(wanted)} of the list"
                + (f", without {' '.join(missing[:8])}" if missing else "")
                + (f", with {' '.join(map(str, stray[:8]))}" if stray else "")
                + ("" if missing or stray else ", in another order"))
    limits = sorted({m.get("limit_minutes") for m in played}, key=str)
    if limits != [LIMIT_MINUTES]:
        return f"played at a limit of {limits} minutes, the set is played at {LIMIT_MINUTES}"
    changed = [m["tag"] for m, line in zip(played, lines) if played_spec(m) != line_spec(line)]
    if changed:
        return f"not the spec of the list: {' '.join(changed[:8])}"
    return None


def describe_plays(dirs, batches):
    """What is compared: per play the bot and the harness of its batch.json, and whether the bots are one."""
    harness = run.mod_name(run.HARNESS)
    bots = []
    for side, d, batch in zip(("base", "new "), dirs, batches):
        mods = batch.get("mods", {})
        bot = {name: info.get("content") for name, info in mods.items() if name != harness}
        bots.append(bot)
        told = ", ".join(f"{name} commit {info.get('commit')} content {info.get('content')}"
                         for name, info in sorted(mods.items()) if name != harness) or "no bot recorded"
        print(f"identity: {side} {d}: {told}; harness content {mods.get(harness, {}).get('content')}")
    contents = [batch.get("mods", {}).get(harness, {}).get("content") for batch in batches]
    if bots[0] == bots[1]:
        print("identity: both plays ran the SAME bot content ("
              + ", ".join(f"{name} {content}" for name, content in sorted(bots[0].items()))
              + "): this compares a bot with itself")
    else:
        print("identity: the two plays ran different bot contents")
    print("identity: the harness content is " + ("the same" if contents[0] == contents[1] else
                                                 f"not the same ({contents[0]} / {contents[1]})"))


def compare(a):
    lines = load_matches()
    dirs = [os.path.abspath(a.base), os.path.abspath(a.new)]
    batches = [batch_info(d) for d in dirs]
    for d, batch in zip(dirs, batches):
        if not has_commands(batch):
            die(f"{d} was played without run.py --commands: no command to compare (play it with identity.py play)")
        why = not_the_list(batch, lines)
        if why:
            die(f"{d} is not a play of {MATCHES} ({why}): not comparable (play it with identity.py play)")
    describe_plays(dirs, batches)
    width = max(len(line["tag"]) for line in lines)
    print(f"\n{'game'.ljust(width)}  hash       commands   telemetry")
    details, unfit_games, counts = [], [], collections.Counter()
    for line in lines:
        tag = line["tag"]
        x, y = read_game(dirs[0], tag), read_game(dirs[1], tag)
        faults = [(side, fitness(game, line)) for side, game in (("base", x), ("new", y))]
        faults = [(side, why) for side, why in faults if why]
        unfit_games += [f"{tag}: unfit in the {side} play: {'; '.join(why)}" for side, why in faults]
        counts["unfit"] += bool(faults)
        mark = f"  UNFIT ({', '.join(side for side, _ in faults)})" if faults else ""
        if x is None or y is None or "-" in (x["hash"], y["hash"]):
            print(f"{tag.ljust(width)}  MISSING ({'base' if x is None or x['hash'] == '-' else 'new'} play has no "
                  f"finished game){mark}")
            counts["missing"] += 1
            continue
        same_hash = x["hash"] == y["hash"]
        at = first_difference(x["commands"], y["commands"])
        replay_at = None if x["replay"] == y["replay"] else \
            first_difference((x["replay"] or "").split("\n"), (y["replay"] or "").split("\n"))
        printed = bool(x["commands"]) and bool(y["commands"])
        same_commands = printed and at is None and x["replay"] == y["replay"]
        tel = first_difference(x["telemetry"], y["telemetry"])
        counts["hash"] += same_hash
        counts["commands"] += same_commands
        counts["telemetry"] += tel is None
        counts["identical"] += same_hash and same_commands and not faults
        print(f"{tag.ljust(width)}  {'same' if same_hash else 'DIFFERS':9}  "
              f"{'same' if same_commands else 'DIFFERS' if printed else 'NONE':9}  "
              f"{'same' if tel is None else 'differs'}{mark}")
        if not same_hash:
            details.append(f"{tag}: statistics hash {x['hash']} -> {y['hash']} "
                           f"({x['outcome']} at {x['game_min']} min -> {y['outcome']} at {y['game_min']} min)")
        if at is not None:
            details.append(f"{tag}: first differing command, number {at + 1} of {len(x['commands'])} / "
                           f"{len(y['commands'])}\n    base: {describe_command(x['commands'], at)}\n"
                           f"    new:  {describe_command(y['commands'], at)}")
        if replay_at is not None:
            details.append(f"{tag}: the replays differ\n    base: {describe_replay(x['replay'] or '', replay_at)}\n"
                           f"    new:  {describe_replay(y['replay'] or '', replay_at)}")
        if tel is not None:
            details.append(f"{tag}: first differing telemetry line, number {tel + 1} of {len(x['telemetry'])} / "
                           f"{len(y['telemetry'])}\n"
                           f"    base: {clip(x['telemetry'][tel]) if tel < len(x['telemetry']) else 'nothing more'}\n"
                           f"    new:  {clip(y['telemetry'][tel]) if tel < len(y['telemetry']) else 'nothing more'}")
    if details:
        print()
        print("\n".join(details))
    if unfit_games:
        print()
        for told in unfit_games:
            complain(told)
    n = len(lines)
    print(f"\nidentity: {counts['identical']} of {n} games identical (statistics hash and commands, fit in both "
          f"plays): hash {counts['hash']} of {n}, commands {counts['commands']} of {n}"
          + (f", {counts['missing']} missing" if counts["missing"] else "")
          + (f", {counts['unfit']} unfit (a game with an error or without commands is never identical)"
             if counts["unfit"] else "")
          + f"; telemetry identical in {counts['telemetry']} of {n}")
    sys.exit(0 if counts["identical"] == n else 1)


# ------------------------------------------------------------------ coverage

# A source, a purpose, an action, an outcome: lower-case words joined by hyphens.
NAME = r"[a-z][a-z0-9-]*"
KEY_RE = re.compile(rf"({NAME}/{NAME})/({NAME}!?):({NAME})\Z")


def ledger_kind(key):
    """A key of the `outcomes` of an [ALLOC] line -> (kind of request, action, outcome).

    The allocator (allocator.js, record) writes `source/purpose/action:outcome`,
    the action followed by `!` when the request is of the production tier; a
    reservation has no action and `reserve` is written in its place. The
    kind is `source/purpose`: the table sums over the actions and the tiers of
    a kind, and names them beside it. A key of another form (a ledger written
    before requests had a purpose) is a ValueError: the line is then reported
    as malformed. This function and source_kinds are the only two places that
    know what a kind is made of."""
    m = KEY_RE.match(key)
    if not m:
        raise ValueError(key)
    return m.groups()


# The module that builds every request (issue #44). Its functions are
# declared `function NAME(...)` at the start of a line; a maker is one whose
# first two parameters are the source and the purpose, and a builder is an
# exported maker: what the subsystems call.
REQUESTS_MODULE = "requests.js"
FUNCTION_RE = re.compile(r"^(export )?function (\w+)\(([^()\n]*)\)", re.M)
# The one form in which a file of the bot names the module: the names it
# imports are then the module's own, and nothing else reaches a builder.
IMPORT_RE = re.compile(r'^import \{\s*\w+(?:,\s*\w+)*\s*\} from "simulation/ai/strategos/requests\.js";$', re.M)
CLASS_RE = re.compile(r"^export class (\w+)", re.M)
# A method of a class, as the bot's code declares one: `\tname(parameters)` on
# its own line. A carrier is a method that is handed a purpose:
# `\tname(..., purpose, ...)`.
METHOD_RE = re.compile(r"^\t(\w+)\(([^()\n]*)\)$", re.M)
CARRIER_RE = re.compile(r"^\t(\w+)\(([^()\n]*\bpurpose\b[^()\n]*)\)$", re.M)
# A class created inside another: `new NAME(`.
CREATED_RE = re.compile(r"\bnew (\w+)\(")
LITERAL_RE = re.compile(rf'"({NAME})"\Z')
CHOICE_RE = re.compile(rf'[^"?:]+\?\s*"({NAME})"\s*:\s*"({NAME})"\Z')
WRITTEN_RE = re.compile(r'"(?:claims|purpose)"\s*:')
# The one record with a key "purpose" outside requests.js: an assignment of
# the allocator (which request a unit was granted to), which copies the
# source and the purpose of that request, side by side and as they are:
# `"source": request.source, "purpose": request.purpose,`. The pair is the
# kind of a request a builder built, where it is read, so the record names no
# kind of its own. Let through in ALLOCATOR_MODULE only, in that form only
# (the name `request`, both fields, nothing computed): anywhere else a
# purpose written is a request rewritten.
ALLOCATOR_MODULE = "allocator.js"
COPIED_RE = re.compile(r'"source"\s*:\s*request\.source\s*,\s*("purpose"\s*:)\s*request\.purpose\s*[,}]')
# The same assignment, saved for a saved game (Allocator.save), keeps of the
# request's claims only its units, copied as they are:
# `"claims": { "units": request.claims.units }`. Let through in
# ALLOCATOR_MODULE only, in that form only.
SAVED_CLAIMS_RE = re.compile(r'("claims"\s*:)\s*\{\s*"units"\s*:\s*request\.claims\.units\s*\}')
# The module that says what a building need is (issue #54): a record that carries a purpose as data, which one
# class (Construction) turns into a request. A maker of needs is a function of that module declared, before any
# class, `export function NAME(purpose, ...)` at the start of a line, whose body up to its closing `}` names
# the purpose once, as the whole value of a key, `"purpose": purpose`: the purpose goes untouched from the
# first argument of a call of the maker to the record. The class that builds the requests of the needs hands the purpose of one to a
# builder as `need.purpose`, in those words (NEED_PURPOSE).
NEEDS_MODULE = "construction-needs.js"
NEEDS_IMPORT_RE = re.compile(r'^import \{\s*\w+(?:,\s*\w+)*\s*\} from "simulation/ai/strategos/construction-needs\.js";$', re.M)
MAKER_RE = re.compile(r'^export function (\w+)\((purpose)\b[^()\n]*\)\n\{\n(.*?)^\}', re.M | re.S)
NEED_PURPOSE = "need.purpose"


def copied(name, text):
    """The offsets, in a text of the file `name`, of the keys `"purpose":` and `"claims":` it may write: those of
    COPIED_RE and SAVED_CLAIMS_RE, in allocator.js; none in any other file."""
    if name != ALLOCATOR_MODULE:
        return set()
    return {m.start(1) for pattern in (COPIED_RE, SAVED_CLAIMS_RE) for m in pattern.finditer(text)}


def regions(text, pattern):
    """[(name, text, lines before it)] of the top-level blocks a pattern starts, each up to the next one."""
    marks = list(pattern.finditer(text))
    return [(m.group(1), text[m.start():marks[i + 1].start() if i + 1 < len(marks) else len(text)],
             text.count("\n", 0, m.start())) for i, m in enumerate(marks)]


def place(name, text, offset):
    """`FILE line N (the line)` of an offset of the text of a file."""
    begin, end = text.rfind("\n", 0, offset) + 1, text.find("\n", offset)
    return f"{name} line {text.count(chr(10), 0, offset) + 1} (`{clip(text[begin:end if end >= 0 else len(text)].strip())}`)"


def call_arguments(text, opening):
    """[(begin, end)] of the arguments of the call whose `(` is text[opening], or None when it does not close."""
    depth, quote, begin, spans, i = 0, None, opening + 1, [], opening
    while i < len(text):
        c = text[i]
        if quote:
            if c == "\\":
                i += 1
            elif c == quote:
                quote = None
        elif c in "\"'`":
            quote = c
        elif c in "([{":
            depth += 1
        elif c in ")]}":
            depth -= 1
            if depth == 0:
                return spans + [(begin, i)]
        elif c == "," and depth == 1:
            spans.append((begin, i))
            begin = i + 1
        i += 1
    return None


def literals(argument):
    """The names an argument can take: one string literal, or `condition ? "a" : "b"`; None for anything else."""
    for pattern in (LITERAL_RE, CHOICE_RE):
        m = pattern.match(argument)
        if m:
            return list(m.groups())
    return None


def need_makers(text):
    """({maker: the offset of its name where it is declared}, the offsets of the words `purpose` the makers may
    write) in the text of NEEDS_MODULE; nothing when the module has no function of the form of MAKER_RE.

    A function of the module that takes a purpose otherwise, or does anything else with it than write it once
    as `"purpose": purpose`, is no maker: its words `purpose` are then reported as every other use of the word
    outside a class is (class_kinds), and its key `"purpose":` as a request written by hand."""
    first = CLASS_RE.search(text)
    makers, made = {}, set()
    for m in MAKER_RE.finditer(text[:first.start()] if first else text):
        body = m.group(3)
        keys = list(re.finditer(r'"purpose"\s*:\s*(purpose)\s*[,}]', body))
        if len(keys) == 1 and [w.start() for w in re.finditer(r"\bpurpose\b", body)] == [keys[0].start() + 1, keys[0].start(1)]:
            makers[m.group(1)] = m.start(1)
            made |= {m.start(2), m.start(3) + keys[0].start() + 1, m.start(3) + keys[0].start(1)}
    return makers, made


def need_purposes(texts, makers):
    """(the purposes of the needs the bot declares, what could not be read), over {file: text} of every file.

    A need is declared by a call of a maker (need_makers) by its own name, in whatever file — the table of
    construction-needs.js, a plan that brings a need of its own — and its purpose is the first argument of that
    call, read when it is a string literal or a choice between two (literals). Refused, as the builders of
    requests.js are: the module named otherwise than in a plain named import, a maker named otherwise than
    called by its own name (handed to a variable, called on an object, through .call), a first argument that
    is anything else. A need made otherwise than by a maker has to write its purpose by hand, and that is
    refused where every `"purpose":` and every word `purpose` outside a request is (source_kinds,
    class_kinds); so is a purpose assigned to a need once it is made (`need.purpose = ...`)."""
    purposes, unread = set(), []
    for name, text in texts.items():
        told = {number for m in NEEDS_IMPORT_RE.finditer(text)
                for number in range(text.count("\n", 0, m.start()), text.count("\n", 0, m.end()) + 1)}
        for m in re.finditer(re.escape(NEEDS_MODULE), text):
            if text.count("\n", 0, m.start()) not in told:
                told.add(text.count("\n", 0, m.start()))
                unread.append(f"{place(name, text, m.start())}: {NEEDS_MODULE} is named otherwise than in "
                              f"`import {{ NAME, ... }} from \"simulation/ai/strategos/{NEEDS_MODULE}\";`")
        for maker, declared in sorted(makers.items()):
            for m in re.finditer(rf"\b{maker}\b", text):
                if name == NEEDS_MODULE and m.start() == declared:
                    continue
                if text[m.end():m.end() + 1] != "(" or text[m.start() - 1:m.start()] == ".":
                    if text.count("\n", 0, m.start()) not in told:
                        unread.append(f"{place(name, text, m.start())}: the maker of needs {maker} is used otherwise than "
                                      f"called as {maker}(...)")
                    continue
                spans = call_arguments(text, m.end())
                named = literals(text[slice(*spans[0])].strip()) if spans else None
                if named is None:
                    unread.append(f"{place(name, text, m.start())}: the purpose of a need is neither a string literal "
                                  "nor a choice between two")
                else:
                    purposes.update(named)
    return purposes, unread


def class_kinds(name, where, body, builders, above=0, made=frozenset()):
    """(the sources named, the purposes named, what could not be read) in the text of one class of the file
    `name`, which starts `above` lines down that file and is reported as `where`.

    A purpose is named where a request is built: as the second argument of a
    builder, or as the `purpose` argument of a method of the class that hands
    it on (a carrier: it has a parameter called `purpose` and is called as
    `this.NAME(`). It is read when it is a string literal or a choice between
    two; the word `purpose` itself, in a carrier, is the purpose handed on.
    A source is the first argument of a builder and must be a string literal.
    Anything else that these positions hold, and any other use of the word
    `purpose` (a variable, a field written) is something this reading cannot
    follow: it is returned as unread. What is let through: the purpose of a
    request read as a field (`request.purpose`, compared or read, never
    assigned), the keys that `copied` allows the file, and the words of a
    maker of needs (`made`, their offsets in the body: need_makers). A carrier
    reached otherwise than as `this.NAME(` in this class is not seen here: see
    carrier_uses.

    The fourth value tells where the class hands the purpose of a building
    need to a builder or a carrier, as `need.purpose` (NEED_PURPOSE): the
    purposes of that request are then those of the needs the bot declares
    (need_purposes), which source_kinds adds to the purposes of the class."""
    sources, purposes, unread, followed, handed = set(), set(), [], set(), []

    def line(offset):
        return f"{where} line {above + body.count(chr(10), 0, offset) + 1}"

    carriers = {}
    for m in CARRIER_RE.finditer(body):
        parameters = [p.strip() for p in m.group(2).split(",")]
        carriers[m.group(1)] = parameters.index("purpose")
        followed.add(m.start(2) + re.search(r"\bpurpose\b", m.group(2)).start())
    calls = [(m, 1, True) for name in builders for m in re.finditer(rf"(?<![.\w]){name}\(", body)]
    for name, index in carriers.items():
        calls += [(m, index, False) for m in re.finditer(rf"\bthis\.{name}\(", body)]
    for m, index, builder in calls:
        spans = call_arguments(body, m.end() - 1)
        if spans is None or len(spans) <= index:
            unread.append(f"{line(m.start())}: the arguments of {m.group(0)}...) cannot be read")
            continue
        if builder:
            named = literals(body[slice(*spans[0])].strip())
            if named is None or len(named) != 1:
                unread.append(f"{line(m.start())}: the source of {m.group(0)}...) is not a string literal")
            else:
                sources.add(named[0])
        begin, end = spans[index]
        argument = body[begin:end].strip()
        if argument == "purpose":
            followed.add(body.index("purpose", begin, end))
            continue
        if argument == NEED_PURPOSE:
            handed.append(line(m.start()))
            continue
        named = literals(argument)
        if named is None:
            unread.append(f"{line(m.start())}: the purpose of {m.group(0)}...) is `{clip(argument)}`, "
                          "neither a string literal nor a choice between two")
        else:
            purposes.update(named)
    copies = copied(name, body)
    for m in re.finditer(r"\bpurpose\b", body):
        field_read = body[m.start() - 1:m.start()] == "." and not re.match(r"\s*=[^=]", body[m.end():])
        if m.start() not in followed and m.start() - 1 not in copies and m.start() not in made and not field_read:
            unread.append(f"{line(m.start())}: `purpose` is used where no request is built")
    return sources, purposes, unread, handed


def carrier_uses(where, body, above, carriers):
    """What a text (one class, what a file holds outside its classes, requests.js) does with the name of a
    carrier that the reading cannot follow; `where` and `above` as in class_kinds, `carriers` {method name: [the
    classes that declare a carrier of that name]} over the whole bot.

    class_kinds reads the purpose a carrier is handed in one place: a call
    `this.NAME(` in the class that declares it. Called from anywhere else
    the carrier may be handed a purpose that is read nowhere (`this.tug =
    new Tug()` then `this.tug.haul("tow", ...)` in Naval: the kind naval/tow
    would be in no list), and this reading does not know of which class an
    object is. So every other call that names a carrier is refused, in
    every file and whatever the object:
    - `.NAME(` or `["NAME"](` on anything (`this.tug.haul(`, `tug.haul(`),
      `this.NAME(` in a class that declares no method NAME included;
    - `NAME(` on its own (the method taken out of its object and called, a
      function of that name);
    - each of these through `.call(`, `.apply(` or `.bind(`, or as `?.(`;
    - `this.NAME` otherwise than called, in the class that declares the
      carrier.
    One call is let through besides the one class_kinds reads: `this.NAME(`
    in a class that declares a method NAME of its own that takes no purpose
    (Executor.unload beside Convoys.unload). The method `this` reaches is
    the class's own before any other, so that call is no call of the
    carrier, and refusing it would forbid a method name to every class once
    one carrier has it. That same method called on another object
    (`executor.unload(`) is refused: there the name is all this reading has.
    A name that is not called (`worker.haul` read as a field, a variable, a
    parameter, a key, a string) is not looked at: a record may have a field
    named as a carrier is. So one thing is not seen: a carrier taken from
    another object as a value and called under another name (`const pull =
    part.haul`, `list.map(part.haul)`, a destructuring that renames it), or
    reached under a computed name (`part[name](...)`)."""
    own = {m.group(1) for m in CARRIER_RE.finditer(body)}
    declared = {m.start(1): m.group(1) for m in METHOD_RE.finditer(body)}
    methods = set(declared.values())
    faults = []
    for name in sorted(carriers):
        for m in re.finditer(rf'(?<![\w$]){name}(?![\w$])|\[\s*(["\'`]){name}\1\s*\]', body):
            if m.start() in declared:
                continue
            before, after = body[:m.start()], body[m.end():]
            direct = after.startswith("(")
            called = direct or re.match(r"\s*(?:\??\.\s*(?:call|apply|bind)\s*)?(?:\?\.\s*)?\(", after)
            if m.group(1) is None and re.search(r"(?<![\w$.])this\.$", before):
                # On `this`: the call class_kinds reads, the class's own method that takes no purpose, a field.
                if direct if name in own else name in methods or not called:
                    continue
            elif not called:
                continue
            begin, end = body.rfind("\n", 0, m.start()) + 1, body.find("\n", m.start())
            faults.append(f"{where} line {above + body.count(chr(10), 0, m.start()) + 1} "
                          f"(`{clip(body[begin:end if end >= 0 else len(body)].strip())}`): {name} is a method that takes "
                          f"a purpose ({', '.join(carriers[name])}) and is used here otherwise than called as "
                          f"this.{name}( in the class that declares it: a purpose it is handed here is read nowhere")
    return faults


def composition(where, body, read):
    """What makes a class that has a `requests(` method and names no purpose unread, [] when its requests are
    those of its parts.

    A subsystem may be composed: its class builds no request and returns
    those of the classes it creates (Naval: the fishing, the convoys, the
    hunt...), each in a file of its own and read as a class like any other,
    so the kinds of the subsystem are the kinds of its parts and the class
    that composes them adds none. `read` is {class name: [(file, sources,
    purposes)]} over every class of the bot. The class is taken as composed
    when
    - it creates, as `new NAME(`, at least one class of the bot that names
      purposes: its parts (a class it creates that names none, a register or
      a switch, is not one);
    - every part is one class (a name declared once in the bot) and all name
      the same source: a subsystem has one.
    A class that is handed its parts, or reaches them otherwise than by
    creating them, is not followed and stays unread. A purpose it would
    name itself as the argument of a part's method is refused where every
    such call is (carrier_uses). The parts are those the class creates
    itself: a part that names purposes and creates a class of another
    source is not looked into, so the one-source rule does not cross that
    nesting; the nested class is read as a class like any other and its
    kinds are in the table."""
    created = sorted({m.group(1) for m in CREATED_RE.finditer(body)} & set(read))
    parts = [name for name in created if any(purposes for _, _, purposes in read[name])]
    if not parts:
        return [f"{where} has a requests( method and names no purpose, and creates no class that names one"]
    faults = []
    for name in parts:
        if len(read[name]) > 1:
            faults.append(f"{where} creates {name}, which {len(read[name])} files declare "
                          f"({', '.join(sorted(file for file, _, _ in read[name]))})")
    sources = sorted({source for name in parts for _, sources, _ in read[name] for source in sources})
    if len(sources) != 1:
        faults.append(f"{where} has a requests( method, names no purpose, and its parts ({', '.join(parts)}) name "
                      f"{len(sources)} sources ({', '.join(sources)}): a composed subsystem has one")
    return faults


def module_builders(module):
    """(the builders of requests.js, what could not be read in it).

    The kinds are read where the subsystems call the builders, so the module
    itself must name no source and no purpose: both go untouched from the
    parameters of a builder to the request. That holds when
    - every function is declared `function NAME(...)` at the start of a line,
      and every export is one of them (no arrow function, no class, no
      exported constant: none could be followed);
    - `source` and `purpose` are parameters of the makers only, first and
      second;
    - a maker is named only where it is declared or called, and every call
      of one is inside a maker and hands on `source, purpose` as its first two
      arguments;
    - a request is written (`"claims":`, `"purpose":`) only inside a maker, as
      `"source": source` and `"purpose": purpose`;
    - the words `source` and `purpose` appear nowhere else (`"source"` as the
      key of an action is not the word: tradeRoute has one).
    Anything else is returned as unread."""
    unread = []

    def line(offset):
        return f"{REQUESTS_MODULE} line {module.count(chr(10), 0, offset) + 1}"

    marks = list(FUNCTION_RE.finditer(module))
    declared = {m.start() + len(m.group(1) or "") for m in marks}
    exported = {m.start() for m in marks if m.group(1)}
    for m in re.finditer(r"\bfunction\b|=>|\bclass\b", module):
        if m.start() not in declared:
            unread.append(f"{line(m.start())}: `{m.group(0)}`, a function that is not declared `function NAME(...)` "
                          "at the start of a line")
    for m in re.finditer(r"\bexport\b", module):
        if m.start() not in exported:
            unread.append(f"{line(m.start())}: an export that is not `export function NAME(...)`")
    parameters = {m.group(2): [p.strip() for p in m.group(3).split(",")] for m in marks}
    makers = {name for name, listed in parameters.items() if listed[:2] == ["source", "purpose"]}
    misdeclared = set()
    for m in marks:
        listed = parameters[m.group(2)]
        if {"source", "purpose"} & set(listed if m.group(2) not in makers else listed[2:]):
            misdeclared.add(m.group(2))
            unread.append(f"{line(m.start())}: {m.group(2)}({m.group(3)}) takes a source or a purpose and is not a "
                          "builder (source, purpose, ...)")
    # The text before the first function, then each function up to the next one.
    bounds = [m.start() for m in marks] + [len(module)]
    blocks = [(None, 0, bounds[0])] + [(m, m.start(), bounds[i + 1]) for i, m in enumerate(marks)]
    for mark, begin, end in blocks:
        if mark is not None and mark.group(2) in misdeclared:
            continue
        body = module[begin:end]
        maker = mark is not None and mark.group(2) in makers
        followed = set()
        if maker:
            followed |= {mark.start(3) + re.search(rf"\b{word}\b", mark.group(3)).start() for word in ("source", "purpose")}
        for name in makers:
            for m in re.finditer(rf"\b{name}\b", body):
                at = begin + m.start()
                if mark is not None and at == mark.start(2):
                    continue
                if module[at - 1] == "." or module[at + len(name):at + len(name) + 1] != "(":
                    unread.append(f"{line(at)}: {name} is used otherwise than called as {name}(...)")
                    continue
                spans = call_arguments(module, at + len(name))
                handed = [module[b:e].strip() for b, e in spans[:2]] if spans else []
                if not maker or handed != ["source", "purpose"]:
                    unread.append(f"{line(at)}: {name}({clip(', '.join(handed))}, ...) builds a request whose source and "
                                  "purpose are not the parameters `source, purpose` of the function it is in")
                else:
                    followed |= {module.index("source", *spans[0]), module.index("purpose", *spans[1])}
        sources = list(re.finditer(r'"source"\s*:\s*(source\b)', body))
        purposes = list(re.finditer(r'"purpose"\s*:\s*(purpose\b)', body))
        written = list(re.finditer(r'"claims"\s*:', body))
        if maker:
            followed |= {begin + m.start(1) for m in sources + purposes} | {begin + m.start() + 1 for m in purposes}
        if (purposes or written) and not (maker and len(purposes) == len(sources) == len(re.findall(r'"source"\s*:', body))
                                          and len(written) <= len(purposes)):
            unread.append(f"{line(begin + (written or purposes)[0].start())}: a request is written whose source and "
                          "purpose are not the parameters `source, purpose` of the function it is in")
        for m in re.finditer(r'\bpurpose\b|(?<!")\bsource\b(?!")', body):
            if begin + m.start() not in followed:
                unread.append(f"{line(begin + m.start())}: `{m.group(0)}` is used otherwise than handed on from the "
                              "parameters of a builder to the request")
    builders = {m.group(2) for m in marks if m.group(1) and m.group(2) in makers}
    if not builders:
        unread.append(f"{REQUESTS_MODULE}: no builder `export function NAME(source, purpose, ...)`")
    return builders, unread


def source_kinds(bot_dir):
    """The kinds of request (source/purpose) the bot's code can emit, read
    from its source, and what the reading could not read.

    Every request is built by a builder of requests.js, an exported function
    whose first two parameters are the source and the purpose
    (module_builders). A subsystem is a class, or a class composed of others
    (composition); class_kinds reads the one source a class names and the
    purposes it names, and its kinds are that source with each of those
    purposes. A class may also build the requests of the building needs,
    records that carry their purpose as data: it hands `need.purpose` to a
    builder, and its purposes are then, besides those it names, the
    purposes of every need the bot declares (need_makers, need_purposes).
    Every .js file under the AI's directory is read, in whatever
    subdirectory it is put.

    The second value lists what makes the kinds less than the whole of what
    the code emits, and the caller must say so: what module_builders could
    not follow in requests.js, what class_kinds could not follow, a method
    that is handed a purpose and is called otherwise than as `this.NAME(` in
    the class that declares it (carrier_uses, over every file, requests.js
    included), a file
    that names requests.js otherwise than in a plain named import (a
    namespace, an alias, a re-export: its builders would be called under
    names this reading does not know), a builder named otherwise than called
    by its own name (handed to a variable, called on an object), a builder
    called or a purpose named outside a class, a request written by hand
    outside requests.js (`"claims":` anywhere but in an assignment saved
    by allocator.js, SAVED_CLAIMS_RE, or `"purpose":` anywhere but in an
    assignment of allocator.js, COPIED_RE, and in a maker of needs), a
    class with purposes and no source, a class with a `requests(` method
    and no kind that is not composed of classes that have some
    (composition), a building need that need_purposes cannot read, needs
    declared that no class hands to a builder, `need.purpose` handed to a
    builder when no need is declared or by classes of several sources."""
    root = os.path.join(bot_dir, "simulation/ai/strategos")
    # Every .js file of the AI, wherever it is put: a file is named by its path below the root.
    texts = {}
    for folder, _, names in sorted(os.walk(root)):
        for name in sorted(names):
            if name.endswith(".js"):
                path = os.path.join(folder, name)
                with open(path, encoding="utf-8") as fh:
                    texts[os.path.relpath(path, root)] = fh.read()
    module = texts.pop(REQUESTS_MODULE, None)
    if module is None:
        return set(), [f"{REQUESTS_MODULE}: no such file in {root}: this bot does not build its requests in one module"]
    builders, unread = module_builders(module)
    makers, made = need_makers(texts.get(NEEDS_MODULE, ""))
    needs, faults = need_purposes(dict(texts, **{REQUESTS_MODULE: module}), makers)
    unread += faults
    # The classes that hand the purpose of a need to a builder, as (where, sources): judged once all are read.
    handing = []
    kinds = set()
    # Every class read, by name, and the classes with a requests( method and no purpose: judged once all are read.
    read, silent = collections.defaultdict(list), []
    # Every text in which a carrier may be reached, as (where, text, lines before it), requests.js first, and the
    # classes that declare each carrier: judged once all are read too.
    scanned, carriers = [(REQUESTS_MODULE, module, 0)], collections.defaultdict(list)
    for name, text in texts.items():
        copies = copied(name, text)
        allowed = made if name == NEEDS_MODULE else frozenset()
        for m in WRITTEN_RE.finditer(text):
            if m.start() in copies or m.start() + 1 in allowed:
                continue
            unread.append(f"{name} line {text.count(chr(10), 0, m.start()) + 1}: {m.group(0)} a request is written "
                          f"outside {REQUESTS_MODULE}")
        # The lines of the plain imports, where a builder is named without being called, and the lines already
        # reported for naming the module otherwise.
        told = {number for m in IMPORT_RE.finditer(text)
                for number in range(text.count("\n", 0, m.start()), text.count("\n", 0, m.end()) + 1)}
        for m in re.finditer(re.escape(REQUESTS_MODULE), text):
            if text.count("\n", 0, m.start()) not in told:
                told.add(text.count("\n", 0, m.start()))
                unread.append(f"{place(name, text, m.start())}: {REQUESTS_MODULE} is named otherwise than in "
                              f"`import {{ NAME, ... }} from \"simulation/ai/strategos/{REQUESTS_MODULE}\";`")
        for builder in sorted(builders):
            for m in re.finditer(rf"\b{builder}\b", text):
                called = text[m.end():m.end() + 1] == "(" and text[m.start() - 1:m.start()] != "."
                if not called and text.count("\n", 0, m.start()) not in told:
                    unread.append(f"{place(name, text, m.start())}: the builder {builder} is used otherwise than called "
                                  f"as {builder}(...)")
        classes = regions(text, CLASS_RE)
        first = CLASS_RE.search(text)
        outside = text[:first.start()] if first else text
        sources, purposes, faults, handed = class_kinds(name, name, outside, builders, 0, allowed)
        unread += faults
        scanned.append((name, outside, 0))
        if sources or purposes or handed:
            unread.append(f"{name}: a request is built outside a class ({', '.join(sorted(sources | purposes))})")
        for cls, body, above in classes:
            sources, purposes, faults, handed = class_kinds(name, f"{name}: class {cls},", body, builders, above)
            unread += faults
            if handed:
                handing.append((f"{name}: class {cls}", sources))
                purposes |= needs
            if len(sources) > 1:
                die(f"{name}: class {cls} names {len(sources)} sources ({', '.join(sorted(sources))}): "
                    "source_kinds reads one per subsystem")
            if purposes and not sources:
                unread.append(f"{name}: class {cls} names purposes ({', '.join(sorted(purposes))}) and no source")
            elif "\trequests(" in body and not purposes:
                if sources:
                    unread.append(f"{name}: class {cls} has a requests( method and names no purpose")
                else:
                    silent.append((f"{name}: class {cls}", body))
            read[cls].append((name, sources, purposes))
            scanned.append((f"{name}: class {cls},", body, above))
            kinds |= {f"{source}/{purpose}" for source in sources for purpose in purposes}
    for where, body, _ in scanned[1:]:
        for carrier in sorted({m.group(1) for m in CARRIER_RE.finditer(body)}):
            carriers[carrier].append(where.rstrip(","))
    for where, body, above in scanned:
        unread += carrier_uses(where, body, above, carriers)
    for where, body in silent:
        unread += composition(where, body, read)
    # The needs are the requests of one subsystem: a purpose declared has to be handed to a builder by a class,
    # and by classes of one source only, or the kinds it makes are not known.
    if needs and not handing:
        unread.append(f"building needs are declared ({', '.join(sorted(needs))}) and no class hands `{NEED_PURPOSE}` to a "
                      f"builder of {REQUESTS_MODULE}: their requests are built where this reading does not see")
    if handing and not needs:
        unread.append(f"{', '.join(where for where, _ in handing)}: `{NEED_PURPOSE}` is handed to a builder and no need is "
                      f"declared by a maker of {NEEDS_MODULE}")
    if len({source for _, sources in handing for source in sources}) > 1:
        told = "; ".join(where + ": " + ", ".join(sorted(sources)) for where, sources in handing)
        unread.append(f"`{NEED_PURPOSE}` is handed to a builder by classes of several sources ({told}): "
                      "the needs are the requests of one subsystem")
    return kinds, unread


def ledger(outdirs):
    """Over the [ALLOC] lines of plays: {kind: {outcome: count}}, {kind: {action granted: count}}, {kind: games
    granting it}, the number of games read, and the lines that are not a ledger ("path:line number: text")."""
    outcomes, actions = collections.defaultdict(collections.Counter), collections.defaultdict(collections.Counter)
    games, played, malformed = collections.defaultdict(set), 0, []
    for outdir in outdirs:
        for tag in sorted(os.listdir(outdir), key=analyze.natural):
            path = os.path.join(outdir, tag, "stdout.log")
            if not os.path.isfile(path):
                continue
            played += 1
            with open(path, errors="replace") as fh:
                for number, line in enumerate(fh, 1):
                    if not line.startswith(ALLOC_TAG):
                        continue
                    try:
                        counted = [ledger_kind(key) + (int(n),)
                                   for key, n in json.loads(line[len(ALLOC_TAG):])["outcomes"].items()]
                    except (ValueError, KeyError, TypeError, AttributeError):
                        malformed.append(f"{path}:{number}: {clip(line.rstrip())}")
                        continue
                    for kind, action, outcome, n in counted:
                        outcomes[kind][outcome] += n
                        if outcome == "granted":
                            actions[kind][action] += n
                            games[kind].add((outdir, tag))
    return outcomes, actions, games, played, malformed


def coverage_table(outdirs, bot_dir):
    """Print the table; False when it cannot be trusted (the reading of the code or of a ledger is not whole)."""
    bot_dir = bot_dir or next((d for d in (os.path.join(o, "mods", "strategos") for o in outdirs)
                               if os.path.isdir(d)), os.path.join(run.REPO, "bot"))
    known, unread = source_kinds(bot_dir)
    outcomes, actions, games, played, malformed = ledger(outdirs)
    granted = sorted(k for k in outcomes if outcomes[k]["granted"])
    unknown = sorted(set(outcomes) - known)
    width = max((len(k) for k in set(outcomes) | known), default=0)
    print(f"{'kind of request'.ljust(width)}   granted    denied  games  actions granted (`!`: production tier)")
    for kind in granted:
        denied = sum(n for outcome, n in outcomes[kind].items() if outcome != "granted")
        # The action alone when the kind was granted one, each with its count otherwise.
        seen = sorted(actions[kind].items())
        told = seen[0][0] if len(seen) == 1 else ", ".join(f"{action} {n}" for action, n in seen)
        print(f"{kind.ljust(width)}  {outcomes[kind]['granted']:8d}  {denied:8d}  {len(games[kind]):5d}  {told}"
              + ("" if kind in known else "   (NOT FOUND IN THE CODE)"))
    never = sorted(known - set(granted))
    faults = ([f"the code: {told}" for told in unread]
              + [f"the code: {kind} is in the ledgers {dict(outcomes[kind])} and no class read emits it"
                 for kind in unknown]
              + [f"a ledger: malformed {ALLOC_TAG.strip()} line, {told}" for told in malformed])
    print()
    if faults:
        complain(f"coverage: NOT TO BE TRUSTED, the reading of the bot's code ({bot_dir}) or of the ledgers is not "
                 f"whole ({len(faults)} fault(s)); kinds of the code that it does not read are missing below")
        for told in faults:
            complain(f"coverage: {told}")
    print(f"coverage: {len(set(granted) & known)} of {len(known)} kinds of request "
          + ("read in" if faults else "of") + f" the code ({bot_dir}) granted at least once in {played} games; "
          f"never granted: {len(never)}")
    for kind in never:
        denied = dict(outcomes[kind]) if kind in outcomes else None
        print(f"  {kind}: " + (f"requested, never granted {denied}" if denied else "never requested"))
    return not faults


def coverage(a):
    for d in a.dirs:
        if not os.path.isdir(d):
            die(f"{d}: no such directory")
    sys.exit(0 if coverage_table([os.path.abspath(d) for d in a.dirs], a.bot) else 1)


def main():
    ap = argparse.ArgumentParser(description="Play the identity set, compare two plays, print its coverage.")
    sub = ap.add_subparsers(dest="command", required=True)
    p = sub.add_parser("play", help="play tools/identity.jsonl into a new directory")
    p.add_argument("outdir")
    p.add_argument("-H", dest="hosts", help="hosts of tools/hosts.json (run.py -H)")
    p.add_argument("-m", dest="sources", action="append", default=[], help="mod source of an AI (run.py -m)")
    p.set_defaults(func=play)
    p = sub.add_parser("compare", help="compare a play with a base; exit 1 when a hash or a command differs or "
                                       "a game is unfit in either play")
    p.add_argument("base")
    p.add_argument("new")
    p.set_defaults(func=compare)
    p = sub.add_parser("coverage", help="the kinds of request granted in a play, and those never granted")
    p.add_argument("dirs", nargs="+", metavar="DIR")
    p.add_argument("--bot", help="the bot whose code is read (default: the one the play snapshotted)")
    p.set_defaults(func=coverage)
    a = ap.parse_args()
    a.func(a)


if __name__ == "__main__":
    main()
