/**
 * Strategos harness: replaces the public maps/scripts/NonVisualTrigger.js in
 * headless matches run by tools/run.sh (the autostart code adds this script
 * to every -autostart-nonvisual game; this mod is mounted last, so its copy
 * wins). Development tooling only: it observes the game and ends it at a
 * time limit, it never changes gameplay before that limit.
 *
 * stdout protocol (one line each, parsed by tools/analyze.py and
 * tools/mapview.py):
 *   [HARNESS] start {"mapSize": <metres>, "limitMin": N, "players": [{"id","civ","team"}...]}
 *   [HARNESS] terrain {"step": <metres>, "rows": ["0122...", ...]}
 *     once at the start: the ground against the water level on a square grid
 *     (rows[j][i] at x = (i + 0.5) * step, z = (j + 0.5) * step): 0 water
 *     deeper than 2 m, 1 shallower water, 2 dry land. Read-only.
 *   [HARNESS] map {"t": <sim s>, "<player id>": [[id,kind,state,x,z], ...], ...}
 *   [HARNESS] eco {"t": <sim s>, "<player id>": {"gathered": {<resource>: n}, "pop": n}, ...}
 *     every minute: cumulative resources gathered (StatisticsTracker basic
 *     statistics) and population, read-only.
 *   [HARNESS] kills {"t": <sim s>, "k": [[t,victimOwner,victimKind,x,z,killerOwner,killerKind], ...], "ids": [victim, ...]}
 *     every 30 s when something died: every entity killed by an attack since
 *     the previous line, with what killed it (kinds as in the map snapshot,
 *     0 for anything else; an arrow kill reads killerKind 5 or 6); "ids"
 *     holds the entity id of each victim, in the order of "k". Recorded
 *     by wrapping Health.prototype.KilledBy, which is called and returns
 *     exactly as before.
 *   [HARNESS] refused {"t": <sim s>, "p": player, "template": name, "x": n, "z": n, "why": message}
 *   [HARNESS] refused {"t": <sim s>, "p": player, "why": "limit"|"requirement"|"cost", "detail": ...}
 *     each construction command the engine did not carry out, which the AI
 *     is not told about: the message of the failed BuildRestrictions check
 *     (terrain, obstruction, territory, distance) with the foundation's
 *     template and position, or the entity limit reached (detail: the
 *     category), the missing requirement (detail: the template) or the
 *     cost the player could not pay (detail: the amounts; this one also
 *     fires for a unit or technology that cannot be paid). Recorded by
 *     wrapping BuildRestrictions.prototype.CheckPlacement,
 *     EntityLimits.prototype.AllowedToBuild,
 *     TechnologyManager.prototype.CanProduce and
 *     Player.prototype.TrySubtractResources, which are called and return
 *     exactly as before.
 *   [HARNESS] standing {"t": <sim s>, "teams": {"<key>": {"players": [ids], "assets": n, "military": n}}}
 *     every 30 s and at the time limit: per side (engine team, or "p<id>" for
 *     a player without team) the summed resource cost of every unit and
 *     structure it owns (foundations at their built fraction) plus its
 *     resource stock; military = the units with Soldier, Siege or Ship.
 *   [HARNESS] resign {"t": <sim s>, "team": key, "players": [ids], "ratio": r}
 *     a side whose assets stayed below HARNESS_RESIGN_RATIO x the strongest
 *     other active side's for HARNESS_RESIGN_HOLD_MS is defeated, as a
 *     player resigning a lost game (0 = never; the standing lines are kept).
 *   [HARNESS] gather {"t": <sim s>, "<player id>": {"<group>|<kind>": {"g","a","r","h","n","wa","wr","wh","d"},
 *       "<group>|idle": s, "<group>|other": s, "<group>|in": s}, ...}
 *     only when HARNESS_GATHER_SAMPLE_MS > 0 (run.py --gather), every
 *     minute (HARNESS_GATHER_REPORT_MS) and at the time limit, for the
 *     interval since the previous line: what every unit with a
 *     ResourceGatherer and a UnitAI did, from a sample every
 *     HARNESS_GATHER_SAMPLE_MS, each sample counting that many
 *     seconds. group: civilian, infantry, cavalry or boat (classes Ship,
 *     Cavalry, Soldier, else civilian). kind: the type of the gather order
 *     ("wood.tree", "food.fruit", ...), "food.field" when the resource is a
 *     field, "food.meat" for a hunt (an Attack order with "hunting"),
 *     "<generic>.*" for a ReturnResource order (the carried type). Seconds
 *     in each phase: g gathering (GATHER.GATHERING), a on the way to the
 *     resource (the other GATHER states: APPROACHING, WALKING,
 *     FINDINGNEWTARGET), r on the way to a dropsite or dropping
 *     (RETURNINGRESOURCE, RETURNRESOURCE), h chasing game; n the returns
 *     completed (a sample in r followed by one that is not); wa, wr, wh the
 *     metres moved between two consecutive samples in the same phase (the
 *     path walked, not the straight line, but missing what is walked
 *     between a phase's last sample and the next phase's first: a walk
 *     of a few seconds reads short by up to a sample interval of
 *     walking); d the seconds spent in g, a, r
 *     or h by the edge distance from the resource (the order's target, the
 *     former target while returning, the animal chased) to the nearest
 *     dropsite of the unit's owner that accepts its type, in bins
 *     [0,5) [5,10) [10,15) [15,20) [20,30) [30,40) [40,60) [60,80)
 *     [80,120) [120,inf) and a last bin for an unknown distance (no
 *     resource, or no such dropsite). idle: seconds in an IDLE state; other:
 *     any other state (building, fighting, walking on an order...); in:
 *     seconds out of the world (garrisoned, aboard). Read-only:
 *     UnitAI states and orders, positions, carried loads and obstruction
 *     distances are read, never changed.
 *   [HARNESS] time limit reached {"t": <sim s>}
 *   [HARNESS] census {"<player id>": {"commands": {<type>: n}, "train": {<template>: units},
 *       "construct": {<template>: n}, "research": {<tech>: n}, "detail": {<type>:<name>: n}}, ...}
 *     once at game end: every command each player issued (AI commands
 *     included, which the replay does not record), counted by type from the
 *     OnPlayerCommand trigger event, with the templates of train / construct
 *     / research commands and the names of formation / stance commands.
 *     Commands the engine later refuses are counted too. Read-only.
 *   [HARNESS] cmd {"turn": n, "p": player, "c": {<the command>}}
 *     only when HARNESS_COMMANDS is set (run.py --commands): every command
 *     of every player as the simulation receives it, in order, from the same
 *     trigger event. The replay (commands.txt) records the commands of human
 *     players only, so this is the one place where the orders of the AIs can
 *     be read turn by turn; tools/identity.py compares two plays on it.
 *     "turn" is the replay's turn number (simulation time / HARNESS_TURN_MS:
 *     commands are flushed before the turn's update advances the timer).
 *     Read-only.
 *   per-player statistics JSON blocks (as the public script), at game end.
 *
 * Map snapshot codes: kind 1 worker, 2 soldier, 3 cavalry, 4 siege,
 * 5 structure, 6 civic centre, 7 ship; state 0 idle, 1 gathering,
 * 2 fighting, 3 other (moving, building...). Positions in metres.
 *
 * A simulation restored from a saved state (a loaded game, the second
 * simulation of the engine's rejoin test) differs from the simulation that
 * was never saved in four ways, which the harness repairs on that path only
 * (a game that is never restored never takes it). It runs one turn, then
 * gives its AIs the full representation of the game
 * (AIInterface.GetFullRepresentation with flushEvents false; the game start
 * calls it with flushEvents true) with that turn's events, and:
 * - the entities changed during the turn stay marked as changed in
 *   AIInterface (sent again next turn, and the serialised states differ):
 *   cleared, as GetRepresentation does every turn;
 * - it describes every entity, also those an AI that ran from the start
 *   never had: without an owner (INVALID_PLAYER: the finished units of a
 *   batch that could not spawn, Trainer.Item.Spawn giving the others their
 *   owner at once), which AIProxy never reports: removed, and their
 *   proxies left as the unsaved game has them;
 * - an entity the AIs knew that is destroyed during the turn is in no
 *   representation, so its Destroy event names an entity the restored AIs
 *   never had (no entityObj, its modifications left in the shared
 *   script): its representation, taken when its owner becomes
 *   INVALID_PLAYER (with the owner it had), is given to the AIs as a
 *   non-enumerable entry of state.entities with a Create event before
 *   that turn's others, so the shared script knows it, then destroys it
 *   as in the unsaved game;
 * - the stock Trainer does not save an item's spawnNotified
 *   (Trainer.Item.SerializableAttributes), so a batch that could not spawn
 *   before the save pushes "Can't find free space to spawn trained units"
 *   again in the restored simulation only (a GUI notification, in the
 *   serialised state): Trainer.Deserialize sets it again as Spawn left it,
 *   on every item that still holds units (those it created and could not
 *   spawn).
 *
 * With HARNESS_FULL_AI_VIEW (run.py --full-ai-view, implied by
 * --rejoin-test) every turn sends the AIs the full representation of every
 * entity they already know (AIProxy.GetFullRepresentation) instead of the
 * changes the engine reported: some changes are never reported (UnitAI
 * rewrites its order queue in several places without
 * MT_UnitAIOrderDataChanged), so the view of an AI depends on the history
 * of the game, while a simulation restored from a saved state starts from
 * the full representation. With it, both see a function of the game state
 * alone. It changes what the AIs see, hence the games; off by default.
 *
 * The resignation ends hopeless games early; it acts only through the
 * defeat of the resigning side, like a resignation in the GUI.
 *
 * At the time limit every active player is marked as won: the game ends
 * cleanly (statistics printed, replay metadata written) without favouring
 * any side; tools/analyze.py reports such a game as a timeout.
 */

