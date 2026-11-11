#!/usr/bin/env python3
"""Generate the per-civilisation entity docs of docs/game_description/<civ>/.

    tools/gamedata/gen_civ.py [--out DIR] [--guides-from DIR] CIV...

For each civ, writes <out>/<civ>/{units,buildings,technologies,auras}/*.md for
every entity only that civ can obtain (see zad.Ownership), plus one README.md
index per kind. Default out: docs/game_description.

Guide sections are handwritten: a file that already exists keeps its
"## Guide" section and any trailing notes after the generated sections
(--guides-from DIR reads them from another tree). New files get an empty
"## Guide" placeholder (`TODO`) to fill by hand.

The civ.md synthesis is handwritten and never generated.
"""
import argparse
from decimal import Decimal, ROUND_HALF_UP
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import zad  # noqa: E402

NAMES = {
    "athen": ("Athenian", "athenians"), "brit": ("Briton", "britons"),
    "cart": ("Carthaginian", "carthaginians"), "gaul": ("Gaul", "gauls"),
    "germ": ("Germanic", "germans"), "han": ("Han", "han"),
    "iber": ("Iberian", "iberians"), "kush": ("Kushite", "kushites"),
    "mace": ("Macedonian", "macedonians"), "maur": ("Mauryan", "mauryans"),
    "pers": ("Persian", "persians"), "ptol": ("Ptolemaic", "ptolemies"),
    "rome": ("Roman", "romans"), "sele": ("Seleucid", "seleucids"),
    "spart": ("Spartan", "spartans"),
}
RES = ("food", "wood", "stone", "metal")
DMG = ("Hack", "Pierce", "Crush")


def n(x, nd=2):
    try:
        v = float(Decimal(repr(float(x))).quantize(Decimal(1).scaleb(-nd), rounding=ROUND_HALF_UP))
    except (TypeError, ValueError, ArithmeticError):
        return str(x)
    if v == int(v):
        return str(int(v))
    return ("%.*f" % (nd, v)).rstrip("0").rstrip(".")


def ms(x):
    return n(float(x) / 1000.0, 3)


def fxn(raw):
    return n(zad.fx_str(raw))


# ------------------------------------------------------------- stat lines

def attack_lines(t):
    out = []
    att = t.get("Attack")
    if att is None:
        return out
    for kind in sorted(att.children):
        if kind.startswith("@") or kind == "Slaughter":
            continue
        a = att.children[kind]
        if kind == "Capture":
            parts = ["Capture", "strength " + n(a.text("Capture", 0))]
        else:
            parts = ['%s "%s"' % (kind, a.text("AttackName", kind))]
            dmg = [n(a.text("Damage/" + d)) + " " + d.lower() for d in DMG
                   if float(a.text("Damage/" + d, 0) or 0) != 0]
            if dmg:
                parts.append("damage " + " + ".join(dmg))
        parts.append("range " + n(a.text("MaxRange", 0)) + " m")
        mn = float(a.text("MinRange", 0) or 0)
        if mn:
            parts.append("min range " + n(mn) + " m")
        if kind != "Capture" and a.has("PrepareTime"):
            parts.append("prepare " + ms(a.text("PrepareTime")) + " s")
        parts.append("repeat " + ms(a.text("RepeatTime", 0)) + " s")
        if a.has("Projectile/Spread"):
            parts.append("spread " + n(a.text("Projectile/Spread")))
        if a.has("Splash"):
            sd = [n(a.text("Splash/Damage/" + d)) + " " + d.lower() for d in DMG
                  if float(a.text("Splash/Damage/" + d, 0) or 0) != 0]
            parts.append("splash %s %s m%s" % (a.text("Splash/Shape", ""), n(a.text("Splash/Range", 0)),
                                              (" " + " + ".join(sd)) if sd else ""))
        b = a.get("Bonuses")
        if b is not None:
            for bn in b.children.values():
                parts.append("bonus %s× vs %s" % (n(bn.text("Multiplier")), bn.text("Classes", "")))
        if a.text("PreferredClasses"):
            parts.append("preferred " + " ".join(a.text("PreferredClasses").split()))
        if a.text("RestrictedClasses"):
            parts.append("restricted " + " ".join(a.text("RestrictedClasses").split()))
        if a.get("ApplyStatus") is not None:
            parts.append("status " + " ".join(k for k in a.get("ApplyStatus").children if not k.startswith("@")))
        out.append(" — ".join(parts))
    if t.has("BuildingAI"):
        ai = t.get("BuildingAI")
        s = "default %s arrow(s), +%s per garrisoned %s, max %s" % (
            ai.text("DefaultArrowCount", 0), ai.text("GarrisonArrowMultiplier", 0),
            " ".join(ai.text("GarrisonArrowClasses", "").split()) or "unit", ai.text("MaxArrowCount", "∞"))
        out.append("Arrows — " + s)
    return out


