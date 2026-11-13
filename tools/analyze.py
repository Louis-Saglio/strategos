#!/usr/bin/env python3
"""Summarize a batch of headless matches produced by tools/run.sh.

One row per match directory (default: every subdirectory of OUTDIR holding a
stdout.log, in natural order):

- outcome: `T<n> won` (the team, or `P<n>` for a teamless player, whose
  players ended `won`), `timeout` when the harness time limit fired (it
  marks every active player won) and no side leads on points,
  `T<n> ahead` / `P<n> ahead` when, at the time limit, that side's assets
  (last `[HARNESS] standing` line: units, structures and stock at cost)
  are at least POINTS_RATIO times every other side's — a crushing
  position, scored as a win by compare.py; `killed` when the wall-clock cap killed
  it (a failure to investigate), `none` when no statistics were printed
  (crash);
- players: one `id:ai/civ[:team]=W|L|T` item per player (W won, L defeated,
  T still active at the time limit);
- map: map/biome (`-` for a map without biomes); setup, shown when the
  matches of the batch differ in it: size, placement, victory conditions
  and every game setting that is not the runner's default;
- game_min: in-game minutes (turns / 300, one turn = 200 ms);
- errors: lines with ERROR, "JavaScript error" or "script exception";
  failed_ai: "Failed to create AI player" (a wrong AI name plays an idle
  player and still exits 0); either one invalidates the game;
- host, exit code, wall seconds, turns/s: from result.json;
- resign: the side the harness made resign (`[HARNESS] resign`), its game
  then ends as a normal win of the other side;
- hash: short sha256 of every player's statistics JSON in print order —
  equal hashes mean identical games (determinism checks).

Usage:
  analyze.py [--tsv FILE] [--det A,B] [--metrics] [--player WHO] [--at MIN] [--by KEYS] OUTDIR [TAG...]

--player WHO is a player number or an AI name (the first player run by that
AI, wherever --rotate put it); default: the first `strategos` player, else
player 1.

--by KEY[,KEY...] adds a breakdown of WHO's results (win / loss / timeout /
fail and the mean score, as compare.py counts them) per value of each KEY,
with the number of games each value drew: map, biome, size, placement,
victory, civ, slot (WHO's), opponent, opponent_civ, or any game setting
(PopulationCap, StartingResources, Landscape, ...).

--metrics adds, for player WHO, statistics from the end of game:
resources gathered (food/wood/stone/metal and their total), the ratio of
that total to the best other player's total, units trained, units lost,
enemy units killed, value killed / value lost, buildings constructed,
population, map controlled (%).

--at MIN takes the gathered resources, their total and ratio, and the
population from the harness `[HARNESS] eco` line at minute MIN instead of
the end of game (a game that ended earlier keeps its last line), so one
batch can be read at several minutes.
"""
import argparse
import hashlib
import json
import os
import re

ERROR_RE = re.compile(r"ERROR|JavaScript error|script exception")
LIMIT_TAG = "[HARNESS] time limit reached"
START_TAG = "[HARNESS] start "
ECO_TAG = "[HARNESS] eco "
STANDING_TAG = "[HARNESS] standing "
RESIGN_TAG = "[HARNESS] resign "
POINTS_RATIO = 3.0


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


def last_json(text, tag):
    obj = None
    for line in text.splitlines():
        if line.startswith(tag):
            try:
                obj = json.loads(line[len(tag):])
            except json.JSONDecodeError:
                pass
    return obj


def side_name(key):
    return key.upper() if key.startswith("p") else f"T{int(key) + 1}"


def points_leader(standing):
    """The side (T<n>/P<n>) whose assets are >= POINTS_RATIO x every other side's, else None."""
    teams = (standing or {}).get("teams", {})
    if len(teams) < 2:
        return None
    for key, side in teams.items():
        others = [o["assets"] for k, o in teams.items() if k != key]
        if all(side["assets"] >= POINTS_RATIO * o for o in others):
            return side_name(key)
    return None


def eco_lines(text):
    """[(t, {player id: {"gathered": {...}, "pop": n}})] from the harness eco lines."""
    out = []
    for line in text.splitlines():
        if line.startswith(ECO_TAG):
            try:
                obj = json.loads(line[len(ECO_TAG):])
            except json.JSONDecodeError:
                continue
            t = obj.pop("t", 0)
            out.append((t, {int(k): v for k, v in obj.items()}))
    return out


def eco_at(row, minute):
    """The last eco snapshot at or before `minute`, or None."""
    best = None
    for t, per in row.get("eco", []):
        if t <= minute * 60 + 1:
            best = per
    return best


