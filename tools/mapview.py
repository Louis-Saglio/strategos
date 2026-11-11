#!/usr/bin/env python3
"""Top-down map view of a match from the mod's [HARNESS] map snapshots.

The harness mod (tools/harness/maps/scripts/NonVisualTrigger.js) prints the
map size once and one JSON line per snapshot (every 30 s of sim time by
default):

    [HARNESS] start {"mapSize": <metres>, ...}
    [HARNESS] map {"t": <sec>, "<player id>": [[id,kind,state,x,z], ...], ...}

kind: 1 worker, 2 soldier, 3 cavalry, 4 siege, 5 structure, 6 civic centre, 7 ship
state: 0 idle, 1 gathering, 2 fighting, 3 other
x, z: metres; drawn with z growing upwards, like a top-down tools/viz.py frame.

Renders a contact sheet of snapshots (default: all of them, at most --max) and,
with --tracks, one image showing how the military units moved over the whole
game. This is the batch-scalable complement to tools/viz.py: exact positions,
no GPU, one picture per match, works on 12 parallel games.

Usage:
  tools/mapview.py <stdout.log> [-o out.png] [--cols N] [--px 220]
                   [--max N] [--from MIN] [--to MIN] [--tracks tracks.png]
                   [--video clip.mp4] [--fps N]
"""
import argparse
import json
import math
import os
import re
import subprocess
import sys

from PIL import Image, ImageDraw, ImageFont

TAG = "[HARNESS] map "
START = "[HARNESS] start "
MAP_M = 768.0  # metres across; replaced by the start line's mapSize
KIND_LABEL = {1: "worker", 2: "soldier", 3: "cavalry", 4: "siege", 5: "building", 6: "cc", 7: "ship"}
PALETTE = [(80, 150, 240), (235, 90, 80), (90, 200, 110), (235, 200, 70), (180, 110, 230), (80, 210, 210),
           (240, 150, 60), (200, 200, 200)]


def color(pl):
    return PALETTE[(int(pl) - 1) % len(PALETTE)]


def player_items(rec):
    return [(k, v) for k, v in sorted(rec.items(), key=lambda kv: kv[0]) if k.isdigit()]
BG = (22, 24, 22)
GRID = (40, 44, 40)


def load(path):
    global MAP_M
    snaps = []
    with open(path, encoding="utf-8", errors="replace") as fh:
        for line in fh:
            j = line.find(START)
            if j >= 0:
                try:
                    MAP_M = float(json.loads(line[j + len(START):].strip()).get("mapSize") or MAP_M)
                except json.JSONDecodeError:
                    pass
                continue
            i = line.find(TAG)
            if i < 0:
                continue
            try:
                rec = json.loads(line[i + len(TAG):].strip())
            except json.JSONDecodeError:
                continue
            snaps.append(rec)
    return snaps


