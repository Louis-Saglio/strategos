#!/usr/bin/env python3
"""Headless match runner for Strategos (entry point: tools/run.sh).

Runs batches of 0 A.D. 0.28.0 matches through the documented pyrogenesis
command line (docs/pyrogenesis_cli.md §3), one isolated HOME per match, under
nice/ionice, on every available host (tools/hosts.json), then prints the
tools/analyze.py summary.

    tools/run.sh -l MIN [options] OUTDIR SEED...

Every match is bounded twice: the harness ends it at -l in-game minutes,
and a wall-clock cap kills it if it runs slower than MIN_RATE turns per
second (cap = 60 s + 300 * MIN / MIN_RATE). Before starting, the batch's
worst-case duration is estimated from the calibrated host throughput; at
the end, games killed by the wall-clock cap are reported as failures.

SEED is N, A-B (inclusive range) or TAG=N. A bare seed N is tagged seedN.
The map seed and the AI seed are both N.

Players (-p, repeatable, in player order; default: strategos vs petra):

    AI[/DIFF[/BEHAVIOR]]:CIV[:TEAM]

AI is strategos, petra, brennus, any AI a mounted mod provides, or none (a
player without an AI, for scenarios whose trigger script plays it). DIFF is
0-5 (Petra: 5 = very hard; default 3), BEHAVIOR balanced | aggressive |
defensive (default balanced). CIV is a civ code, or * to pick one per seed
(deterministic, from all 15 civs). TEAM is 1-based; omit it for no team.
Examples: -p strategos:athen:1 -p petra/5:*:2

Maps and biomes (-M / -b) accept a comma-separated list or *: each seed
picks one deterministically (biome * = the generic biomes).

Sampling: every choice of a batch can be one value or a set from which each
seed draws one with a fixed hash of the seed, so a seed range covers the
set reproducibly and two batches run on the same seeds play the same
matches. -M, -b, -s and -P take comma-separated lists; -M also takes *
(every playable random map), *land and *naval (by the map's "naval"
keyword); -b * and -P * mean whatever the drawn map supports. -V takes
alternatives separated by commas, each a +-joined combination
(-V conquest,conquest+wonder,conquest_units); -S KEY=V1,V2,V3 draws the
setting; --rotate draws the player slots (the -p list rotated). A draw that
falls outside the scope of the goal (SCOPE below: too many players for the
map size, too little population per player, last man standing with locked
teams, a nomad start that cannot afford a civic centre) is redrawn; the draw counts of every sampled choice are printed
before the batch starts, because hash picks are uneven on short ranges.

Each map is given only what it supports, read from its .json in the 0 A.D.
source checkout (ZEROAD_SRC, default ~/Work/0ad) or in scenarios/: a biome
and a player placement only when the map declares them, and its own options
(MAP_OPTIONS: Daytime, Landscape, SeaLevelRiseTime, TriggerDifficulty,
waterLevel). The engine would pick Daytime and Landscape at random, so they
are drawn per seed; the others take the map's default; -S overrides any of
them for the maps that have the option.

AI mods: strategos is this repo's bot/ (or -m strategos=DIR); brennus is
~/Work/brennus at a commit (-m brennus=GIT_DIR@REV, default HEAD), with its
own harness scripts stripped so only its AI is mounted. Every mod used is
snapshotted into OUTDIR/mods/ once (provenance in OUTDIR/batch.json), so
editing the sources during a batch cannot leak into it. The scenario mod
(scenarios/) is mounted when a map of the batch comes from it
(-M random/strategos_...). The harness mod (tools/harness) is always
mounted last; -l sets its time limit.

Game settings are all explicit: the map, size, placement, biome, victory,
seeds and players go on the public autostart command line; every other
setting (GAME_SETTINGS: population cap, starting resources, visibility,
ceasefire, treasures, spies, nomad, locked teams, last man standing, cheats,
wonder/relic/regicide options, game speed) goes to the harness as
-harness-settings=JSON. After each match the settings the engine wrote into
the replay are compared with the spec: a mismatch is reported as a FAILURE,
a setting present in the replay that the batch did not choose (a
map-specific option) as a WARNING.

Per match, in OUTDIR/TAG/: stdout.log (engine output: harness lines, bot
telemetry, statistics JSON), result.json (spec, host, exit code, wall
seconds, turns, the settings the engine applied, mismatches) and home/
(engine logs and the replay; cache and mod copies dropped).

Options:
  -p SPEC        player (repeatable, see above)
  -M MAPS        map(s), or * / *land / *naval (default random/mainland)
  -b BIOMES      biome(s), or * for the map's own (default generic/temperate)
  -s SIZES       random-map size(s) in tiles (default 192)
  -P PLACEMENTS  random-map player placement(s), or * for the map's own
                 (default circle)
  -V VICTORY     victory condition, repeatable for a combination; or one -V
                 with comma-separated alternatives, each a +-joined
                 combination (default conquest)
  -S KEY=VALUE   game setting, repeatable, overriding GAME_SETTINGS or a
                 map option (MAP_OPTIONS); VALUE is JSON (true, 200, "team")
                 or a bare string, or a comma-separated set drawn per seed
  --rotate       draw the player slots per seed: the -p list is rotated, so
                 every AI plays every slot (teams and civs follow the player)
  -l MIN         in-game time limit in minutes — REQUIRED, > 0 (AGENTS.md,
                 "Game duration": the shortest limit that answers the question)
  -R RATIO       harness resignation: a side whose assets (units, structures
                 and stock, at cost) stay below RATIO x the strongest other
                 side's for 2 minutes is defeated (default 0.1; 0 = never)
  -t SEC         wall-clock cap per match (default: derived from -l, see
                 below; a larger value is accepted with a warning)
  -m AI=SOURCE   mod source for an AI (repeatable)
  -H HOSTS       comma-separated hosts from tools/hosts.json (default: all
                 verified and reachable); local is a host
  -j N           override the local slot count
  --unverified   also use hosts whose determinism is not verified
  --matches F    run the matches of a JSON-lines file instead (one spec per
                 line, keys as in result.json "spec"; tag, seed and players
                 required, anything else missing is drawn as for a seed)
  --verify-host HOST [SEEDS]  run SEEDS (default 1-3) on local and on HOST
                 and mark HOST verified in tools/hosts.json if every game is
                 bit-identical (statistics hash)
  --calibrate HOST K1,K2,...  for each K, run K matches at once on HOST
                 (the given players/map/limit) and measure the total
                 simulation throughput (turns per wall second, summed over
                 the K games); the best K becomes HOST's slot count in
                 tools/hosts.json
"""
import argparse
import base64
import concurrent.futures
import collections
import datetime
import functools
import hashlib
import json
import os
import queue
import re
import shlex
import shutil
import subprocess
import sys
import tarfile
import tempfile
import threading
import time

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TOOLS = os.path.join(REPO, "tools")
HOSTS_FILE = os.path.join(TOOLS, "hosts.json")
HARNESS = os.path.join(TOOLS, "harness")
SCENARIOS = os.path.join(REPO, "scenarios")
SRC = os.path.expanduser(os.environ.get("ZEROAD_SRC", "~/Work/0ad"))
CIVS = ["athen", "brit", "cart", "gaul", "germ", "han", "iber", "kush", "mace", "maur",
        "pers", "ptol", "rome", "sele", "spart"]