def cost_line(t):
    parts = [n(t.text("Cost/Resources/" + r)) + " " + r for r in RES
             if float(t.text("Cost/Resources/" + r, 0) or 0) != 0]
    return ", ".join(parts) if parts else "free"


def gather_lines(t):
    g = t.get("ResourceGatherer")
    if g is None:
        return []
    out = []
    rates = g.get("Rates")
    if rates is not None:
        groups = {}
        for k, v in rates.children.items():
            if k.startswith("@"):
                continue
            r, _, sub = k.partition(".")
            groups.setdefault(r, []).append("%s %s" % (sub or r, n(v.value)))
        txt = "; ".join("%s: %s" % (r, ", ".join(groups[r])) for r in RES + tuple(sorted(set(groups) - set(RES))) if r in groups)
        if txt:
            base = float(g.text("BaseSpeed", 1) or 1)
            out.append("rates: " + txt + " /s" + ("" if base == 1 else " (base speed ×%s)" % n(base)))
    caps = g.get("Capacities")
    if caps is not None:
        c = [n(caps.text(r)) + " " + r for r in RES if caps.has(r) and float(caps.text(r) or 0) != 0]
        if c:
            out.append("capacity: " + ", ".join(c))
    return out


def speed_line(t):
    w = t.text("UnitMotion/WalkSpeed")
    if w is None:
        return None
    rm = t.text("UnitMotion/RunMultiplier")
    s = "walk %s m/s" % n(w)
    if rm:
        s += ", run %s m/s" % fxn((zad.fx(w) * zad.fx(rm)) >> 16)
    return s


def footprint_line(t):
    f = t.get("Footprint")
    if f is None:
        return None
    h = f.text("Height")
    hs = " (height %s m)" % n(h) if h else ""
    if f.has("Square"):
        return "Square %s m × %s m%s" % (n(f.text("Square/@width")), n(f.text("Square/@depth")), hs)
    if f.has("Circle"):
        return "Circle r %s m%s" % (n(f.text("Circle/@radius")), hs)
    return None


def obstruction_line(t):
    o = t.get("Obstruction")
    if o is None:
        return None
    if o.has("Static"):
        return "Static %s m × %s m" % (n(o.text("Static/@width")), n(o.text("Static/@depth")))
    if o.has("Obstructions"):
        parts = []
        for k, v in o.get("Obstructions").children.items():
            if k.startswith("@"):
                continue
            parts.append("%s %s×%s at (%s, %s)" % (k, n(v.text("@width")), n(v.text("@depth")),
                                                   n(v.text("@x", 0)), n(v.text("@z", 0))))
        return "Obstructions " + "; ".join(parts)
    if o.has("Unit"):
        return None
    return None


