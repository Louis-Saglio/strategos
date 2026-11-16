#!/usr/bin/env python3
"""Check the bot's combat forecast against the duels of the duel scenario.

    tools/duel.py [--bot DIR] [--set k=v,...] [--fit] [--cases] BATCH_DIR...

A batch of `random/strategos_duel` (see
scenarios/maps/random/strategos_duel_triggers.js) fights a list of duels per
game: two groups of soldiers alone on open ground, reported every second.
Unlike the battles of a real game (tools/forecast.py), nothing outside the
two groups kills anybody, so a duel is the clean truth for the core of
forecast.js: who can strike, how fast, and how losses fall on a group.

A duel is one sample, taken at contact — the last tick before the first hit
point is lost — with the forces as they stand then. The observation is the
units each side has lost 5, 10, 20 and 40 s later (MARKS; the count stays
at its last value once the duel is over). The prediction is forecast.js of
--bot (default: this repo's bot/) run under node on those forces, with
--set overriding its constants.

Printed:
- per class of duel (kinds of the two sides and their sizes, all seeds
  together): units lost by each side at every mark, observed and forecast;
- overall: root mean square error of the lost shares (the quantity --fit
  minimises), and how often the forecast names the side that loses more
  units at the last mark;
- --cases: one line per duel instead of per class;
- --fit: coordinate descent on the constants of the core of forecast.js
  (efficiency and joining time of melee and ranged units, focus), on every
  other game, with the error on the rest; the constants that only matter
  with arrivals or arrows are left alone (a duel has neither). Equal duels
  end with one side wiped out and the other half alive, either way round,
  so their error cannot go to zero: read the fit on the unequal ones.
"""
import argparse
import json
import math
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import forecast as fc  # noqa: E402

MARKS = [5, 10, 20, 40]
FITTED = ["meleeEfficiency", "rangedEfficiency", "focus", "meleeJoinS", "rangedJoinS"]
# focus: units left = initial x (hit points left / initial) ^ focus. 1 is fire concentrated on one unit after
# the other; above 1 a group would lose more units than the damage it took can kill.
EFFICIENCY = [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.85, 1, 1.2]
JOIN = [0, 2, 4, 6, 8, 10, 14, 20, 30]
GRID = {"meleeEfficiency": EFFICIENCY, "rangedEfficiency": EFFICIENCY, "focus": [0.4, 0.5, 0.6, 0.7, 0.85, 1],
        "meleeJoinS": JOIN, "rangedJoinS": JOIN}


def load(batch):
    samples = []
    for tag in sorted(os.listdir(batch)):
        path = os.path.join(batch, tag, "stdout.log")
        if not os.path.exists(path):
            continue
        duels = {}
        with open(path, errors="replace") as fh:
            for line in fh:
                if line.startswith("[DUEL] start "):
                    row = json.loads(line[13:])
                    duels[row["case"]] = {"start": row, "ticks": []}
                elif line.startswith("[DUEL] tick "):
                    row = json.loads(line[12:])
                    duels[row["case"]]["ticks"].append(row)
        for case, duel in duels.items():
            ticks = duel["ticks"]
            full = [sum(g[2] for g in side["groups"]) for side in duel["start"]["sides"]]
            first = next((i for i, t in enumerate(ticks) if any(sum(t["hp"][s]) < full[s] for s in (0, 1))), None)
            if first is None:
                continue
            at = ticks[first - 1] if first else None
            sides = []
            for s in (0, 1):
                side = duel["start"]["sides"][s]
                groups = [list(g) for g in side["groups"]]
                if at:
                    for k, g in enumerate(groups):
                        g[1], g[2] = at["alive"][s][k], at["hp"][s][k]
                for g in groups:
                    g[5] = 0
                sides.append({"groups": groups, "rates": side["rates"], "fire": side["fire"]})
            t0 = at["t"] if at else duel["start"]["t"]
            n = tuple(sum(g[1] for g in side["groups"]) for side in sides)
            obs = {}
            for mark in MARKS:
                seen = [t for t in ticks if t["t"] <= t0 + mark]
                last = seen[-1]
                obs[mark] = tuple(n[s] - sum(last["alive"][s]) for s in (0, 1))
            samples.append({"game": f"{os.path.basename(os.path.normpath(batch))}/{tag}", "case": case,
                            "kinds": duel["start"]["kinds"], "ours": sides[0], "theirs": sides[1], "n": n, "obs": obs,
                            "seconds": ticks[-1]["t"] - t0})
    return samples


