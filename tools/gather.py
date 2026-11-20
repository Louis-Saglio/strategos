#!/usr/bin/env python3
"""Where the gatherers' time goes, from the harness gather census.

    tools/gather.py BATCH... [--bands 0,5,10,15,20,30] [--player WHO] [--kinds K,...] [--by-game]

Reads the `[HARNESS] gather` lines (see tools/harness/maps/scripts/NonVisualTrigger.js)
and the `[HARNESS] eco` lines of every game of the batches, and prints, per AI
(or for the player WHO: a number or an AI name, as in analyze.py), per band of
game minutes and per unit group and resource kind:

- `sec`: gatherer-seconds on that kind (gathering + walking to it + walking back
  + chasing game), per game;
- `g% a% r% h%`: the shares of those seconds spent gathering, walking to the
  resource, walking back to a dropsite (and dropping), chasing game;
- `m/load`: metres walked (to the resource and back, the path actually walked)
  per completed return;
- `d50 d75 d90`: the edge distance from the resource to the nearest dropsite
  that accepts it, as quantiles of the gatherer-seconds (bin upper edges:
  5 10 15 20 30 40 60 80 120 m, `>120` beyond);
then per group the seconds idle, in another state (building, fighting, walking
on an order...) and out of the world (garrisoned), as shares of all the
group's seconds; and per generic resource the amount gathered (statistics
tracker) per gatherer-second on it, all groups together.

A game's band is counted only when the game reached the band's end.
"""
import argparse
import collections
import json
import os
import sys

BINS = [5, 10, 15, 20, 30, 40, 60, 80, 120]
GATHER_TAG = "[HARNESS] gather "
ECO_TAG = "[HARNESS] eco "
START_TAG = "[HARNESS] start "


def read_game(path):
    gather, eco, start = [], [], None
    for line in open(path, errors="replace"):
        if line.startswith(GATHER_TAG):
            try:
                gather.append(json.loads(line[len(GATHER_TAG):]))
            except ValueError:
                pass
        elif line.startswith(ECO_TAG):
            try:
                eco.append(json.loads(line[len(ECO_TAG):]))
            except ValueError:
                pass
        elif line.startswith(START_TAG) and start is None:
            try:
                start = json.loads(line[len(START_TAG):])
            except ValueError:
                pass
    return gather, eco, start


def players_of(game_dir):
    """{player id (str): ai name} from result.json's spec."""
    try:
        spec = json.load(open(os.path.join(game_dir, "result.json")))["spec"]
    except (OSError, ValueError, KeyError):
        return {}
    out = {}
    for i, p in enumerate(spec.get("players", []), start=1):
        ai = p.get("ai") if isinstance(p, dict) else str(p).split(":")[0].split("/")[0]
        out[str(i)] = (ai or "none").split("/")[0]
    return out


def quantile(hist, q):
    total = sum(hist[:-1])
    if total <= 0:
        return None
    acc = 0
    for i, v in enumerate(hist[:-1]):
        acc += v
        if acc >= q * total:
            return BINS[i] if i < len(BINS) else float("inf")
    return float("inf")