const HARNESS_LIMIT_MINUTES = 60;
const HARNESS_MAP_INTERVAL_MS = 30000;
const HARNESS_TERRAIN_STEP = 8;
const HARNESS_ECO_INTERVAL_MS = 60000;
const HARNESS_KILLS_INTERVAL_MS = 30000;
const HARNESS_STANDING_INTERVAL_MS = 30000;
const HARNESS_RESIGN_RATIO = 0;
const HARNESS_RESIGN_HOLD_MS = 120000;
const HARNESS_COMMANDS = 0;
const HARNESS_TURN_MS = 200;
const HARNESS_FULL_AI_VIEW = 0;
const HARNESS_MILITARY_CLASSES = ["Soldier", "Siege", "Ship"];
const HARNESS_GATHER_SAMPLE_MS = 0;
const HARNESS_GATHER_REPORT_MS = 60000;
const HARNESS_GATHER_BINS = [5, 10, 15, 20, 30, 40, 60, 80, 120];

const HARNESS_KINDS = [
	[6, "CivCentre"],
	[7, "Ship"],
	[5, "Structure"],
	[4, "Siege"],
	[3, "Cavalry"],
	[2, "Soldier"],
	[1, "Worker"]
];

Trigger.prototype.HarnessEndGame = function()
{
	if (!this.harnessOnce || Engine.QueryInterface(SYSTEM_ENTITY, IID_PlayerManager).GetActivePlayers().length)
		return;
	this.harnessOnce = false;
	this.HarnessKills();
	print("[HARNESS] census " + JSON.stringify(this.harnessCensus) + "\n");
	for (const player of Engine.GetEntitiesWithInterface(IID_StatisticsTracker))
	{
		const cmpStatisticsTracker = Engine.QueryInterface(player, IID_StatisticsTracker);
		if (cmpStatisticsTracker)
			print(cmpStatisticsTracker.GetStatisticsJSON() + "\n");
	}
};