def player_limits(civ):
    p = zad.template("special/players/" + civ) or zad.template("special/player/player")
    lim = {}
    if p is not None and p.get("EntityLimits/Limits") is not None:
        for k, v in p.get("EntityLimits/Limits").children.items():
            lim[k] = v.value
    changers = {}
    if p is not None and p.get("EntityLimits/LimitChangers") is not None:
        for k, v in p.get("EntityLimits/LimitChangers").children.items():
            changers[k] = {kk: vv.value for kk, vv in v.children.items()}
    return lim, changers


def category_line(t, civ):
    cat = t.text("BuildRestrictions/Category")
    if not cat:
        return None
    lim, changers = player_limits(civ)
    if cat not in lim:
        return None
    v = lim[cat]
    s = "one per player" if v == "1" else "max %s per player" % v
    if v == "0":
        s = "limit 0"
    ch = changers.get(cat)
    if ch:
        s += "; " + ", ".join("+%s while a %s is owned" % (val, k) for k, val in ch.items())
    return "%s (%s)" % (cat, s)


def distance_line(t):
    d = t.get("BuildRestrictions/Distance")
    if d is None:
        return None
    parts = []
    if d.has("MinDistance"):
        parts.append("min %s m" % n(d.text("MinDistance")))
    if d.has("MaxDistance"):
        parts.append("max %s m" % n(d.text("MaxDistance")))
    return "%s from %s" % (" / ".join(parts), d.text("FromClass", "?"))


def garrison_line(t):
    g = t.get("GarrisonHolder")
    if g is None:
        return None
    s = "%s slots" % g.text("Max", 0)
    h = float(g.text("BuffHeal", 0) or 0)
    if h:
        s += " (+%s/s heal)" % n(h)
    lst = " ".join(g.text("List", "").split())
    if lst and lst not in ("Infantry Cavalry Support", "Support Infantry Cavalry", "Infantry Ship Support Cavalry"):
        s += " — accepts " + lst
    return s


def requirements_line(t):
    r = t.get("Identity/Requirements")
    if r is None:
        return None
    parts = []
    for k, v in r.children.items():
        if k.startswith("@"):
            continue
        if k == "Techs":
            parts.append(" ".join(v.value.split()))
        else:
            parts.append(k + ": " + " ".join(v.value.split()))
    return "; ".join(p for p in parts if p) or None


def trickle_line(t):
    rt = t.get("ResourceTrickle")
    if rt is None:
        return None
    rates = rt.get("Rates")
    parts = []
    if rates is not None:
        for k, v in rates.children.items():
            if not k.startswith("@") and float(v.value or 0) != 0:
                parts.append("%s %s" % (n(v.value), k))
    if not parts:
        return None
    return "%s per %s ms" % (", ".join(parts), rt.text("Interval", "?"))


def upgrade_lines(t, civ):
    up = t.get("Upgrade")
    out = []
    if up is None:
        return out
    native = t.text("Identity/Civ")
    for k, v in up.children.items():
        if k.startswith("@"):
            continue
        ent = (v.text("Entity") or "").replace("{civ}", civ).replace("{native}", native or civ)
        cost = v.get("Cost")
        cs = ", ".join("%s %s" % (n(c.value), r) for r, c in cost.children.items()) if cost else "free"
        s = "%s → `%s` (%s, %s s" % (k, ent, cs, n(v.text("Time", 0)))
        rq = v.text("Requirements/Techs")
        s += (", requires " + " ".join(rq.split()) + ")") if rq else ")"
        out.append(s)
    return out


def researches(t, civ):
    out = []
    for tok in t.tokens("Researcher/Technologies"):
        if "{civ}" in tok:
            c = tok.replace("{civ}", civ)
            tok = c if zad.tech(c) else tok.replace("{civ}", "generic")
        td = zad.tech(tok)
        if td is not None and zad.req_allows_civ(td.get("requirements"), civ):
            out.append(tok)
    return out


def trains(t, civ):
    native = t.text("Identity/Civ")
    out = []
    for tok in t.tokens("Trainer/Entities"):
        r = tok.replace("{civ}", civ).replace("{native}", native or civ)
        if zad.exists(r):
            out.append(tok)
    return out


