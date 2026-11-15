#!/usr/bin/env python3
"""What each AI used in the games of one or more batches, against what its
civilisation offers: command types, technologies, structures and units.

    tools/census.py [--ai NAME] [--all] [--civ] BATCHDIR...

Reads the `[HARNESS] census` line of every game (tools/harness: every
command each player issued, with the templates of train / construct /
research commands) and the game data of the 0 A.D. source checkout
(tools/gamedata/zad.py). For the AI family --ai (default strategos; a
family is the AI name of the match spec, e.g. petra) it prints

- the command types of every family side by side, in games using them;
- per technology, structure and unit: the games where the AI ordered it
  over the games where its civ could (the civ owns a building or unit
  that researches, builds or trains it), with the same count for the
  other families as a reference.

Without --all only the entries used in fewer than 5 % of the possible
games are listed; --civ adds the per-civ split. A command the engine
refused still counts as ordered: read `[HARNESS] refused` for those.
"""
import argparse
import glob
import json
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "gamedata"))
import zad  # noqa: E402

RARE = 0.05


def phase_of(text):
    return 3 if "phase_city" in text else 2 if "phase_town" in text else 1


def tech_phase(name):
    return phase_of(json.dumps((zad.tech(name) or {}).get("requirements", {})))


def template_phase(name):
    t = zad.template(name)
    return phase_of(t.text("Identity/Requirements/Techs") or "") if t is not None else 1


def tech_effects(name):
    out = []
    for m in (zad.tech(name) or {}).get("modifications", []):
        op = ("x%g" % m["multiply"] if "multiply" in m else "+%g" % m["add"] if "add" in m
              else "=%s" % m.get("replace", m.get("tokens")))
        out.append(m["value"] + op)
    return "; ".join(out)


def cost_of(costs):
    return " ".join("%s%d" % (k[0], float(v)) for k, v in costs.items() if v and float(v))


def load(dirs):
    """-> games[(family, civ)], used[kind][(family, civ, name)] in games, commands[(family, type)] in games."""
    games, commands = {}, {}
    used = {"research": {}, "construct": {}, "train": {}}
    for d in dirs:
        for res in glob.glob(os.path.join(d, "*", "result.json")):
            spec = json.load(open(res))["spec"]
            log = os.path.join(os.path.dirname(res), "stdout.log")
            census = None
            if os.path.exists(log):
                for line in open(log, errors="replace"):
                    if line.startswith("[HARNESS] census "):
                        census = json.loads(line[len("[HARNESS] census "):])
            if census is None:
                continue
            for i, p in enumerate(spec["players"]):
                if p["ai"] == "none":
                    continue
                key = (p["ai"], p["civ"])
                games[key] = games.get(key, 0) + 1
                entry = census.get(str(i + 1), {})
                for ctype in entry.get("commands", {}):
                    commands[(p["ai"], ctype)] = commands.get((p["ai"], ctype), 0) + 1
                for name in entry.get("detail", {}):
                    commands[(p["ai"], name)] = commands.get((p["ai"], name), 0) + 1
                for kind in used:
                    for name in entry.get(kind, {}):
                        k = (p["ai"], p["civ"], name)
                        used[kind][k] = used[kind].get(k, 0) + 1
    return games, used, commands


def offered(civ):
    """-> {kind: {name: label}} of what the civ can research / build / train."""
    own = zad.ownership(civ)
    techs = {}
    for name, producers in own.techs().items():
        td = zad.tech(name) or {}
        if "auto" in producers or "top" in td:
            continue
        techs[name] = ",".join(sorted({zad.short(p).replace(civ + "_", "") for p in producers}))
    return {
        "research": techs,
        "construct": {s: "" for s in own.structures() if s in own.built},
        "train": {u: ",".join(sorted(zad.short(p) for p in own.trained[u])) for u in own.units()},
    }


def generic(civ, name):
    return name.replace("/" + civ + "/", "/*/")


def section(title, kind, games, used, ai, others, args, describe):
    rows = {}
    for (family, civ), n in sorted(games.items()):
        if family != ai:
            continue
        for name, label in offered(civ)[kind].items():
            row = rows.setdefault(generic(civ, name), {"can": 0, "did": 0, "civs": {}, "label": label, "name": name,
                                                       "other": {o: [0, 0] for o in others}})
            row["can"] += n
            row["did"] += used[kind].get((ai, civ, name), 0)
            row["civs"][civ] = (used[kind].get((ai, civ, name), 0), n)
    for (family, civ), n in games.items():
        if family not in others:
            continue
        for name in offered(civ)[kind]:
            row = rows.get(generic(civ, name))
            if row:
                row["other"][family][0] += used[kind].get((family, civ, name), 0)
                row["other"][family][1] += n
    print("\n%s: %s ordered / possible games%s" % (title, ai, "".join("  | " + o for o in others)))
    shown = 0
    for key in sorted(rows, key=lambda k: (rows[k]["did"] / max(1, rows[k]["can"]), k)):
        row = rows[key]
        if not args.all and row["did"] / max(1, row["can"]) >= RARE:
            continue
        shown += 1
        other = "".join("  | %3d/%-3d" % tuple(row["other"][o]) for o in others)
        print("  %-44s %4d/%-4d%s  %s" % (key[:44], row["did"], row["can"], other, describe(row)))
        if args.civ:
            print("      " + " ".join("%s %d/%d" % (c, a, b) for c, (a, b) in sorted(row["civs"].items())))
    print("  (%d of %d listed)" % (shown, len(rows)))


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--ai", default="strategos")
    ap.add_argument("--all", action="store_true", help="list every entry, not only the rare ones")
    ap.add_argument("--civ", action="store_true", help="per-civ split under each entry")
    ap.add_argument("dirs", nargs="+")
    args = ap.parse_args()
    games, used, commands = load(args.dirs)
    families = sorted({f for f, _ in games})
    if args.ai not in families:
        sys.exit("census.py: no game of %s with a census line in %s" % (args.ai, " ".join(args.dirs)))
    others = [f for f in families if f != args.ai]
    total = {f: sum(n for (g, _), n in games.items() if g == f) for f in families}
    print("games: " + "  ".join("%s %d" % (f, total[f]) for f in families))
    print("\ncommand types, in games using them:  " + "  ".join(families))
    for ctype in sorted({t for _, t in commands}):
        print("  %-28s %s" % (ctype, "  ".join("%5d" % commands.get((f, ctype), 0) for f in families)))

    def tech_row(row):
        td = zad.tech(row["name"]) or {}
        return "ph%d %-16s %-18s %s" % (tech_phase(row["name"]), row["label"][:16], cost_of(td.get("cost") or {}),
                                         tech_effects(row["name"])[:110])

    def template_row(row):
        t = zad.template(row["name"])
        costs = {k: t.text("Cost/Resources/" + k) for k in ("food", "wood", "stone", "metal")} if t is not None else {}
        return "ph%d %-18s %s" % (template_phase(row["name"]), cost_of(costs), row["label"][:60])

    section("technologies", "research", games, used, args.ai, others, args, tech_row)
    section("structures", "construct", games, used, args.ai, others, args, template_row)
    section("units", "train", games, used, args.ai, others, args, template_row)


if __name__ == "__main__":
    main()