Trigger.prototype.HarnessCommand = function(data)
{
	const cmd = data.cmd;
	if (!cmd || !cmd.type)
		return;
	if (HARNESS_COMMANDS)
		print("[HARNESS] cmd " + JSON.stringify({
			"turn": Math.round(Engine.QueryInterface(SYSTEM_ENTITY, IID_Timer).GetTime() / HARNESS_TURN_MS),
			"p": data.player, "c": cmd
		}) + "\n");
	const entry = this.harnessCensus[data.player] = this.harnessCensus[data.player] ||
		{ "commands": {}, "train": {}, "construct": {}, "research": {}, "detail": {} };
	entry.commands[cmd.type] = (entry.commands[cmd.type] || 0) + 1;
	if (cmd.type === "train" || cmd.type === "construct" || cmd.type === "research")
		entry[cmd.type][cmd.template] = (entry[cmd.type][cmd.template] || 0) + (cmd.type === "train" ? cmd.count || 1 : 1);
	else if (cmd.type === "formation" || cmd.type === "stance")
	{
		const key = cmd.type + ":" + (cmd.formation || cmd.name);
		entry.detail[key] = (entry.detail[key] || 0) + 1;
	}
};

Trigger.prototype.HarnessStart = function()
{
	const cmpPlayerManager = Engine.QueryInterface(SYSTEM_ENTITY, IID_PlayerManager);
	const players = [];
	for (let id = 1; id < cmpPlayerManager.GetNumPlayers(); ++id)
	{
		const identity = QueryPlayerIDInterface(id, IID_Identity);
		const diplomacy = QueryPlayerIDInterface(id, IID_Diplomacy);
		players.push({
			"id": id,
			"civ": identity ? identity.GetCiv() : "",
			"team": diplomacy ? diplomacy.GetTeam() : -1
		});
	}
	const cmpTerrain = Engine.QueryInterface(SYSTEM_ENTITY, IID_Terrain);
	print("[HARNESS] start " + JSON.stringify({
		"mapSize": cmpTerrain ? cmpTerrain.GetMapSize() : 0,
		"limitMin": HARNESS_LIMIT_MINUTES,
		"players": players
	}) + "\n");
	const cmpWaterManager = Engine.QueryInterface(SYSTEM_ENTITY, IID_WaterManager);
	if (!cmpTerrain || !cmpWaterManager)
		return;
	const step = HARNESS_TERRAIN_STEP;
	const cells = Math.floor(cmpTerrain.GetMapSize() / step);
	const rows = [];
	for (let j = 0; j < cells; ++j)
	{
		let row = "";
		for (let i = 0; i < cells; ++i)
		{
			const x = (i + 0.5) * step;
			const z = (j + 0.5) * step;
			const depth = cmpWaterManager.GetWaterLevel(x, z) - cmpTerrain.GetGroundLevel(x, z);
			row += depth > 2 ? "0" : depth > 0 ? "1" : "2";
		}
		rows.push(row);
	}
	print("[HARNESS] terrain " + JSON.stringify({ "step": step, "rows": rows }) + "\n");
};

