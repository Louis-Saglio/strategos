#!/usr/bin/env python3
"""Summarize a batch of headless matches produced by tools/run.sh.

One row per match directory (default: every subdirectory of OUTDIR holding a
stdout.log, in natural order):

- outcome: `T<n> won` (the team, or `P<n>` for a teamless player, whose
  players ended `won`), `timeout` when the harness time limit fired (it
  marks every active player won), `none` when no statistics were printed
  (crash, wall-clock kill);
- players: one `id:ai/civ[:team]=W|L|T` item per player (W won, L defeated,
  T still active at the time limit);
- game_min: in-game minutes (turns / 300, one turn = 200 ms);
- errors: lines with ERROR, "JavaScript error" or "script exception";
  failed_ai: "Failed to create AI player" (a wrong AI name plays an idle
  player and still exits 0); either one invalidates the game;
- host, exit code, wall seconds, turns/s: from result.json;
- hash: short sha256 of every player's statistics JSON in print order —
  equal hashes mean identical games (determinism checks).

Usage:
  analyze.py [--tsv FILE] [--det A,B] [--metrics] [--player N] OUTDIR [TAG...]

--metrics adds, for player N (default 1), statistics from the end of game:
resources gathered (food/wood/stone/metal), units trained, units lost,
enemy units killed, value killed / value lost, buildings constructed,
population, map controlled (%).
"""
import argparse
import hashlib
import json
import os
import re

ERROR_RE = re.compile(r"ERROR|JavaScript error|script exception")
LIMIT_TAG = "[HARNESS] time limit reached"
START_TAG = "[HARNESS] start "


def player_blocks(text):
    """Yield raw JSON blocks (lines from a column-0 '{' to a column-0 '}')."""
    block, inside = [], False
    for line in text.splitlines(keepends=True):
        if not inside and line.startswith("{"):
            inside, block = True, [line]
        elif inside:
            block.append(line)
            if line.rstrip("\n") == "}":
                yield "".join(block)
                inside = False


def load_stats(text):
    raws, stats = [], {}
    for block in player_blocks(text):
        try:
            obj = json.loads(block)
        except json.JSONDecodeError:
            continue
        if "playerID" in obj and "statistics" in obj:
            raws.append(block)
            stats[obj["playerID"]] = obj
    return raws, stats


def metrics(stat):
    s = stat["statistics"]
    g = s.get("resourcesGathered", {})
    lost_v = s.get("unitsLostValue", 0) + s.get("buildingsLostValue", 0)
    kill_v = s.get("enemyUnitsKilledValue", 0) + s.get("enemyBuildingsDestroyedValue", 0)
    return {
        "food": g.get("food", 0), "wood": g.get("wood", 0), "stone": g.get("stone", 0), "metal": g.get("metal", 0),
        "trained": s.get("unitsTrained", {}).get("total", 0),
        "lost": s.get("unitsLost", {}).get("Unit", 0),
        "killed": s.get("enemyUnitsKilled", {}).get("Unit", 0),
        "kd_value": f"{kill_v / lost_v:.2f}" if lost_v else ("inf" if kill_v else "-"),
        "built": s.get("buildingsConstructed", {}).get("total", 0),
        "pop": s.get("populationCount", 0),
        "map%": s.get("percentMapControlled", 0),
    }


