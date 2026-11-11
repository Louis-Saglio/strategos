"""0 A.D. 0.28.0 game data loader for the doc generators.

Loads entity templates and technology/aura JSON from the 0 A.D. source
reference (default ~/Work/0ad, override with ZEROAD_SRC) and reproduces the
engine semantics the docs depend on:

- template inheritance and layer merging: CParamNode::ApplyLayer
  (source/simulation2/system/ParamNode.cpp) and the "A|B" filter syntax and
  file lookup order of CTemplateLoader::LoadTemplateFile
  (source/ps/TemplateLoader.cpp);
- fixed-point arithmetic of CFixed_15_16 (source/maths/Fixed.cpp);
- which entities, technologies and auras each civilisation can obtain in a
  skirmish game (Trainer/Builder/Upgrade/Researcher lists with {civ} and
  {native} substitution, start entities, skirmish replacements, auto-research
  techs and pair techs).
"""
import glob
import json
import os
import re
import xml.etree.ElementTree as ET

SRC = os.path.expanduser(os.environ.get("ZEROAD_SRC", "~/Work/0ad"))
SIM = os.path.join(SRC, "binaries/data/mods/public/simulation")
TEMPLATES = os.path.join(SIM, "templates")
TECHS = os.path.join(SIM, "data/technologies")
AURAS = os.path.join(SIM, "data/auras")
CIVS = os.path.join(SIM, "data/civs")


# ---------------------------------------------------------------- fixed point

def fx(s):
    """CFixed_15_16::FromString -> raw int."""
    s = str(s).strip()
    if not s:
        return 0
    neg = False
    i = 0
    if s[0] in "+-":
        neg = s[0] == "-"
        i = 1
    r = 0
    while i < len(s):
        c = s[i]
        if c.isdigit():
            r = r * 10 + (int(c) << 16)
            i += 1
        elif c == ".":
            i += 1
            frac, div = 0, 1
            while i < len(s) and s[i].isdigit():
                frac = frac * 10 + int(s[i])
                div *= 10
                i += 1
                if div >= 100000:
                    break
            r += (frac << 16) // div
            break
        else:
            break
    return -r if neg else r


def fx_str(v):
    """CFixed_15_16::ToString."""
    out = "-" if v < 0 else ""
    pv = abs(v)
    out += str(pv >> 16)
    fraction = pv & 0xFFFF
    if fraction:
        out += "."
        frac, div = 0, 1
        while True:
            frac *= 10
            div *= 10
            digit = ((fraction * div) >> 16) - frac
            frac += digit
            if (frac << 16) // div == fraction:
                out += str(digit)
                break
            if digit <= 8 and ((frac + 1) << 16) // div == fraction:
                out += str(digit + 1)
                break
            out += str(digit)
    return out


# ---------------------------------------------------------------- param nodes

class Node:
    __slots__ = ("value", "children")

    def __init__(self):
        self.value = ""
        self.children = {}

    def get(self, path, default=None):
        n = self
        for p in path.split("/"):
            if n is None or p not in n.children:
                return default
            n = n.children[p]
        return n

    def text(self, path, default=None):
        n = self.get(path)
        return default if n is None else n.value

    def has(self, path):
        return self.get(path) is not None

    def tokens(self, path):
        v = self.text(path)
        return v.split() if v else []


