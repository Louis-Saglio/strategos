#!/usr/bin/env python3
"""Contact sheets (and optional clips) from the frames tools/viz.py captured.

Reads <viz dir>/frames/*.png and frames.jsonl (one record per frame: game
time, target, camera point, info). Frames of one shot group show the same
game instant, so the sheet is a table: one row per instant, one column per
target (overview, base:1, base:2, army:1, ...), an empty cell where a target
was skipped (no army, no fight). Long matches are split into pages of --rows
rows: contact_01.png, contact_02.png, ...

Usage:
  tools/frames.py <viz dir> [--rows N] [--thumb W] [--from MIN] [--to MIN]
                  [--targets overview,fight] [--video out.mp4 --target T] [--fps N]

--video encodes one target's frames as a time-lapse (default target: the
first column, usually overview).

Top-down frames (pitch >= 80) get a world-coordinate grid, in metres — the
same coordinates as the [HARNESS] map telemetry and tools/viz.py targets — so
a spot seen on an overview can be framed next with area:X,Z,R. The director
records nine screen->ground samples per frame; a least-squares affine fit maps
the world onto the image. Full-size gridded copies go to <viz dir>/grid/.
--no-grid turns this off.
"""
import argparse
import json
import os
import re
import subprocess
import sys

from PIL import Image, ImageDraw, ImageFont


def load(vizdir):
    path = os.path.join(vizdir, "frames.jsonl")
    if not os.path.exists(path):
        sys.exit(f"frames.py: no {path}")
    recs = []
    for line in open(path, encoding="utf-8"):
        line = line.strip()
        if line:
            try:
                recs.append(json.loads(line))
            except json.JSONDecodeError:
                pass
    recs = [r for r in recs if os.path.exists(os.path.join(vizdir, "frames", r["frame"]))]
    if not recs:
        sys.exit(f"frames.py: no frames listed in {path}")
    return recs


def caption(rec):
    info = rec.get("info") or {}
    bits = [rec["target"]]
    if "units" in info:
        bits.append(f'{info["units"]} units')
    if "byPlayer" in info:
        bits.append(" v ".join(f"p{p}:{n}" for p, n in sorted(info["byPlayer"].items())))
    if info.get("civCentres") == 0:
        bits.append("no CC")
    bits.append(f'@{rec["x"]},{rec["z"]}')
    if rec.get("radius"):
        bits.append(f'r{rec["radius"]}m')
    return "  ".join(bits)


def solve3(m, v):
    """Solve the 3x3 system m·x = v (Gaussian elimination, partial pivoting)."""
    a = [row[:] + [v[i]] for i, row in enumerate(m)]
    for c in range(3):
        p = max(range(c, 3), key=lambda r: abs(a[r][c]))
        if abs(a[p][c]) < 1e-12:
            return None
        a[c], a[p] = a[p], a[c]
        for r in range(3):
            if r != c:
                f = a[r][c] / a[c][c]
                a[r] = [x - f * y for x, y in zip(a[r], a[c])]
    return [a[i][3] / a[i][i] for i in range(3)]


def world_to_pixel(ground):
    """Affine fit (x, z) -> (px, py) from [px, py, x, z] samples; None if unusable."""
    if not ground or len(ground) < 6:
        return None
    rows = [(g[2], g[3], 1.0) for g in ground]
    m = [[sum(r[i] * r[j] for r in rows) for j in range(3)] for i in range(3)]
    cu = solve3(m, [sum(r[i] * g[0] for r, g in zip(rows, ground)) for i in range(3)])
    cv = solve3(m, [sum(r[i] * g[1] for r, g in zip(rows, ground)) for i in range(3)])
    if not cu or not cv:
        return None
    f = lambda x, z: (cu[0] * x + cu[1] * z + cu[2], cv[0] * x + cv[1] * z + cv[2])
    err = max(abs(f(g[2], g[3])[0] - g[0]) + abs(f(g[2], g[3])[1] - g[1]) for g in ground)
    width = max(g[0] for g in ground) / 0.9          # samples span 10%..90% of the frame
    return f if err < 0.01 * width else None         # relief/perspective too strong for an affine grid