Trigger.prototype.HarnessKind = function(ent)
{
	const cmpTemplateManager = Engine.QueryInterface(SYSTEM_ENTITY, IID_TemplateManager);
	const name = cmpTemplateManager.GetCurrentTemplateName(ent) || "";
	const cached = this.harnessKindCache.get(ent);
	if (cached && cached.name === name)
		return cached.kind;
	let kind = 0;
	const template = name ? cmpTemplateManager.GetTemplate(name) : null;
	if (template && template.Identity)
	{
		const classes = (String(template.Identity.Classes && template.Identity.Classes._string || "") + " " +
			String(template.Identity.VisibleClasses && template.Identity.VisibleClasses._string || "")).split(/\s+/);
		for (const [code, cls] of HARNESS_KINDS)
			if (classes.indexOf(cls) !== -1)
			{
				kind = code;
				break;
			}
	}
	this.harnessKindCache.set(ent, { "name": name, "kind": kind });
	return kind;
};

Trigger.prototype.HarnessMapSnapshot = function()
{
	const now = Engine.QueryInterface(SYSTEM_ENTITY, IID_Timer).GetTime() / 1000;
	const per = {};
	for (const ent of Engine.GetEntitiesWithInterface(IID_Position))
	{
		const cmpOwnership = Engine.QueryInterface(ent, IID_Ownership);
		const owner = cmpOwnership ? cmpOwnership.GetOwner() : -1;
		if (owner < 1)
			continue;
		const kind = this.HarnessKind(ent);
		if (!kind)
			continue;
		const cmpPosition = Engine.QueryInterface(ent, IID_Position);
		if (!cmpPosition.IsInWorld())
			continue;
		let state = 0;
		const cmpUnitAI = kind < 5 || kind == 7 ? Engine.QueryInterface(ent, IID_UnitAI) : null;
		if (cmpUnitAI)
		{
			const s = cmpUnitAI.GetCurrentState() || "";
			state = s.indexOf("IDLE") !== -1 ? 0 :
				s.indexOf("GATHER") !== -1 ? 1 :
					s.indexOf("COMBAT") !== -1 || s.indexOf("ATTACK") !== -1 ? 2 : 3;
		}
		const pos = cmpPosition.GetPosition2D();
		(per[owner] = per[owner] || []).push("[" + ent + "," + kind + "," + state + "," +
			Math.round(pos.x) + "," + Math.round(pos.y) + "]");
	}
	let line = "{\"t\":" + now.toFixed(0);
	for (const owner in per)
		line += ",\"" + owner + "\":[" + per[owner].join(",") + "]";
	print("[HARNESS] map " + line + "}\n");
};

Trigger.prototype.HarnessEconomy = function()
{
	const now = Engine.QueryInterface(SYSTEM_ENTITY, IID_Timer).GetTime() / 1000;
	const cmpPlayerManager = Engine.QueryInterface(SYSTEM_ENTITY, IID_PlayerManager);
	const line = { "t": Math.round(now) };
	for (let id = 1; id < cmpPlayerManager.GetNumPlayers(); ++id)
	{
		const cmpStatisticsTracker = QueryPlayerIDInterface(id, IID_StatisticsTracker);
		const cmpPlayer = QueryPlayerIDInterface(id);
		const gathered = {};
		const basic = cmpStatisticsTracker ? cmpStatisticsTracker.GetBasicStatistics().resourcesGathered : {};
		for (const code of Resources.GetCodes())
			gathered[code] = basic[code] || 0;
		line[id] = { "gathered": gathered, "pop": cmpPlayer ? cmpPlayer.GetPopulationCount() : 0 };
	}
	print("[HARNESS] eco " + JSON.stringify(line) + "\n");
};

Trigger.prototype.HarnessRecordKill = function(victim, killer, killerOwner)
{
	const cmpOwnership = Engine.QueryInterface(victim, IID_Ownership);
	const cmpKillerOwnership = Engine.QueryInterface(killer, IID_Ownership);
	if (cmpKillerOwnership && cmpKillerOwnership.GetOwner() != INVALID_PLAYER)
		killerOwner = cmpKillerOwnership.GetOwner();
	const cmpPosition = Engine.QueryInterface(victim, IID_Position);
	const pos = cmpPosition && cmpPosition.IsInWorld() ? cmpPosition.GetPosition2D() : null;
	const now = Engine.QueryInterface(SYSTEM_ENTITY, IID_Timer).GetTime() / 1000;
	this.harnessKills.push("[" + now.toFixed(1) + "," + (cmpOwnership ? cmpOwnership.GetOwner() : -1) + "," +
		this.HarnessKind(victim) + "," + (pos ? Math.round(pos.x) : -1) + "," + (pos ? Math.round(pos.y) : -1) + "," +
		killerOwner + "," + this.HarnessKind(killer) + "]");
	this.harnessKillIds.push(victim);
};

Trigger.prototype.HarnessKills = function()
{
	if (!this.harnessKills.length)
		return;
	const now = Engine.QueryInterface(SYSTEM_ENTITY, IID_Timer).GetTime() / 1000;
	print("[HARNESS] kills {\"t\":" + now.toFixed(0) + ",\"k\":[" + this.harnessKills.join(",") + "],\"ids\":[" +
		this.harnessKillIds.join(",") + "]}\n");
	this.harnessKills = [];
	this.harnessKillIds = [];
};