def apply_layer(parent, el):
    name = el.tag
    value = (el.text or "").strip()
    has_set = False
    replacing = filtering = merging = False
    op = None
    attrs = el.attrib
    for a, av in attrs.items():
        if a == "disable":
            parent.children.pop(name, None)
            return
        if a == "replace":
            parent.children.pop(name, None)
            replacing = True
        elif a == "filtered":
            filtering = True
        elif a == "merge":
            if name not in parent.children:
                return
            merging = True
        elif a == "op":
            op = av
    if attrs.get("datatype") == "tokens":
        node = parent.children.setdefault(name, Node())
        old = node.value.split() if (not replacing and node.value) else []
        new = value.split() if value else []
        tokens = list(old)
        for t in new:
            if t.startswith("-"):
                if t[1:] in tokens:
                    tokens.remove(t[1:])
            elif t not in old:
                tokens.append(t)
        node.value = " ".join(tokens)
        has_set = True
    node = parent.children.setdefault(name, Node())
    if op in ("add", "mul", "mul_round"):
        old = fx(node.value)
        mod = fx(value)
        if op == "add":
            node.value = fx_str(old + mod)
        elif op == "mul":
            node.value = fx_str((old * mod) >> 16)
        else:
            m = (old * mod) >> 16
            node.value = fx_str(((m + 0x8000) >> 16) << 16)
        has_set = True
    if not has_set and not merging:
        node.value = value
    kept = {}
    for child in el:
        if not isinstance(child.tag, str):
            continue
        apply_layer(node, child)
        if filtering and child.tag in node.children:
            kept[child.tag] = node.children[child.tag]
    if filtering:
        node.children = kept
    for a, av in attrs.items():
        if a in ("replace", "op", "merge", "filtered"):
            continue
        node.children.setdefault("@" + a, Node()).value = av


_xml_cache = {}


def _xml(path):
    if path not in _xml_cache:
        _xml_cache[path] = ET.parse(path).getroot() if os.path.exists(path) else None
    return _xml_cache[path]


def _locate(name):
    for p in (os.path.join(TEMPLATES, "special/filter", name + ".xml"),
              os.path.join(TEMPLATES, "mixins", name + ".xml"),
              os.path.join(TEMPLATES, name + ".xml")):
        if os.path.exists(p):
            return p
    return None


def _load_into(root, name, depth=0):
    if depth > 100:
        raise RuntimeError("inheritance loop at " + name)
    if "|" in name:
        pos = name.index("|")
        return _load_into(root, name[pos + 1:], depth + 1) and _load_into(root, name[:pos], depth + 1)
    path = _locate(name)
    if not path:
        return False
    el = _xml(path)
    parent = el.attrib.get("parent")
    if parent and not _load_into(root, parent, depth + 1):
        return False
    apply_layer(root, el)
    return True


_tpl_cache = {}


def template(name):
    """Fully merged entity template (the Entity node), or None if missing."""
    if name not in _tpl_cache:
        root = Node()
        ok = _load_into(root, name)
        _tpl_cache[name] = root.children.get("Entity") if ok else None
    return _tpl_cache[name]


def exists(name):
    return os.path.exists(os.path.join(TEMPLATES, name + ".xml"))


def raw_parent(name):
    el = _xml(os.path.join(TEMPLATES, name + ".xml"))
    return None if el is None else el.attrib.get("parent")


def chain(name):
    """Template names from the entity itself up to the root, following the
    primary parent (for 'A|B' parents, every component is listed)."""
    out, todo = [], [name]
    while todo:
        n = todo.pop(0)
        if n in out:
            continue
        out.append(n)
        p = raw_parent(n)
        if p:
            todo = p.split("|") + todo
    return out


# ---------------------------------------------------------------- tech / aura