def pixel_to_world(f):
    """Inverse of an affine world->pixel map."""
    ox, oy = f(0, 0)
    ax, ay = f(1, 0)
    bx, by = f(0, 1)
    a, b, c, d = ax - ox, bx - ox, ay - oy, by - oy
    det = a * d - b * c
    if abs(det) < 1e-12:
        return None
    return lambda px, py: ((d * (px - ox) - b * (py - oy)) / det, (-c * (px - ox) + a * (py - oy)) / det)


def draw_grid(im, rec):
    """World grid on a top-down frame, or None when the frame is not one."""
    if (rec.get("pitch") or 0) < 80:
        return None
    f = world_to_pixel(rec.get("ground"))
    if not f:
        return None
    # Extent of the view, from the fit: the four frame corners in world space.
    W, H = im.size
    inv = pixel_to_world(f)
    if not inv:
        return None
    corners = [inv(0, 0), inv(W, 0), inv(0, H), inv(W, H)]
    span = max(max(c[0] for c in corners) - min(c[0] for c in corners),
               max(c[1] for c in corners) - min(c[1] for c in corners))
    step = next((s for s in (5, 10, 20, 25, 50, 100, 200, 500) if span / s <= 9), 1000)
    x0, x1 = min(c[0] for c in corners), max(c[0] for c in corners)
    z0, z1 = min(c[1] for c in corners), max(c[1] for c in corners)
    im = im.convert("RGB")
    over = Image.new("RGBA", im.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(over)
    fnt = font(max(14, im.width // 45))
    for axis in ("x", "z"):
        lo, hi = (x0, x1) if axis == "x" else (z0, z1)
        v = max(0, (int(lo // step) + 1) * step)   # world coordinates start at 0
        while v < hi:
            a = f(v, z0) if axis == "x" else f(x0, v)
            b = f(v, z1) if axis == "x" else f(x1, v)
            d.line([a, b], fill=(255, 255, 255, 110), width=max(1, W // 800))
            # Label where the line crosses the frame border (top / left edge first).
            label = f"{axis}={v:g}"
            for t in [i / 200 for i in range(201)]:
                px, py = a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t
                if 0 <= px < W - 4 * fnt.size and 0 <= py < H - 1.6 * fnt.size:
                    d.text((px + 3, py + 2), label, fill=(255, 255, 140, 230), font=fnt,
                           stroke_width=2, stroke_fill=(0, 0, 0, 200))
                    break
            v += step
    return Image.alpha_composite(im.convert("RGBA"), over).convert("RGB")


def font(size):
    for name in ("DejaVuSans.ttf", "NotoSans-Regular.ttf", "/usr/share/fonts/noto/NotoSans-Regular.ttf"):
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            pass
    return ImageFont.load_default(size)   # Pillow >= 10.1: scalable built-in font


def sheets(vizdir, recs, rows_per_page, thumb, prefix, grid=True):
    cols = []
    for r in recs:
        if r["target"] not in cols:
            cols.append(r["target"])
    instants = sorted({r["t"] for r in recs})
    cell = {(r["t"], r["target"]): r for r in recs}
    with Image.open(os.path.join(vizdir, "frames", recs[0]["frame"])) as im0:
        th = int(round(thumb * im0.height / im0.width))
    pad, bar, left = 4, 18, 64
    f_small, f_big = font(12), font(16)
    out = []
    for page in range(0, len(instants), rows_per_page):
        rows = instants[page:page + rows_per_page]
        W = left + len(cols) * (thumb + pad) + pad
        H = bar + len(rows) * (th + bar + pad) + pad
        sheet = Image.new("RGB", (W, H), (18, 18, 20))
        d = ImageDraw.Draw(sheet)
        for c, target in enumerate(cols):
            d.text((left + c * (thumb + pad) + 2, 1), target, fill=(240, 200, 120), font=f_big)
        for r, t in enumerate(rows):
            y = bar + r * (th + bar + pad)
            d.text((4, y + bar + th // 2 - 8), f"{t / 60000:.1f}'", fill=(240, 200, 120), font=f_big)
            for c, target in enumerate(cols):
                x = left + c * (thumb + pad)
                rec = cell.get((t, target))
                if not rec:
                    d.rectangle((x, y + bar, x + thumb - 1, y + bar + th - 1), outline=(50, 50, 55))
                    continue
                with Image.open(os.path.join(vizdir, "frames", rec["frame"])) as im:
                    im = im.convert("RGB")
                    gridded = draw_grid(im, rec) if grid else None
                    if gridded:
                        os.makedirs(os.path.join(vizdir, "grid"), exist_ok=True)
                        gridded.save(os.path.join(vizdir, "grid", rec["frame"]))
                        im = gridded
                    sheet.paste(im.resize((thumb, th), Image.Resampling.LANCZOS), (x, y + bar))
                d.text((x + 2, y + 2), caption(rec), fill=(220, 220, 220), font=f_small)
        name = os.path.join(vizdir, f"{prefix}_{page // rows_per_page + 1:02d}.png")
        sheet.save(name)
        out.append((name, len(rows), sheet.size))
    return cols, out


def video(vizdir, recs, target, path, fps):
    sel = [r for r in recs if r["target"] == target]
    if not sel:
        sys.exit(f"frames.py: no frames for target {target}")
    lst = os.path.join(vizdir, "frames.txt")
    with open(lst, "w", encoding="utf-8") as fh:
        for r in sel:
            fh.write(f"file '{os.path.join(vizdir, 'frames', r['frame'])}'\nduration {1 / fps:.4f}\n")
    subprocess.run(["ffmpeg", "-nostdin", "-loglevel", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst,
                    "-vf", f"scale=1280:-2,fps={fps}", "-pix_fmt", "yuv420p", path], check=True)
    os.unlink(lst)
    print(f"frames.py: {target} time-lapse -> {path} ({len(sel)} frames, {len(sel) / fps:.0f}s at {fps} fps)")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("vizdir")
    ap.add_argument("--rows", type=int, default=10, help="instants per sheet (default 10)")
    ap.add_argument("--thumb", type=int, default=400, help="cell width in px (default 400)")
    ap.add_argument("--from", dest="lo", type=float, help="first game minute")
    ap.add_argument("--to", dest="hi", type=float, help="last game minute")
    ap.add_argument("--targets", help="comma-separated columns to keep (default: all)")
    ap.add_argument("--prefix", default="contact")
    ap.add_argument("--no-grid", action="store_true", help="no world grid on top-down frames")
    ap.add_argument("--video")
    ap.add_argument("--target", help="target of the --video time-lapse (default: first column)")
    ap.add_argument("--fps", type=int, default=4)
    a = ap.parse_args()

    vizdir = os.path.abspath(a.vizdir)
    recs = load(vizdir)
    if a.lo is not None:
        recs = [r for r in recs if r["game_min"] >= a.lo]
    if a.hi is not None:
        recs = [r for r in recs if r["game_min"] <= a.hi]
    if a.targets:
        keep = re.split(r",(?=[A-Za-z])", a.targets)
        recs = [r for r in recs if r["target"] in keep]
    if not recs:
        sys.exit("frames.py: no frames in that selection")
    cols, out = sheets(vizdir, recs, a.rows, a.thumb, a.prefix, grid=not a.no_grid)
    for name, n, size in out:
        print(f"frames.py: {n} instants x {len(cols)} targets -> {name} ({size[0]}x{size[1]})")
    if a.video:
        video(vizdir, recs, a.target or cols[0], os.path.abspath(a.video), a.fps)


if __name__ == "__main__":
    main()