def basic_stats(name, civ, kind):
    t = zad.template(name)
    L = []

    def add(k, v):
        if v not in (None, "", []):
            L.append("- **%s:** %s" % (k, v))

    add("Generic name", t.text("Identity/GenericName"))
    if t.text("Identity/SpecificName"):
        add("Specific name", t.text("Identity/SpecificName"))
    add("Health", (n(t.text("Health/Max")) + " HP") if t.has("Health/Max") else None)
    if t.has("Resistance/Entity/Damage"):
        add("Armor", " / ".join(n(t.text("Resistance/Entity/Damage/" + d, 0)) + " " + d.lower() for d in DMG))
    for a in attack_lines(t):
        add("Attack", a)
    if kind == "unit":
        add("Speed", speed_line(t))
    add("Vision", (n(t.text("Vision/Range")) + " m") if t.has("Vision/Range") else None)
    add("Cost", cost_line(t))
    add("Build time", n(t.text("Cost/BuildTime", 0)) + " s")
    if kind == "unit":
        add("Population", t.text("Cost/Population", "0"))
    if t.has("Population/Bonus"):
        add("Population bonus", "+" + t.text("Population/Bonus"))
    if kind == "unit":
        for g in gather_lines(t):
            add("Gather", g)
        if t.has("Heal"):
            add("Heal", "%s HP per %s s, range %s m" % (n(t.text("Heal/Health", 0)), ms(t.text("Heal/Interval", 0)),
                                                       n(t.text("Heal/Range", 0))))
        if t.text("Builder/Entities"):
            nat = t.text("Identity/Civ") or civ
            bl = []
            for tok in t.tokens("Builder/Entities"):
                r = tok.replace("{civ}", civ).replace("{native}", nat)
                if zad.exists(r) and zad.short(r) not in bl:
                    bl.append(zad.short(r))
            add("Builds", " ".join(bl))
    if kind == "building":
        ti = t.get("TerritoryInfluence")
        if ti is not None:
            s = "radius %s m, weight %s" % (n(ti.text("Radius", 0)), ti.text("Weight", "?"))
            if ti.text("Root") == "true":
                s += ", territory root"
            add("Territory influence", s)
        add("Garrison", garrison_line(t))
        add("Capture points", t.text("Capturable/CapturePoints"))
        add("Build territory", " ".join(t.tokens("BuildRestrictions/Territory")))
        add("Placement", t.text("BuildRestrictions/PlacementType"))
        add("Build category", category_line(t, civ))
        add("Build distance", distance_line(t))
    else:
        add("Garrison", garrison_line(t))
    add("Requirements", requirements_line(t))
    tr = trains(t, civ)
    add("Trains", " ".join(tr))
    if t.has("Trainer/BatchTimeModifier") and tr:
        add("Train batch time", "×" + n(t.text("Trainer/BatchTimeModifier")))
    add("Researches", " ".join(researches(t, civ)))
    add("Auras", " ".join(t.tokens("Auras")))
    add("Resource trickle", trickle_line(t))
    for u in upgrade_lines(t, civ):
        add("Upgrade", u)
    if t.has("Loot"):
        lt = [n(t.text("Loot/" + r)) + " " + r for r in RES + ("xp",) if float(t.text("Loot/" + r, 0) or 0) != 0]
        if lt:
            add("Loot", ", ".join(lt))
    add("Classes", " ".join(t.tokens("Identity/Classes")))
    add("Visible classes", " ".join(t.tokens("Identity/VisibleClasses")))
    add("Rank", t.text("Identity/Rank"))
    if kind == "building":
        add("Footprint", footprint_line(t))
        add("Obstruction", obstruction_line(t))
    return L


# ------------------------------------------------------------- ranks