Trigger.prototype.HarnessSides = function()
{
	const cmpPlayerManager = Engine.QueryInterface(SYSTEM_ENTITY, IID_PlayerManager);
	const sides = {};
	const keyOf = {};
	for (let id = 1; id < cmpPlayerManager.GetNumPlayers(); ++id)
	{
		const cmpPlayer = QueryPlayerIDInterface(id);
		if (!cmpPlayer || cmpPlayer.GetState() !== "active")
			continue;
		const diplomacy = QueryPlayerIDInterface(id, IID_Diplomacy);
		const team = diplomacy ? diplomacy.GetTeam() : -1;
		const key = team === -1 ? "p" + id : String(team);
		keyOf[id] = key;
		const side = sides[key] = sides[key] || { "players": [], "assets": 0, "military": 0 };
		side.players.push(id);
		const stock = cmpPlayer.GetResourceCounts();
		for (const code in stock)
			side.assets += stock[code];
	}
	for (const ent of Engine.GetEntitiesWithInterface(IID_Cost))
	{
		const cmpOwnership = Engine.QueryInterface(ent, IID_Ownership);
		const key = cmpOwnership && keyOf[cmpOwnership.GetOwner()];
		if (!key)
			continue;
		const costs = Engine.QueryInterface(ent, IID_Cost).GetResourceCosts();
		let value = 0;
		for (const code in costs)
			value += costs[code];
		const cmpFoundation = Engine.QueryInterface(ent, IID_Foundation);
		if (cmpFoundation)
			value *= cmpFoundation.GetBuildProgress();
		sides[key].assets += value;
		const cmpIdentity = Engine.QueryInterface(ent, IID_Identity);
		if (cmpIdentity && HARNESS_MILITARY_CLASSES.some(cls => cmpIdentity.HasClass(cls)))
			sides[key].military += value;
	}
	for (const key in sides)
	{
		sides[key].assets = Math.round(sides[key].assets);
		sides[key].military = Math.round(sides[key].military);
	}
	return sides;
};

Trigger.prototype.HarnessStanding = function()
{
	const now = Engine.QueryInterface(SYSTEM_ENTITY, IID_Timer).GetTime();
	const sides = this.HarnessSides();
	print("[HARNESS] standing " + JSON.stringify({ "t": Math.round(now / 1000), "teams": sides }) + "\n");
	if (!(HARNESS_RESIGN_RATIO > 0))
		return;
	for (const key in sides)
	{
		let strongest = 0;
		for (const other in sides)
			if (other !== key)
				strongest = Math.max(strongest, sides[other].assets);
		const ratio = strongest > 0 ? sides[key].assets / strongest : Infinity;
		if (ratio >= HARNESS_RESIGN_RATIO)
		{
			delete this.harnessBehind[key];
			continue;
		}
		if (this.harnessBehind[key] === undefined)
			this.harnessBehind[key] = now;
		if (now - this.harnessBehind[key] < HARNESS_RESIGN_HOLD_MS)
			continue;
		delete this.harnessBehind[key];
		this.HarnessKills();
		print("[HARNESS] resign " + JSON.stringify({ "t": Math.round(now / 1000), "team": key, "players": sides[key].players,
			"ratio": Math.round(ratio * 1000) / 1000 }) + "\n");
		for (const id of sides[key].players)
			QueryPlayerIDInterface(id).SetState("defeated", "%(player)s has resigned (strategos harness).");
		return;
	}
};

/**
 * The gather census: what every unit that can gather is doing, sampled every
 * HARNESS_GATHER_SAMPLE_MS, reported every HARNESS_GATHER_REPORT_MS for the
 * interval just ended (see the protocol in the header). Read-only: it reads
 * UnitAI states and orders, positions, carried loads and obstruction
 * distances, and changes none of them.
 */
Trigger.prototype.HarnessGatherGroup = function(ent)
{
	const cmpIdentity = Engine.QueryInterface(ent, IID_Identity);
	const has = cls => !!cmpIdentity && cmpIdentity.HasClass(cls);
	return has("Ship") ? "boat" : has("Cavalry") ? "cavalry" : has("Soldier") ? "infantry" : "civilian";
};

Trigger.prototype.HarnessGatherPhase = function(state, order)
{
	if (state.indexOf("RETURNINGRESOURCE") !== -1 || state.indexOf("RETURNRESOURCE") !== -1)
		return "r";
	if (state.indexOf("GATHER.GATHERING") !== -1)
		return "g";
	if (state.indexOf("GATHER.") !== -1)
		return "a";
	if (order && order.type == "Attack" && order.data && order.data.hunting)
		return "h";
	if (state.indexOf("IDLE") !== -1)
		return "i";
	return "o";
};

