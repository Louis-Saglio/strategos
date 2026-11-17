#!/usr/bin/env python3
"""Count the numbers written in the bot's code.

    tools/constants.py [--list] [MOD_DIR]      (default: bot/)

A number written in the bot is a decision somebody took once, for every
civilisation, map and setting. This counts them so that a commit can say
how many it removed or added:

- declared: numeric literals inside the module-level `const NAME = ...;`
  declarations, exported or not (one for `const REACH = 150;`, every numeric leaf of a
  table such as `BASE` in strategy.js), with the number of such
  declarations and of those holding no number (class names, template
  paths, state lists);
- inline: numeric literals anywhere else in the code, other than 0, 1 and
  2 (indices, signs, halves and doublings of a formula).

Declared numbers are also grouped by kind, guessed from the name of the
constant (or the path inside a table): the grouping is a reading aid, the
total is the measure. Names declared in more than one file are listed:
each is one decision written several times.

--list prints every declaration with its file, kind and count.
String literals are skipped; the bot has no comments (tools/check_bot.py).
"""
import argparse
import collections
import os
import re
import sys

NUMBER = re.compile(r"(?<![\w.$])(?:0x[0-9a-fA-F]+|\d+\.?\d*(?:e[+-]?\d+)?)(?![\w$])")
STRING = re.compile(r'"(?:\\.|[^"\\])*"|\'(?:\\.|[^\'\\])*\'|`(?:\\.|[^`\\])*`')
DECLARATION = re.compile(r"^(?:export )?const ([A-Z][A-Z_0-9]*) = ", re.M)
TRIVIAL = {0.0, 1.0, 2.0}

KINDS = [
    ("telemetry", r"REPORT"),
    ("duration", r"_MS$|_S$|TIMEOUT|PATIENCE|MEMORY|RETRY|COOLDOWN|DELAY|WINDOW|HORIZON|afterMs|Ms$|memory|[Hh]orizon"),
    ("distance", r"RADIUS|REACH|CLEARANCE|DISTANCE|MARGIN|SPACING|TOLERANCE|RING|OFFING|SEARCH|KEEP_AWAY|STEP|CELL"
                 r"|ROOM|FRONT|BACK|SLACK|PROBES|OFFSETS|MATCH|FAR$|BIAS|reach|clearance|near|shore|Area|distance"),
    ("compute budget", r"KEPT|TRIED|CANDIDATES|PER_DECISION|COUNTED|EXPOSED|tried"),
    ("switch threshold", r"ENTER|EXIT|EDGE|SUPERIORITY|QUORUM|ABORT|ENGAGE|enter|exit|superiority|edge"),
    ("population threshold", r"[Pp]opulation|civilian|Trainer|settlers|founders|builders"),
    ("priority", r"^(?:BASE|OPENING)\.values\."),
    ("weight or price", r"WEIGHT|SHARE|GAIN|PRICE|VALUE|CREDIT|RATE|BASE$|SMOOTHING|WORTH|SCALE|FRACTION|MULTIPLIER"
                        r"|BONUS|RETURN|RATIO|LOSS|FLOOR|BUFFER|KEEP$|STOCK|SURPLUS|URGENCY|[Ss]hare|[Ww]eight|[Ww]ealth"
                        r"|Rate|cost|Cost"),
]


def kind(name):
    for label, pattern in KINDS:
        if re.search(pattern, name):
            return label
    return "count or other"


def blank_strings(src):
    """Blank the content of every string literal, keeping its length."""
    return STRING.sub(lambda m: '"' + " " * (len(m.group(0)) - 2) + '"', src)


def declaration_end(src, start):
    """Index after the `;` closing the declaration that starts at `start`."""
    depth = 0
    for i in range(start, len(src)):
        c = src[i]
        if c in "([{":
            depth += 1
        elif c in ")]}":
            depth -= 1
        elif c == ";" and depth == 0:
            return i + 1
    return len(src)