def _affects(mod_aff, classes):
    if not mod_aff:
        return True
    lst = mod_aff if isinstance(mod_aff, list) else [mod_aff]
    for group in lst:
        ok = True
        for c in group.split():
            if c.startswith("!"):
                ok = ok and c[1:] not in classes
            else:
                ok = ok and c in classes
        if ok:
            return True
    return False


def rank_section(name, civ):
    t = zad.template(name)
    prom = t.get("Promotion")
    if prom is None or not prom.text("Entity"):
        return []
    L = ["## Ranks", ""]
    cur, cur_t = name, t
    totals = {}
    base = {}
    for rank_tech, label in (("unit_advanced", "Advanced"), ("unit_elite", "Elite")):
        p = cur_t.get("Promotion")
        if p is None or not p.text("Entity"):
            break
        nxt = p.text("Entity").replace("{civ}", civ)
        if not zad.exists(nxt):
            break
        nt = zad.template(nxt)
        if nt.text("Identity/Rank") != label:
            rk = nt.text("Identity/Rank")
            L.append("- Promotes at %s XP to `%s`%s." % (p.text("RequiredXp"), nxt, (" (rank %s)" % rk) if rk else " (a different unit, no rank)"))
            break
        L.append("### %s — `%s`" % (label, nxt.replace("/" + civ + "/", "/{civ}/")))
        cls_cur = set(cur_t.tokens("Identity/Classes")) | set(cur_t.tokens("Identity/VisibleClasses")) | {cur_t.text("Identity/Rank") or "Basic", "Unit"}
        xp_note = xp_override(cls_cur, civ)
        if xp_note:
            L.append("Requires %s XP (template %s; set by the auto-researched `%s`)." % (xp_note[1], p.text("RequiredXp"), xp_note[0]))
        else:
            L.append("Requires %s XP." % p.text("RequiredXp"))
        classes = set(nt.tokens("Identity/Classes")) | set(nt.tokens("Identity/VisibleClasses")) | {label, "Unit"}
        td = zad.tech(rank_tech)
        for m in td["modifications"]:
            if not _affects(m.get("affects"), classes):
                continue
            path = m["value"]
            if not t.has(path) and not path.startswith("Loot"):
                continue
            if path.startswith("Loot") and not t.has("Loot"):
                continue
            key = path
            if "multiply" in m:
                totals[key] = totals.get(key, 1.0) * m["multiply"]
            else:
                totals[key] = totals.get(key, 0.0) + m["add"]
            base.setdefault(key, float(t.text(path, 0) or 0))
        L += _rank_lines(t, totals, rank_tech, classes, label)
        L.append("")
        cur, cur_t = nxt, nt
    if L[-1] == "":
        L.pop()
    return L + [""]


def xp_override(classes, civ):
    for name in zad.all_techs():
        td = zad.tech(name)
        if not td or not td.get("autoResearch") or not zad.req_allows_civ(td.get("requirements"), civ):
            continue
        if not _affects(td.get("affects"), classes):
            continue
        for m in td.get("modifications") or []:
            if m["value"] == "Promotion/RequiredXp" and _affects(m.get("affects"), classes):
                if "replace" in m:
                    return name, n(m["replace"])
    return None


