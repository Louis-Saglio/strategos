#!/usr/bin/env python3
"""Check the bot's combat forecast against the battles of recorded games.

    tools/forecast.py [--window S] [--bot DIR] [--logged] [--fit] [--by KEY] BATCH_DIR...

The bot prints a `[FORECAST]` line at the onset of every battle and every
30 s while it lasts: the two forces as it sees them and what `forecast.js`
predicts. Per side: `groups`, one `[template, count, hit points, ranged,
cost, engaged, at]` per template and wave — the soldiers within 60 m of
the fight (`at` 0; `engaged` of them are fighting a unit of the other
side) and those within 150 m that can join (`at`: the mean seconds they
need to arrive; gathering enemies are left out); `rates`, what one unit of
a group deals per second to each group of the other side; `fire`, the
arrow damage per second the covering structures would deal to each group.
`ids` lists the units of each side in that order. The harness prints every
death (`[HARNESS] kills`, with the victims' ids). This tool joins the two:

- truth of a sample: the units the line lists that the harness saw die
  during the --window seconds (default 30) after the line; a unit that
  walks away counts as alive, one that was not listed is not counted, and a
  sample whose window runs past the end of the game is dropped;
- prediction: recomputed from the logged forces with the forecast.js of
  --bot (default: this repo's bot/), run under node by forecast_eval.mjs, so
  a change of the model is read on games already played; --logged takes the
  prediction the game printed instead.

It prints, for the forecast and for two baselines computed on the same
samples (`balance`, the dps x hit points ratio of tactics.js that the line
carries, and the head count ratio):

- error: mean absolute error and bias of the share of each side lost in
  the window (lost / listed, capped at 1), and of the units;
- side: on the samples where one side loses at least 2 units more than the
  other, how often the model names it (forecast: the side it predicts to
  lose more; balance and head count: the side below 1), next to how often
  we are the side that loses fewer — the score of always answering so;
- corr: correlation between the predicted and the observed difference of
  lost shares (theirs - ours);
- units: correlation between predicted and observed units lost by each
  side and their difference (theirs - ours), the net exchange — what a
  decision to fight or leave needs, and what a ratio cannot give.

--by cover splits the samples by the arrow fire present (none / ours /
theirs / both); --by size by the units engaged; --by seq into battle
onsets and later reports.

--fit searches, by coordinate descent on the games with an even hash,
minimising the root mean square error of the two lost shares, the constants
of forecast.js that only a real battle can set (GRID: the share of an
arriving wave that counts, the share of the arrows that hit, the scale of
the joining times), and reports the error on the other games before and
after. It prints the constants to put into forecast.js; it does not edit
the bot. The core of the model is fitted on duels (tools/duel.py): in a
recorded battle a listed unit is not always killed by a listed unit, so
this truth cannot tell how fast two forces alone destroy each other.
"""
import argparse
import hashlib
import json
import math
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
FORECAST_TAG = "[FORECAST] "
KILLS_TAG = "[HARNESS] kills "
START_TAG = "[HARNESS] start "
END_TAG = "[HARNESS] time limit reached"
MIN_GAP = 2
GRID = {
    "arrivals": [0, 0.1, 0.25, 0.5, 0.75, 1],
    "arrowHitShare": [0.05, 0.1, 0.2, 0.3, 0.5, 0.7, 1],
    "joinScale": [0, 0.25, 0.5, 1, 1.5],
}


def load(batch, window):
    """Samples of one batch directory: logged forces, logged prediction, observed losses."""
    samples = []
    for tag in sorted(os.listdir(batch)):
        path = os.path.join(batch, tag, "stdout.log")
        if not os.path.exists(path):
            continue
        lines, died, end, limit = [], {}, 0.0, 0.0
        with open(path, errors="replace") as fh:
            for line in fh:
                if line.startswith(FORECAST_TAG):
                    lines.append(json.loads(line[len(FORECAST_TAG):]))
                elif line.startswith(KILLS_TAG):
                    row = json.loads(line[len(KILLS_TAG):])
                    if "ids" not in row:
                        sys.exit(f"forecast.py: {path}: kills lines without ids (a batch of an older harness)")
                    for kill, victim in zip(row["k"], row["ids"]):
                        died[victim] = kill[0]
                    end = max(end, row["t"])
                elif line.startswith(START_TAG):
                    limit = json.loads(line[len(START_TAG):])["limitMin"] * 60
                elif line.startswith(END_TAG):
                    end = limit
        for row in lines:
            if row["t"] + window > end:
                continue
            ours, theirs = (sum(1 for unit in side if row["t"] < died.get(unit, -1) <= row["t"] + window)
                            for side in row["ids"])
            count = lambda side: sum(g[1] for g in side["groups"])
            samples.append({
                "game": f"{os.path.basename(os.path.normpath(batch))}/{tag}", "t": row["t"], "seq": row["seq"],
                "ours": row["ours"], "theirs": row["theirs"], "n": (count(row["ours"]), count(row["theirs"])),
                "obs": (ours, theirs), "logged": {m[0]: (m[1], m[2]) for m in row["marks"]},
                "balance": row["balance"],
            })
    return samples