def leaves(name, body, raw):
    """(path, value) for every numeric literal of a declaration; paths follow the keys of a table."""
    out = []
    keys = [(m.start(), m.group(1)) for m in re.finditer(r'"([A-Za-z_0-9]+)"\s*:', raw)]
    for m in NUMBER.finditer(body):
        path = []
        # the keys of the tables that enclose this number: walk back, one key each time a nesting opens
        depth = 0
        i = m.start()
        while i > 0:
            i -= 1
            c = body[i]
            if c in ")]}":
                depth += 1
            elif c in "([{":
                if depth == 0:
                    before = [k for pos, k in keys if pos < i]
                    if before and re.search(r'"\s*:\s*$', raw[:i].rstrip()[-40:] + " "):
                        path.insert(0, before[-1])
                else:
                    depth -= 1
        own = [k for pos, k in keys if pos < m.start()]
        if own and re.search(r':\s*-?$', body[:m.start()][-4:]):
            path.append(own[-1])
        out.append((".".join([name] + path), m.group(0)))
    return out


def scan(path):
    raw = open(path, encoding="utf-8").read()
    src = blank_strings(raw)
    declared, spans = [], []
    for m in DECLARATION.finditer(src):
        end = declaration_end(src, m.end())
        spans.append((m.start(), end))
        declared.append((m.group(1), leaves(m.group(1), src[m.end():end], raw[m.end():end])))
    inline = 0
    cursor = 0
    for start, end in spans + [(len(src), len(src))]:
        for m in NUMBER.finditer(src[cursor:start]):
            text = m.group(0)
            value = float(int(text, 16)) if text.lower().startswith("0x") else float(text)
            if value not in TRIVIAL:
                inline += 1
        cursor = end
    return declared, inline


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--list", action="store_true", help="print every declaration")
    parser.add_argument("mod_dir", nargs="?", default="bot")
    args = parser.parse_args()
    files = []
    for root, _dirs, names in os.walk(args.mod_dir):
        files += [os.path.join(root, name) for name in names if name.endswith(".js")]
    if not files:
        sys.exit(f"constants: no .js file under {args.mod_dir}")
    rows, kinds, owners = [], collections.Counter(), collections.defaultdict(list)
    listing = []
    for path in sorted(files):
        declared, inline = scan(path)
        name = os.path.basename(path)
        numbers = sum(len(found) for _n, found in declared)
        rows.append((name, len(declared), sum(1 for _n, found in declared if not found), numbers, inline))
        for constant, found in declared:
            owners[constant].append(name)
            for leaf, value in found:
                kinds[kind(leaf)] += 1
                listing.append((name, kind(leaf), leaf, value))
    print(f"{'file':<18} {'declarations':>12} {'without number':>15} {'declared numbers':>17} {'inline numbers':>15}")
    for row in rows:
        print(f"{row[0]:<18} {row[1]:>12} {row[2]:>15} {row[3]:>17} {row[4]:>15}")
    total = [sum(row[i] for row in rows) for i in range(1, 5)]
    print(f"{'total':<18} {total[0]:>12} {total[1]:>15} {total[2]:>17} {total[3]:>15}")
    print(f"\nnumbers written in the bot: {total[2] + total[3]} ({total[2]} declared, {total[3]} inline)")
    print("\ndeclared numbers by kind (guessed from the name):")
    for label, count in kinds.most_common():
        print(f"  {count:>4}  {label}")
    repeated = {constant: names for constant, names in owners.items() if len(names) > 1}
    if repeated:
        print("\ndeclared in several files:")
        for constant, names in sorted(repeated.items()):
            print(f"  {constant}: {', '.join(names)}")
    if args.list:
        print()
        for name, label, leaf, value in listing:
            print(f"{name:<18} {label:<21} {leaf} = {value}")


if __name__ == "__main__":
    main()
