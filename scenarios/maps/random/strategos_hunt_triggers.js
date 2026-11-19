/**
 * Strategos scenario "hunt": how much meat the bot gets out of a herd of
 * wild animals, and where it kills them.
 *
 * The map is strategos_assault.js (player 1, the bot under test, with the
 * usual mainland start; player 2 a lone civic centre, no AI). At the start
 * this script places a herd of N gaia animals of one template in a clump
 * of HUNT_CLUMP metres, D metres from player 1's civic centre, on the side
 * away from the map centre (so away from player 2), and gives player 1 C
 * more units of the template of its first starting cavalry gatherer, at its
 * centre. Nothing else is ordered: the bot hunts the herd as it would in a
 * game.
 *
 * The case is read from the map name, maps/random/strategos_hunt_<fauna>_nN_dD[_cC]:
 * <fauna> is the end of a gaia/fauna_<fauna> template (deer, horse, camel,
 * boar, elephant_african_bush, ...), C defaults to 0.
 *
 * stdout protocol:
 *   [SCENARIO] start {"scenario","template","animals","distance","cavalry","meat"}:
 *     meat is the herd's total supply.
 *   [SCENARIO] kill {"t","drop","spawn","moved"} at each death of a herd
 *     animal: drop is the distance from the corpse to the centre of the
 *     nearest finished food dropsite of player 1 at that moment, spawn the
 *     distance of the animal's spawn point from that same dropsite, moved
 *     how far the animal is from its spawn point.
 *   [SCENARIO] tick {"t","harvested","alive","corpses","kills","meanDrop",
 *     "delivered","hunters","huntersLost"} every 10 s: harvested is the herd
 *     meat taken out of the animals and corpses (carried included), alive
 *     the herd animals alive, corpses those with meat left, meanDrop the
 *     mean drop of the kills so far, delivered player 1's meat gathered
 *     (statistics: food minus vegetarian food, the starting chickens
 *     included), hunters its living units with a meat rate of 2/s or more,
 *     huntersLost how many of those died.
 *   [SCENARIO] result {...tick fields, "outcome"}: outcome harvested when
 *     the herd's meat is all taken (t is then the harvest time), unfinished
 *     after HUNT_LIMIT_S. With N = 0 there is no herd and the result comes
 *     at HUNT_LIMIT_S: delivered is then the measure (what the bot gets out
 *     of the starting chickens and of whatever it breeds).
 *
 * The game ends at the result: player 2 is defeated either way, so a
 * scenario batch reads as wins; the result line is the measure.
 */

const HUNT_PLAYER = 1;
const HUNT_OTHER = 2;
const HUNT_TICK_MS = 1000;
const HUNT_REPORT_MS = 10000;
const HUNT_LIMIT_S = 480;
const HUNT_CLUMP = 8;
const HUNT_HUNTER_RATE = 2;

Trigger.prototype.HuntPosition = function(ent)
{
	const cmpPosition = Engine.QueryInterface(ent, IID_Position);
	return cmpPosition && cmpPosition.IsInWorld() ? cmpPosition.GetPosition2D() : null;
};

Trigger.prototype.HuntAmount = function(ent)
{
	const cmpResourceSupply = Engine.QueryInterface(ent, IID_ResourceSupply);
	return cmpResourceSupply ? cmpResourceSupply.GetCurrentAmount() : 0;
};

Trigger.prototype.HuntIsHunter = function(ent)
{
	const cmpGatherer = Engine.QueryInterface(ent, IID_ResourceGatherer);
	if (!cmpGatherer)
		return false;
	const rates = cmpGatherer.GetGatherRates();
	return (rates["food.meat"] || 0) >= HUNT_HUNTER_RATE;
};

Trigger.prototype.HuntDropsite = function(position)
{
	let best = null;
	let bestDistance = Infinity;
	for (const ent of TriggerHelper.GetEntitiesByPlayer(HUNT_PLAYER))
	{
		const cmpDropsite = Engine.QueryInterface(ent, IID_ResourceDropsite);
		if (!cmpDropsite || !cmpDropsite.AcceptsType("food") || Engine.QueryInterface(ent, IID_Foundation))
			continue;
		const where = this.HuntPosition(ent);
		if (!where)
			continue;
		const distance = where.distanceTo(position);
		if (distance < bestDistance)
		{
			best = where;
			bestDistance = distance;
		}
	}
	return best;
};

