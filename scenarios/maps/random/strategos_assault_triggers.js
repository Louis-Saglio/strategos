/**
 * Strategos scenario "assault": does an army take a civic centre whose
 * defenders are garrisoned?
 *
 * Player 1 (the bot under test) starts with an army beside its civic
 * centre; player 2 has no AI: a civic centre, soldiers garrisoned in it
 * (arrows and capture regeneration) and soldiers standing around it, who
 * fight with the engine's default stance.
 *
 * The case is read from the map name, maps/random/strategos_assault_aA_gG_dD[_rR]:
 *   A soldiers for player 1, the basic infantry citizen-soldiers of its
 *     civ (units/CIV/infantry_KIND_b, mercenaries excluded) in equal shares;
 *   G soldiers garrisoned in player 2's civic centre (its first basic
 *     melee infantry citizen-soldier);
 *   D soldiers of player 2 around its civic centre (same shares as the
 *     army);
 *   R (optional, default 0) rams for player 1 (units/CIV/siege_ram), beside
 *     its army; they count in neither the army nor the give-up rule.
 * A new case is a new .json with a matching name.
 *
 * stdout protocol:
 *   [SCENARIO] start {"scenario","army","garrison","defenders","armyTemplates",...}
 *   [SCENARIO] tick {"t","army","near","points","hp","garrison","defenders"}
 *     every 5 s: army soldiers alive, those within 100 m of the centre,
 *     the centre's capture points per player id, its hitpoints, units
 *     garrisoned in it, defenders alive outside.
 *   [SCENARIO] result {"t","outcome","army","contact",...}
 *     outcome captured | destroyed | repelled; contact is the time the
 *     first army soldier came within 100 m (null if none did).
 *
 * The game ends as soon as the outcome is known: player 2 is defeated by
 * the conquest_civic_centers victory condition when its centre falls
 * (player 1 wins); player 1 is defeated here when a quarter of its army
 * or less is left (player 2 wins). A game that reaches the time limit is
 * an unresolved assault (a timeout for tools/analyze.py), so
 * tools/compare.py scores a batch of this scenario as it scores matches.
 */

const ASSAULT_ATTACKER = 1;
const ASSAULT_DEFENDER = 2;
const ASSAULT_TICK_MS = 5000;
const ASSAULT_NEAR = 100;
const ASSAULT_GIVE_UP = 0.25;

Trigger.prototype.AssaultTemplates = function(player, classes)
{
	const civ = QueryPlayerIDInterface(player, IID_Identity).GetCiv();
	return TriggerHelper.GetTemplateNamesByClasses(classes + "+!Mercenary", civ, undefined, "Basic", true)
		.filter(name => /^units\/[a-z]+\/infantry_[a-z]+_b$/.test(name)).sort();
};

Trigger.prototype.AssaultSpawn = function(source, templates, count, owner)
{
	let entities = [];
	for (let i = 0; i < templates.length; ++i)
	{
		const share = Math.floor(count / templates.length) + (i < count % templates.length ? 1 : 0);
		if (share)
			entities = entities.concat(TriggerHelper.SpawnUnits(source, templates[i], share, owner));
	}
	return entities;
};

Trigger.prototype.AssaultInit = function()
{
	const match = /strategos_assault_a(\d+)_g(\d+)_d(\d+)(?:_r(\d+))?$/.exec(InitAttributes.map);
	if (!match)
		throw new Error("strategos_assault: no case in the map name " + InitAttributes.map);
	const [army, garrison, defenders, rams] = match.slice(1).map(n => +(n || 0));
	const home = TriggerHelper.GetPlayerEntitiesByClass(ASSAULT_ATTACKER, "CivCentre")[0];
	const centre = TriggerHelper.GetPlayerEntitiesByClass(ASSAULT_DEFENDER, "CivCentre")[0];
	const armyTemplates = this.AssaultTemplates(ASSAULT_ATTACKER, "CitizenSoldier+Infantry");
	const defenderTemplates = this.AssaultTemplates(ASSAULT_DEFENDER, "CitizenSoldier+Infantry");
	const garrisonTemplate = this.AssaultTemplates(ASSAULT_DEFENDER, "CitizenSoldier+Infantry+Melee")[0];
	this.assault = {
		"centre": centre,
		"armyStart": army,
		"army": this.AssaultSpawn(home, armyTemplates, army, ASSAULT_ATTACKER),
		"defenders": this.AssaultSpawn(centre, defenderTemplates, defenders, ASSAULT_DEFENDER),
		"contact": null,
		"done": false
	};
	TriggerHelper.SpawnGarrisonedUnits(centre, garrisonTemplate, garrison, ASSAULT_DEFENDER);
	const ramTemplate = "units/" + QueryPlayerIDInterface(ASSAULT_ATTACKER, IID_Identity).GetCiv() + "/siege_ram";
	if (rams && Engine.QueryInterface(SYSTEM_ENTITY, IID_TemplateManager).TemplateExists(ramTemplate))
		TriggerHelper.SpawnUnits(home, ramTemplate, rams, ASSAULT_ATTACKER);
	print("[SCENARIO] start " + JSON.stringify({
		"scenario": "assault",
		"army": army,
		"garrison": garrison,
		"defenders": defenders,
		"rams": rams,
		"armyTemplates": armyTemplates,
		"garrisonTemplate": garrisonTemplate,
		"defenderTemplates": defenderTemplates
	}) + "\n");
};