def panel(rec, px, title=None):
    im = Image.new("RGB", (px, px), BG)
    dr = ImageDraw.Draw(im)
    for g in range(1, 4):
        v = px * g // 4
        dr.line([(v, 0), (v, px)], fill=GRID)
        dr.line([(0, v), (px, v)], fill=GRID)
    s = px / MAP_M
    for pl, ents in player_items(rec):
        col = color(pl)
        for e in ents:
            if len(e) < 5:
                continue
            _eid, kind, state, x, z = e[:5]
            cx, cy = x * s, (MAP_M - z) * s
            r = {1: 1.2, 2: 2.2, 3: 3.0, 4: 3.6, 5: 3.4, 6: 5.5, 7: 3.2}.get(kind, 2) * (px / 220.0)
            if kind == 7:
                dr.ellipse([cx - r * 1.4, cy - r * 0.7, cx + r * 1.4, cy + r * 0.7], fill=col)
            elif kind >= 5:
                dr.rectangle([cx - r, cy - r, cx + r, cy + r], fill=col,
                             outline=(255, 255, 255) if kind == 6 else None)
            elif kind == 1:
                dr.ellipse([cx - r, cy - r, cx + r, cy + r], fill=col)
            elif kind == 3:
                dr.polygon([(cx, cy - r * 1.6), (cx - r * 1.3, cy + r), (cx + r * 1.3, cy + r)],
                           fill=col, outline=(255, 255, 255) if state == 2 else None)
            else:
                dr.rectangle([cx - r, cy - r, cx + r, cy + r], fill=col,
                             outline=(255, 255, 255) if state == 2 else None)
    if title:
        try:
            font = ImageFont.truetype("DejaVuSans.ttf", max(11, px // 16))
        except OSError:
            font = ImageFont.load_default()
        dr.text((5, 3), title, fill=(225, 225, 225), font=font)
    return im


def sheet(snaps, out, cols, px, max_n):
    if max_n and len(snaps) > max_n:
        step = len(snaps) / max_n
        snaps = [snaps[min(len(snaps) - 1, int(i * step))] for i in range(max_n)]
    rows = (len(snaps) + cols - 1) // cols
    pad = 4
    W = cols * px + (cols + 1) * pad
    H = rows * px + (rows + 1) * pad
    img = Image.new("RGB", (W, H), (12, 12, 12))
    for i, rec in enumerate(snaps):
        r, c = divmod(i, cols)
        t = rec.get("t", 0) / 60.0
        img.paste(panel(rec, px, f"{t:5.1f} min"), (pad + c * (px + pad), pad + r * (px + pad)))
    img.save(out)
    return out, len(snaps), img.size


def tracks(snaps, out, px):
    """Military movement over the whole match: per-unit polylines."""
    im = Image.new("RGB", (px, px), BG)
    dr = ImageDraw.Draw(im)
    for g in range(1, 4):
        v = px * g // 4
        dr.line([(v, 0), (v, px)], fill=GRID)
        dr.line([(0, v), (px, v)], fill=GRID)
    s = px / MAP_M
    last = {}
    for rec in snaps:
        for pl, ents in player_items(rec):
            col = color(pl)
            for e in ents:
                if len(e) < 5:
                    continue
                eid, kind, state, x, z = e[:5]
                if kind < 2 or kind == 5 or kind == 6:
                    continue
                key = (pl, eid)
                prev = last.get(key)
                if prev:
                    dr.line([prev[0] * s, (MAP_M - prev[1]) * s, x * s, (MAP_M - z) * s], fill=col, width=1)
                last[key] = (x, z)
    # Final density of buildings for orientation.
    for rec in snaps[-1:]:
        for pl, ents in player_items(rec):
            for e in ents:
                if len(e) >= 5 and e[1] in (5, 6):
                    _i, kind, _st, x, z = e[:5]
                    r = 4 if kind == 6 else 2.5
                    y = (MAP_M - z) * s
                    dr.rectangle([x * s - r, y - r, x * s + r, y + r], fill=color(pl))
    try:
        font = ImageFont.truetype("DejaVuSans.ttf", max(12, px // 24))
    except OSError:
        font = ImageFont.load_default()
    dr.text((6, 4), "military tracks over the match (p1 blue, p2 red, p3 green, p4 yellow, ...)",
            fill=(225, 225, 225), font=font)
    im.save(out)
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("stdout_log")
    ap.add_argument("-o", "--out")
    ap.add_argument("--cols", type=int, default=6)
    ap.add_argument("--px", type=int, default=220)
    ap.add_argument("--max", type=int, default=36)
    ap.add_argument("--tracks")
    ap.add_argument("--video")
    ap.add_argument("--fps", type=int, default=4)
    a = ap.parse_args()

    snaps = load(a.stdout_log)
    if not snaps:
        sys.exit(f"mapview.py: no '{TAG.strip()}' lines in {a.stdout_log}")
    out = a.out or os.path.join(os.path.dirname(os.path.abspath(a.stdout_log)), "mapview.png")
    out, n, size = sheet(snaps, out, a.cols, a.px, a.max)
    print(f"mapview.py: {len(snaps)} snapshots ({snaps[0]['t']/60:.1f}-{snaps[-1]['t']/60:.1f} min), "
          f"{n} drawn -> {out} ({size[0]}x{size[1]})")
    if a.tracks:
        print(f"mapview.py: tracks -> {tracks(snaps, a.tracks, max(600, a.px * 3))}")
    if a.video:
        tmp = os.path.join(os.path.dirname(os.path.abspath(out)), ".mapframes")
        os.makedirs(tmp, exist_ok=True)
        for i, rec in enumerate(snaps):
            panel(rec, 512, f"{rec.get('t', 0)/60:5.1f} min").save(os.path.join(tmp, f"{i:04d}.png"))
        subprocess.run(["ffmpeg", "-nostdin", "-loglevel", "error", "-y", "-framerate", str(a.fps),
                        "-i", os.path.join(tmp, "%04d.png"), "-pix_fmt", "yuv420p", a.video], check=True)
        for f in os.listdir(tmp):
            os.unlink(os.path.join(tmp, f))
        os.rmdir(tmp)
        print(f"mapview.py: clip -> {a.video}")


if __name__ == "__main__":
    main()
