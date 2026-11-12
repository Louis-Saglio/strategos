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
 *   [HARNESS] map {"t": <sim s>, "<player id>": [[id,kind,state,x,z], ...], ...}
 *   [HARNESS] eco {"t": <sim s>, "<player id>": {"gathered": {<resource>: n}, "pop": n}, ...}
 *     every minute: cumulative resources gathered (StatisticsTracker basic
 *     statistics) and population, read-only.
 *   [HARNESS] kills {"t": <sim s>, "k": [[t,victimOwner,victimKind,x,z,killerOwner,killerKind], ...]}
 *     every 30 s when something died: every entity killed by an attack since
 *     the previous line, with what killed it (kinds as in the map snapshot,
 *     0 for anything else; an arrow kill reads killerKind 5 or 6). Recorded
 *     by wrapping Health.prototype.KilledBy, which is called and returns
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
 *   [HARNESS] time limit reached {"t": <sim s>}
 *   per-player statistics JSON blocks (as the public script), at game end.
 *
 * Map snapshot codes: kind 1 worker, 2 soldier, 3 cavalry, 4 siege,
 * 5 structure, 6 civic centre, 7 ship; state 0 idle, 1 gathering,
 * 2 fighting, 3 other (moving, building...). Positions in metres.
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
const HARNESS_ECO_INTERVAL_MS = 60000;
const HARNESS_KILLS_INTERVAL_MS = 30000;
const HARNESS_STANDING_INTERVAL_MS = 30000;
const HARNESS_RESIGN_RATIO = 0;
const HARNESS_RESIGN_HOLD_MS = 120000;
const HARNESS_MILITARY_CLASSES = ["Soldier", "Siege", "Ship"];

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
	for (const player of Engine.GetEntitiesWithInterface(IID_StatisticsTracker))
	{
		const cmpStatisticsTracker = Engine.QueryInterface(player, IID_StatisticsTracker);
		if (cmpStatisticsTracker)
			print(cmpStatisticsTracker.GetStatisticsJSON() + "\n");
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
};

Trigger.prototype.HarnessKills = function()
{
	if (!this.harnessKills.length)
		return;
	const now = Engine.QueryInterface(SYSTEM_ENTITY, IID_Timer).GetTime() / 1000;
	print("[HARNESS] kills {\"t\":" + now.toFixed(0) + ",\"k\":[" + this.harnessKills.join(",") + "]}\n");
	this.harnessKills = [];
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

Trigger.prototype.HarnessTimeLimit = function()
{
	const now = Engine.QueryInterface(SYSTEM_ENTITY, IID_Timer).GetTime() / 1000;
	this.HarnessKills();
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
	cmpTrigger.harnessBehind = {};
	const harnessBaseKilledBy = Health.prototype.KilledBy;
	Health.prototype.KilledBy = function(attacker, attackerOwner)
	{
		Engine.QueryInterface(SYSTEM_ENTITY, IID_Trigger).HarnessRecordKill(this.entity, attacker, attackerOwner);
		return harnessBaseKilledBy.call(this, attacker, attackerOwner);
	};
	cmpTrigger.RegisterTrigger("OnPlayerWon", "HarnessEndGame", { "enabled": true });
	cmpTrigger.RegisterTrigger("OnPlayerDefeated", "HarnessEndGame", { "enabled": true });
	cmpTrigger.DoAfterDelay(0, "HarnessStart", {});
	if (HARNESS_MAP_INTERVAL_MS > 0)
		cmpTrigger.DoRepeatedly(HARNESS_MAP_INTERVAL_MS, "HarnessMapSnapshot", {});
	cmpTrigger.DoRepeatedly(HARNESS_ECO_INTERVAL_MS, "HarnessEconomy", {});
	cmpTrigger.DoRepeatedly(HARNESS_KILLS_INTERVAL_MS, "HarnessKills", {});
	cmpTrigger.DoRepeatedly(HARNESS_STANDING_INTERVAL_MS, "HarnessStanding", {});
	if (HARNESS_LIMIT_MINUTES > 0)
		cmpTrigger.DoAfterDelay(HARNESS_LIMIT_MINUTES * 60 * 1000, "HarnessTimeLimit", {});
}