PUBLIC = os.path.join(SRC, "binaries/data/mods/public")
BUILTIN_AIS = {"petra"}
NO_AI = "none"
# Every game setting the public autostart command line cannot set, passed to
# the harness (tools/harness/autostart/harness_settings.js) and checked after
# each match against the replay. Keys are the engine's InitAttributes names;
# -S KEY=VALUE overrides one. A match whose replay carries a setting nobody
# chose is reported as uncontrolled.
GAME_SETTINGS = {
    "PopulationCapType": "player", "PopulationCap": 300, "StartingResources": 300, "Ceasefire": 0,
    "ExploreMap": False, "RevealMap": False, "AllyView": False, "DisableTreasures": True,
    "DisableSpies": False, "Nomad": False, "LockTeams": False, "LastManStanding": False,
    "CheatsEnabled": False, "WonderDuration": 10, "RelicCount": 2, "RelicDuration": 10,
    "RegicideGarrison": False, "gameSpeed": 1,
}
# Options only some maps have (map_info), with a value of their type. They go
# to the harness with the GAME_SETTINGS and are checked the same way.
MAP_OPTIONS = {"Daytime": "", "Landscape": "", "SeaLevelRiseTime": 0, "TriggerDifficulty": 0, "waterLevel": ""}
# The scope of the goal (AGENTS.md: degenerate combinations are out of it): the
# smallest map size for a player count, the smallest population a player may
# end up with once a team or world cap is shared out, and the starting
# resources below which a nomad start needs the treasures the map generator
# places beside the units (rmgen-common/player.js, placePlayersNomad: up to
# the civic centre's cost, 300 of its dearest resource).
SCOPE = {"min_tiles": {2: 128, 3: 192, 4: 192, 5: 256, 6: 256, 7: 320, 8: 320}, "min_population": 100,
         "nomad_resources": 300}
REDRAWS = 32
# Kept by the engine only when they apply (their victory condition, a random map).
CONDITIONAL_SETTINGS = {"WonderDuration", "RelicCount", "RelicDuration", "RegicideGarrison", "Nomad"}
# Settings the replay carries that come from the command line or the map itself.
DERIVED_SETTINGS = {"Biome", "Size", "PlayerPlacement", "VictoryConditions", "Seed", "AISeed", "PlayerData",
                    "mapName", "mapPreview", "TriggerScripts", "CircularMap"}
MIN_RATE = 20
SSH = ["ssh", "-o", "BatchMode=yes", "-o", "ConnectTimeout=10", "-o", "ServerAliveInterval=30"]


def die(msg):
    sys.exit(f"run: {msg}")


def wall_cap(limit_min):
    return 60 + (300 * limit_min) // MIN_RATE


# ------------------------------------------------------------------ specs

def parse_player(spec):
    m = re.fullmatch(r"([\w-]+)(?:/(\d))?(?:/(\w+))?:([\w*]+)(?::(\d+))?", spec)
    if not m:
        die(f"bad player spec {spec!r} (AI[/DIFF[/BEHAVIOR]]:CIV[:TEAM])")
    ai, diff, behav, civ, team = m.groups()
    if civ != "*" and civ not in CIVS:
        die(f"unknown civ {civ!r}")
    return {"ai": ai, "diff": int(diff) if diff else 3, "behavior": behav or "balanced",
            "civ": civ, "team": int(team) if team else None}


def parse_seeds(args):
    out = []
    for a in args:
        if "=" in a:
            tag, seed = a.split("=", 1)
            out.append((tag, int(seed)))
        elif re.fullmatch(r"\d+-\d+", a):
            lo, hi = map(int, a.split("-"))
            out += [(f"seed{s}", s) for s in range(lo, hi + 1)]
        else:
            out.append((f"seed{int(a)}", int(a)))
    return out


def pick(options, seed, salt):
    h = hashlib.sha256(f"{salt}:{seed}".encode()).digest()
    return options[int.from_bytes(h[:4], "big") % len(options)]


def draw(options, seed, salt, attempt=0):
    """One of `options` for this seed; `attempt` > 0 is a redraw after an out-of-scope combination."""
    if len(options) == 1:
        return options[0]
    return pick(options, seed, f"{salt}#{attempt}" if attempt else salt)


@functools.lru_cache(maxsize=None)
def biome_ids():
    root = os.path.join(PUBLIC, "maps/random/rmbiome")
    if not os.path.isdir(root):
        die(f"no 0 A.D. source checkout at {SRC} (ZEROAD_SRC): map metadata cannot be read")
    return sorted(f"{d}/{f[:-5]}" for d in os.listdir(root) if os.path.isdir(os.path.join(root, d))
                  for f in os.listdir(os.path.join(root, d)) if f.endswith(".json"))


def map_settings(name):
    """The "settings" object of a random map's .json (scenarios/ first), or None."""
    for root in (os.path.join(SCENARIOS, "maps"), os.path.join(PUBLIC, "maps")):
        path = os.path.join(root, name + ".json")
        if os.path.isfile(path):
            with open(path, encoding="utf-8") as fh:
                return json.load(fh).get("settings")
    return None