Trigger.prototype.HarnessGatherSample = function()
{
	const cmpObstructionManager = Engine.QueryInterface(SYSTEM_ENTITY, IID_ObstructionManager);
	const dropsites = {};
	for (const ent of Engine.GetEntitiesWithInterface(IID_ResourceDropsite))
	{
		const cmpOwnership = Engine.QueryInterface(ent, IID_Ownership);
		const owner = cmpOwnership ? cmpOwnership.GetOwner() : -1;
		if (owner < 1)
			continue;
		const byType = dropsites[owner] = dropsites[owner] || {};
		for (const type of Engine.QueryInterface(ent, IID_ResourceDropsite).GetTypes())
			(byType[type] = byType[type] || []).push(ent);
	}
	const distances = new Map();
	const haul = (owner, generic, resource) => {
		const key = owner + ":" + generic + ":" + resource;
		if (distances.has(key))
			return distances.get(key);
		let best = -1;
		const cmpPosition = Engine.QueryInterface(resource, IID_Position);
		const candidates = dropsites[owner] && dropsites[owner][generic] || [];
		if (cmpPosition && cmpPosition.IsInWorld())
		{
			const pos = cmpPosition.GetPosition2D();
			for (const dropsite of candidates)
			{
				const distance = cmpObstructionManager.DistanceToPoint(dropsite, pos.x, pos.y);
				if (distance >= 0 && (best < 0 || distance < best))
					best = distance;
			}
		}
		distances.set(key, best);
		return best;
	};
	const fields = new Map();
	const isField = resource => {
		if (!fields.has(resource))
		{
			const cmpIdentity = Engine.QueryInterface(resource, IID_Identity);
			fields.set(resource, !!cmpIdentity && cmpIdentity.HasClass("Field"));
		}
		return fields.get(resource);
	};
	const groups = new Map();
	const seconds = HARNESS_GATHER_SAMPLE_MS / 1000;
	const seen = new Map();
	for (const ent of Engine.GetEntitiesWithInterface(IID_ResourceGatherer))
	{
		const cmpOwnership = Engine.QueryInterface(ent, IID_Ownership);
		const owner = cmpOwnership ? cmpOwnership.GetOwner() : -1;
		const cmpUnitAI = Engine.QueryInterface(ent, IID_UnitAI);
		if (owner < 1 || !cmpUnitAI)
			continue;
		const group = this.harnessGatherGroups.get(ent) || this.HarnessGatherGroup(ent);
		groups.set(ent, group);
		const tally = this.harnessGather[owner] = this.harnessGather[owner] || {};
		const cmpPosition = Engine.QueryInterface(ent, IID_Position);
		if (!cmpPosition || !cmpPosition.IsInWorld())
		{
			tally[group + "|in"] = (tally[group + "|in"] || 0) + seconds;
			continue;
		}
		const pos = cmpPosition.GetPosition2D();
		const order = cmpUnitAI.order;
		const phase = this.HarnessGatherPhase(cmpUnitAI.GetCurrentState() || "", order);
		if (phase == "i" || phase == "o")
		{
			const key = group + "|" + (phase == "i" ? "idle" : "other");
			tally[key] = (tally[key] || 0) + seconds;
			seen.set(ent, { "phase": phase, "x": pos.x, "z": pos.y });
			continue;
		}
		const data = order && order.data || {};
		let generic = data.type && data.type.generic;
		let kind = data.type ? data.type.generic + "." + data.type.specific : null;
		let resource = phase == "r" ? data.formerTarget : data.target;
		if (phase == "h")
		{
			generic = "food";
			kind = "food.meat";
		}
		if (!kind)
		{
			const cmpResourceGatherer = Engine.QueryInterface(ent, IID_ResourceGatherer);
			generic = cmpResourceGatherer && cmpResourceGatherer.GetMainCarryingType();
			kind = generic ? generic + ".*" : "unknown";
			resource = undefined;
		}
		if (resource !== undefined && isField(resource))
			kind = "food.field";
		const key = group + "|" + kind;
		const entry = tally[key] = tally[key] || { "g": 0, "a": 0, "r": 0, "h": 0, "n": 0, "wa": 0, "wr": 0, "wh": 0,
			"d": HARNESS_GATHER_BINS.map(() => 0).concat([0, 0]) };
		entry[phase] += seconds;
		const previous = this.harnessGatherLast.get(ent);
		if (previous)
		{
			if (previous.phase == phase && (phase == "a" || phase == "r" || phase == "h"))
				entry["w" + phase] += Math.sqrt((pos.x - previous.x) * (pos.x - previous.x) + (pos.y - previous.z) * (pos.y - previous.z));
			if (previous.phase == "r" && phase != "r")
				entry.n += 1;
		}
		const distance = resource !== undefined && generic ? haul(owner, generic, resource) : -1;
		let bin = HARNESS_GATHER_BINS.length + 1;
		if (distance >= 0)
		{
			bin = HARNESS_GATHER_BINS.findIndex(edge => distance < edge);
			if (bin < 0)
				bin = HARNESS_GATHER_BINS.length;
		}
		entry.d[bin] += seconds;
		seen.set(ent, { "phase": phase, "x": pos.x, "z": pos.y });
	}
	this.harnessGatherLast = seen;
	this.harnessGatherGroups = groups;
};