Trigger.prototype.HuntInit = function()
{
	const match = /strategos_hunt_([a-z_]+?)_n(\d+)_d(\d+)(?:_c(\d+))?$/.exec(InitAttributes.map);
	if (!match)
		throw new Error("strategos_hunt: no case in the map name " + InitAttributes.map);
	const template = "gaia/fauna_" + match[1];
	if (!Engine.QueryInterface(SYSTEM_ENTITY, IID_TemplateManager).TemplateExists(template))
		throw new Error("strategos_hunt: no template " + template);
	const home = TriggerHelper.GetPlayerEntitiesByClass(HUNT_PLAYER, "CivCentre")[0];
	const base = TriggerHelper.GetPlayerEntitiesByClass(HUNT_OTHER, "CivCentre")[0];
	const homePosition = this.HuntPosition(home);
	const away = Vector2D.sub(homePosition, this.HuntPosition(base)).normalize();
	const centre = Vector2D.add(homePosition, Vector2D.mult(away, +match[3]));
	const count = +match[2];
	const animals = [];
	let meat = 0;
	for (let i = 0; i < count; ++i)
	{
		const radius = HUNT_CLUMP * Math.sqrt((i + 0.5) / count);
		const angle = i * 2.39996;
		const point = new Vector2D(centre.x + radius * Math.cos(angle), centre.y + radius * Math.sin(angle));
		const ent = Engine.AddEntity(template);
		const cmpPosition = Engine.QueryInterface(ent, IID_Position);
		cmpPosition.JumpTo(point.x, point.y);
		cmpPosition.SetYRotation(angle);
		Engine.QueryInterface(ent, IID_Ownership).SetOwner(0);
		meat += this.HuntAmount(ent);
		animals.push({ "entity": ent, "spawn": point, "alive": true });
	}
	const extra = +(match[4] || 0);
	if (extra)
	{
		const rider = TriggerHelper.GetPlayerEntitiesByClass(HUNT_PLAYER, "Cavalry").find(ent => this.HuntIsHunter(ent));
		if (!rider)
			throw new Error("strategos_hunt: player 1 starts with no cavalry gatherer");
		const riderTemplate = Engine.QueryInterface(SYSTEM_ENTITY, IID_TemplateManager).GetCurrentTemplateName(rider);
		TriggerHelper.SpawnUnits(home, riderTemplate, extra, HUNT_PLAYER);
	}
	this.hunt = {
		"animals": animals,
		"meat": meat,
		"kills": [],
		"huntersLost": 0,
		"dying": [],
		"renamed": new Set(),
		"lastReport": -Infinity,
		"done": false
	};
	print("[SCENARIO] start " + JSON.stringify({ "scenario": "hunt", "template": template, "animals": count,
		"distance": +match[3], "cavalry": extra, "meat": meat }) + "\n");
};

Trigger.prototype.HuntState = function()
{
	const s = this.hunt;
	let left = 0;
	let alive = 0;
	let corpses = 0;
	for (const animal of s.animals)
	{
		const amount = this.HuntAmount(animal.entity);
		left += amount;
		if (animal.alive)
			++alive;
		else if (amount > 0)
			++corpses;
	}
	let hunters = 0;
	for (const ent of TriggerHelper.GetEntitiesByPlayer(HUNT_PLAYER))
		if (this.HuntIsHunter(ent))
			++hunters;
	const cmpStatistics = QueryPlayerIDInterface(HUNT_PLAYER, IID_StatisticsTracker);
	const gathered = cmpStatistics.resourcesGathered;
	const round = value => Math.round(value * 10) / 10;
	return {
		"t": Engine.QueryInterface(SYSTEM_ENTITY, IID_Timer).GetTime() / 1000,
		"harvested": round(s.meat - left),
		"alive": alive,
		"corpses": corpses,
		"kills": s.kills.length,
		"meanDrop": s.kills.length ? round(s.kills.reduce((sum, kill) => sum + kill.drop, 0) / s.kills.length) : null,
		"delivered": round(gathered.food - gathered.vegetarianFood),
		"hunters": hunters,
		"huntersLost": s.huntersLost
	};
};

Trigger.prototype.HuntResult = function(outcome)
{
	const s = this.hunt;
	s.done = true;
	const state = this.HuntState();
	state.outcome = outcome;
	print("[SCENARIO] result " + JSON.stringify(state) + "\n");
	TriggerHelper.DefeatPlayer(HUNT_OTHER, "Hunt over (strategos scenario).");
};

Trigger.prototype.HuntTick = function()
{
	const s = this.hunt;
	if (!s || s.done)
		return;
	for (const entity of s.dying)
		if (!s.renamed.has(entity))
			++s.huntersLost;
	s.dying = [];
	const now = Engine.QueryInterface(SYSTEM_ENTITY, IID_Timer).GetTime();
	const state = this.HuntState();
	if (s.meat > 0 && state.harvested >= s.meat)
	{
		this.HuntResult("harvested");
		return;
	}
	if (now >= HUNT_LIMIT_S * 1000)
	{
		this.HuntResult("unfinished");
		return;
	}
	if (now - s.lastReport < HUNT_REPORT_MS)
		return;
	s.lastReport = now;
	print("[SCENARIO] tick " + JSON.stringify(state) + "\n");
};

Trigger.prototype.HuntEntityRenamed = function(data)
{
	const s = this.hunt;
	if (!s || s.done)
		return;
	const animal = s.animals.find(candidate => candidate.entity == data.entity);
	if (!animal)
	{
		s.renamed.add(data.entity);
		return;
	}
	animal.entity = data.newentity;
	if (!animal.alive)
		return;
	animal.alive = false;
	const corpse = this.HuntPosition(data.newentity);
	const dropsite = corpse && this.HuntDropsite(corpse);
	if (!dropsite)
		return;
	const round = value => Math.round(value * 10) / 10;
	const kill = { "t": Engine.QueryInterface(SYSTEM_ENTITY, IID_Timer).GetTime() / 1000, "drop": round(corpse.distanceTo(dropsite)),
		"spawn": round(animal.spawn.distanceTo(dropsite)), "moved": round(corpse.distanceTo(animal.spawn)) };
	s.kills.push(kill);
	print("[SCENARIO] kill " + JSON.stringify(kill) + "\n");
};

Trigger.prototype.HuntOwnershipChanged = function(data)
{
	const s = this.hunt;
	if (!s || s.done || data.to != INVALID_PLAYER || data.from != HUNT_PLAYER)
		return;
	if (this.HuntIsHunter(data.entity))
		s.dying.push(data.entity);
};

{
	const cmpTrigger = Engine.QueryInterface(SYSTEM_ENTITY, IID_Trigger);
	cmpTrigger.RegisterTrigger("OnInitGame", "HuntInit", { "enabled": true });
	cmpTrigger.RegisterTrigger("OnOwnershipChanged", "HuntOwnershipChanged", { "enabled": true });
	cmpTrigger.RegisterTrigger("OnEntityRenamed", "HuntEntityRenamed", { "enabled": true });
	cmpTrigger.DoRepeatedly(HUNT_TICK_MS, "HuntTick", {});
}