def fmt_q(v):
    if v is None:
        return "  -"
    return ">120" if v == float("inf") else f"{v:4d}"


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("batches", nargs="+")
    ap.add_argument("--bands", default="0,5,10,15,20,30")
    ap.add_argument("--player", help="a player number or an AI name (default: every AI)")
    ap.add_argument("--kinds", help="only these kinds (comma separated, e.g. wood.tree,food.fruit)")
    ap.add_argument("--min-sec", type=float, default=60, help="hide rows under this many seconds per game")
    a = ap.parse_args()
    edges = [float(x) for x in a.bands.split(",")]
    bands = list(zip(edges, edges[1:]))
    kinds_filter = set(a.kinds.split(",")) if a.kinds else None

    rows = collections.defaultdict(lambda: {"g": 0, "a": 0, "r": 0, "h": 0, "n": 0, "w": 0, "d": [0] * (len(BINS) + 2)})
    states = collections.defaultdict(lambda: collections.Counter())
    gathered = collections.defaultdict(lambda: collections.Counter())
    gsec = collections.defaultdict(lambda: collections.Counter())
    games = collections.Counter()

    for batch in a.batches:
        for tag in sorted(os.listdir(batch)):
            game_dir = os.path.join(batch, tag)
            log = os.path.join(game_dir, "stdout.log")
            if not os.path.isfile(log):
                continue
            gather, eco, start = read_game(log)
            if not gather:
                continue
            ais = players_of(game_dir)
            last = gather[-1]["t"] / 60
            if a.player:
                if a.player.isdigit():
                    wanted = {a.player: ais.get(a.player, "p" + a.player)}
                else:
                    ids = sorted((pid for pid, ai in ais.items() if ai == a.player), key=int)
                    wanted = {ids[0]: a.player} if ids else {}
            else:
                wanted = ais
            eco_at = {round(e["t"] / 60): e for e in eco}
            if eco and 0 not in eco_at:
                eco_at[0] = {pid: {"gathered": {}} for pid in eco[0] if pid != "t"}
            for lo, hi in bands:
                if last < hi - 0.01:
                    continue
                for pid, ai in wanted.items():
                    who = (ai, (lo, hi))
                    games[who] += 1
                    for line in gather:
                        minute_end = line["t"] / 60
                        if not (lo < minute_end <= hi + 0.01) or pid not in line:
                            continue
                        for key, entry in line[pid].items():
                            group, kind = key.split("|", 1)
                            if isinstance(entry, (int, float)):
                                states[(who, group)][kind] += entry
                                continue
                            busy = entry["g"] + entry["a"] + entry["r"] + entry["h"]
                            states[(who, group)]["work"] += busy
                            if kind not in ("unknown",):
                                generic = kind.split(".")[0]
                                gsec[who][generic] += busy
                            if kinds_filter and kind not in kinds_filter:
                                continue
                            row = rows[(who, group, kind)]
                            for f in ("g", "a", "r", "h", "n"):
                                row[f] += entry[f]
                            row["w"] += entry["wa"] + entry["wr"]
                            for i, v in enumerate(entry["d"]):
                                row["d"][i] += v
                    m0, m1 = round(lo), round(hi)
                    if m0 in eco_at and m1 in eco_at and pid in eco_at[m0] and pid in eco_at[m1]:
                        for code, v in eco_at[m1][pid]["gathered"].items():
                            gathered[who][code] += v - eco_at[m0][pid]["gathered"].get(code, 0)

    for who in sorted(games, key=lambda w: (w[0], w[1])):
        ai, (lo, hi) = who
        n = games[who]
        print(f"\n== {ai}  minutes {lo:g}-{hi:g}  ({n} game{'s' if n != 1 else ''})")
        print(f"  {'group|kind':28s} {'sec/game':>8s} {'g%':>4s} {'a%':>4s} {'r%':>4s} {'h%':>4s} {'m/load':>6s}  d50  d75  d90")
        keys = sorted((k for k in rows if k[0] == who), key=lambda k: -(rows[k]["g"] + rows[k]["a"] + rows[k]["r"] + rows[k]["h"]))
        for key in keys:
            row = rows[key]
            busy = row["g"] + row["a"] + row["r"] + row["h"]
            if busy / n < a.min_sec:
                continue
            pct = lambda f: 100 * row[f] / busy if busy else 0
            per_load = row["w"] / row["n"] if row["n"] else float("nan")
            print(f"  {key[1] + '|' + key[2]:28s} {busy / n:8.0f} {pct('g'):4.0f} {pct('a'):4.0f} {pct('r'):4.0f} {pct('h'):4.0f} {per_load:6.0f} "
                  f" {fmt_q(quantile(row['d'], 0.5))} {fmt_q(quantile(row['d'], 0.75))} {fmt_q(quantile(row['d'], 0.9))}")
        for (w, group), c in sorted(states.items()):
            if w != who:
                continue
            total = c["work"] + c["idle"] + c["other"] + c["in"]
            if total / n < a.min_sec:
                continue
            print(f"  {group:10s} labour {total / n:6.0f} s/game: working {100 * c['work'] / total:3.0f}%  idle {100 * c['idle'] / total:3.0f}%"
                  f"  other {100 * c['other'] / total:3.0f}%  garrisoned {100 * c['in'] / total:3.0f}%")
        rates = []
        for code in ("food", "wood", "stone", "metal"):
            if gsec[who][code] > 0:
                rates.append(f"{code} {gathered[who][code] / gsec[who][code]:.2f}")
        if rates:
            print("  gathered per gatherer-second: " + "  ".join(rates))


if __name__ == "__main__":
    main()