@functools.lru_cache(maxsize=None)
def map_info(name):
    """What the game setup can choose on a map, as the engine's gamesettings
    attributes read it from the map's .json: {"biomes": [ids], "placements":
    [ids], "options": {MAP_OPTIONS key: {"values": [...] | None, "range":
    (min, max) | None, "default": value | None}}}. Only random maps have any."""
    info = {"biomes": [], "placements": [], "options": {}}
    if not name.startswith("random/"):
        return info
    s = map_settings(name)
    if s is None:
        die(f"map {name!r}: no {name}.json with settings in scenarios/ or in {PUBLIC}/maps")
    supported = s.get("SupportedBiomes")
    if isinstance(supported, str):
        info["biomes"] = [b for b in biome_ids() if b.startswith(supported)]
    elif supported:
        info["biomes"] = [b for b in biome_ids() if b in supported]
    info["placements"] = list(s.get("PlayerPlacements") or [])
    opts = info["options"]
    if s.get("Daytime"):
        opts["Daytime"] = {"values": [d["Id"] for d in s["Daytime"]], "range": None, "default": None}
    if s.get("Landscapes"):
        opts["Landscape"] = {"values": [i["Id"] for g in s["Landscapes"] for i in g["Items"]], "range": None,
                             "default": None}
    if s.get("SeaLevelRise"):
        r = s["SeaLevelRise"]
        opts["SeaLevelRiseTime"] = {"values": None, "range": (r["Min"], r["Max"]), "default": r["Default"]}
    if s.get("SupportedTriggerDifficulties"):
        with open(os.path.join(PUBLIC, "simulation/data/settings/trigger_difficulties.json"), encoding="utf-8") as fh:
            levels = [d for d in json.load(fh)["Data"] if d["Name"] in s["SupportedTriggerDifficulties"]["Values"]]
        opts["TriggerDifficulty"] = {"values": [d["Difficulty"] for d in levels], "range": None,
                                     "default": next(d["Difficulty"] for d in levels if d.get("Default"))}
    if s.get("WaterLevels"):
        opts["waterLevel"] = {"values": [w["Name"] for w in s["WaterLevels"]], "range": None,
                              "default": next(w["Name"] for w in s["WaterLevels"] if w.get("Default"))}
    return info


def random_maps(kind):
    """-M *, *land, *naval: the random maps of the game, demo maps excluded."""
    out = []
    root = os.path.join(PUBLIC, "maps/random")
    if not os.path.isdir(root):
        die(f"no 0 A.D. source checkout at {SRC} (ZEROAD_SRC): the map list cannot be read")
    for f in sorted(os.listdir(root)):
        if not f.endswith(".json"):
            continue
        s = map_settings("random/" + f[:-5])
        if not s or "Script" not in s or "demo" in (s.get("Keywords") or []):
            continue
        naval = "naval" in (s.get("Keywords") or [])
        if kind == "*" or (kind == "*naval") == naval:
            out.append("random/" + f[:-5])
    return out


def supported_choice(kind, mapname, supported, wanted, given, seed, attempt):
    """The biome or placement of a match: None when the map has none, else one
    the map supports among the batch's (`*` = all of the map's)."""
    if kind in given:
        value = given[kind]
        if (value is None) != (not supported) or (supported and value not in supported):
            die(f"{mapname}: {kind} {value!r} given, the map supports {supported or 'none'}")
        return value
    if not supported:
        return None
    options = supported if wanted == ["*"] else [w for w in wanted if w in supported]
    if not options:
        die(f"{mapname} supports none of the {kind}s {', '.join(wanted)} (it has {', '.join(supported)}): "
            f"give one of them or '*'")
    return draw(options, seed, kind, attempt)


def out_of_scope(spec):
    """Why a match is outside the scope of the goal, or None."""
    n, s = len(spec["players"]), spec["settings"]
    if spec["size"] and spec["size"] < SCOPE["min_tiles"].get(n, max(SCOPE["min_tiles"].values())):
        return f"{n} players on {spec['size']} tiles"
    teams = collections.Counter(p["team"] for p in spec["players"] if p.get("team"))
    share = {"team": max(teams.values(), default=1), "world": n}.get(s["PopulationCapType"], 1)
    if s["PopulationCap"] / share < SCOPE["min_population"]:
        return f"population cap {s['PopulationCap']} per {s['PopulationCapType']}: {s['PopulationCap'] // share} a player"
    if s["LastManStanding"] and (s["LockTeams"] or s["PopulationCapType"] == "team"):
        return "last man standing with locked teams (a team cap locks them)"
    if s["Nomad"] and s["DisableTreasures"] and s["StartingResources"] < SCOPE["nomad_resources"]:
        return (f"nomad with {s['StartingResources']} resources and no treasures: the map generator's "
                "treasures are the only way to afford a civic centre")
    return None


def expand(base, seed, given=None):
    """Resolve the per-seed choices of a batch into one match spec. `given`
    (a --matches line) fixes any of them. Returns (spec, out-of-scope reason)."""
    given = given or {}
    for attempt in range(REDRAWS):
        spec = expand_once(base, seed, given, attempt)
        why = out_of_scope(spec)
        if not why:
            break
    return spec, why


def expand_once(base, seed, given, attempt):
    spec = {"seed": seed, "limit_minutes": base["limit_minutes"]}
    spec["map"] = given.get("map") or draw(base["maps"], seed, "map")
    info = map_info(spec["map"])
    is_random = spec["map"].startswith("random/")
    spec["size"] = (given.get("size") or draw(base["sizes"], seed, "size", attempt)) if is_random else None
    spec["biome"] = supported_choice("biome", spec["map"], info["biomes"], base["biomes"], given, seed, 0)
    spec["placement"] = supported_choice("placement", spec["map"], info["placements"], base["placements"], given,
                                         seed, attempt)
    spec["victory"] = list(given.get("victory") or draw(base["victories"], seed, "victory", attempt))
    fixed = given.get("settings", {})
    spec["settings"] = {k: fixed[k] if k in fixed else draw(base["settings"][k], seed, k, attempt)
                        for k in GAME_SETTINGS}
    for key, opt in info["options"].items():
        wanted = [fixed[key]] if key in fixed else base["settings"].get(key)
        if wanted:
            for v in wanted:
                lo, hi = opt["range"] or (v, v)
                if (opt["values"] is not None and v not in opt["values"]) or not lo <= v <= hi:
                    die(f"{spec['map']}: {key}={v!r} is not one of {opt['values'] or opt['range']}")
            spec["settings"][key] = draw(wanted, seed, key, attempt)
        elif opt["default"] is not None:
            spec["settings"][key] = opt["default"]
        else:
            spec["settings"][key] = draw(opt["values"], seed, key)
    stray = set(fixed) - set(spec["settings"])
    if stray:
        die(f"{given.get('tag')}: setting(s) {', '.join(sorted(stray))} unknown or not an option of {spec['map']}")
    if "players" in given:
        spec["players"] = [parse_player(p) if isinstance(p, str) else dict(p) for p in given["players"]]
        if any(p["civ"] == "*" for p in spec["players"]):
            die(f"{given.get('tag')}: a --matches line names every civ")
    else:
        players = []
        for i, p in enumerate(base["players"], 1):
            q = dict(p)
            if q["civ"] == "*":
                q["civ"] = pick(CIVS, seed, f"civ{i}")
            players.append(q)
        k = pick(range(len(players)), seed, "slot") if base["rotate"] else 0
        spec["players"] = players[k:] + players[:k]
    return spec