def predict(bot, samples, options):
    opts = [dict(o, marksS=MARKS, horizonS=MARKS[-1]) for o in options]
    return fc.evaluate(bot, samples, opts)


def error(samples, preds):
    total, count = 0.0, 0
    for s, p in zip(samples, preds):
        for mark in MARKS:
            for i in (0, 1):
                total += (min(1.0, p[mark][i] / s["n"][i]) - s["obs"][mark][i] / s["n"][i]) ** 2
                count += 1
    return math.sqrt(total / max(1, count))


def named(samples, preds):
    mark = MARKS[-1]
    decided = [(s, p) for s, p in zip(samples, preds) if s["obs"][mark][0] != s["obs"][mark][1]]
    right = sum((p[mark][1] > p[mark][0]) == (s["obs"][mark][1] > s["obs"][mark][0]) for s, p in decided)
    return right, len(decided)


def report(samples, preds, cases):
    mean = lambda xs: sum(xs) / len(xs)
    rows = {}
    for s, p in zip(samples, preds):
        key = (s["game"], s["case"]) if cases else s["case"]
        rows.setdefault(key, []).append((s, p))
    head = "  ".join(f"{m:>2d} s obs      fc     " for m in MARKS)
    print(f"{'duel':24} {'n':>3}  {'ends':>4}  {head}   (units lost, player 1 / player 2)")
    for key in sorted(rows, key=lambda k: (k if cases else (k,))):
        group = rows[key]
        s = group[0][0]
        label = f"{s['kinds'][0]}{s['kinds'][1]} v {s['kinds'][2]}{s['kinds'][3]}" + (f" {s['game'].split('/')[-1]}" if cases else "")
        cells = []
        for m in MARKS:
            cells.append(f"{mean([x['obs'][m][0] for x, _ in group]):4.1f}/{mean([x['obs'][m][1] for x, _ in group]):4.1f} "
                         f"{mean([q[m][0] for _, q in group]):4.1f}/{mean([q[m][1] for _, q in group]):4.1f}")
        print(f"{label:24} {len(group):3d}  {mean([x['seconds'] for x, _ in group]):4.0f}  " + "  ".join(cells))
    right, decided = named(samples, preds)
    print(f"{len(samples)} duels: RMS error of the lost shares {error(samples, preds):.3f}; "
          f"side losing more units at {MARKS[-1]} s named {right}/{decided}")


def fit(bot, samples):
    games = sorted({s["game"] for s in samples})
    train = [s for s in samples if games.index(s["game"]) % 2 == 0]
    test = [s for s in samples if games.index(s["game"]) % 2 == 1]
    best = {}
    score = error(train, predict(bot, train, [best])[0])
    print(f"fit on {len(train)} duels of {len(games) - len(games) // 2} games, checked on {len(test)}; start {score:.4f}")
    improved = True
    while improved:
        improved = False
        for key in FITTED:
            options = [dict(best, **{key: value}) for value in GRID[key]]
            scores = [error(train, p) for p in predict(bot, train, options)]
            k = min(range(len(scores)), key=scores.__getitem__)
            if scores[k] < score - 1e-5:
                best, score, improved = options[k], scores[k], True
                print(f"  {key} = {GRID[key][k]} -> {score:.4f}")
    if test:
        print(f"train {score:.4f}; test {error(test, predict(bot, test, [best])[0]):.4f} "
              f"(with the constants of forecast.js: {error(test, predict(bot, test, [{}])[0]):.4f})")
    print("fitted: " + json.dumps(best))
    return best


def main():
    ap = argparse.ArgumentParser(description="Check the combat forecast against duels.")
    ap.add_argument("batches", nargs="+")
    ap.add_argument("--bot", default=os.path.join(fc.REPO, "bot"))
    ap.add_argument("--set", default="")
    ap.add_argument("--fit", action="store_true")
    ap.add_argument("--cases", action="store_true")
    a = ap.parse_args()
    samples = [s for b in a.batches for s in load(b)]
    if not samples:
        sys.exit("duel.py: no duel in " + ", ".join(a.batches))
    options = {k: float(v) for k, v in (p.split("=") for p in a.set.split(",") if p)}
    if a.fit:
        options = fit(a.bot, samples)
    report(samples, predict(a.bot, samples, [options])[0], a.cases)


if __name__ == "__main__":
    main()
