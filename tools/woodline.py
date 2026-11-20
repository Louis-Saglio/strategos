#!/usr/bin/env python3
"""Fit the gatherer throughput model of the bot on the woodline scenario.

    tools/woodline.py BATCH... [--all]

Reads the `[WOODLINE]` lines of every game of the batches (scenario
`strategos_woodline_<list>`, see scenarios/maps/random/strategos_woodline_triggers.js)
and fits the constants of `bot/simulation/ai/strategos/gathering.js`:

    cycle  = capacity / rate + LOAD_OVERHEAD_S
             + 2 * max(0, haul - reach) / speed
             + CROWD_COST_S * max(0, gatherers - CROWD_FREE)
    reach  = target half-size + 2 * (gather range + unit clearance)
    output = capacity / cycle

with capacity 10, rate 0.7, speed 9 and gather range 2 m (the female
citizen's template values, no technology in the scenario), the default
passability class's clearance 0.8 m and the tree's half-size 0.8 m (its
1.6 m obstruction): a gatherer stops within its range of the dropsite's edge
and of the tree, so a load walks the haul less 6.4 m each way. `haul` is the
case's mean distance from the
dropsite to the trees its gatherers hold (the `tick` lines), `gatherers` the
case's head count on its dropsite, and output the wood delivered per gatherer
per second (`result`). The crowd is a head count whatever the dropsite: a
civic centre (100 to 148 m of obstruction perimeter, list `p`) eases it no
more than the model's error, against 52 m for a storehouse.

The fit is a least-squares search over a grid of LOAD_OVERHEAD_S, CROWD_FREE
and CROWD_COST_S on the managed cases (the policy the bot plays); `--all`
fits on every case. It prints the constants, then every case with its
measured and predicted output.
"""
import argparse
import collections
import itertools
import json
import os
import sys

CAPACITY = 10.0
RATE = 0.7
SPEED = 9.0
GATHER_RANGE = 2.0
CLEARANCE = 0.8
TREE_HALF = 0.8
REACH = TREE_HALF + 2 * (GATHER_RANGE + CLEARANCE)
TAG = "[WOODLINE] "


def cases_of(batches):
    cases = []
    for batch in batches:
        for tag in sorted(os.listdir(batch)):
            log = os.path.join(batch, tag, "stdout.log")
            if not os.path.isfile(log):
                continue
            start, hauls, result = {}, collections.defaultdict(list), {}
            for line in open(log, errors="replace"):
                if not line.startswith(TAG):
                    continue
                kind, _, payload = line[len(TAG):].partition(" ")
                try:
                    data = json.loads(payload)
                except ValueError:
                    continue
                if kind == "start":
                    start[data["player"]] = data
                elif kind == "tick" and data.get("haul") is not None:
                    hauls[data["player"]].append(data["haul"])
                elif kind == "result":
                    result[data["player"]] = data
            for player, res in result.items():
                if player not in start or not hauls[player]:
                    continue
                s = start[player]
                cases.append({
                    "game": f"{os.path.basename(batch)}/{tag}", "player": player, "policy": s["policy"],
                    "gatherers": res["gatherers"], "gap": s["gap"], "cap": s["cap"],
                    "dropsite": s.get("dropsite", "storehouse"),
                    "haul": sum(hauls[player]) / len(hauls[player]), "output": res["perGatherer"]})
    return cases


def predict(case, overhead, free, cost):
    cycle = CAPACITY / RATE + overhead + 2 * max(0.0, case["haul"] - REACH) / SPEED + cost * max(0.0, case["gatherers"] - free)
    return CAPACITY / cycle


def error(cases, params):
    return sum(((predict(c, *params) - c["output"]) / c["output"]) ** 2 for c in cases)


def frange(lo, hi, step):
    n = int(round((hi - lo) / step))
    return [lo + i * step for i in range(n + 1)]


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("batches", nargs="+")
    ap.add_argument("--all", action="store_true", help="fit on every case, not only the managed ones")
    a = ap.parse_args()
    cases = cases_of(a.batches)
    fitted = [c for c in cases if a.all or c["policy"] == "managed"]
    if not fitted:
        sys.exit("woodline.py: no case found")
    grid = itertools.product(frange(0.0, 4.0, 0.1), frange(0.0, 20.0, 1.0), frange(0.0, 0.4, 0.005))
    best = min(grid, key=lambda params: error(fitted, params))
    overhead, free, cost = best
    rms = (error(fitted, best) / len(fitted)) ** 0.5
    print(f"fitted on {len(fitted)} cases of {len(cases)} (reach {REACH:g} m): LOAD_OVERHEAD_S {overhead:g}, "
          f"CROWD_FREE {free:g}, CROWD_COST_S {cost:g}; rms relative error {100 * rms:.1f} %")
    groups = collections.defaultdict(list)
    for c in cases:
        groups[(c["policy"], c["dropsite"], c["gatherers"], c["gap"], c["cap"])].append(c)
    print(f"\n{'policy':8s} {'dropsite':12s} {'n':>3s} {'gap':>4s} {'cap':>3s} {'runs':>4s} {'haul':>5s} {'measured':>8s} {'model':>6s} {'error':>6s}")
    for key in sorted(groups):
        group = groups[key]
        haul = sum(c["haul"] for c in group) / len(group)
        measured = sum(c["output"] for c in group) / len(group)
        model = sum(predict(c, *best) for c in group) / len(group)
        print(f"{key[0]:8s} {key[1]:12s} {key[2]:3d} {key[3]:4d} {key[4]:3d} {len(group):4d} {haul:5.1f} {measured:8.3f} {model:6.3f} "
              f"{100 * (model - measured) / measured:+5.1f}%")


if __name__ == "__main__":
    main()