def _rank_lines(t, totals, rank_tech, classes, label):
    td = zad.tech(rank_tech)
    step = {}
    for m in td["modifications"]:
        if _affects(m.get("affects"), classes):
            step[m["value"]] = ("×", m["multiply"]) if "multiply" in m else ("+", m["add"])
    out = []

    def line(title, key, unit="", show_value=True):
        if key not in totals or key not in step:
            return
        op, v = step[key]
        tot = totals[key]
        s = "- %s: %s%s" % (title, op, n(v))
        if op == "×" and abs(tot - v) > 1e-9:
            s += " (total ×%s)" % n(tot)
        if op == "+" and abs(tot - v) > 1e-9:
            s += " (total +%s)" % n(tot)
        if show_value:
            b = float(t.text(key, 0) or 0)
            val = b * tot if op == "×" else b + tot
            s += " → %s%s" % (n(val), unit)
        out.append(s)

    line("Health", "Health/Max", " HP")
    melee = [k for k in ("Attack/Melee/Damage/Hack", "Attack/Melee/Damage/Pierce", "Attack/Melee/Damage/Crush")
             if k in totals and float(t.text(k, 0) or 0) != 0]
    if melee:
        op, v = step[melee[0]]
        tot = totals[melee[0]]
        s = "- Melee attack damage: ×%s" % n(v) + (" (total ×%s)" % n(tot) if abs(tot - v) > 1e-9 else "")
        s += " → " + " + ".join("%s %s" % (k.rsplit("/", 1)[1].lower(), n(float(t.text(k)) * tot)) for k in melee)
        out.append(s)
    line("Capture strength", "Attack/Capture/Capture")
    line("Build time", "Cost/BuildTime", " s")
    line("Gather base speed", "ResourceGatherer/BaseSpeed")
    line("Heal strength", "Heal/Health", " HP")
    line("Heal range", "Heal/Range", " m")
    line("Loot", "Loot/xp", show_value=False) if "Loot/xp" in totals else line("Loot", "Loot/food", show_value=False)
    line("Ranged spread", "Attack/Ranged/Projectile/Spread", show_value=False)
    return out


# ------------------------------------------------------------- tech / aura

def mod_line(m):
    v = m["value"]
    if "multiply" in m:
        s = "×%s %s" % (n(m["multiply"], 4), v)
    elif "add" in m:
        a = m["add"]
        s = ("+%s %s" % (n(a, 4), v)) if a >= 0 else ("−%s %s" % (n(-a, 4), v))
    elif "replace" in m:
        s = "%s = `%s` (replace)" % (v, m["replace"])
    else:
        s = v + " " + json.dumps({k: x for k, x in m.items() if k != "value"})
    if m.get("affects"):
        aff = m["affects"]
        s += " — " + (", ".join(aff) if isinstance(aff, list) else aff)
    return s


def affects_str(a):
    if not a:
        return None
    return ", ".join(a) if isinstance(a, list) else a


def specific(td, civ):
    s = td.get("specificName")
    if isinstance(s, dict):
        return s.get(civ)
    return s


def generic(td):
    g = td.get("genericName")
    if isinstance(g, dict):
        return None
    return g


def tech_md(name, civ, producers):
    td = zad.tech(name)
    adj, pl = NAMES[civ]
    L = ["# " + name, "",
         "%s-specific technology of 0 A.D. 0.28.0 — only the %s can get it. See `docs/game_description/%s/technologies/README.md` for the method; shared technologies are documented in `docs/game_description/generic/technologies/`." % (adj, pl, civ),
         "", "Data file: `simulation/data/technologies/%s.json`." % name, "", "## Basic stats", ""]

    def add(k, v):
        if v not in (None, "", []):
            L.append("- **%s:** %s" % (k, v))

    if "top" in td:
        add("Name", generic(td) or "pair choice")
        add("Top", "`%s`" % td["top"])
        add("Bottom", "`%s`" % td["bottom"])
    else:
        add("Name", generic(td))
        add("Specific name", specific(td, civ))
    c = td.get("cost") or {}
    add("Cost", ", ".join("%s %s" % (n(c[r]), r) for r in RES if c.get(r)))
    if td.get("researchTime"):
        add("Research time", n(td["researchTime"]) + " s")
    if td.get("autoResearch"):
        add("Auto-researched", "yes")
    if "requirements" in td:
        r = json.dumps(td["requirements"], separators=(",", ": "), ensure_ascii=False)
        add("Requirements", "`%s`" % r + ((" — " + td["requirementsTooltip"]) if td.get("requirementsTooltip") else ""))
    add("Supersedes", td.get("supersedes"))
    rep = td.get("replaces")
    add("Replaces", ", ".join(rep) if isinstance(rep, list) else rep)
    add("Effect", td.get("tooltip"))
    mods = td.get("modifications") or []
    if mods:
        L.append("- **Modifications:**")
        for m in mods:
            L.append("  - " + mod_line(m))
    add("Affects", affects_str(td.get("affects")))
    L += ["", "## " + adj, ""]
    for p in sorted(producers):
        L.append("- " + ("auto-researched" if p == "auto" else zad.short(p)))
    return L


