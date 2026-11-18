/**
 * Strategos scenario "harass": what the bot's army does when enemy archers
 * stand just outside the reach of its civic centre and shoot.
 *
 * The map is strategos_battle.js (player 1, the bot under test, with the
 * usual mainland start; player 2 a lone civic centre, no AI). At second
 * HARASS_LAUNCH_S this script spawns A basic archers of player 2 at its
 * centre (units/CIV/infantry_archer_b; a civ without one aborts the game:
 * pin player 2's civ, e.g. -p none:maur:2), sets them to the standground
 * stance and walks them to posts on an arc facing player 2, at the reach of
 * player 1's centre (its ranged attack's maximum range) plus HARASS_MARGIN
 * from its position, HARASS_SPACING apart. There they stay and shoot
 * whatever comes within their own range, as a player harassing a base
 * does. Nothing else is ordered.
 *
 * The case is read from the map name, maps/random/strategos_harass_aA.
 *
 * stdout protocol:
 *   [SCENARIO] start {"scenario","archers","template","post"}: post is the
 *     distance of the posts from player 1's centre.
 *   [SCENARIO] tick {"t","soldiers","civilians","archers","lost",
 *     "civiliansLost","killed","lostValue","killedValue"} every 5 s:
 *     player 1 soldiers and civilians alive (garrisoned included), archers
 *     alive, player 1 soldiers and civilians dead, archers dead, the cost
 *     sums of the dead.
 *   [SCENARIO] result {...tick fields, "outcome"}: outcome repelled when
 *     every archer is dead, endured when HARASS_DURATION_S have passed
 *     since the launch.
 *
 * The game ends at the result: player 2 is defeated either way, so a
 * scenario batch reads as wins; the result line is the measure.
 */

const HARASS_DEFENDER = 1;
const HARASS_ATTACKER = 2;
const HARASS_TICK_MS = 1000;
const HARASS_REPORT_MS = 5000;
const HARASS_LAUNCH_S = 60;
const HARASS_DURATION_S = 180;
const HARASS_MARGIN = 10;
const HARASS_SPACING = 4;

Trigger.prototype.HarassPosition = function(ent)
{
	const cmpPosition = Engine.QueryInterface(ent, IID_Position);
	return cmpPosition && cmpPosition.IsInWorld() ? cmpPosition.GetPosition2D() : null;
};

Trigger.prototype.HarassAlive = function(ent)
{
	const cmpHealth = Engine.QueryInterface(ent, IID_Health);
	const cmpOwnership = Engine.QueryInterface(ent, IID_Ownership);
	return !!cmpHealth && cmpHealth.GetHitpoints() > 0 && !!cmpOwnership && cmpOwnership.GetOwner() > 0;
};

Trigger.prototype.HarassClasses = function(ent)
{
	const cmpIdentity = Engine.QueryInterface(ent, IID_Identity);
	return cmpIdentity ? cmpIdentity.GetClassesList() : [];
};

Trigger.prototype.HarassCost = function(ent)
{
	const cmpCost = Engine.QueryInterface(ent, IID_Cost);
	if (!cmpCost)
		return 0;
	const costs = cmpCost.GetResourceCosts();
	let sum = 0;
	for (const code in costs)
		sum += costs[code];
	return sum;
};

Trigger.prototype.HarassInit = function()
{
	const match = /strategos_harass_a(\d+)$/.exec(InitAttributes.map);
	if (!match)
		throw new Error("strategos_harass: no case in the map name " + InitAttributes.map);
	const civ = QueryPlayerIDInterface(HARASS_ATTACKER, IID_Identity).GetCiv();
	const template = "units/" + civ + "/infantry_archer_b";
	if (!Engine.QueryInterface(SYSTEM_ENTITY, IID_TemplateManager).TemplateExists(template))
		throw new Error("strategos_harass: " + civ + " has no " + template + " (pin player 2's civ)");
	const home = TriggerHelper.GetPlayerEntitiesByClass(HARASS_DEFENDER, "CivCentre")[0];
	const cmpAttack = Engine.QueryInterface(home, IID_Attack);
	const reach = cmpAttack && cmpAttack.GetAttackTypes().indexOf("Ranged") !== -1 ? cmpAttack.GetRange("Ranged").max : 0;
	this.harass = {
		"home": home,
		"base": TriggerHelper.GetPlayerEntitiesByClass(HARASS_ATTACKER, "CivCentre")[0],
		"count": +match[1],
		"template": template,
		"post": reach + HARASS_MARGIN,
		"archers": [],
		"launched": false,
		"done": false,
		"dead": { "soldiers": 0, "civilians": 0, "archers": 0, "lostValue": 0, "killedValue": 0 },
		"lastReport": -Infinity,
		"dying": [],
		"renamed": new Set()
	};
	print("[SCENARIO] start " + JSON.stringify({ "scenario": "harass", "archers": this.harass.count, "template": template,
		"post": this.harass.post }) + "\n");
};