def describe_draws(specs):
    """One line per choice that took more than one value in the batch."""
    def values(s):
        out = {"map": s["map"].split("/", 1)[-1], "biome": s["biome"], "size": s["size"],
               "placement": s["placement"], "victory": "+".join(s["victory"]),
               "slots": ",".join(p["ai"] for p in s["players"])}
        out.update({f"civ{i}": p["civ"] for i, p in enumerate(s["players"], 1)})
        out.update(s["settings"])
        return out
    counts = {}
    for s in specs:
        for k, v in values(s).items():
            counts.setdefault(k, collections.Counter())[json.dumps(v) if not isinstance(v, str) else v] += 1
    lines = []
    for k, c in counts.items():
        if len(c) > 1 or sum(c.values()) < len(specs):
            lines.append(f"run: draws {k}: " + ", ".join(f"{v} {n}" for v, n in sorted(c.items())))
    return lines


def engine_args(spec):
    args = [f"-autostart={spec['map']}", f"-autostart-seed={spec['seed']}",
            f"-autostart-aiseed={spec['seed']}", "-autostart-nonvisual",
            f"-autostart-players={len(spec['players'])}"]
    if spec["map"].startswith("random/"):
        args.append(f"-autostart-size={spec['size']}")
        if spec["biome"]:
            args.append(f"-autostart-biome={spec['biome']}")
        if spec["placement"]:
            args.append(f"-autostart-placement={spec['placement']}")
    for v in spec["victory"]:
        args.append(f"-autostart-victory={v}")
    for i, p in enumerate(spec["players"], 1):
        args.append(f"-autostart-civ={i}:{p['civ']}")
        if p["ai"] != NO_AI:
            args += [f"-autostart-ai={i}:{p['ai']}", f"-autostart-aidiff={i}:{p['diff']}",
                     f"-autostart-aibehavior={i}:{p['behavior']}"]
        if p.get("team"):
            args.append(f"-autostart-team={i}:{p['team']}")
    args.append("-harness-settings=" + json.dumps(spec["settings"], sort_keys=True, separators=(",", ":")))
    args += ["-autostart-player=-1", "-unique-logs", "-nosound", "-mod=public"]
    args += [f"-mod={m}" for m in spec["mods"]]
    return args


# ------------------------------------------------------------------ mods

def git_info(path):
    r = subprocess.run(["git", "-C", path, "rev-parse", "HEAD"], capture_output=True, text=True)
    if r.returncode:
        return None
    dirty = subprocess.run(["git", "-C", path, "status", "--porcelain", "--", "."],
                           capture_output=True, text=True).stdout.strip()
    return r.stdout.strip() + (" (dirty)" if dirty else "")


def content_hash(path):
    h = hashlib.sha256()
    for root, dirs, files in sorted(os.walk(path)):
        dirs.sort()
        for f in sorted(files):
            p = os.path.join(root, f)
            h.update(os.path.relpath(p, path).encode())
            with open(p, "rb") as fh:
                h.update(hashlib.sha256(fh.read()).digest())
    return h.hexdigest()[:16]


def mod_name(path):
    with open(os.path.join(path, "mod.json"), encoding="utf-8") as fh:
        return json.load(fh)["name"]


def is_scenario(map_name):
    return any(os.path.isfile(os.path.join(SCENARIOS, "maps", map_name + ext)) for ext in (".json", ".xml"))


def snapshot_mods(outdir, ais, sources, limit, map_interval, resign, scenarios=False):
    """Copy every needed mod into OUTDIR/mods/. Returns (mount order, provenance)."""
    mods_dir = os.path.join(outdir, "mods")
    if os.path.exists(mods_dir):
        shutil.rmtree(mods_dir)
    os.makedirs(mods_dir)
    order, prov = [], {}
    for ai in sorted(ais - BUILTIN_AIS - {NO_AI}):
        src = sources.get(ai)
        if ai == "strategos" and not src:
            src = os.path.join(REPO, "bot")
        if ai == "brennus" and not src:
            src = os.path.expanduser("~/Work/brennus") + "@HEAD"
        if not src:
            die(f"no mod source for AI {ai!r} (-m {ai}=DIR)")
        if "@" in src:
            gitdir, rev = src.rsplit("@", 1)
            gitdir = os.path.abspath(os.path.expanduser(gitdir))
            sha = subprocess.run(["git", "-C", gitdir, "rev-parse", rev], capture_output=True,
                                 text=True).stdout.strip()
            if not sha:
                die(f"cannot resolve {rev} in {gitdir}")
            tmp = tempfile.mkdtemp(dir=outdir)
            arch = subprocess.run(["git", "-C", gitdir, "archive", sha, "bot"], capture_output=True)
            if arch.returncode:
                die(f"git archive {sha} bot failed in {gitdir}")
            with tarfile.open(fileobj=__import__("io").BytesIO(arch.stdout)) as tf:
                tf.extractall(tmp, filter="data")
            path = os.path.join(tmp, "bot")
            origin = {"source": gitdir, "commit": sha}
        else:
            path = os.path.abspath(os.path.expanduser(src))
            origin = {"source": path, "commit": git_info(path)}
        if not os.path.isfile(os.path.join(path, "mod.json")):
            die(f"no mod.json in {path}")
        name = mod_name(path)
        dest = os.path.join(mods_dir, name)
        shutil.copytree(path, dest, ignore=shutil.ignore_patterns(".git", "__pycache__"))
        if ai != "strategos" and os.path.isdir(os.path.join(dest, "maps")):
            shutil.rmtree(os.path.join(dest, "maps"))
            origin["stripped"] = "maps/"
        if "@" in src:
            shutil.rmtree(os.path.dirname(path))
        origin["content"] = content_hash(dest)
        prov[name] = origin
        order.append(name)
    if scenarios:
        sdest = os.path.join(mods_dir, mod_name(SCENARIOS))
        shutil.copytree(SCENARIOS, sdest)
        prov[mod_name(SCENARIOS)] = {"source": SCENARIOS, "commit": git_info(SCENARIOS),
                                     "content": content_hash(sdest)}
        order.append(mod_name(SCENARIOS))
    hdest = os.path.join(mods_dir, mod_name(HARNESS))
    shutil.copytree(HARNESS, hdest)
    trig = os.path.join(hdest, "maps/scripts/NonVisualTrigger.js")
    with open(trig, encoding="utf-8") as fh:
        text = fh.read()
    text = re.sub(r"const HARNESS_LIMIT_MINUTES = \d+;", f"const HARNESS_LIMIT_MINUTES = {limit};", text)
    text = re.sub(r"const HARNESS_MAP_INTERVAL_MS = \d+;", f"const HARNESS_MAP_INTERVAL_MS = {map_interval};",
                  text)
    text = re.sub(r"const HARNESS_RESIGN_RATIO = [\d.]+;", f"const HARNESS_RESIGN_RATIO = {resign};", text)
    with open(trig, "w", encoding="utf-8") as fh:
        fh.write(text)
    prov[mod_name(HARNESS)] = {"source": HARNESS, "commit": git_info(REPO), "content": content_hash(hdest),
                               "limit_minutes": limit, "map_interval_ms": map_interval,
                               "resign_ratio": resign}
    order.append(mod_name(HARNESS))
    return order, prov