def aura_md(name, civ, carriers):
    ad = zad.aura(name)
    adj, pl = NAMES[civ]
    L = ["# " + name, "",
         "%s-specific aura of 0 A.D. 0.28.0 — only the %s can have it. See `docs/game_description/%s/auras/README.md` for the method; shared auras are documented in `docs/game_description/generic/auras/`." % (adj, pl, civ),
         "", "Data file: `simulation/data/auras/%s.json`." % name, "", "## Basic stats", ""]

    def add(k, v):
        if v not in (None, "", []):
            L.append("- **%s:** %s" % (k, v))

    add("Name", ad.get("auraName"))
    add("Type", ad.get("type", "") + (" (stackable)" if ad.get("stackable") else ""))
    if ad.get("radius") is not None:
        add("Radius", n(ad["radius"]) + " m")
    add("Affects", affects_str(ad.get("affects")))
    ap = ad.get("affectedPlayers")
    add("Affected players", ", ".join(ap) if isinstance(ap, list) else ap)
    add("Required technology", ad.get("requiredTechnology"))
    add("Description", ad.get("auraDescription"))
    mods = ad.get("modifications") or []
    if mods:
        L.append("- **Modifications:**")
        for m in mods:
            L.append("  - " + mod_line(m))
    L += ["", "## " + adj, ""]
    for c in sorted(carriers):
        if c.startswith("special/players/"):
            L.append("- attached by `special/players/<civ>.xml` (the player's teambonus)")
        else:
            L.append("- attached by `%s`" % c)
    return L


def entity_md(name, civ, kind, producers):
    adj, pl = NAMES[civ]
    folder = "units" if kind == "unit" else "buildings"
    verb = "train" if kind == "unit" else "build"
    L = ["# " + zad.short(name), "",
         "%s-specific %s of 0 A.D. 0.28.0 — only the %s can %s it. See `docs/game_description/%s/%s/README.md` for the method; shared %s are documented in `docs/game_description/generic/%s/`." % (
             adj, kind, pl, verb, civ, folder, folder, folder),
         "", "Stats resolved from `simulation/templates/%s` (full %s template chain)." % (name, civ),
         "", "## Guide", "", "TODO", "", "## Basic stats", ""]
    L += basic_stats(name, civ, kind)
    L.append("")
    if kind == "unit":
        L += rank_section(name, civ)
    L += ["## %s" % ("Trained by" if kind == "unit" else "Built by"), ""]
    o = zad.ownership(civ)
    if kind == "unit":
        names = []
        for p in sorted(producers, key=zad.short):
            s = zad.short(p)
            if o.obtained_only_on_skirmish_maps(p):
                s += " (only when pre-placed on a skirmish map)"
            names.append(s)
        L.append("- **%s** — `%s` (%s)" % (civ, name, ", ".join(names)))
    else:
        s = "- **%s** — `%s`" % (civ, name)
        ups = sorted(o.upgraded.get(name, ()))
        if ups:
            s += " (upgrade of %s)" % ", ".join("`%s`" % u for u in ups)
            if name not in o.built:
                s += " — not placeable directly"
        L.append(s)
    return L


# ------------------------------------------------------------- guides merge

def split_guide(text):
    """Return (guide paragraph text or None, trailing notes after the last
    generated section or None)."""
    m = re.search(r"^## Guide\n\n(.*?)\n\n(?=## )", text, re.S | re.M)
    guide = m.group(1).strip() if m else None
    return guide


