/**
 * Strategos harness: makes every game setting of a headless match explicit.
 *
 * The engine loads every file of autostart/ in name order (GameSetup.cpp:
 * "Load the entire folder to allow mods to extend the entrypoint without
 * copying the whole file"), so this file runs after the public
 * cmd_line_args.js and wraps its parseCmdLineArgs. Development tooling only:
 * it sets game settings exactly as the game setup screen would, it never
 * changes gameplay.
 *
 * tools/run.py passes -harness-settings=JSON, an object whose keys are the
 * InitAttributes names the engine writes into the replay's commands.txt
 * (where tools/run.py checks them after the match). Every key must be known
 * here: an unknown key aborts the game start, so a typo cannot silently fall
 * back to a default. Keys are applied in the order of HARNESS_SETTERS,
 * because some settings constrain others (the cap type resets the cap,
 * locked teams make last man standing unavailable). Wonder, relic and
 * regicide settings are kept by the engine only when their victory condition
 * is active; Nomad only on random maps. The last five are options of
 * particular maps (day time, landscape, sea level rise, trigger difficulty,
 * water level): left alone, the engine picks the first two at random.
 */

const HARNESS_SETTERS = [
	["PopulationCapType", (s, v) => s.population.setPopCapType(v)],
	["PopulationCap", (s, v) => s.population.setPopCap(+v)],
	["StartingResources", (s, v) => s.startingResources.setResources(+v)],
	["Ceasefire", (s, v) => s.ceasefire.setValue(+v)],
	["ExploreMap", (s, v) => s.mapExploration.setExplored(!!v)],
	["RevealMap", (s, v) => s.mapExploration.setRevealed(!!v)],
	["AllyView", (s, v) => s.mapExploration.setAllied(!!v)],
	["DisableTreasures", (s, v) => s.disableTreasures.setEnabled(!!v)],
	["DisableSpies", (s, v) => s.disableSpies.setEnabled(!!v)],
	["Nomad", (s, v) => s.nomad.setEnabled(!!v)],
	["LockTeams", (s, v) => s.lockedTeams.setEnabled(!!v)],
	["LastManStanding", (s, v) => s.lastManStanding.setEnabled(!!v)],
	["CheatsEnabled", (s, v) => s.cheats.setEnabled(!!v)],
	["WonderDuration", (s, v) => s.wonder.setDuration(+v)],
	["RelicCount", (s, v) => s.relic.setCount(+v)],
	["RelicDuration", (s, v) => s.relic.setDuration(+v)],
	["RegicideGarrison", (s, v) => s.regicideGarrison.setEnabled(!!v)],
	["gameSpeed", (s, v) => s.gameSpeed.setSpeed(+v)],
	// Options only some maps have; tools/run.py sends them for those maps only.
	["Daytime", (s, v) => s.daytime.setValue(v)],
	["Landscape", (s, v) => s.landscape.setValue(v)],
	["SeaLevelRiseTime", (s, v) => s.seaLevelRise.setValue(+v)],
	["TriggerDifficulty", (s, v) => s.triggerDifficulty.setValue(+v)],
	["waterLevel", (s, v) => { s.waterLevel.value = v; }]
];

const harnessBaseParseCmdLineArgs = parseCmdLineArgs;

parseCmdLineArgs = function(settings, cmdLineArgs)
{
	harnessBaseParseCmdLineArgs(settings, cmdLineArgs);
	if (!("harness-settings" in cmdLineArgs))
		return settings;
	const wanted = JSON.parse(cmdLineArgs["harness-settings"]);
	const known = new Set(HARNESS_SETTERS.map(([key]) => key));
	const unknown = Object.keys(wanted).filter(key => !known.has(key));
	if (unknown.length)
		throw new Error("harness: unknown game setting(s) " + unknown.join(", "));
	for (const [key, set] of HARNESS_SETTERS)
		if (key in wanted)
			set(settings, wanted[key]);
	return settings;
};