def syntax_check(mods_dir):
    if not shutil.which("node"):
        print("run: note: node not found, JS syntax not checked", file=sys.stderr)
        return
    bad = []
    for root, _, files in os.walk(mods_dir):
        for f in files:
            if f.endswith(".js"):
                p = os.path.join(root, f)
                with open(p, "rb") as fh:
                    src = fh.read()
                for mode in ("module", "commonjs"):
                    r = subprocess.run(["node", f"--input-type={mode}", "--check"], input=src,
                                       capture_output=True)
                    if r.returncode == 0:
                        break
                else:
                    bad.append((p, r.stderr.decode(errors="replace").strip().splitlines()[:6]))
    if bad:
        for p, err in bad:
            print(f"run: syntax error in {p}:\n  " + "\n  ".join(err), file=sys.stderr)
        die("fix the syntax errors first (every slot would be wasted)")


# ------------------------------------------------------------------ hosts

def load_hosts():
    with open(HOSTS_FILE, encoding="utf-8") as fh:
        return json.load(fh)


def save_hosts(hosts):
    with open(HOSTS_FILE, "w", encoding="utf-8") as fh:
        json.dump(hosts, fh, indent=2)
        fh.write("\n")


BUILD_CMD = ("(pacman -Q 0ad 0ad-data 2>/dev/null || "
             "dpkg-query -W -f '${Package} ${Version}\\n' 0ad 0ad-data 2>/dev/null) | tr '\\n' ' '; echo; "
             "cat /sys/class/power_supply/A*/online 2>/dev/null | sort -r | head -1; echo; nproc")


def probe(host, cfg):
    if host == "local":
        r = subprocess.run(["bash", "-c", BUILD_CMD], capture_output=True, text=True)
    else:
        try:
            r = subprocess.run(SSH + [cfg["ssh"], BUILD_CMD], capture_output=True, text=True, timeout=30)
        except subprocess.TimeoutExpired:
            return None
        if r.returncode:
            return None
    lines = r.stdout.split("\n")
    return {"build": lines[0].strip(), "ac": lines[1].strip() if len(lines) > 1 else "",
            "nproc": lines[2].strip() if len(lines) > 2 else ""}


def select_slots(names, hosts, local_jobs, unverified, force=()):
    local = probe("local", hosts["local"])
    slots, info = [], {}
    for name in names:
        cfg = hosts.get(name)
        if cfg is None:
            die(f"unknown host {name!r} (tools/hosts.json)")
        p = local if name == "local" else probe(name, cfg)
        if p is None:
            print(f"run: {name} unreachable, skipped", file=sys.stderr)
            continue
        if p["build"] != local["build"]:
            print(f"run: {name} runs '{p['build']}', not '{local['build']}', skipped", file=sys.stderr)
            continue
        if cfg.get("requires_ac") and p["ac"] == "0":
            print(f"run: {name} is on battery, skipped", file=sys.stderr)
            continue
        if name != "local" and not cfg.get("verified") and not unverified and name not in force:
            print(f"run: {name} not verified bit-identical (--verify-host {name}), skipped", file=sys.stderr)
            continue
        n = local_jobs if (name == "local" and local_jobs) else cfg["slots"]
        slots += [(name, i) for i in range(1, n + 1)]
        info[name] = dict(p, slots=n)
    if not slots:
        die("no usable slot")
    return slots, info, local["build"]


# ------------------------------------------------------------------ matches

REMOTE = r"""
set -u
wall=$1; shift
d=$(mktemp -d "${TMPDIR:-/tmp}/strategos-run.XXXXXX") || exit 1
trap 'rm -rf "$d"' EXIT
mkdir -p "$d/home/.local/share/0ad/mods"
tar -xf - -C "$d/home/.local/share/0ad/mods"
cd "$d" || exit 1
bin=$(command -v pyrogenesis || echo /usr/games/pyrogenesis)
HOME=$d/home XDG_DATA_HOME=$d/home/.local/share XDG_CONFIG_HOME=$d/home/.config \
XDG_CACHE_HOME=$d/home/.cache XDG_STATE_HOME=$d/home/.local/state \
	timeout --signal=TERM --kill-after=30 "$wall" nice -n 10 ionice -c 3 \
	"$bin" "$@" < /dev/null > stdout.log 2>&1
echo $? > exit_code
rm -rf home/.cache home/.local/share/0ad/mods
tar -cf - stdout.log exit_code home
"""
REMOTE_B64 = base64.b64encode(REMOTE.encode()).decode()


class TransportError(Exception):
    pass