Trigger.prototype.HarassLaunch = function()
{
	const s = this.harass;
	s.launched = true;
	s.archers = TriggerHelper.SpawnUnits(s.base, s.template, s.count, HARASS_ATTACKER);
	const home = this.HarassPosition(s.home);
	const base = this.HarassPosition(s.base);
	const toward = Vector2D.sub(base, home).normalize();
	const across = new Vector2D(-toward.y, toward.x);
	ProcessCommand(HARASS_ATTACKER, { "type": "stance", "entities": s.archers, "name": "standground" });
	s.archers.forEach((ent, i) => {
		const side = (i - (s.archers.length - 1) / 2) * HARASS_SPACING;
		const post = Vector2D.add(Vector2D.add(home, Vector2D.mult(toward, s.post)), Vector2D.mult(across, side));
		ProcessCommand(HARASS_ATTACKER, { "type": "walk", "entities": [ent], "x": post.x, "z": post.y, "queued": false });
	});
};

Trigger.prototype.HarassCountDeaths = function()
{
	const s = this.harass;
	for (const death of s.dying)
	{
		if (s.renamed.has(death.entity))
			continue;
		const soldier = death.classes.indexOf("Soldier") !== -1;
		if (death.from == HARASS_ATTACKER && soldier)
		{
			++s.dead.archers;
			s.dead.killedValue += death.value;
		}
		else if (death.from == HARASS_DEFENDER && soldier)
		{
			++s.dead.soldiers;
			s.dead.lostValue += death.value;
		}
		else if (death.from == HARASS_DEFENDER && death.classes.indexOf("Civilian") !== -1)
			++s.dead.civilians;
	}
	s.dying = [];
};

Trigger.prototype.HarassState = function()
{
	const s = this.harass;
	s.archers = s.archers.filter(ent => this.HarassAlive(ent));
	let soldiers = 0;
	let civilians = 0;
	for (const ent of TriggerHelper.GetEntitiesByPlayer(HARASS_DEFENDER))
	{
		if (!this.HarassAlive(ent))
			continue;
		const classes = this.HarassClasses(ent);
		if (classes.indexOf("Soldier") !== -1)
			++soldiers;
		else if (classes.indexOf("Civilian") !== -1)
			++civilians;
	}
	return {
		"t": Engine.QueryInterface(SYSTEM_ENTITY, IID_Timer).GetTime() / 1000,
		"soldiers": soldiers,
		"civilians": civilians,
		"archers": s.archers.length,
		"lost": s.dead.soldiers,
		"civiliansLost": s.dead.civilians,
		"killed": s.dead.archers,
		"lostValue": s.dead.lostValue,
		"killedValue": s.dead.killedValue
	};
};

Trigger.prototype.HarassResult = function(outcome)
{
	const s = this.harass;
	s.done = true;
	const state = this.HarassState();
	state.outcome = outcome;
	print("[SCENARIO] result " + JSON.stringify(state) + "\n");
	TriggerHelper.DefeatPlayer(HARASS_ATTACKER, "Harass over (strategos scenario).");
};

Trigger.prototype.HarassTick = function()
{
	const s = this.harass;
	if (!s || s.done)
		return;
	this.HarassCountDeaths();
	const now = Engine.QueryInterface(SYSTEM_ENTITY, IID_Timer).GetTime();
	if (!s.launched && now >= HARASS_LAUNCH_S * 1000)
		this.HarassLaunch();
	if (now - s.lastReport < HARASS_REPORT_MS)
		return;
	s.lastReport = now;
	const state = this.HarassState();
	print("[SCENARIO] tick " + JSON.stringify(state) + "\n");
	if (s.launched && !state.archers)
		this.HarassResult("repelled");
	else if (s.launched && now >= (HARASS_LAUNCH_S + HARASS_DURATION_S) * 1000)
		this.HarassResult("endured");
};

Trigger.prototype.HarassOwnershipChanged = function(data)
{
	const s = this.harass;
	if (!s || s.done || data.to != INVALID_PLAYER || data.from <= 0)
		return;
	const classes = this.HarassClasses(data.entity);
	if (classes.indexOf("Unit") !== -1)
		s.dying.push({ "entity": data.entity, "from": data.from, "classes": classes, "value": this.HarassCost(data.entity) });
};

Trigger.prototype.HarassEntityRenamed = function(data)
{
	const s = this.harass;
	if (!s)
		return;
	s.renamed.add(data.entity);
	const index = s.archers.indexOf(data.entity);
	if (index !== -1)
		s.archers[index] = data.newentity;
};

{
	const cmpTrigger = Engine.QueryInterface(SYSTEM_ENTITY, IID_Trigger);
	cmpTrigger.RegisterTrigger("OnInitGame", "HarassInit", { "enabled": true });
	cmpTrigger.RegisterTrigger("OnOwnershipChanged", "HarassOwnershipChanged", { "enabled": true });
	cmpTrigger.RegisterTrigger("OnEntityRenamed", "HarassEntityRenamed", { "enabled": true });
	cmpTrigger.DoRepeatedly(HARASS_TICK_MS, "HarassTick", {});
}