def gathered_totals(row, minute=None):
    """{player id: total gathered} at `minute` (eco line) or at the end of game."""
    if minute is not None:
        per = eco_at(row, minute) or {}
        return {p: sum(v["gathered"].get(k, 0) for k in RESOURCES) for p, v in per.items()}
    return {p: sum(st["statistics"].get("resourcesGathered", {}).get(k, 0) for k in RESOURCES)
            for p, st in row["stats"].items()}


RESOURCES = ("food", "wood", "stone", "metal")


def metrics(stat, row=None, minute=None):
    s = stat["statistics"]
    g = s.get("resourcesGathered", {})
    pop = s.get("populationCount", 0)
    player = stat.get("playerID")
    if row is not None and minute is not None:
        snap = (eco_at(row, minute) or {}).get(player)
        g = snap["gathered"] if snap else {}
        pop = snap["pop"] if snap else 0
    lost_v = s.get("unitsLostValue", 0) + s.get("buildingsLostValue", 0)
    kill_v = s.get("enemyUnitsKilledValue", 0) + s.get("enemyBuildingsDestroyedValue", 0)
    total = sum(g.get(k, 0) for k in RESOURCES)
    ratio = "-"
    if row is not None:
        others = [v for p, v in gathered_totals(row, minute).items() if p != player]
        ratio = f"{total / max(others):.2f}" if others and max(others) else "-"
    return {
        "food": g.get("food", 0), "wood": g.get("wood", 0), "stone": g.get("stone", 0), "metal": g.get("metal", 0),
        "gathered": total, "gath_ratio": ratio,
        "trained": s.get("unitsTrained", {}).get("total", 0),
        "lost": s.get("unitsLost", {}).get("Unit", 0),
        "killed": s.get("enemyUnitsKilled", {}).get("Unit", 0),
        "kd_value": f"{kill_v / lost_v:.2f}" if lost_v else ("inf" if kill_v else "-"),
        "built": s.get("buildingsConstructed", {}).get("total", 0),
        "pop": pop,
        "map%": s.get("percentMapControlled", 0),
    }


def player_id(row, who=None):
    """The player number `who` designates in a match: a number, an AI name
    (its first player), or by default the first strategos player, else 1."""
    players = row["spec"].get("players", [])
    if who is not None and str(who).isdigit():
        return int(who)
    for i, p in enumerate(players, 1):
        if p["ai"] == (who or "strategos"):
            return i
    return 1 if who is None else 0


def side_of(row, player):
    players = row["spec"].get("players", [])
    team = players[player - 1].get("team") if 0 < player <= len(players) else None
    return f"T{team}" if team else f"P{player}"


def side_result(row, player):
    """win / loss / timeout / fail for player's side; a timeout with a side
    ahead on points (POINTS_RATIO) counts as that side's win."""
    if row["outcome"] in ("none", "?"):
        return "fail"
    if row["outcome"] == "timeout":
        return "timeout"
    if row["outcome"].endswith(" ahead"):
        return "win" if row["outcome"].split()[0] == side_of(row, player) else "loss"
    st = row["stats"].get(player, {}).get("playerState")
    return {"won": "win", "defeated": "loss"}.get(st, "fail")


def score(row, player):
    """+1 when player's side won (or led on points at the limit), -1 when it lost, 0 on a timeout, None on a failure."""
    return {"win": 1, "loss": -1, "timeout": 0}.get(side_result(row, player))


def spec_value(row, key, player):
    """The value of a --by key in a match, as a string."""
    spec = row["spec"]
    players = spec.get("players", [])
    others = [p for i, p in enumerate(players, 1) if i != player]
    if key == "civ":
        v = players[player - 1]["civ"] if 0 < player <= len(players) else None
    elif key == "slot":
        v = player
    elif key == "opponent":
        v = " ".join(sorted(f"{p['ai']}/{p['diff']}/{p['behavior']}" for p in others))
    elif key == "opponent_civ":
        v = " ".join(p["civ"] for p in others)
    elif key == "victory":
        v = "+".join(spec.get("victory", []))
    elif key == "map":
        v = spec.get("map", "-").split("/")[-1]
    elif key in spec:
        v = spec[key]
    else:
        v = spec.get("settings", {}).get(key)
    return "-" if v is None else v if isinstance(v, str) else json.dumps(v)


def breakdown(rows, key, who=None):
    """[(value, games, {result: count}, mean score | None)] for one --by key."""
    groups = {}
    for r in rows:
        player = player_id(r, who)
        groups.setdefault(spec_value(r, key, player), []).append(side_result(r, player))
    out = []
    for value in sorted(groups, key=natural):
        res = groups[value]
        played = [x for x in res if x != "fail"]
        mean = (res.count("win") - res.count("loss")) / len(played) if played else None
        out.append((value, len(res), {k: res.count(k) for k in ("win", "loss", "timeout", "fail")}, mean))
    return out