def run_match(outdir, spec, host, hosts, wall):
    tag = spec["tag"]
    d = os.path.join(outdir, tag)
    if os.path.exists(d):
        shutil.rmtree(d)
    os.makedirs(d)
    args = engine_args(spec)
    mods_dir = os.path.join(outdir, "mods")
    start = time.time()
    if host == "local":
        home = os.path.join(d, "home")
        os.makedirs(os.path.join(home, ".local/share/0ad"))
        shutil.copytree(mods_dir, os.path.join(home, ".local/share/0ad/mods"))
        env = dict(os.environ, HOME=home, XDG_DATA_HOME=f"{home}/.local/share",
                   XDG_CONFIG_HOME=f"{home}/.config", XDG_CACHE_HOME=f"{home}/.cache",
                   XDG_STATE_HOME=f"{home}/.local/state")
        with open(os.path.join(d, "stdout.log"), "wb") as out:
            rc = subprocess.run(["timeout", "--signal=TERM", "--kill-after=30", str(wall), "nice", "-n", "10",
                                 "ionice", "-c", "3", "pyrogenesis"] + args, cwd=d, env=env,
                                stdin=subprocess.DEVNULL, stdout=out, stderr=subprocess.STDOUT).returncode
        shutil.rmtree(os.path.join(home, ".cache"), ignore_errors=True)
        shutil.rmtree(os.path.join(home, ".local/share/0ad/mods"), ignore_errors=True)
    else:
        tar_in = subprocess.run(["tar", "-C", mods_dir, "-cf", "-", "."], capture_output=True).stdout
        cmd = f"bash -c \"$(echo {REMOTE_B64} | base64 -d)\" _ {wall} " + " ".join(shlex.quote(a) for a in args)
        try:
            r = subprocess.run(SSH + [hosts[host]["ssh"], cmd], input=tar_in, capture_output=True,
                               timeout=wall + 300)
        except subprocess.TimeoutExpired:
            raise TransportError(f"{host}: ssh timeout")
        if r.returncode or not r.stdout:
            raise TransportError(f"{host}: ssh exit {r.returncode}: {r.stderr.decode(errors='replace')[-300:]}")
        try:
            with tarfile.open(fileobj=__import__("io").BytesIO(r.stdout)) as tf:
                tf.extractall(d, filter="data")
        except tarfile.TarError as e:
            raise TransportError(f"{host}: bad artifact tar ({e})")
        try:
            with open(os.path.join(d, "exit_code")) as fh:
                rc = int(fh.read().strip())
            os.remove(os.path.join(d, "exit_code"))
        except (OSError, ValueError):
            raise TransportError(f"{host}: no exit code")
    wall_s = round(time.time() - start, 1)
    turns = 0
    with open(os.path.join(d, "stdout.log"), "rb") as fh:
        for line in fh:
            if line.startswith(b"Turn "):
                try:
                    turns = int(line.split()[1])
                except (IndexError, ValueError):
                    pass
    result = {"tag": tag, "seed": spec["seed"], "host": host, "exit_code": rc, "wall_seconds": wall_s,
              "turns": turns, "spec": spec}
    result.update(check_settings(d, spec))
    with open(os.path.join(d, "result.json"), "w", encoding="utf-8") as fh:
        json.dump(result, fh, indent=1)
    return result


def check_settings(d, spec):
    """Compare the settings the engine applied (the replay's start line) with
    the spec. Returns {"applied": ..., "settings_mismatch": [...],
    "settings_uncontrolled": {...}} (empty lists/dicts when all is well)."""
    starts = []
    for root, _, files in os.walk(os.path.join(d, "home")):
        if "commands.txt" in files:
            starts.append(os.path.join(root, "commands.txt"))
    if len(starts) != 1:
        return {"applied": None, "settings_mismatch": [f"{len(starts)} replays found"],
                "settings_uncontrolled": {}}
    with open(starts[0], encoding="utf-8") as fh:
        line = fh.readline()
    try:
        start = json.loads(line[len("start "):])
    except ValueError:
        return {"applied": None, "settings_mismatch": ["unreadable replay start line"],
                "settings_uncontrolled": {}}
    applied = dict(start["settings"])
    applied.pop("mapPreview", None)
    applied["gameSpeed"] = start.get("gameSpeed")
    bad = []

    def expect(key, want, got):
        if want != got:
            bad.append(f"{key}: wanted {want!r}, engine applied {got!r}")

    for key, want in spec["settings"].items():
        if key in applied:
            expect(key, want, applied[key])
        elif key not in CONDITIONAL_SETTINGS:
            bad.append(f"{key}: wanted {want!r}, absent from the replay")
    expect("map", "maps/" + spec["map"], start.get("map"))
    expect("Seed", spec["seed"], applied.get("Seed"))
    expect("AISeed", spec["seed"], applied.get("AISeed"))
    expect("VictoryConditions", sorted(spec["victory"]), sorted(applied.get("VictoryConditions", [])))
    if spec["map"].startswith("random/"):
        expect("Size", spec["size"], applied.get("Size"))
        expect("Biome", spec.get("biome"), applied.get("Biome"))
        expect("PlayerPlacement", spec.get("placement"), applied.get("PlayerPlacement"))
    pdata = [p for p in applied.get("PlayerData", []) if p]
    if len(pdata) != len(spec["players"]):
        bad.append(f"players: wanted {len(spec['players'])}, engine applied {len(pdata)}")
    for i, (p, q) in enumerate(zip(spec["players"], pdata), 1):
        checks = [("Civ", p["civ"], q.get("Civ")),
                  ("Team", (p["team"] - 1) if p.get("team") else -1, q.get("Team", -1))]
        if p["ai"] == NO_AI:
            checks.append(("AI", False, q.get("AI") or False))
        else:
            checks += [("AI", p["ai"], q.get("AI")), ("AIDiff", p["diff"], q.get("AIDiff")),
                       ("AIBehavior", p["behavior"], q.get("AIBehavior"))]
        for key, want, got in checks:
            expect(f"player{i}.{key}", want, got)
    uncontrolled = {k: v for k, v in applied.items() if k not in spec["settings"] and k not in DERIVED_SETTINGS
                    and k != "gameSpeed"}
    return {"applied": applied, "settings_mismatch": bad, "settings_uncontrolled": uncontrolled}


def parse_setting(text):
    """-S KEY=VALUE or KEY=V1,V2,...: (key, [values]), each of the type of the key's default."""
    if "=" not in text:
        die(f"bad -S {text!r} (KEY=VALUE)")
    key, raw = text.split("=", 1)
    kinds = dict(GAME_SETTINGS, **MAP_OPTIONS)
    if key not in kinds:
        die(f"unknown setting {key!r} (known: {', '.join(kinds)})")

    def parse(item):
        try:
            return json.loads(item)
        except ValueError:
            return item
    try:
        values = [json.loads(raw)]
    except ValueError:
        values = [parse(item) for item in raw.split(",")]
    for value in values:
        if type(value) is not type(kinds[key]):
            die(f"-S {key}: {raw!r} is not a {type(kinds[key]).__name__} like {json.dumps(kinds[key])}")
    return key, values


def parse_victories(args):
    """-V: repeated for one combination, or one -V of comma-separated +-joined alternatives."""
    args = args or ["conquest"]
    if any("," in a or "+" in a for a in args):
        if len(args) > 1:
            die("-V: give either repeated conditions (one combination) or a single list of alternatives")
        alternatives = [alt.split("+") for alt in args[0].split(",")]
    else:
        alternatives = [args]
    root = os.path.join(PUBLIC, "simulation/data/settings/victory_conditions")
    known = {f[:-5] for f in os.listdir(root)} if os.path.isdir(root) else None
    for alt in alternatives:
        for name in alt:
            if known is not None and name not in known:
                die(f"unknown victory condition {name!r} (known: {', '.join(sorted(known))})")
    return alternatives


