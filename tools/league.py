#!/usr/bin/env python3
"""Play the bot against every member of the league and print one table.

    tools/league.py -l MIN [--candidate SRC] [--members a,b] [--league FILE] OUTDIR SEED... [-- RUN.PY OPTIONS]
    tools/league.py --table OUTDIR

Petra and the mirror no longer tell two versions of the bot apart: Petra
is beaten in most games and always plays the same game, the mirror never
plays another one. The league (tools/league.json) is a set of named
opponents that do:

- "player": an AI the runner already knows, as a run.sh player spec without
  civ and team (`petra/5/aggressive`, `brennus`);
- "bot": a commit of this repository — the bot as it was then;
- "bot" + "set": that commit with values of its strategy table changed
  (`BASE` in strategy-plans.js; in strategy.js before the strategy was split, named `OPENING` before
  the plans; a dotted path, `military.civilianTarget`): a
  plan variant. The commit is pinned, so a member stays the same opponent
  whatever the working tree becomes.

A member may pin "civ" and "biome" (Brennus only plays gaul on temperate
mainland); otherwise civs and biomes are drawn per seed, like the
candidate's civ, which is the same against every member.

For each member the tool builds its mod when it is a bot (OUTDIR/members/NAME,
the AI renamed `lg_NAME` so that it can meet the candidate), then runs
tools/run.py into OUTDIR/NAME on the same seeds, one member after the other
(two batches at once would oversubscribe the hosts): candidate as player 1,
team 1, against the member as player 2, team 2. The candidate is the
working tree's bot/ unless --candidate gives another source (`DIR`, or
`.@REV` for a commit, as run.sh -m). A directory is copied once into
OUTDIR/candidate before the first member, so every member meets the same
bot even if the working tree is edited while the league plays. Options
after `--` go to run.py as they are (`-M`, `-s`, `-H`, `-S` ...).

The table has one row per member: games, the candidate's wins / losses /
undecided games (a game ahead on points at the limit counts as won or
lost, as in compare.py), the wins concluded before the limit, the minutes
to victory (analyze.py: a game not won counted at the limit), the mean
score, and the games decided on the field with the minutes it took
(analyze.py: the enemy's military value at most a quarter of the
candidate's from then on — when an opponent that resigns would; the AIs
of the league never do, so the minutes to victory also measure how long a
beaten opponent takes to finish). --table prints it again from an OUTDIR
already played.
"""
import argparse
import io
import json
import os
import re
import shutil
import subprocess
import sys
import tarfile

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
sys.path.insert(0, HERE)
import analyze  # noqa: E402

TABLE_RE = re.compile(r"(const (?:BASE|OPENING) = )(\{.*?\n\})(;)", re.S)


def die(msg):
    sys.exit(f"league.py: {msg}")


def ai_name(member):
    return "lg_" + re.sub(r"\W", "_", member)


def build(member, spec, dest):
    """The bot of commit spec["bot"], its strategy table overridden by spec["set"], renamed, in dest."""
    sha = subprocess.run(["git", "-C", REPO, "rev-parse", spec["bot"]], capture_output=True, text=True).stdout.strip()
    if not sha:
        die(f"member {member}: cannot resolve commit {spec['bot']}")
    arch = subprocess.run(["git", "-C", REPO, "archive", sha, "bot"], capture_output=True)
    if arch.returncode:
        die(f"member {member}: git archive {sha} bot failed")
    if os.path.exists(dest):
        shutil.rmtree(dest)
    os.makedirs(dest)
    with tarfile.open(fileobj=io.BytesIO(arch.stdout)) as tf:
        tf.extractall(dest, filter="data")
    bot = os.path.join(dest, "bot")
    ai_dir = os.path.join(bot, "simulation/ai/strategos")
    if spec.get("set"):
        # The table is in strategy-plans.js; a commit from before the strategy was split has it in strategy.js.
        m = None
        for name in ("strategy-plans.js", "strategy.js"):
            path = os.path.join(ai_dir, name)
            if not os.path.exists(path):
                continue
            with open(path, encoding="utf-8") as fh:
                text = fh.read()
            m = TABLE_RE.search(text)
            if m:
                break
        if not m:
            die(f"member {member}: no `const BASE = {{...}};` table in strategy-plans.js or strategy.js at {spec['bot']}")
        table = json.loads(m.group(2))
        for dotted, value in spec["set"].items():
            node = table
            *parents, leaf = dotted.split(".")
            for key in parents:
                if not isinstance(node.get(key), dict):
                    die(f"member {member}: no {dotted} in the strategy table at {spec['bot']}")
                node = node[key]
            if leaf not in node:
                die(f"member {member}: no {dotted} in the strategy table at {spec['bot']}")
            node[leaf] = value
        with open(path, "w", encoding="utf-8") as fh:
            fh.write(text[:m.start(2)] + json.dumps(table, indent="\t") + text[m.end(2):])
    name = ai_name(member)
    os.rename(ai_dir, os.path.join(bot, "simulation/ai", name))
    for root, _, files in os.walk(bot):
        for f in files:
            if f.endswith(".js"):
                p = os.path.join(root, f)
                with open(p, encoding="utf-8") as fh:
                    src = fh.read()
                with open(p, "w", encoding="utf-8") as fh:
                    fh.write(src.replace("simulation/ai/strategos/", f"simulation/ai/{name}/"))
    for path, keys in ((os.path.join(bot, "mod.json"), ("name", "label")),
                       (os.path.join(bot, "simulation/ai", name, "data.json"), ("name",))):
        with open(path, encoding="utf-8") as fh:
            data = json.load(fh)
        for key in keys:
            data[key] = name
        with open(path, "w", encoding="utf-8") as fh:
            json.dump(data, fh, indent="\t")
    return bot