Trigger.prototype.HarnessGatherReport = function()
{
	const now = Engine.QueryInterface(SYSTEM_ENTITY, IID_Timer).GetTime() / 1000;
	const line = { "t": Math.round(now) };
	for (const owner in this.harnessGather)
	{
		const tally = this.harnessGather[owner];
		const out = {};
		for (const key of Object.keys(tally).sort())
		{
			const entry = tally[key];
			if (typeof entry == "number")
			{
				out[key] = Math.round(entry);
				continue;
			}
			out[key] = { "g": Math.round(entry.g), "a": Math.round(entry.a), "r": Math.round(entry.r), "h": Math.round(entry.h),
				"n": entry.n, "wa": Math.round(entry.wa), "wr": Math.round(entry.wr), "wh": Math.round(entry.wh),
				"d": entry.d.map(Math.round) };
		}
		line[owner] = out;
	}
	print("[HARNESS] gather " + JSON.stringify(line) + "\n");
	this.harnessGather = {};
};

Trigger.prototype.HarnessTimeLimit = function()
{
	const now = Engine.QueryInterface(SYSTEM_ENTITY, IID_Timer).GetTime() / 1000;
	this.HarnessKills();
	if (HARNESS_GATHER_SAMPLE_MS > 0)
		this.HarnessGatherReport();
	print("[HARNESS] standing " + JSON.stringify({ "t": Math.round(now), "teams": this.HarnessSides() }) + "\n");
	print("[HARNESS] time limit reached " + JSON.stringify({ "t": now }) + "\n");
	const active = Engine.QueryInterface(SYSTEM_ENTITY, IID_PlayerManager).GetActivePlayers();
	Engine.QueryInterface(SYSTEM_ENTITY, IID_EndGameManager).MarkPlayersAsWon(
		active,
		n => "Time limit reached (strategos harness).",
		n => "Time limit reached (strategos harness).");
};