Trigger.prototype.AssaultAlive = function(entities)
{
	return entities.filter(ent => {
		const cmpHealth = Engine.QueryInterface(ent, IID_Health);
		const cmpOwnership = Engine.QueryInterface(ent, IID_Ownership);
		return cmpHealth && cmpHealth.GetHitpoints() > 0 && cmpOwnership && cmpOwnership.GetOwner() > 0;
	});
};

Trigger.prototype.AssaultState = function()
{
	const s = this.assault;
	s.army = this.AssaultAlive(s.army);
	s.defenders = this.AssaultAlive(s.defenders);
	const cmpCentrePosition = Engine.QueryInterface(s.centre, IID_Position);
	const centrePos = cmpCentrePosition && cmpCentrePosition.IsInWorld() ? cmpCentrePosition.GetPosition2D() : null;
	let near = 0;
	if (centrePos)
		for (const ent of s.army)
		{
			const cmpPosition = Engine.QueryInterface(ent, IID_Position);
			if (cmpPosition && cmpPosition.IsInWorld() && cmpPosition.GetPosition2D().distanceTo(centrePos) <= ASSAULT_NEAR)
				++near;
		}
	const now = Engine.QueryInterface(SYSTEM_ENTITY, IID_Timer).GetTime() / 1000;
	if (near && s.contact === null)
		s.contact = now;
	const cmpCapturable = Engine.QueryInterface(s.centre, IID_Capturable);
	const cmpHealth = Engine.QueryInterface(s.centre, IID_Health);
	const cmpGarrisonHolder = Engine.QueryInterface(s.centre, IID_GarrisonHolder);
	return {
		"t": now,
		"army": s.army.length,
		"near": near,
		"points": cmpCapturable ? cmpCapturable.GetCapturePoints().map(p => Math.round(p)) : [],
		"hp": cmpHealth ? Math.round(cmpHealth.GetHitpoints()) : 0,
		"garrison": cmpGarrisonHolder ? cmpGarrisonHolder.GetEntities().length : 0,
		"defenders": s.defenders.length
	};
};

Trigger.prototype.AssaultResult = function(outcome)
{
	const s = this.assault;
	if (s.done)
		return;
	s.done = true;
	const state = this.AssaultState();
	state.outcome = outcome;
	state.armyStart = s.armyStart;
	state.contact = s.contact;
	print("[SCENARIO] result " + JSON.stringify(state) + "\n");
};

Trigger.prototype.AssaultTick = function()
{
	const s = this.assault;
	if (!s || s.done)
		return;
	const state = this.AssaultState();
	print("[SCENARIO] tick " + JSON.stringify(state) + "\n");
	if (state.army > ASSAULT_GIVE_UP * s.armyStart)
		return;
	this.AssaultResult("repelled");
	TriggerHelper.DefeatPlayer(ASSAULT_ATTACKER, "Assault repelled (strategos scenario).");
};

Trigger.prototype.AssaultOwnershipChanged = function(data)
{
	if (!this.assault || data.entity != this.assault.centre || data.from != ASSAULT_DEFENDER)
		return;
	this.AssaultResult(data.to == INVALID_PLAYER ? "destroyed" : "captured");
};

{
	const cmpTrigger = Engine.QueryInterface(SYSTEM_ENTITY, IID_Trigger);
	cmpTrigger.RegisterTrigger("OnInitGame", "AssaultInit", { "enabled": true });
	cmpTrigger.RegisterTrigger("OnOwnershipChanged", "AssaultOwnershipChanged", { "enabled": true });
	cmpTrigger.DoRepeatedly(ASSAULT_TICK_MS, "AssaultTick", {});
}
