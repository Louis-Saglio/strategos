#!/usr/bin/env python3
"""Per-game timeline of a batch, for any number of players and teams.

    tools/timeline.py [--at 8,12,16,20,25,30,40] [--player N] BATCHDIR...

For each game: the outcome (as tools/analyze.py reads it), civs, size and
biome, the phases player N researched (default 1: the bot in the usual
`-p` order), then at each minute of --at the population and the resources
gathered (thousands) of every player and the military value of every team
(`[HARNESS] eco` and `standing`), and player N's attack launches and
returns with their army size and reason (`[ATTACK]` lines of the bot).

Written for games of one player against several (issue #34), where the
one-line summary of analyze.py hides when and how a game was decided.
"""
import argparse
import json
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))


def outcomes(batch):
    out = subprocess.run([sys.executable, os.path.join(HERE, "analyze.py"), batch], capture_output=True, text=True).stdout
    lines = out.splitlines()
    found = {}
    for line in lines[1:]:
        fields = line.split()
        if len(fields) > 2 and os.path.isdir(os.path.join(batch, fields[0])):
            found[fields[0]] = " ".join(fields[1:3]) if fields[1] in ("T1", "T2", "T3", "T4") else fields[1]
    return found, [line for line in lines[-2:] if line and line.split()[0] not in found]


def game(batch, tag, player, minutes, outcome):
    path = os.path.join(batch, tag, "stdout.log")
    eco, standing, phases, moves = {}, {}, {}, []
    for line in open(path, errors="replace"):
        if line.startswith("[HARNESS] eco "):
            entry = json.loads(line[14:])
            eco[entry["t"] // 60] = entry
        elif line.startswith("[HARNESS] standing "):
            entry = json.loads(line[19:])
            standing[entry["t"] // 60] = entry["teams"]
        elif line.startswith("[TECH] "):
            entry = json.loads(line[7:])
            if entry.get("p") == player and str(entry.get("research", "")).startswith("phase_"):
                phases[entry["research"].split("_")[1]] = round(entry["t"] / 60, 1)
        elif line.startswith("[ATTACK] "):
            entry = json.loads(line[9:])
            if entry.get("p") == player and entry.get("mode") in ("rally", "return"):
                moves.append(f'{entry["t"] / 60:.1f} {entry["mode"]} {entry.get("army", entry.get("alive", ""))}'
                             f' {entry.get("reason", "")}'.strip())
    spec = json.load(open(os.path.join(batch, tag, "result.json")))["spec"]
    players = spec["players"]
    civs = " ".join(f'{entry["ai"]}/{entry["civ"]}:{entry.get("team", "-")}' for entry in players)
    print(f'\n== {tag}  {outcome}  | {civs} | size {spec.get("size")} {spec.get("biome") or "-"}'
          f' | last minute {max(eco) if eco else 0} | phases of player {player}: {phases or "none"}')
    ids = [str(index + 1) for index in range(len(players))]
    for minute in minutes:
        entry = eco.get(minute)
        if not entry:
            continue
        population = " / ".join(str(entry[i]["pop"]) if i in entry else "-" for i in ids)
        gathered = " / ".join(f'{sum(entry[i]["gathered"].values()) / 1000:.1f}' if i in entry else "-" for i in ids)
        teams = standing.get(minute)
        military = " vs ".join(str(teams[key]["military"]) for key in sorted(teams)) if teams else "-"
        print(f"  {minute:>2} min  population {population}  | gathered k {gathered}  | military {military}")
    print(f"  attacks of player {player}: " + ("; ".join(moves) if moves else "none"))


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--at", default="8,12,16,20,25,30,40", help="minutes to print")
    parser.add_argument("--player", type=int, default=1, help="player whose phases and attacks are printed")
    parser.add_argument("batches", nargs="+")
    args = parser.parse_args()
    minutes = [int(minute) for minute in args.at.split(",")]
    for batch in args.batches:
        found, summary = outcomes(batch)
        print(f"#### {batch}")
        for line in summary:
            print(line)
        for tag in sorted(os.listdir(batch)):
            if os.path.exists(os.path.join(batch, tag, "stdout.log")) and os.path.exists(os.path.join(batch, tag, "result.json")):
                game(batch, tag, args.player, minutes, found.get(tag, "?"))


if __name__ == "__main__":
    main()