{
	const cmpTrigger = Engine.QueryInterface(SYSTEM_ENTITY, IID_Trigger);
	cmpTrigger.harnessOnce = true;
	cmpTrigger.harnessKindCache = new Map();
	cmpTrigger.harnessKills = [];
	cmpTrigger.harnessKillIds = [];
	cmpTrigger.harnessBehind = {};
	cmpTrigger.harnessCensus = {};
	cmpTrigger.harnessGather = {};
	cmpTrigger.harnessGatherLast = new Map();
	cmpTrigger.harnessGatherGroups = new Map();
	let harnessRestored = false;
	const harnessFallen = new Map();
	const harnessBaseAIDeserialize = AIInterface.prototype.Deserialize;
	AIInterface.prototype.Deserialize = function(data)
	{
		harnessBaseAIDeserialize.call(this, data);
		harnessRestored = true;
	};
	const harnessBaseOwnershipChanged = AIProxy.prototype.OnOwnershipChanged;
	AIProxy.prototype.OnOwnershipChanged = function(msg)
	{
		if (harnessRestored && msg.to == INVALID_PLAYER && msg.from != INVALID_PLAYER)
		{
			const fallen = this.GetFullRepresentation();
			fallen.owner = msg.from;
			harnessFallen.set(msg.entity, fallen);
		}
		return harnessBaseOwnershipChanged.call(this, msg);
	};
	const harnessBaseTrainerDeserialize = Trainer.prototype.Deserialize;
	Trainer.prototype.Deserialize = function(data)
	{
		harnessBaseTrainerDeserialize.call(this, data);
		for (const item of this.queue.values())
			if (item.entities?.length)
				item.spawnNotified = true;
	};
	const harnessBaseFullRepresentation = AIInterface.prototype.GetFullRepresentation;
	AIInterface.prototype.GetFullRepresentation = function(flushEvents)
	{
		const state = harnessBaseFullRepresentation.call(this, flushEvents);
		if (!flushEvents)
		{
			for (const id in this.changedEntities)
			{
				const cmpAIProxy = Engine.QueryInterface(+id, IID_AIProxy);
				if (cmpAIProxy)
					cmpAIProxy.changes = null;
			}
			this.changedEntities = {};
			for (const id in state.entities)
			{
				const cmpOwnership = Engine.QueryInterface(+id, IID_Ownership);
				if (cmpOwnership && cmpOwnership.GetOwner() != INVALID_PLAYER)
					continue;
				delete state.entities[id];
				const cmpAIProxy = Engine.QueryInterface(+id, IID_AIProxy);
				cmpAIProxy.needsFullGet = true;
				cmpAIProxy.changes = null;
			}
			const born = new Set(state.events.Create.map(evt => evt.entity));
			const known = [];
			for (const evt of state.events.Destroy)
			{
				if (!harnessFallen.has(evt.entity) || born.has(evt.entity) || state.entities[evt.entity])
					continue;
				Object.defineProperty(state.entities, evt.entity, { "value": harnessFallen.get(evt.entity), "enumerable": false });
				known.push({ "entity": evt.entity });
			}
			state.events.Create = known.concat(state.events.Create);
		}
		harnessRestored = false;
		harnessFallen.clear();
		return state;
	};
	if (HARNESS_FULL_AI_VIEW)
	{
		const harnessBaseRepresentation = AIInterface.prototype.GetRepresentation;
		AIInterface.prototype.GetRepresentation = function()
		{
			for (const id of Engine.GetEntitiesWithInterface(IID_AIProxy))
			{
				const cmpAIProxy = Engine.QueryInterface(id, IID_AIProxy);
				if (cmpAIProxy.needsFullGet)
					continue;
				cmpAIProxy.changes = cmpAIProxy.GetFullRepresentation();
				this.changedEntities[id] = 1;
			}
			return harnessBaseRepresentation.call(this);
		};
	}
	const harnessBaseKilledBy = Health.prototype.KilledBy;
	Health.prototype.KilledBy = function(attacker, attackerOwner)
	{
		Engine.QueryInterface(SYSTEM_ENTITY, IID_Trigger).HarnessRecordKill(this.entity, attacker, attackerOwner);
		return harnessBaseKilledBy.call(this, attacker, attackerOwner);
	};
	const harnessBaseCheckPlacement = BuildRestrictions.prototype.CheckPlacement;
	BuildRestrictions.prototype.CheckPlacement = function()
	{
		const result = harnessBaseCheckPlacement.call(this);
		if (!result.success)
		{
			const cmpOwnership = Engine.QueryInterface(this.entity, IID_Ownership);
			const cmpPosition = Engine.QueryInterface(this.entity, IID_Position);
			const pos = cmpPosition && cmpPosition.IsInWorld() ? cmpPosition.GetPosition2D() : null;
			const now = Engine.QueryInterface(SYSTEM_ENTITY, IID_Timer).GetTime() / 1000;
			print("[HARNESS] refused " + JSON.stringify({
				"t": +now.toFixed(1), "p": cmpOwnership ? cmpOwnership.GetOwner() : -1,
				"template": Engine.QueryInterface(SYSTEM_ENTITY, IID_TemplateManager).GetCurrentTemplateName(this.entity),
				"x": pos ? Math.round(pos.x) : -1, "z": pos ? Math.round(pos.y) : -1, "why": result.message
			}) + "\n");
		}
		return result;
	};
	const harnessRefusal = function(component, why, detail)
	{
		const cmpPlayer = Engine.QueryInterface(component.entity, IID_Player);
		const now = Engine.QueryInterface(SYSTEM_ENTITY, IID_Timer).GetTime() / 1000;
		print("[HARNESS] refused " + JSON.stringify({
			"t": +now.toFixed(1), "p": cmpPlayer ? cmpPlayer.GetPlayerID() : -1, "why": why, "detail": detail
		}) + "\n");
	};
	const harnessBaseSubtract = Player.prototype.TrySubtractResources;
	Player.prototype.TrySubtractResources = function(amounts)
	{
		const paid = harnessBaseSubtract.call(this, amounts);
		if (!paid)
			harnessRefusal(this, "cost", amounts);
		return paid;
	};
	const harnessBaseAllowedToBuild = EntityLimits.prototype.AllowedToBuild;
	EntityLimits.prototype.AllowedToBuild = function(category)
	{
		const allowed = harnessBaseAllowedToBuild.call(this, category);
		if (!allowed)
			harnessRefusal(this, "limit", category);
		return allowed;
	};
	const harnessBaseCanProduce = TechnologyManager.prototype.CanProduce;
	TechnologyManager.prototype.CanProduce = function(templateName)
	{
		const able = harnessBaseCanProduce.call(this, templateName);
		if (!able)
			harnessRefusal(this, "requirement", templateName);
		return able;
	};
	cmpTrigger.RegisterTrigger("OnPlayerCommand", "HarnessCommand", { "enabled": true });
	cmpTrigger.RegisterTrigger("OnPlayerWon", "HarnessEndGame", { "enabled": true });
	cmpTrigger.RegisterTrigger("OnPlayerDefeated", "HarnessEndGame", { "enabled": true });
	cmpTrigger.DoAfterDelay(0, "HarnessStart", {});
	if (HARNESS_MAP_INTERVAL_MS > 0)
		cmpTrigger.DoRepeatedly(HARNESS_MAP_INTERVAL_MS, "HarnessMapSnapshot", {});
	cmpTrigger.DoRepeatedly(HARNESS_ECO_INTERVAL_MS, "HarnessEconomy", {});
	cmpTrigger.DoRepeatedly(HARNESS_KILLS_INTERVAL_MS, "HarnessKills", {});
	cmpTrigger.DoRepeatedly(HARNESS_STANDING_INTERVAL_MS, "HarnessStanding", {});
	if (HARNESS_GATHER_SAMPLE_MS > 0)
	{
		cmpTrigger.DoRepeatedly(HARNESS_GATHER_SAMPLE_MS, "HarnessGatherSample", {});
		cmpTrigger.DoRepeatedly(HARNESS_GATHER_REPORT_MS, "HarnessGatherReport", {});
	}
	if (HARNESS_LIMIT_MINUTES > 0)
		cmpTrigger.DoAfterDelay(HARNESS_LIMIT_MINUTES * 60 * 1000, "HarnessTimeLimit", {});
}
