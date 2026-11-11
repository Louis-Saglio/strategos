# ship_capture_resistance

Generic (non-civ-specific) technology of 0 A.D. 0.28.0 — see `docs/game_description/generic/technologies/README.md` for the method.

Data file: `simulation/data/technologies/ship_capture_resistance.json`.

## Basic stats

- **Name:** Marines
- **Cost:** 400 food, 200 metal
- **Research time:** 60 s
- **Requirements:** `{"all": [{"tech": "phase_city"},{"any": [{"notciv": "rome"}]}]}` — Unlocked in City Phase.
- **Effect:** All Warships +40% capture resistance.
- **Modifications:**
  - ×1.4 Capturable/CapturePoints
- **Affects:** Warship

## Notes

- **Vestigial in 0.28.0**: no building's `Researcher` lists this tech (verified — no
  file under `binaries/data/mods/public/simulation/` references it), so despite its `notciv: rome`
  requirement (all non-rome civs are allowed by requirements) it is unresearchable
  through the build UI — a data vestige in the same class as athen's
  `pheidian_workshop` and spart's `agoge`. The per-civ `specificName` "Epibatai"
  (athen/cart/mace/pers/ptol/sele/spart) is flavour text only.