def print_breakdown(rows, key, who=None):
    table = breakdown(rows, key, who)
    width = max([len(key)] + [len(v) for v, *_ in table])
    print(f"\n{key.ljust(width)}  games   win  loss  timeout  fail  score")
    for value, n, res, mean in table:
        print(f"{value.ljust(width)}  {n:5d} {res['win']:5d} {res['loss']:5d} {res['timeout']:8d} {res['fail']:5d}  "
              + (f"{mean:+.2f}" if mean is not None else "-"))


# The runner's defaults (tools/run.py GAME_SETTINGS): a setup shows what departs from them.
DEFAULT_SETTINGS = {
    "PopulationCapType": "player", "PopulationCap": 300, "StartingResources": 300, "Ceasefire": 0,
    "ExploreMap": False, "RevealMap": False, "AllyView": False, "DisableTreasures": True,
    "DisableSpies": False, "Nomad": False, "LockTeams": False, "LastManStanding": False,
    "CheatsEnabled": False, "WonderDuration": 10, "RelicCount": 2, "RelicDuration": 10,
    "RegicideGarrison": False, "gameSpeed": 1,
}


def setup(spec):
    parts = [str(spec.get("size") or "-"), spec.get("placement") or "-", "+".join(spec.get("victory", [])) or "-"]
    parts += [f"{k}={json.dumps(v) if not isinstance(v, str) else v}"
              for k, v in spec.get("settings", {}).items() if DEFAULT_SETTINGS.get(k, None) != v]
    return " ".join(parts)


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
    if run.get("exit_code") in (124, 137):
        outcome = "killed"
    elif not stats:
        outcome = "none"
    elif timeout:
        leader = points_leader(last_json(text, STANDING_TAG))
        outcome = f"{leader} ahead" if leader else "timeout"
    elif winners:
        outcome = " ".join(sorted(winners)) + " won"
    else:
        outcome = "?"
    turns, wall = run.get("turns", 0), run.get("wall_seconds", 0)
    return {
        "tag": tag,
        "outcome": outcome,
        "players": " ".join(items),
        "map": f"{spec.get('map', '-').split('/')[-1]}/{(spec.get('biome') or '-').split('/')[-1]}",
        "setup": setup(spec),
        "game_min": f"{turns / 300:.1f}" if turns else "-",
        "errors": len(ERROR_RE.findall(text)),
        "failed_ai": int("Failed to create AI player" in text),
        "host": run.get("host", "-"),
        "exit": run.get("exit_code", "-"),
        "wall_s": f"{wall:.0f}" if wall else "-",
        "turns_s": f"{turns / wall:.0f}" if turns and wall else "-",
        "resign": side_name(last_json(text, RESIGN_TAG)["team"]) if RESIGN_TAG in text else "-",
        "hash": hashlib.sha256("".join(raws).encode()).hexdigest()[:12] if raws else "-",
        "stats": stats,
        "spec": spec,
        "eco": eco_lines(text),
    }


def natural(tag):
    return [int(p) if p.isdigit() else p for p in re.split(r"(\d+)", tag)]


COLUMNS = ["tag", "outcome", "players", "map", "game_min", "errors", "failed_ai", "host", "exit", "resign", "wall_s",
           "turns_s", "hash"]
METRICS = ["food", "wood", "stone", "metal", "gathered", "gath_ratio", "trained", "lost", "killed", "kd_value", "built", "pop", "map%"]


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
    ap.add_argument("--player")
    ap.add_argument("--at", type=float)
    ap.add_argument("--by", default="")
    a = ap.parse_args()
    rows = rows_for(a.outdir, a.tags)
    cols = list(COLUMNS)
    if len({r["setup"] for r in rows}) > 1:
        cols.insert(cols.index("map") + 1, "setup")
    if a.metrics:
        cols += METRICS
        for r in rows:
            st = r["stats"].get(player_id(r, a.player))
            r.update(metrics(st, r, a.at) if st else {m: "-" for m in METRICS})
    widths = {c: max([len(c)] + [len(str(r[c])) for r in rows]) for c in cols}
    print("  ".join(c.ljust(widths[c]) for c in cols))
    for r in rows:
        print("  ".join(str(r[c]).ljust(widths[c]) for c in cols))
    outcomes = {}
    for r in rows:
        outcomes[r["outcome"]] = outcomes.get(r["outcome"], 0) + 1
    count = lambda pred: sum(1 for r in rows if pred(r))
    print(f"{len(rows)} games: " + ", ".join(f"{v} {k}" for k, v in sorted(outcomes.items())) +
          f"; {count(lambda r: r['outcome'] == 'killed')} killed by the wall-clock cap, "
          f"{count(lambda r: r['errors'])} with errors, {count(lambda r: r['failed_ai'])} failed-AI, "
          f"{count(lambda r: r['exit'] not in (0, '-'))} nonzero exit")
    for key in filter(None, a.by.split(",")):
        print_breakdown(rows, key, a.player)
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
