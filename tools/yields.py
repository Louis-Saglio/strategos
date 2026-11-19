#!/usr/bin/env python3
"""Realised gather rates of Strategos, from the [YIELD] lines of a batch.

usage: tools/yields.py OUTDIR [--player P] [--windows 0-4,4-8,8-12] [--by-map]

Each [YIELD] line (one a minute) carries, for every source kind and unit
group ("food.fruit|civilian", "food.meat.wild|cavalry", "food.fish|boat",
...), what was delivered at a dropsite since the last line (d), the seconds
those deliveries took from the previous delivery of the same unit (s: walk,
chase, drive, gather and return included; idle and time spent under another
subsystem's orders excluded), the seconds the units sat idle after working
that kind (idle), the seconds another subsystem held them (taken) and the
load thrown away on a change of resource type (lost).

The table sums those per window of in-game minutes over every game and
prints the realised rate d / s, the share of the unit time lost to idling
and to other subsystems, and how many games the bucket appears in.
"""
import argparse
import glob
import json
import os
from collections import defaultdict


def parse_windows(text):
    windows = []
    for part in text.split(","):
        low, high = part.split("-")
        windows.append((float(low), float(high)))
    return windows


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("outdir")
    parser.add_argument("--player", type=int, default=1)
    parser.add_argument("--windows", default="0-4,4-8,8-12")
    parser.add_argument("--by-map", action="store_true")
    args = parser.parse_args()
    windows = parse_windows(args.windows)
    totals = defaultdict(lambda: [0.0, 0.0, 0.0, 0.0, 0.0, set()])
    for path in sorted(glob.glob(os.path.join(args.outdir, "*", "stdout.log"))):
        tag = os.path.basename(os.path.dirname(path))
        group = tag.rsplit("-", 1)[0] if args.by_map else ""
        for line in open(path, errors="replace"):
            if not line.startswith("[YIELD] "):
                continue
            data = json.loads(line.split(" ", 1)[1])
            if data.get("p") != args.player:
                continue
            minute = data["t"] / 60
            window = next((w for w in windows if w[0] <= minute < w[1]), None)
            if window is None:
                continue
            for key, value in data.items():
                if not isinstance(value, dict) or "d" not in value:
                    continue
                entry = totals[(group, key, window)]
                entry[0] += value["d"]
                entry[1] += value["s"]
                entry[2] += value["idle"]
                entry[3] += value["taken"]
                entry[4] += value["lost"]
                entry[5].add(tag)
    keys = sorted({(group, key) for group, key, _ in totals})
    header = "%-40s" % "source|units" + "".join("  %26s" % ("%g-%g min rate idle taken n" % w) for w in windows)
    print(header)
    for group, key in keys:
        cells = []
        for window in windows:
            entry = totals.get((group, key, window))
            if not entry or entry[1] + entry[2] + entry[3] <= 0:
                cells.append("  %26s" % "-")
                continue
            busy = entry[1] + entry[2] + entry[3]
            rate = entry[0] / entry[1] if entry[1] > 0 else 0
            cells.append("  %8.2f %5.0f%% %5.0f%% %4d" % (rate, 100 * entry[2] / busy, 100 * entry[3] / busy, len(entry[5])))
        print("%-40s" % ((group + " " if group else "") + key) + "".join(cells))


if __name__ == "__main__":
    main()
