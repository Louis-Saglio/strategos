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
 *   [HARNESS] time limit reached {"t": <sim s>}
 *   per-player statistics JSON blocks (as the public script), at game end.
 *
 * Map snapshot codes: kind 1 worker, 2 soldier, 3 cavalry, 4 siege,
 * 5 structure, 6 civic centre, 7 ship; state 0 idle, 1 gathering,
 * 2 fighting, 3 other (moving, building...). Positions in metres.
 *
 * At the time limit every active player is marked as won: the game ends
 * cleanly (statistics printed, replay metadata written) without favouring
 * any side; tools/analyze.py reports such a game as a timeout.
 */

const HARNESS_LIMIT_MINUTES = 60;
const HARNESS_MAP_INTERVAL_MS = 30000;
const HARNESS_ECO_INTERVAL_MS = 60000;

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

Trigger.prototype.HarnessTimeLimit = function()
{
	const now = Engine.QueryInterface(SYSTEM_ENTITY, IID_Timer).GetTime() / 1000;
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
	cmpTrigger.RegisterTrigger("OnPlayerWon", "HarnessEndGame", { "enabled": true });
	cmpTrigger.RegisterTrigger("OnPlayerDefeated", "HarnessEndGame", { "enabled": true });
	cmpTrigger.DoAfterDelay(0, "HarnessStart", {});
	if (HARNESS_MAP_INTERVAL_MS > 0)
		cmpTrigger.DoRepeatedly(HARNESS_MAP_INTERVAL_MS, "HarnessMapSnapshot", {});
	cmpTrigger.DoRepeatedly(HARNESS_ECO_INTERVAL_MS, "HarnessEconomy", {});
	if (HARNESS_LIMIT_MINUTES > 0)
		cmpTrigger.DoAfterDelay(HARNESS_LIMIT_MINUTES * 60 * 1000, "HarnessTimeLimit", {});
}
