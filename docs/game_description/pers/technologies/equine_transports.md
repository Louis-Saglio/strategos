# equine_transports

Persian-specific technology of 0 A.D. 0.28.0 — only the persians can get it. See `docs/game_description/pers/technologies/README.md` for the method; shared technologies are documented in `docs/game_description/generic/technologies/`.

Data file: `simulation/data/technologies/equine_transports.json`.

## Basic stats

- **Name:** Equine Transports
- **Cost:** 300 wood, 300 metal
- **Research time:** 60 s
- **Requirements:** `{"all": [{"tech": "phase_city"},{"tech": "dock_efficiency"},{"civ": "pers"}]}` — Unlocked in City Phase. Requires "Shipwrights."
- **Effect:** Persian Triremes gain the ability to train Cavalry.

## Persian

- dock

Note: the tech itself carries no modifications — it is the gate on the
Persian cavalry-in-transport units. The Persian arrow and ram warships
(`ship_arrow`, `ship_ram`) always list the two trireme cavalry trainers
(`units/pers/cavalry_axeman_b_trireme`,
`units/pers/cavalry_javelineer_b_trireme`), but those templates have
`Identity/Requirements/Techs = equine_transports`, so they only become
trainable once this tech is researched. The trireme cavalry have the same
stats as the land versions and their own promotion chain
(`…_trireme → …_a_trireme → …_e_trireme`); they let a Persian fleet drop
cavalry raiders on enemy shores without a transport fleet.