def table(outdir, members):
    rows = []
    for member in members:
        d = os.path.join(outdir, member)
        games = analyze.rows_for(d) if os.path.isdir(d) else []
        if not games:
            continue
        res = [analyze.side_result(r, analyze.player_id(r, "strategos")) for r in games]
        played = [x for x in res if x != "fail"]
        minutes = [m for m in (analyze.victory_minutes(r, analyze.player_id(r, "strategos")) for r in games)
                   if m is not None]
        concluded = sum(analyze.concluded_win(r, analyze.player_id(r, "strategos")) for r in games)
        dec = [m for m in (analyze.decided_minutes(r, analyze.player_id(r, "strategos")) for r in games) if m is not None]
        decided = sum(analyze.decided(r, analyze.player_id(r, "strategos")) for r in games)
        rows.append((member, len(games), res.count("win"), res.count("loss"), res.count("timeout"), res.count("fail"),
                     concluded, sum(minutes) / len(minutes) if minutes else None,
                     (res.count("win") - res.count("loss")) / len(played) if played else None,
                     decided, sum(dec) / len(dec) if dec else None))
    if not rows:
        die(f"no game in {outdir}")
    width = max(len("member"), max(len(r[0]) for r in rows))
    print(f"{'member'.ljust(width)}  games   win  loss  undecided  fail  concluded  win_min  score  decided  dec_min")
    for member, n, w, l, t, f, c, m, sc, d, dm in rows:
        print(f"{member.ljust(width)}  {n:5d} {w:5d} {l:5d} {t:10d} {f:5d} {c:10d}  "
              f"{(f'{m:7.1f}' if m is not None else '      -')}  {(f'{sc:+.2f}' if sc is not None else '    -')}  {d:7d}  "
              f"{(f'{dm:7.1f}' if dm is not None else '      -')}")
    tot = [sum(r[i] for r in rows) for i in range(1, 7)]
    print(f"{'all'.ljust(width)}  {tot[0]:5d} {tot[1]:5d} {tot[2]:5d} {tot[3]:10d} {tot[4]:5d} {tot[5]:10d}"
          f"{' ' * 18}{sum(r[9] for r in rows):7d}")


def main():
    argv = sys.argv[1:]
    extra = []
    if "--" in argv:
        cut = argv.index("--")
        argv, extra = argv[:cut], argv[cut + 1:]
    ap = argparse.ArgumentParser(description="Play the bot against the league.")
    ap.add_argument("-l", dest="limit", type=int)
    ap.add_argument("--candidate")
    ap.add_argument("--members")
    ap.add_argument("--league", default=os.path.join(HERE, "league.json"))
    ap.add_argument("--table", action="store_true")
    ap.add_argument("outdir")
    ap.add_argument("seeds", nargs="*")
    a = ap.parse_args(argv)
    with open(a.league, encoding="utf-8") as fh:
        league = json.load(fh)["members"]
    members = a.members.split(",") if a.members else list(league)
    for member in members:
        if member not in league:
            die(f"unknown member {member!r} (in {a.league}: {', '.join(league)})")
    outdir = os.path.abspath(a.outdir)
    if a.table:
        table(outdir, [m for m in league if os.path.isdir(os.path.join(outdir, m))])
        return
    if not a.limit or not a.seeds:
        die("-l MIN and seeds are required (or --table OUTDIR)")
    os.makedirs(outdir, exist_ok=True)
    candidate = a.candidate or os.path.join(REPO, "bot")
    if "@" not in candidate:
        frozen = os.path.join(outdir, "candidate", "bot")
        if os.path.exists(frozen):
            shutil.rmtree(frozen)
        shutil.copytree(os.path.abspath(os.path.expanduser(candidate)), frozen,
                        ignore=shutil.ignore_patterns(".git", "__pycache__"))
        candidate = frozen
    for member in members:
        spec = league[member]
        cmd = [sys.executable, os.path.join(HERE, "run.py"), "-l", str(a.limit),
               "-b", spec.get("biome", "*"), "-p", "strategos:*:1"]
        cmd += ["-m", f"strategos={candidate}"]
        if "bot" in spec:
            bot = build(member, spec, os.path.join(outdir, "members", member))
            cmd += ["-m", f"{ai_name(member)}={bot}", "-p", f"{ai_name(member)}:{spec.get('civ', '*')}:2"]
        else:
            cmd += ["-p", f"{spec['player']}:{spec.get('civ', '*')}:2"]
        cmd += extra + [os.path.join(outdir, member)] + a.seeds
        print(f"league: {member}: {' '.join(cmd[2:])}", flush=True)
        with open(os.path.join(outdir, member + ".log"), "w") as log:
            code = subprocess.run(cmd, stdout=log, stderr=subprocess.STDOUT).returncode
        with open(os.path.join(outdir, member + ".log")) as log:
            tail = log.read().strip().splitlines()[-1:]
        print(f"league: {member}: " + (tail[0] if tail else f"run.py exit {code}"), flush=True)
    print()
    table(outdir, members)


if __name__ == "__main__":
    main()