def _json(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


_tech_cache = {}


def tech(name):
    if name not in _tech_cache:
        p = os.path.join(TECHS, name + ".json")
        _tech_cache[name] = _json(p) if os.path.exists(p) else None
    return _tech_cache[name]


def all_techs():
    out = []
    for p in glob.glob(os.path.join(TECHS, "**/*.json"), recursive=True):
        out.append(os.path.relpath(p, TECHS)[:-5].replace(os.sep, "/"))
    return sorted(out)


def aura(name):
    p = os.path.join(AURAS, name + ".json")
    return _json(p) if os.path.exists(p) else None


def civ_data(civ):
    return _json(os.path.join(CIVS, civ + ".json"))


def civs():
    out = []
    for p in sorted(glob.glob(os.path.join(CIVS, "*.json"))):
        d = _json(p)
        if d.get("SelectableInGameSetup", True) and d.get("Code") != "gaia":
            out.append(d["Code"])
    return out


def interpret_requirements(civ, operator, value):
    """Port of InterpretTechRequirements (globalscripts/Technologies.js):
    False when the civ is not permitted, else a list of remaining
    tech/entity requirement alternatives."""
    reqs = []
    if operator == "civ":
        return [] if (not civ or civ == value) else False
    if operator == "notciv":
        return False if civ == value else []
    if operator == "entity":
        number = value.get("number") or value.get("numberOfTypes") or 0
        if number > 0:
            reqs.append({"entities": [{"class": value.get("class"), "number": number,
                                       "check": "count" if value.get("number") else "variants"}]})
        return reqs
    if operator == "tech":
        return [{"techs": [value]}]
    if operator == "all":
        civ_permitted = None
        for sub in value:
            op = next(iter(sub))
            val = sub[op]
            res = interpret_requirements(civ, op, val)
            if op == "civ":
                if res is not False:
                    civ_permitted = True
                elif civ_permitted is not True:
                    civ_permitted = False
                continue
            if op == "notciv":
                if res is False:
                    return False
                continue
            if op == "any" and res is False:
                return False
            if op in ("any", "all"):
                if res is False:
                    null = interpret_requirements(None, op, val)
                    if null is False or not null:
                        civ_permitted = False
                    continue
            if op in ("any", "all", "tech", "entity"):
                if res:
                    if not reqs:
                        reqs.append({})
                    combined = []
                    for cur in reqs:
                        for r in res:
                            nr = {k: list(v) for k, v in cur.items()}
                            for k, v in r.items():
                                nr[k] = nr.get(k, []) + list(v)
                            combined.append(nr)
                    reqs = combined
        if civ_permitted is False:
            return False
        return reqs
    if operator == "any":
        civ_permitted = False
        for sub in value:
            op = next(iter(sub))
            val = sub[op]
            res = interpret_requirements(civ, op, val)
            if op == "civ":
                if res is not False:
                    return []
                continue
            if op == "notciv":
                if res is False:
                    return False
                civ_permitted = True
                continue
            if op == "any" and res is False:
                null = interpret_requirements(None, op, val)
                if null is False or not null:
                    continue
                return False
            if op == "all":
                if res is False:
                    continue
                civ_permitted = True
            if op in ("any", "all", "tech", "entity"):
                reqs.extend(res)
        if not civ_permitted and not reqs:
            return False
        return reqs
    return reqs


def req_allows_civ(req, civ):
    """Whether a requirements object permits the civ, per the engine."""
    if req is None:
        return True
    if req is False:
        return False
    op = next(iter(req)) if isinstance(req, dict) and req else None
    if op is None:
        return True
    return interpret_requirements(civ, op, req[op]) is not False


def tech_reqs(t):
    if t is None:
        return None
    return t.get("requirements")


# ---------------------------------------------------------------- ownership

def _subst(tok, civ, native):
    tok = tok.replace("{civ}", civ)
    if native:
        tok = tok.replace("{native}", native)
    return tok


def produced_by(name, civ):
    """(trains, builds, upgrades) of one owned entity for that civ."""
    t = template(name)
    if t is None:
        return [], [], []
    native = t.text("Identity/Civ")
    trains = [_subst(x, civ, native) for x in t.tokens("Trainer/Entities")]
    builds = [_subst(x, civ, native) for x in t.tokens("Builder/Entities")]
    ups = []
    up = t.get("Upgrade")
    if up is not None:
        for k, n in up.children.items():
            e = n.text("Entity")
            if e:
                ups.append(_subst(e, civ, native))
    return ([x for x in trains if exists(x)], [x for x in builds if exists(x)],
            [x for x in ups if exists(x)])


def skirmish_targets(civ):
    repl = civ_data(civ).get("SkirmishReplacements", {}) or {}
    out = []
    for d in ("skirmish/structures", "skirmish/units"):
        for p in glob.glob(os.path.join(TEMPLATES, d, "*.xml")):
            n = os.path.relpath(p, TEMPLATES)[:-4]
            if n in repl:
                r = repl[n]
            else:
                r = (template(n) or Node()).text("SkirmishReplacer/general") or ""
            r = r.replace("{civ}", civ)
            if r and exists(r):
                out.append(r)
    return out


class Ownership:
    """Everything a civ can own, with who trains/builds it."""

    def __init__(self, civ):
        self.civ = civ
        self.start = []
        for e in civ_data(civ).get("StartEntities", []):
            if exists(e["Template"]):
                self.start.append(e["Template"])
        self.skirmish = [x for x in skirmish_targets(civ) if x not in self.start]
        self.start += self.skirmish
        self.trained = {}    # unit -> set(producer structures short names)
        self.built = {}      # structure -> set(builder units)
        self.upgraded = {}   # target -> set(sources)
        todo = list(dict.fromkeys(self.start))
        seen = set()
        while todo:
            n = todo.pop(0)
            if n in seen:
                continue
            seen.add(n)
            tr, bu, up = produced_by(n, civ)
            for x in tr:
                self.trained.setdefault(x, set()).add(n)
                todo.append(x)
            for x in bu:
                self.built.setdefault(x, set()).add(n)
                todo.append(x)
            for x in up:
                self.upgraded.setdefault(x, set()).add(n)
                todo.append(x)
        self.entities = seen

    def units(self):
        return sorted(x for x in self.trained if x.startswith("units/"))

    def structures(self):
        return sorted(x for x in set(self.built) | set(self.upgraded) if x.startswith("structures/"))

    def obtained_only_on_skirmish_maps(self, name):
        return (name in self.skirmish and name not in self.built and name not in self.upgraded
                and name not in self.trained)

    def techs(self):
        """tech -> set of producer short names, or {'auto'}."""
        out = {}
        for n in sorted(self.entities):
            t = template(n)
            if t is None:
                continue
            for tok in t.tokens("Researcher/Technologies"):
                if "{civ}" in tok:
                    c = tok.replace("{civ}", self.civ)
                    tok = c if tech(c) else tok.replace("{civ}", "generic")
                if tech(tok) is None:
                    continue
                out.setdefault(tok, set()).add(n)
        for name in list(out):
            td = tech(name)
            if td and "top" in td:
                for side in ("top", "bottom"):
                    out.setdefault(td[side], set()).update(out[name])
        for name in all_techs():
            td = tech(name)
            if td and td.get("autoResearch") and req_allows_civ(td.get("requirements"), self.civ):
                out.setdefault(name, set()).add("auto")
        for name in list(out):
            td = tech(name)
            if td is None or not req_allows_civ(td.get("requirements"), self.civ):
                if "auto" not in out[name]:
                    del out[name]
        return out

    def auras(self):
        """aura -> set of carrier template names (declaring templates)."""
        out = {}
        owned = sorted(self.entities) + ["special/players/" + self.civ]
        for n in owned:
            for c in chain(n):
                el = _xml(os.path.join(TEMPLATES, c + ".xml"))
                if el is None:
                    continue
                a = el.find("Auras")
                if a is None or not (a.text or "").strip():
                    continue
                for tok in a.text.split():
                    if tok.startswith("-"):
                        continue
                    tok = tok.replace("{civ}", self.civ)
                    if aura(tok) is not None:
                        out.setdefault(tok, set()).add(n)
        return out


_own_cache = {}


def ownership(civ):
    if civ not in _own_cache:
        _own_cache[civ] = Ownership(civ)
    return _own_cache[civ]


def short(name):
    return name.rsplit("/", 1)[-1]