def evaluate(bot, samples, options):
    """Predicted (ours lost, theirs lost) at every mark, per option set and sample."""
    request = {"samples": [{"ours": s["ours"], "theirs": s["theirs"]} for s in samples], "options": options}
    run = subprocess.run(["node", os.path.join(HERE, "forecast_eval.mjs"),
                          os.path.join(bot, "simulation/ai/strategos/forecast.js")],
                         input=json.dumps(request), capture_output=True, text=True)
    if run.returncode:
        sys.exit("forecast.py: node failed:\n" + run.stderr)
    return [[{m[0]: (m[1], m[2]) for m in s["marks"]} for s in per] for per in json.loads(run.stdout)]


def shares(sample, lost):
    return tuple(min(1.0, lost[i] / sample["n"][i]) for i in (0, 1))


def share_error(samples, preds, window):
    """Root mean square error of the two lost shares: the quantity --fit minimises
    (squared, so that the many samples without a loss do not pull the fit to zero)."""
    total = 0.0
    for s, p in zip(samples, preds):
        obs, pred = shares(s, s["obs"]), shares(s, p[window])
        total += (pred[0] - obs[0]) ** 2 + (pred[1] - obs[1]) ** 2
    return math.sqrt(total / max(1, 2 * len(samples)))


def correlation(xs, ys):
    n = len(xs)
    if n < 3:
        return float("nan")
    mx, my = sum(xs) / n, sum(ys) / n
    sx = math.sqrt(sum((x - mx) ** 2 for x in xs))
    sy = math.sqrt(sum((y - my) ** 2 for y in ys))
    return sum((x - mx) * (y - my) for x, y in zip(xs, ys)) / (sx * sy) if sx and sy else float("nan")


def report(samples, preds, window, label):
    n = len(samples)
    if not n:
        print(f"{label}: no sample")
        return
    mean = lambda xs: sum(xs) / len(xs) if xs else float("nan")
    obs = [shares(s, s["obs"]) for s in samples]
    pred = [shares(s, p[window]) for s, p in zip(samples, preds)]
    units_obs = [s["obs"] for s in samples]
    units_pred = [p[window] for p in preds]
    print(f"{label}: {n} samples in {len({s['game'] for s in samples})} games; "
          f"mean engaged {mean([s['n'][0] for s in samples]):.1f} / {mean([s['n'][1] for s in samples]):.1f}; "
          f"lost in {window} s, observed {mean([u[0] for u in units_obs]):.1f} / {mean([u[1] for u in units_obs]):.1f}, "
          f"forecast {mean([u[0] for u in units_pred]):.1f} / {mean([u[1] for u in units_pred]):.1f} (ours / theirs)")
    for i, who in enumerate(("ours", "theirs")):
        print(f"  error {who:6}: share MAE {mean([abs(p[i] - o[i]) for p, o in zip(pred, obs)]):.3f}, "
              f"bias {mean([p[i] - o[i] for p, o in zip(pred, obs)]):+.3f}; "
              f"units MAE {mean([abs(p[i] - o[i]) for p, o in zip(units_pred, units_obs)]):.2f}, "
              f"bias {mean([p[i] - o[i] for p, o in zip(units_pred, units_obs)]):+.2f}")
    decided = [k for k, s in enumerate(samples) if abs(s["obs"][0] - s["obs"][1]) >= MIN_GAP]
    truth = [samples[k]["obs"][1] > samples[k]["obs"][0] for k in decided]
    named = {
        "forecast": [units_pred[k][1] > units_pred[k][0] for k in decided],
        "balance": [samples[k]["balance"] > 1 for k in decided],
        "head count": [samples[k]["n"][0] > samples[k]["n"][1] for k in decided],
    }
    won = sum(truth)
    print(f"  side  (the {len(decided)} samples with a gap of {MIN_GAP}+ units; we lose fewer in {won}): " +
          ", ".join(f"{k} {sum(a == b for a, b in zip(v, truth))}/{len(decided)}" for k, v in named.items()))
    net = lambda units: [u[1] - u[0] for u in units]
    print(f"  units corr: ours lost {correlation([u[0] for u in units_pred], [u[0] for u in units_obs]):.2f}, "
          f"theirs lost {correlation([u[1] for u in units_pred], [u[1] for u in units_obs]):.2f}, "
          f"net exchange {correlation(net(units_pred), net(units_obs)):.2f}")
    gap_obs = [o[1] - o[0] for o in obs]
    ratio = lambda x: math.log(max(1e-3, x))
    print(f"  corr  with the observed difference of lost shares: forecast "
          f"{correlation([p[1] - p[0] for p in pred], gap_obs):.2f}, "
          f"balance {correlation([ratio(s['balance']) for s in samples], gap_obs):.2f}, "
          f"head count {correlation([ratio(s['n'][0] / s['n'][1]) for s in samples], gap_obs):.2f}")


