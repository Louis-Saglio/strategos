# unlock_neodamodes

Spartan-specific technology of 0 A.D. 0.28.0 — only the spartans can get it. See `docs/game_description/spart/technologies/README.md` for the method; shared technologies are documented in `docs/game_description/generic/technologies/`.

Data file: `simulation/data/technologies/unlock_neodamodes.json`.

## Basic stats

- **Name:** Unlock Neodamodes
- **Cost:** 500 food
- **Research time:** 60 s
- **Requirements:** `{"all": [{"tech": "phase_city"}, {"civ": "spart"}]}`
- **Effect:** Unlocks the Neodamodes Hoplite at the barracks.
- **Modifications:** none — the unlock is a training requirement on the unit: `units/spart/infantry_spearman_neodamodes` has `Identity/Requirements/Techs = unlock_neodamodes`.

## Spartans

- gerousia

Note: the City-phase economic-military tech. The Neodamodes Hoplite is
a citizen-tier spearman (100 HP, 4.5 hack + 4 pierce, 2.5× vs cavalry)
that costs **30 food + 20 metal** — the cheapest metal-based melee unit
in the game and Sparta's answer to late-game food-wood armies: freed
helots who fight for metal instead of wood. The gerousia (Town) is the
researcher, so the barracks upgrade is gated on the City phase tech
plus a standing senate building.
