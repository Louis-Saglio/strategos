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

coverage reads the `[ALLOC]` ledgers of a play: every kind of request
(source/action) with how many times it was granted and denied and in how
many games, then the kinds the bot's code can emit that the play never
granted. The kinds of the code are read from the bot that played
(DIR/mods/strategos, or --bot): see source_kinds. The table can be trusted
only when that reading is whole: a class with a requests( method from
which no kind is read, a kind of the ledgers that the reading does not
know, or an `[ALLOC]` line that cannot be parsed, is reported and the exit
status is 1.

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

def ledger_kind(key):
    """A key of the `outcomes` of an [ALLOC] line -> (kind of request, outcome).

    The allocator (allocator.js, record) writes `source/action:outcome`, with
    a `!` after the action for a request of the production tier; the kind is
    `source/action`. This function and source_kinds are the only two places
    that know what a kind is made of."""
    kind, outcome = key.rsplit(":", 1)
    return kind.rstrip("!"), outcome


SOURCE_RE = re.compile(r'"source":\s*"([\w-]+)"')
ACTION_RE = re.compile(r'\{\s*"type":\s*"([\w-]+)"')
CLASS_RE = re.compile(r"^export class (\w+)", re.M)
FUNCTION_RE = re.compile(r"^export function (\w+)", re.M)


def regions(text, pattern):
    """[(name, text)] of the top-level blocks a pattern starts, each up to the next one."""
    marks = list(pattern.finditer(text))
    return [(m.group(1), text[m.start():marks[i + 1].start() if i + 1 < len(marks) else len(text)])
            for i, m in enumerate(marks)]


def source_kinds(bot_dir):
    """The kinds of request the bot's code can emit, read from its source,
    and what the reading could not read.

    A subsystem is a class with a `requests(` method that names itself in
    `"source": "NAME"`; every action literal (`{ "type": "ACTION"`) of the
    class is a kind NAME/ACTION, whether it stands in the request or is
    handed to a helper that wraps it. A module without a subsystem (tactics.js)
    builds actions for the subsystems that call it: the actions of each of
    its exported functions go to every subsystem whose class calls that
    function by name.

    A class with a `requests(` method from which this reads no kind (its
    source is not a string literal, or it holds no action literal) is
    returned in the second value: the kinds are then not the whole of what
    the code emits, and the caller must say so."""
    root = os.path.join(bot_dir, "simulation/ai/strategos")
    texts = {}
    for name in sorted(os.listdir(root)):
        if name.endswith(".js"):
            with open(os.path.join(root, name), encoding="utf-8") as fh:
                texts[name] = fh.read()
    subsystems, helpers, unread = [], {}, []
    for name, text in texts.items():
        emitting = [(cls, body) for cls, body in regions(text, CLASS_RE) if "\trequests(" in body]
        for cls, body in emitting:
            sources = set(SOURCE_RE.findall(body))
            if len(sources) > 1:
                die(f"{name}: class {cls} names {len(sources)} sources ({', '.join(sorted(sources))}): "
                    "source_kinds reads one per subsystem")
            if sources:
                subsystems.append((name, cls, sources.pop(), body))
            else:
                unread.append(f'{name}: class {cls} has a requests( method and no literal "source": "NAME"')
        if not emitting:
            for function, body in regions(text, FUNCTION_RE):
                actions = set(ACTION_RE.findall(body))
                if actions:
                    helpers[function] = actions
    kinds = set()
    for name, cls, source, body in subsystems:
        actions = set(ACTION_RE.findall(body))
        for function, extra in helpers.items():
            if re.search(rf"\b{function}\(", body):
                actions |= extra
        if not actions:
            unread.append(f'{name}: class {cls} (source {source}) has no action literal {{ "type": "ACTION"')
        kinds |= {f"{source}/{action}" for action in actions}
    return kinds, unread


def ledger(outdirs):
    """Over the [ALLOC] lines of plays: {kind: {outcome: count}}, {kind: games granting it}, the number of
    games read, and the lines that are not a ledger ("path:line number: text")."""
    outcomes, games = collections.defaultdict(collections.Counter), collections.defaultdict(set)
    played, malformed = 0, []
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
                    for kind, outcome, n in counted:
                        outcomes[kind][outcome] += n
                        if outcome == "granted":
                            games[kind].add((outdir, tag))
    return outcomes, games, played, malformed


def coverage_table(outdirs, bot_dir):
    """Print the table; False when it cannot be trusted (the reading of the code or of a ledger is not whole)."""
    bot_dir = bot_dir or next((d for d in (os.path.join(o, "mods", "strategos") for o in outdirs)
                               if os.path.isdir(d)), os.path.join(run.REPO, "bot"))
    known, unread = source_kinds(bot_dir)
    outcomes, games, played, malformed = ledger(outdirs)
    granted = sorted(k for k in outcomes if outcomes[k]["granted"])
    unknown = sorted(set(outcomes) - known)
    width = max((len(k) for k in set(outcomes) | known), default=0)
    print(f"{'kind of request'.ljust(width)}   granted    denied  games")
    for kind in granted:
        denied = sum(n for outcome, n in outcomes[kind].items() if outcome != "granted")
        print(f"{kind.ljust(width)}  {outcomes[kind]['granted']:8d}  {denied:8d}  {len(games[kind]):5d}"
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
