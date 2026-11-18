#!/usr/bin/env python3
"""Compare the games of a rejoin-test batch with the same games played without it.

    tools/rejoin.py PLAIN_DIR TEST_DIR

TEST_DIR is a batch run with run.sh --rejoin-test (or "rejoin_test" in a
--matches line), PLAIN_DIR the same matches run with --full-ai-view and no
rejoin test. From the rejoin turn N on, the engine runs a second simulation
restored from the first one's serialised state, and both print to the same
log: every turn's block of output (the lines between two "Turn T (200)..."
lines) is the first simulation's lines followed by the second's. A game
passes when

- the engine found no difference (no "Serialization test failure") and the
  second simulation did start;
- both games exited with code 0, without an ERROR or WARNING line;
- every turn before N prints what the plain game prints that turn, and every
  turn from N on prints it twice: the first simulation plays the plain game
  (the test does not change it) and the restored one plays it too, the
  bots' telemetry and every command included.

Compared lines: those that start with "[" (harness and bot lines) or "{"
(the statistics at game end), less [PERF] (wall-clock times). A test game
the wall-clock cap killed (both simulations run slowly once the second has
started) is compared on the turns it completed and reported as PARTIAL; so
is the output of a game the engine stopped at a difference.
Exit status 1 when a game fails or is partial.
"""
import json
import os
import re
import sys

TURN = re.compile(r"^Turn (\d+) \(\d+\)\.\.\.$")
PROBLEM = re.compile(r"\b(ERROR|WARNING)\b")


def blocks(path):
    """{turn: [lines printed during that turn's update]}, the lines after the
    last turn under the key None, and the problem lines."""
    out, current, problems = {}, [], []
    with open(path, encoding="utf-8", errors="replace") as fh:
        for raw in fh:
            line = raw.rstrip("\n")
            m = TURN.match(line)
            if m:
                out[int(m.group(1))] = current
                current = []
                continue
            if PROBLEM.search(line) and not line.startswith(("[", "{")):
                problems.append(line)
            if line.startswith(("[", "{")) and not line.startswith("[PERF]"):
                current.append(line)
    out[None] = current
    return out, problems


def result(d, tag):
    with open(os.path.join(d, tag, "result.json"), encoding="utf-8") as fh:
        return json.load(fh)


def check(plain_dir, test_dir, tag):
    test = result(test_dir, tag)
    plain = result(plain_dir, tag)
    faults = []
    rejoin = test.get("rejoin_test")
    if not rejoin:
        return [f"{tag}: not played with the rejoin test"], None, None
    n = rejoin["turn"]
    if not rejoin["started"]:
        faults.append("the second simulation never started")
    if rejoin["failure"]:
        faults.append("the engine reported a serialization test failure")
    killed = test["exit_code"] in (124, 137) and not rejoin["failure"]
    for name, r in (("plain", plain), ("test", test)):
        if r["exit_code"] != 0 and not (name == "test" and killed):
            faults.append(f"{name} exit code {r['exit_code']}")
    if {k: v for k, v in test["spec"].items() if k not in ("rejoin_test", "mods")} != \
            {k: v for k, v in plain["spec"].items() if k not in ("rejoin_test", "mods")}:
        faults.append("the two games are not the same match")
    p, p_problems = blocks(os.path.join(plain_dir, tag, "stdout.log"))
    t, t_problems = blocks(os.path.join(test_dir, tag, "stdout.log"))
    for name, problems in (("plain", p_problems), ("test", t_problems)):
        if problems:
            faults.append(f"{name} log has {len(problems)} ERROR/WARNING line(s): {problems[0][:120]}")
    first = None
    turns = sorted(k for k in set(p) | set(t) if k is not None) + [None]
    if killed or rejoin["failure"]:
        turns = [k for k in turns if k is not None and k in t]
    for turn in turns:
        want = p.get(turn, [])
        if turn is None or turn >= n:
            want = want + want
        if t.get(turn, []) != want:
            first = turn
            break
    if first is not None:
        got = t.get(first, [])
        want = p.get(first, [])
        if first is None or first >= n:
            want = want + want
        k = next((i for i, (a, b) in enumerate(zip(got, want)) if a != b), min(len(got), len(want)))
        faults.append(f"the output differs at turn {first if first is not None else 'end'} "
                      f"({'restored' if first is None or first >= n else 'before the rejoin'}), line {k}: "
                      f"test {got[k][:150] if k < len(got) else '<none>'} | plain {want[k][:150] if k < len(want) else '<none>'}")
    compared = sum(1 for turn in turns if turn is not None and turn >= n)
    return faults, compared, max(k for k in turns if k is not None) if killed else None


def main():
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    plain_dir, test_dir = sys.argv[1:]
    with open(os.path.join(test_dir, "batch.json"), encoding="utf-8") as fh:
        tags = [m["tag"] for m in json.load(fh)["matches"]]
    failed = 0
    for tag in tags:
        faults, compared, cut = check(plain_dir, test_dir, tag)
        n = result(test_dir, tag).get("rejoin_test", {}).get("turn")
        if faults:
            failed += 1
            print(f"{tag}: FAILS (rejoin at turn {n})")
            for f in faults:
                print(f"  {f}")
        elif cut is not None:
            failed += 1
            print(f"{tag}: PARTIAL: restored at turn {n}, killed by the wall-clock cap after turn {cut}: "
                  f"{compared} turns played by both simulations, output identical to the plain game, "
                  f"no difference found by the engine")
        else:
            print(f"{tag}: passes: restored at turn {n}, {compared} turns played by both simulations, "
                  f"output identical to the plain game, no difference found by the engine")
    print(f"rejoin: {len(tags) - failed} of {len(tags)} games pass in full")
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