def analyze(outdir, tag):
    d = os.path.join(outdir, tag)
    path = os.path.join(d, "stdout.log")
    if not os.path.exists(path):
        return None
    with open(path, errors="replace") as fh:
        text = fh.read()
    run = {}
    if os.path.exists(os.path.join(d, "result.json")):
        with open(os.path.join(d, "result.json")) as fh:
            run = json.load(fh)
    spec = run.get("spec", {})
    raws, stats = load_stats(text)
    timeout = LIMIT_TAG in text
    players = spec.get("players", [])
    items, winners = [], set()
    for i, p in enumerate(players, 1):
        st = stats.get(i, {}).get("playerState")
        code = "-" if st is None else ("T" if timeout else {"won": "W", "defeated": "L"}.get(st, st))
        team = p.get("team")
        items.append(f"{i}:{p['ai']}/{p['civ']}" + (f":{team}" if team else "") + f"={code}")
        if st == "won" and not timeout:
            winners.add(f"T{team}" if team else f"P{i}")
    if not stats:
        outcome = "none"
    elif timeout:
        outcome = "timeout"
    elif winners:
        outcome = " ".join(sorted(winners)) + " won"
    else:
        outcome = "?"
    turns, wall = run.get("turns", 0), run.get("wall_seconds", 0)
    return {
        "tag": tag,
        "outcome": outcome,
        "players": " ".join(items),
        "map": f"{spec.get('map', '-').split('/')[-1]}/{spec.get('biome', '-').split('/')[-1]}",
        "game_min": f"{turns / 300:.1f}" if turns else "-",
        "errors": len(ERROR_RE.findall(text)),
        "failed_ai": int("Failed to create AI player" in text),
        "host": run.get("host", "-"),
        "exit": run.get("exit_code", "-"),
        "wall_s": f"{wall:.0f}" if wall else "-",
        "turns_s": f"{turns / wall:.0f}" if turns and wall else "-",
        "hash": hashlib.sha256("".join(raws).encode()).hexdigest()[:12] if raws else "-",
        "stats": stats,
        "spec": spec,
    }


def natural(tag):
    return [int(p) if p.isdigit() else p for p in re.split(r"(\d+)", tag)]


COLUMNS = ["tag", "outcome", "players", "map", "game_min", "errors", "failed_ai", "host", "exit", "wall_s",
           "turns_s", "hash"]
METRICS = ["food", "wood", "stone", "metal", "trained", "lost", "killed", "kd_value", "built", "pop", "map%"]


def rows_for(outdir, tags=None):
    tags = tags or sorted((t for t in os.listdir(outdir) if os.path.exists(os.path.join(outdir, t, "stdout.log"))),
                          key=natural)
    return [r for r in (analyze(outdir, t) for t in tags) if r]


def main():
    ap = argparse.ArgumentParser(description="Summarize a tools/run.sh batch.")
    ap.add_argument("outdir")
    ap.add_argument("tags", nargs="*")
    ap.add_argument("--tsv")
    ap.add_argument("--det", help="comma pair of tags whose hashes must match")
    ap.add_argument("--metrics", action="store_true")
    ap.add_argument("--player", type=int, default=1)
    a = ap.parse_args()
    rows = rows_for(a.outdir, a.tags)
    cols = list(COLUMNS)
    if a.metrics:
        cols += METRICS
        for r in rows:
            st = r["stats"].get(a.player)
            r.update(metrics(st) if st else {m: "-" for m in METRICS})
    widths = {c: max([len(c)] + [len(str(r[c])) for r in rows]) for c in cols}
    print("  ".join(c.ljust(widths[c]) for c in cols))
    for r in rows:
        print("  ".join(str(r[c]).ljust(widths[c]) for c in cols))
    outcomes = {}
    for r in rows:
        outcomes[r["outcome"]] = outcomes.get(r["outcome"], 0) + 1
    count = lambda pred: sum(1 for r in rows if pred(r))
    print(f"{len(rows)} games: " + ", ".join(f"{v} {k}" for k, v in sorted(outcomes.items())) +
          f"; {count(lambda r: r['errors'])} with errors, {count(lambda r: r['failed_ai'])} failed-AI, "
          f"{count(lambda r: r['exit'] not in (0, '-'))} nonzero exit")
    if a.tsv:
        with open(a.tsv, "w") as fh:
            fh.write("\t".join(cols) + "\n")
            for r in rows:
                fh.write("\t".join(str(r[c]) for c in cols) + "\n")
    if a.det:
        x, y = a.det.split(",")
        h = {r["tag"]: r["hash"] for r in rows}
        ok = h.get(x) not in (None, "-") and h.get(x) == h.get(y)
        print(f"determinism({x} vs {y}): {'OK' if ok else 'MISMATCH'}")


if __name__ == "__main__":
    main()
