#!/usr/bin/env python3
"""Paired comparison of two tools/run.sh batches run on the same matches.

    compare.py BASE_DIR VARIANT_DIR [--player WHO] [--at MIN] [--by KEYS] [TAG...]

WHO is a player number or an AI name, as in analyze.py (default: the first
strategos player, else player 1).

Matches are paired by tag (default: every tag present in both). Prints:

- identical games (equal statistics hash) — when a change should leave a
  match untouched, it must show up here;
- outcome table: how many matches player N's side won / lost / timed out /
  failed in each batch, and the per-match transitions;
- for each end-of-game metric of player N (tools/analyze.py --metrics, plus
  game minutes): base mean, variant mean, mean paired delta, and the
  two-sided paired t-test p-value. --at MIN reads the gathered resources,
  their total and ratio and the population at minute MIN (harness eco
  lines, see analyze.py).
- score: per match +1 when player N's side won, -1 when it lost, 0 on a
  timeout (failed matches are left out), compared like the metrics.

--by KEY[,KEY...] (the keys of analyze.py --by) adds, per value of each
KEY, the number of pairs and each batch's wins / losses / timeouts and mean
score, so a change can be read setting by setting.

A difference is only worth reading when it is larger than the noise of the
unchanged matches; small batches are noise.
"""
import argparse
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import analyze  # noqa: E402


def betacf(a, b, x):
    tiny = 1e-300
    c, d = 1.0, 1.0 - (a + b) * x / (a + 1.0)
    d = 1.0 / (d if abs(d) > tiny else tiny)
    h = d
    for m in range(1, 300):
        m2 = 2 * m
        for aa in (m * (b - m) * x / ((a - 1.0 + m2) * (a + m2)),
                   -(a + m) * (a + b + m) * x / ((a + m2) * (a + 1.0 + m2))):
            d = 1.0 + aa * d
            d = 1.0 / (d if abs(d) > tiny else tiny)
            c = 1.0 + aa / c
            c = c if abs(c) > tiny else tiny
            h *= d * c
        if abs(d * c - 1.0) < 1e-12:
            break
    return h


def reg_ibeta(a, b, x):
    if x <= 0:
        return 0.0
    if x >= 1:
        return 1.0
    lbt = math.lgamma(a + b) - math.lgamma(a) - math.lgamma(b) + a * math.log(x) + b * math.log(1 - x)
    if x < (a + 1) / (a + b + 2):
        return math.exp(lbt) * betacf(a, b, x) / a
    return 1.0 - math.exp(lbt) * betacf(b, a, 1 - x) / b


def paired_p(deltas):
    n = len(deltas)
    if n < 2:
        return None
    mean = sum(deltas) / n
    var = sum((d - mean) ** 2 for d in deltas) / (n - 1)
    if var == 0:
        return 1.0 if mean == 0 else 0.0
    t = mean / math.sqrt(var / n)
    df = n - 1
    return reg_ibeta(df / 2, 0.5, df / (df + t * t))


side_result, score = analyze.side_result, analyze.score


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("base")
    ap.add_argument("variant")
    ap.add_argument("tags", nargs="*")
    ap.add_argument("--player")
    ap.add_argument("--at", type=float)
    ap.add_argument("--by", default="")
    a = ap.parse_args()
    base = {r["tag"]: r for r in analyze.rows_for(a.base)}
    var = {r["tag"]: r for r in analyze.rows_for(a.variant)}
    tags = a.tags or sorted(set(base) & set(var), key=analyze.natural)
    tags = [t for t in tags if t in base and t in var]
    if not tags:
        sys.exit("compare.py: no common tag")
    # A pair is a pair only if everything but the mods is the same match:
    # flag (but still compare) pairs whose map, players or game settings differ.
    differ = {}
    for t in tags:
        sb, sv = base[t]["spec"], var[t]["spec"]
        for k in sorted((set(sb) | set(sv)) - {"mods", "tag"}):
            if sb.get(k) != sv.get(k):
                differ.setdefault(k, []).append(t)
    for k, ts in differ.items():
        print(f"compare.py: WARNING: {k} differs between the batches on {len(ts)} pair(s) "
              f"({' '.join(ts[:8])}{' ...' if len(ts) > 8 else ''})", file=sys.stderr)
    who = a.player or "strategos"
    pid = lambda row: analyze.player_id(row, a.player)
    same = [t for t in tags if base[t]["hash"] != "-" and base[t]["hash"] == var[t]["hash"]]
    print(f"{len(tags)} paired matches, {len(same)} identical games")

    trans, counts = {}, {"base": {}, "variant": {}}
    for t in tags:
        rb, rv = side_result(base[t], pid(base[t])), side_result(var[t], pid(var[t]))
        counts["base"][rb] = counts["base"].get(rb, 0) + 1
        counts["variant"][rv] = counts["variant"].get(rv, 0) + 1
        if rb != rv:
            trans.setdefault(f"{rb} -> {rv}", []).append(t)
    for k in ("base", "variant"):
        print(f"  player {who} side, {k}: " + ", ".join(f"{v} {r}" for r, v in sorted(counts[k].items())))
    for k, v in sorted(trans.items()):
        print(f"  {k}: {len(v)} ({' '.join(v[:12])}{' ...' if len(v) > 12 else ''})")

    names = ["score", "game_min"] + analyze.METRICS
    print(f"\n{'metric':10} {'base':>10} {'variant':>10} {'delta':>10} {'p':>7}  n")
    for m in names:
        pairs = []
        for t in tags:
            vals = []
            for row in (base[t], var[t]):
                if m == "score":
                    v = score(row, pid(row))
                elif m == "game_min":
                    v = row["game_min"]
                else:
                    st = row["stats"].get(pid(row))
                    v = analyze.metrics(st, row, a.at)[m] if st else None
                try:
                    vals.append(float(v))
                except (TypeError, ValueError):
                    vals.append(None)
            if None not in vals and all(math.isfinite(x) for x in vals):
                pairs.append(vals)
        if not pairs:
            continue
        mb = sum(p[0] for p in pairs) / len(pairs)
        mv = sum(p[1] for p in pairs) / len(pairs)
        p = paired_p([p[1] - p[0] for p in pairs])
        print(f"{m:10} {mb:10.1f} {mv:10.1f} {mv - mb:+10.1f} {('%.3f' % p) if p is not None else '-':>7}  {len(pairs)}")


    for key in filter(None, a.by.split(",")):
        rows = {"base": analyze.breakdown([base[t] for t in tags], key, a.player),
                "variant": analyze.breakdown([var[t] for t in tags], key, a.player)}
        values = [v for v, *_ in rows["base"]]
        byv = {k: {v: (res, mean) for v, _, res, mean in rows[k]} for k in rows}
        width = max([len(key)] + [len(v) for v in values])
        fmt = lambda x: f"{x[0]['win']}/{x[0]['loss']}/{x[0]['timeout']}" + (f"/{x[0]['fail']}f" if x[0]["fail"] else "")
        sc = lambda x: f"{x[1]:+.2f}" if x[1] is not None else "-"
        print(f"\n{key.ljust(width)}  pairs  {'base W/L/T':>12} {'variant W/L/T':>14} {'base':>6} {'variant':>8}")
        for v, n, _, _ in rows["base"]:
            b, w = byv["base"][v], byv["variant"].get(v)
            if w is None:
                continue
            print(f"{v.ljust(width)}  {n:5d}  {fmt(b):>12} {fmt(w):>14} {sc(b):>6} {sc(w):>8}")


if __name__ == "__main__":
    main()