def report_settings(results):
    bad = [(r["tag"], m) for r in results for m in r.get("settings_mismatch", [])]
    if bad:
        print(f"run: FAILURE: the engine did not apply the requested settings in "
              f"{len({t for t, _ in bad})} game(s):", file=sys.stderr)
        for t, m in bad[:20]:
            print(f"  {t}: {m}", file=sys.stderr)
    loose = {}
    for r in results:
        for k, v in r.get("settings_uncontrolled", {}).items():
            loose.setdefault(f"{k}={json.dumps(v)}", []).append(r["tag"])
    for kv, tags in sorted(loose.items()):
        print(f"run: WARNING: setting {kv} was chosen by the map/engine, not by the batch, in {len(tags)} "
              f"game(s) ({' '.join(tags[:8])}): add it to GAME_SETTINGS", file=sys.stderr)
    sys.stderr.flush()


def run_batch(outdir, specs, slots, hosts, wall):
    """Each slot is a worker pulling matches from one queue; a match whose
    remote transport fails is put back once for another slot, and a host that
    fails twice in a row is dropped from the batch."""
    q = queue.Queue()
    for s in specs:
        q.put((s, 0))
    lock = threading.Lock()
    failures = {}
    dropped = set()
    done = []
    total = len(specs)

    def worker(host, _i):
        while True:
            with lock:
                if host in dropped:
                    return
            try:
                spec, attempt = q.get_nowait()
            except queue.Empty:
                return
            try:
                r = run_match(outdir, spec, host, hosts, wall)
                with lock:
                    failures[host] = 0
                    done.append(r)
                    print(f"[{len(done)}/{total}] {r['tag']} host={host} exit={r['exit_code']} "
                          f"wall={r['wall_seconds']:.0f}s turns={r['turns']}", flush=True)
            except TransportError as e:
                with lock:
                    failures[host] = failures.get(host, 0) + 1
                    if failures[host] >= 2:
                        dropped.add(host)
                print(f"run: {spec['tag']}: {e}; {'requeued' if attempt < 2 else 'given up'}",
                      file=sys.stderr, flush=True)
                if attempt < 2:
                    q.put((spec, attempt + 1))

    with concurrent.futures.ThreadPoolExecutor(max_workers=len(slots)) as ex:
        futs = [ex.submit(worker, h, i) for h, i in slots]
        for f in futs:
            f.result()
    while not q.empty():
        spec, attempt = q.get()
        r = run_match(outdir, spec, "local", hosts, wall)
        done.append(r)
        print(f"[{len(done)}/{total}] {r['tag']} host=local (fallback) exit={r['exit_code']}", flush=True)
    return done


# ------------------------------------------------------------------ main

def stats_hash(outdir, tag):
    sys.path.insert(0, TOOLS)
    import analyze
    row = analyze.analyze(outdir, tag)
    return row["hash"] if row else None