def merge(new_lines, old_text):
    if old_text is None:
        return "\n".join(new_lines).rstrip() + "\n"
    guide = split_guide(old_text)
    txt = "\n".join(new_lines)
    if guide:
        txt = txt.replace("## Guide\n\nTODO", "## Guide\n\n" + guide, 1)
    elif "## Guide" not in old_text:
        txt = txt.replace("## Guide\n\nTODO\n\n", "", 1)
    return txt.rstrip() + "\n"


# ------------------------------------------------------------- driver

def exclusive(kind):
    owners = {}
    for c in zad.civs():
        o = zad.ownership(c)
        if kind == "units":
            items = {x: o.trained[x] for x in o.units()}
        elif kind == "buildings":
            items = {x: o.built.get(x, set()) for x in o.structures()}
        elif kind == "technologies":
            items = o.techs()
        else:
            items = o.auras()
        for k, v in items.items():
            key = zad.short(k) if kind in ("units", "buildings") else k
            owners.setdefault(key, {})[c] = (k, v)
    return {k: v for k, v in owners.items() if len(v) == 1}


def fname(key):
    return key.replace("/", "__") + ".md"


def readme(civ, kind, keys, types):
    adj, pl = NAMES[civ]
    sing = {"units": "unit", "buildings": "building", "technologies": "technology", "auras": "aura"}[kind]
    verb = {"units": "can train", "buildings": "can build", "technologies": "can get", "auras": "can have"}[kind]
    L = ["# %s-specific %s of 0 A.D. 0.28.0" % (adj, kind), "",
         "One file per %s that **only the %s** %s (single-civ %s of the `generic/%s/` analysis). %s" % (
             sing, pl, verb, kind, kind,
             "Stats are the fully resolved %s templates; the shared %s are documented in `docs/game_description/generic/%s/`." % (civ, kind, kind)
             if kind in ("units", "buildings") else
             "Shared %s are documented in `docs/game_description/generic/%s/`." % (kind, kind)),
         "", "## Index", "", "| Name | Type |", "|---|---|"]
    for k in keys:
        L.append("| [%s](%s) | %s |" % (k, fname(k), types[k]))
    return "\n".join(L) + "\n"


def main():
    ap = argparse.ArgumentParser()
    root = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../docs/game_description"))
    ap.add_argument("--out", default=root)
    ap.add_argument("--guides-from", default=None)
    ap.add_argument("--no-readme", action="store_true")
    ap.add_argument("civs", nargs="+")
    a = ap.parse_args()
    gsrc = a.guides_from or a.out
    for kind in ("units", "buildings", "technologies", "auras"):
        ex = exclusive(kind)
        for civ in a.civs:
            mine = sorted(k for k, v in ex.items() if civ in v)
            d = os.path.join(a.out, civ, kind)
            types = {}
            for key in mine:
                full, prod = ex[key][civ]
                if kind == "units":
                    lines = entity_md(full, civ, "unit", prod)
                    types[key] = "unit"
                elif kind == "buildings":
                    lines = entity_md(full, civ, "building", prod)
                    types[key] = "building"
                elif kind == "technologies":
                    lines = tech_md(full, civ, prod)
                    types[key] = "auto-researched" if prod == {"auto"} else ("pair" if "top" in zad.tech(full) else "researchable")
                else:
                    lines = aura_md(full, civ, prod)
                    types[key] = zad.aura(full).get("type", "")
                old_p = os.path.join(gsrc, civ, kind, fname(key))
                old = open(old_p, encoding="utf-8").read() if os.path.exists(old_p) else None
                os.makedirs(d, exist_ok=True)
                with open(os.path.join(d, fname(key)), "w", encoding="utf-8") as f:
                    f.write(merge(lines, old))
            if mine and not a.no_readme:
                with open(os.path.join(d, "README.md"), "w", encoding="utf-8") as f:
                    f.write(readme(civ, kind, mine, types))


if __name__ == "__main__":
    main()