def group_key(sample, key):
    if key == "cover":
        mine, theirs = any(sample["ours"]["fire"]), any(sample["theirs"]["fire"])
        return "both" if mine and theirs else "ours" if mine else "theirs" if theirs else "none"
    if key == "size":
        n = sum(sample["n"])
        return "under 20" if n < 20 else "20-59" if n < 60 else "60 and more"
    if key == "seq":
        return "onset" if sample["seq"] == 0 else "later"
    sys.exit(f"forecast.py: unknown --by key {key!r} (cover, size, seq)")


def fit(bot, samples, window):
    even = lambda s: int(hashlib.sha256(s["game"].encode()).hexdigest(), 16) % 2 == 0
    train = [s for s in samples if even(s)]
    test = [s for s in samples if not even(s)]
    if not train or not test:
        sys.exit("forecast.py: --fit needs games on both sides of the split")
    current = {}
    before = (share_error(train, evaluate(bot, train, [{}])[0], window),
              share_error(test, evaluate(bot, test, [{}])[0], window))
    best = before[0]
    for sweep in range(4):
        moved = False
        for name, values in GRID.items():
            options = [dict(current, **{name: v}) for v in values]
            errors = [share_error(train, p, window) for p in evaluate(bot, train, options)]
            k = min(range(len(values)), key=lambda i: errors[i])
            if errors[k] < best - 1e-6:
                best, moved = errors[k], True
                current[name] = values[k]
        if not moved:
            break
    after = share_error(test, evaluate(bot, test, [current])[0], window)
    print(f"\nfit on {len(train)} samples ({len({s['game'] for s in train})} games), "
          f"checked on {len(test)} ({len({s['game'] for s in test})} games), RMS error of the lost shares at {window} s:")
    print(f"  fitted games : {before[0]:.3f} -> {best:.3f}")
    print(f"  other games  : {before[1]:.3f} -> {after:.3f}")
    print("  constants that moved (FORECAST in forecast.js): " + (json.dumps(current) if current else "none"))
    return current


def main():
    ap = argparse.ArgumentParser(description="Check the bot's combat forecast against recorded battles.")
    ap.add_argument("batches", nargs="+")
    ap.add_argument("--window", type=int, default=30)
    ap.add_argument("--bot", default=os.path.join(REPO, "bot"))
    ap.add_argument("--logged", action="store_true")
    ap.add_argument("--fit", action="store_true")
    ap.add_argument("--by", default="")
    a = ap.parse_args()
    samples = [s for b in a.batches for s in load(b, a.window)]
    if not samples:
        sys.exit("forecast.py: no [FORECAST] line in these batches")
    if a.logged:
        if any(a.window not in s["logged"] for s in samples):
            sys.exit(f"forecast.py: --logged needs --window among the marks the game printed")
        preds = [s["logged"] for s in samples]
    else:
        preds = evaluate(a.bot, samples, [{"marksS": [a.window], "horizonS": a.window}])[0]
    report(samples, preds, a.window, "all")
    for key in filter(None, a.by.split(",")):
        groups = {}
        for s, p in zip(samples, preds):
            groups.setdefault(group_key(s, key), []).append((s, p))
        for value in sorted(groups):
            report([s for s, _ in groups[value]], [p for _, p in groups[value]], a.window, f"{key} {value}")
    if a.fit:
        if a.window not in (30, 60):
            sys.exit("forecast.py: --fit reads the marks of forecast.js (30 or 60 s)")
        moved = fit(a.bot, samples, a.window)
        if moved:
            report(samples, evaluate(a.bot, samples, [moved])[0], a.window, "all, fitted constants")


if __name__ == "__main__":
    main()