def main():
    ap = argparse.ArgumentParser(add_help=False)
    ap.add_argument("-h", "--help", action="store_true")
    ap.add_argument("-p", dest="players", action="append")
    ap.add_argument("-M", dest="maps", default="random/mainland")
    ap.add_argument("-b", dest="biomes", default="generic/temperate")
    ap.add_argument("-s", dest="sizes", default="192")
    ap.add_argument("-P", dest="placement", default="circle")
    ap.add_argument("-V", dest="victory", action="append")
    ap.add_argument("-S", dest="settings", action="append", default=[])
    ap.add_argument("-l", dest="limit", type=int)
    ap.add_argument("-t", dest="wall", type=int)
    ap.add_argument("-m", dest="sources", action="append", default=[])
    ap.add_argument("-H", dest="hosts")
    ap.add_argument("-j", dest="jobs", type=int)
    ap.add_argument("--unverified", action="store_true")
    ap.add_argument("--matches")
    ap.add_argument("--rotate", action="store_true")
    ap.add_argument("--map-interval", type=int, default=30000)
    ap.add_argument("-R", dest="resign", type=float, default=0.1)
    ap.add_argument("--verify-host")
    ap.add_argument("--calibrate", nargs=2, metavar=("HOST", "KS"))
    ap.add_argument("rest", nargs="*")
    a = ap.parse_args()
    if a.help or (not a.rest and not a.verify_host and not a.calibrate):
        print(__doc__)
        sys.exit(0 if a.help else 2)
    if not shutil.which("pyrogenesis"):
        die("pyrogenesis not in PATH")
    if not a.limit or a.limit <= 0:
        die("-l MIN is required and must be > 0: choose the shortest in-game limit that answers the "
            "question (AGENTS.md, Game duration)")
    derived = wall_cap(a.limit)
    if a.wall is None:
        a.wall = derived
    elif a.wall > derived:
        print(f"run: WARNING -t {a.wall}s exceeds the derived cap {derived}s (a game slower than "
              f"{MIN_RATE} turns/s is a defect to investigate, not to wait for)", file=sys.stderr)

    hosts = load_hosts()
    sources = dict(s.split("=", 1) for s in a.sources)

    if a.calibrate:
        host, ks = a.calibrate[0], [int(k) for k in a.calibrate[1].split(",")]
        if not a.rest:
            die("--calibrate HOST KS OUTDIR")
        outdir = os.path.abspath(a.rest[0])
        seeds = [(f"cal{s}", s) for s in range(1, max(ks) + 1)]
        players = [parse_player(p) for p in (a.players or ["petra/3/balanced:athen:1", "petra/3/aggressive:rome:2"])]
    elif a.verify_host:
        host = a.verify_host
        if not a.rest:
            die("--verify-host HOST OUTDIR [SEEDS]")
        outdir = os.path.abspath(a.rest[0])
        seeds = parse_seeds(a.rest[1:] or ["1-3"])
        players = [parse_player(p) for p in (a.players or ["petra/3/balanced:athen:1", "petra/3/aggressive:rome:2"])]
    else:
        outdir = os.path.abspath(a.rest[0])
        seeds = parse_seeds(a.rest[1:]) if not a.matches else []
        players = [parse_player(p) for p in (a.players or ["strategos:athen:1", "petra/3:rome:2"])]
    os.makedirs(outdir, exist_ok=True)

    settings = {k: [v] for k, v in GAME_SETTINGS.items()}
    settings.update(parse_setting(t) for t in a.settings)
    maps = [m for item in a.maps.split(",") for m in (random_maps(item) if item.startswith("*") else [item])]
    try:
        sizes = [int(s) for s in a.sizes.split(",")]
    except ValueError:
        die(f"-s {a.sizes!r}: sizes are tile counts")
    base = {"maps": maps, "biomes": a.biomes.split(","), "sizes": sizes, "placements": a.placement.split(","),
            "victories": parse_victories(a.victory), "settings": settings, "limit_minutes": a.limit,
            "players": players, "rotate": a.rotate}
    if a.matches:
        with open(a.matches, encoding="utf-8") as fh:
            lines = [json.loads(line) for line in fh if line.strip()]
        todo = [(g["tag"], g["seed"], g) for g in lines]
    else:
        todo = [(tag, seed, None) for tag, seed in seeds]
    specs, beyond = [], {}
    for tag, seed, given in todo:
        s, why = expand(base, seed, given)
        s["tag"] = tag
        specs.append(s)
        if why:
            beyond.setdefault(why, []).append(tag)
    unused = [k for k in settings if k in MAP_OPTIONS and not any(k in s["settings"] for s in specs)]
    if unused:
        die(f"-S {', '.join(unused)}: no map of the batch has that option")
    for why, tags in beyond.items():
        print(f"run: WARNING: {len(tags)} match(es) outside the scope of the goal ({why}): "
              f"{' '.join(tags[:8])}{' ...' if len(tags) > 8 else ''}", file=sys.stderr)
    if not specs:
        die("no match to run")
    ais = {p["ai"] for s in specs for p in s["players"]}
    order, prov = snapshot_mods(outdir, ais, sources, a.limit, a.map_interval, a.resign,
                                scenarios=any(is_scenario(s["map"]) for s in specs))
    syntax_check(os.path.join(outdir, "mods"))
    for s in specs:
        s["mods"] = [m for m in order]

    if a.calibrate:
        slots, info, build = select_slots([host], hosts, None, True, force=(host,))
        if host not in info:
            die(f"{host} is not usable")
        best = None
        for k in ks:
            t0 = time.time()
            with concurrent.futures.ThreadPoolExecutor(max_workers=k) as ex:
                res = list(ex.map(lambda s: run_match(outdir, dict(s, tag=f"k{k}-{s['tag']}"), host, hosts, a.wall),
                                  specs[:k]))
            wall_s = time.time() - t0
            turns = sum(r["turns"] for r in res)
            rate = turns / wall_s
            bad = sum(1 for r in res if r["exit_code"] != 0)
            print(f"{host} k={k}: {turns} turns in {wall_s:.0f}s -> {rate:.0f} turns/s total, "
                  f"{rate / k:.0f} per game{f', {bad} nonzero exits' if bad else ''}", flush=True)
            if not bad and (best is None or rate > best[1]):
                best = (k, rate)
        if best:
            hosts[host]["slots"] = best[0]
            hosts[host]["calibrated"] = {"date": datetime.date.today().isoformat(), "turns_per_s": round(best[1]),
                                         "candidates": ks, "players": [f"{p['ai']}/{p['diff']}" for p in players],
                                         "limit_minutes": a.limit}
            save_hosts(hosts)
            print(f"run: {host} slots = {best[0]} ({best[1]:.0f} turns/s); tools/hosts.json updated")
        return

    if a.verify_host:
        host = a.verify_host
        slots, info, build = select_slots(["local", host], hosts, a.jobs, True, force=(host,))
        if host not in info:
            die(f"{host} is not usable")
        pairs = []
        for s in specs:
            for h in ("local", host):
                t = dict(s, tag=f"{s['tag']}-{h}")
                pairs.append((t, h))
        results = {}
        with concurrent.futures.ThreadPoolExecutor(max_workers=len(pairs)) as ex:
            futs = {ex.submit(run_match, outdir, t, h, hosts, a.wall): t["tag"] for t, h in pairs}
            for f in concurrent.futures.as_completed(futs):
                r = f.result()
                results[r["tag"]] = r
                print(f"{r['tag']} exit={r['exit_code']} turns={r['turns']} wall={r['wall_seconds']:.0f}s")
        ok = True
        for s in specs:
            ha, hb = stats_hash(outdir, f"{s['tag']}-local"), stats_hash(outdir, f"{s['tag']}-{host}")
            same = ha and ha != "-" and ha == hb
            ok &= bool(same)
            print(f"{s['tag']}: local {ha} {host} {hb} -> {'identical' if same else 'DIFFERENT'}")
        if ok:
            hosts[host]["verified"] = {"date": datetime.date.today().isoformat(), "build": build,
                                       "seeds": [s["seed"] for s in specs]}
            save_hosts(hosts)
            print(f"run: {host} verified bit-identical on {len(specs)} games; tools/hosts.json updated")
        else:
            print(f"run: {host} NOT verified", file=sys.stderr)
            sys.exit(1)
        return

    names = a.hosts.split(",") if a.hosts else list(hosts)
    slots, info, build = select_slots(names, hosts, a.jobs, a.unverified)
    batch = {"date": datetime.datetime.now().isoformat(timespec="seconds"), "repo": REPO,
             "repo_commit": git_info(REPO), "build": build, "mods": prov, "hosts": info,
             "wall_cap": a.wall, "argv": sys.argv[1:], "matches": specs}
    with open(os.path.join(outdir, "batch.json"), "w", encoding="utf-8") as fh:
        json.dump(batch, fh, indent=1)
    print(f"run: {len(specs)} matches on {len(slots)} slots "
          f"({', '.join(f'{h}:{v['slots']}' for h, v in info.items())}) -> {outdir}", flush=True)
    for line in describe_draws(specs):
        print(line, flush=True)
    rate = sum(hosts[h].get("calibrated", {}).get("turns_per_s", 0) * min(1.0, len(specs) / max(1, v["slots"]))
               for h, v in info.items())
    turns = 300 * a.limit * len(specs)
    if rate:
        secs = turns / rate
        est = (f"at most ~{secs / 60:.0f} min" if secs >= 120 else f"at most ~{secs:.0f} s") + \
            f" if every game reaches the {a.limit}-min limit"
    else:
        est = "no calibration to estimate from"
    print(f"run: limit {a.limit} in-game min, wall cap {a.wall}s per match; {est}", flush=True)
    t0 = time.time()
    results = run_batch(outdir, specs, slots, hosts, a.wall)
    killed = [r["tag"] for r in results if r["exit_code"] in (124, 137)]
    print(f"run: batch done in {time.time() - t0:.0f}s", flush=True)
    if killed:
        print(f"run: FAILURE: {len(killed)} game(s) hit the {a.wall}s wall-clock cap ({' '.join(killed)}): "
              "investigate (hang, stall, slowdown); do not rerun with a bigger cap", file=sys.stderr, flush=True)
    report_settings(results)
    subprocess.run([sys.executable, os.path.join(TOOLS, "analyze.py"), outdir] + [s["tag"] for s in specs])


if __name__ == "__main__":
    main()
