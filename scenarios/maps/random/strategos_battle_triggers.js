/**
 * Strategos scenario "battle": does the bot's army beat an attacking wave,
 * even outnumbered?
 *
 * The map is strategos_battle.js: player 1 (the bot under test) has the
 * usual mainland start and a woodline with a storehouse ~110 m out toward
 * player 2, player 2 a lone civic centre. Player 2 has no AI:
 * this script plays its army the way Petra's attack plans fight
 * (simulation/ai/petra/attackPlan.js, state "" update), re-written here:
 *   - the wave attack-walks to player 1's civic centre (units and
 *     structures, walls avoided, capture allowed);
 *   - every tick, an attacker that is idle, whose target is gone, or whose
 *     target already has more than 3 attackers (8 for heroes and siege, 5
 *     for champions) picks a new unit target among player 1's units within
 *     60 m (melee), 90 m (cavalry) or 30 m + its range (ranged), ranked by
 *     100 if it holds a bonus against the target, 50 if the target is a
 *     Support unit, minus the distance; melee infantry ignore fleeing
 *     civilians; over-subscribed targets are skipped while the attacker is
 *     more than 50 m from the civic centre;
 *   - an attacker targeting a structure or a support unit, or a ranged one
 *     targeting a ranged unit, retaliates against a player 1 melee soldier
 *     within 8 m (Petra reacts to Attacked events; triggers have none);
 *   - with no unit in range, it attacks a structure in range (the civic
 *     centre first), else keeps attack-walking.
 *
 * The case is read from the map name,
 * maps/random/strategos_battle_dD_aA[_cC][_w][_lL]:
 *   D soldiers for player 1, spawned at its civic centre at the start (the
 *     basic infantry citizen-soldiers of its civ, units/CIV/infantry_KIND_b,
 *     mercenaries excluded, in equal shares) on top of its starting units;
 *     the bot puts them to work like any citizen soldier; with _w they are
 *     spawned at the woodline's storehouse instead and ordered to cut its
 *     trees (spread over the nearest ones), so the wave meets them there;
 *   A infantry for player 2 (same rule, its civ), C (default 0) basic
 *     citizen cavalry of its civ (units/CIV/cavalry_KIND_b) in equal shares;
 *   L (default 90) the second at which the wave leaves player 2's centre.
 *
 * stdout protocol:
 *   [SCENARIO] start {"scenario","defenders","attackers","cavalry","launch",
 *     "defenderTemplates","attackerTemplates"}
 *   [SCENARIO] tick {"t","soldiers","civilians","attackers","near",
 *     "lost","killed","civiliansLost","lostValue","killedValue"} every 5 s:
 *     player 1 soldiers and civilians alive (garrisoned included), attackers
 *     alive, attackers within 100 m of player 1's centre, player 1 soldiers
 *     and civilians dead, attackers dead, and the cost sums of the dead.
 *   [SCENARIO] result {...tick fields, "outcome", "contact"}: outcome held |
 *     overrun; contact is the time an attacker first came within 100 m.
 *
 * The game ends as soon as the outcome is known: the wave is beaten (held,
 * player 2 defeated) when 10 % of it or less is left; player 1 is overrun
 * (defeated) when its civic centre changes owner or is destroyed. A game
 * that reaches the time limit is a timeout for tools/analyze.py.
 */

const BATTLE_DEFENDER = 1;
const BATTLE_ATTACKER = 2;
const BATTLE_TICK_MS = 1000;
const BATTLE_REPORT_MS = 5000;
const BATTLE_NEAR = 100;
const BATTLE_HELD = 0.1;
const BATTLE_TARGET_RADIUS = 50;
const BATTLE_RETALIATE = 8;
const BATTLE_WALK_CLASSES = { "attack": ["Unit", "Structure"], "avoid": ["Palisade", "Wall", "Fortress"] };

Trigger.prototype.BattleTemplates = function(player, classes, pattern)
{
	const civ = QueryPlayerIDInterface(player, IID_Identity).GetCiv();
	return TriggerHelper.GetTemplateNamesByClasses(classes + "+!Mercenary", civ, undefined, "Basic", true)
		.filter(name => pattern.test(name)).sort();
};

Trigger.prototype.BattleSpawn = function(source, templates, count, owner)
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

Trigger.prototype.BattleCost = function(ent)
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

Trigger.prototype.BattleInit = function()
{
	const match = /strategos_battle_d(\d+)_a(\d+)(?:_c(\d+))?(_w)?(?:_l(\d+))?$/.exec(InitAttributes.map);
	if (!match)
		throw new Error("strategos_battle: no case in the map name " + InitAttributes.map);
	const [defenders, attackers, cavalry, woodline, launch] = [+match[1], +match[2], +(match[3] || 0), !!match[4],
		match[5] === undefined ? undefined : +match[5]];
	const home = TriggerHelper.GetPlayerEntitiesByClass(BATTLE_DEFENDER, "CivCentre")[0];
	const base = TriggerHelper.GetPlayerEntitiesByClass(BATTLE_ATTACKER, "CivCentre")[0];
	const infantry = /^units\/[a-z]+\/infantry_[a-z]+_b$/;
	const defenderTemplates = this.BattleTemplates(BATTLE_DEFENDER, "CitizenSoldier+Infantry", infantry);
	const attackerTemplates = this.BattleTemplates(BATTLE_ATTACKER, "CitizenSoldier+Infantry", infantry);
	const cavalryTemplates = this.BattleTemplates(BATTLE_ATTACKER, "CitizenSoldier+Cavalry", /^units\/[a-z]+\/cavalry_[a-z]+_b$/);
	const camp = woodline ? this.BattleWoodline(home) : null;
	const spawned = this.BattleSpawn(camp ? camp.storehouse : home, defenderTemplates, defenders, BATTLE_DEFENDER);
	if (camp)
		spawned.forEach((ent, i) => ProcessCommand(BATTLE_DEFENDER, {
			"type": "gather", "entities": [ent], "target": camp.trees[i % camp.trees.length], "queued": false
		}));
	const wave = this.BattleSpawn(base, attackerTemplates, attackers, BATTLE_ATTACKER)
		.concat(this.BattleSpawn(base, cavalryTemplates, cavalry || 0, BATTLE_ATTACKER));
	this.battle = {
		"home": home,
		"wave": wave,
		"waveStart": wave.length,
		"launch": (launch === undefined ? 90 : launch) * 1000,
		"launched": false,
		"contact": null,
		"done": false,
		"dead": { "soldiers": 0, "civilians": 0, "attackers": 0, "lostValue": 0, "killedValue": 0 },
		"lastReport": -Infinity,
		"dying": [],
		"renamed": new Set()
	};
	print("[SCENARIO] start " + JSON.stringify({
		"scenario": "battle",
		"defenders": defenders,
		"attackers": attackers,
		"cavalry": cavalry || 0,
		"woodline": woodline,
		"launch": this.battle.launch / 1000,
		"defenderTemplates": defenderTemplates,
		"attackerTemplates": attackerTemplates,
		"cavalryTemplates": cavalry ? cavalryTemplates : []
	}) + "\n");
};

Trigger.prototype.BattleWoodline = function(home)
{
	const homePos = this.BattlePosition(home);
	let storehouse = null;
	let farthest = -1;
	for (const ent of TriggerHelper.GetPlayerEntitiesByClass(BATTLE_DEFENDER, "Storehouse"))
	{
		const position = this.BattlePosition(ent);
		if (position && position.distanceTo(homePos) > farthest)
		{
			storehouse = ent;
			farthest = position.distanceTo(homePos);
		}
	}
	if (!storehouse)
		throw new Error("strategos_battle: no woodline storehouse for player " + BATTLE_DEFENDER);
	const camp = this.BattlePosition(storehouse);
	const trees = [];
	for (const ent of TriggerHelper.GetEntitiesByPlayer(0))
	{
		const cmpSupply = Engine.QueryInterface(ent, IID_ResourceSupply);
		const position = this.BattlePosition(ent);
		if (cmpSupply && position && cmpSupply.GetType().generic === "wood" && position.distanceTo(camp) <= 45)
			trees.push({ "id": ent, "distance": position.distanceTo(camp) });
	}
	trees.sort((a, b) => a.distance - b.distance || a.id - b.id);
	return { "storehouse": storehouse, "trees": trees.slice(0, 16).map(tree => tree.id) };
};

Trigger.prototype.BattleAlive = function(ent)
{
	const cmpHealth = Engine.QueryInterface(ent, IID_Health);
	const cmpOwnership = Engine.QueryInterface(ent, IID_Ownership);
	return !!cmpHealth && cmpHealth.GetHitpoints() > 0 && !!cmpOwnership && cmpOwnership.GetOwner() > 0;
};

Trigger.prototype.BattlePosition = function(ent)
{
	const cmpPosition = Engine.QueryInterface(ent, IID_Position);
	return cmpPosition && cmpPosition.IsInWorld() ? cmpPosition.GetPosition2D() : null;
};

Trigger.prototype.BattleClasses = function(ent)
{
	const cmpIdentity = Engine.QueryInterface(ent, IID_Identity);
	return cmpIdentity ? cmpIdentity.GetClassesList() : [];
};

Trigger.prototype.BattleCounters = function(ent, targetClasses)
{
	const cmpAttack = Engine.QueryInterface(ent, IID_Attack);
	if (!cmpAttack)
		return false;
	for (const type of cmpAttack.GetAttackTypes())
	{
		const bonuses = cmpAttack.GetAttackEffectsData(type).Bonuses;
		for (const key in bonuses || {})
			if (+bonuses[key].Multiplier > 1 && MatchesClassList(targetClasses, bonuses[key].Classes))
				return true;
	}
	return false;
};

Trigger.prototype.BattleRange = function(ent, classes)
{
	const cmpAttack = Engine.QueryInterface(ent, IID_Attack);
	if (cmpAttack && cmpAttack.GetAttackTypes().indexOf("Ranged") !== -1)
		return 30 + cmpAttack.GetRange("Ranged").max;
	return classes.indexOf("FastMoving") !== -1 ? 90 : 60;
};

Trigger.prototype.BattleOrderTarget = function(ent)
{
	const cmpUnitAI = Engine.QueryInterface(ent, IID_UnitAI);
	const orders = cmpUnitAI ? cmpUnitAI.GetOrderData() : [];
	return orders.length && orders[0] && orders[0].target !== undefined ? orders[0].target : undefined;
};

Trigger.prototype.BattleCommand = function(ent, command)
{
	ProcessCommand(BATTLE_ATTACKER, Object.assign({ "entities": [ent], "queued": false }, command));
};

Trigger.prototype.BattleControl = function(now)
{
	const s = this.battle;
	const homePos = this.BattlePosition(s.home);
	if (!homePos)
		return;
	const units = [];
	const structures = [];
	for (const ent of TriggerHelper.GetEntitiesByPlayer(BATTLE_DEFENDER))
	{
		const position = this.BattlePosition(ent);
		if (!position || !this.BattleAlive(ent))
			continue;
		const classes = this.BattleClasses(ent);
		if (classes.indexOf("Unit") !== -1)
		{
			const cmpUnitAI = Engine.QueryInterface(ent, IID_UnitAI);
			units.push({ "id": ent, "position": position, "classes": classes,
				"fleeing": !!cmpUnitAI && cmpUnitAI.GetCurrentState().indexOf("FLEEING") !== -1 });
		}
		else if (classes.indexOf("Structure") !== -1 && Engine.QueryInterface(ent, IID_Capturable))
			structures.push({ "id": ent, "position": position, "centre": ent === s.home });
	}
	const byId = new Map(units.map(unit => [unit.id, unit]));
	const subscribed = new Map();
	for (const ent of s.wave)
	{
		const target = this.BattleOrderTarget(ent);
		const unit = target !== undefined && byId.get(target);
		if (!unit)
			continue;
		if (!subscribed.has(target))
			subscribed.set(target, unit.classes.indexOf("Hero") !== -1 || unit.classes.indexOf("Siege") !== -1 ? -8 :
				unit.classes.indexOf("Champion") !== -1 ? -5 : -3);
		subscribed.set(target, subscribed.get(target) + 1);
	}
	for (const ent of s.wave)
	{
		const position = this.BattlePosition(ent);
		if (!position)
			continue;
		const classes = this.BattleClasses(ent);
		const ranged = classes.indexOf("Ranged") !== -1;
		const cmpUnitAI = Engine.QueryInterface(ent, IID_UnitAI);
		const targetId = this.BattleOrderTarget(ent);
		const target = targetId !== undefined ? byId.get(targetId) : undefined;
		const targetIsStructure = targetId !== undefined && structures.some(structure => structure.id === targetId);
		if (target && target.classes.indexOf("Support") !== -1 || targetIsStructure || ranged && target && target.classes.indexOf("Ranged") !== -1)
		{
			let closest = null;
			let closestDistance = BATTLE_RETALIATE;
			for (const unit of units)
			{
				if (unit.classes.indexOf("Soldier") === -1 || unit.classes.indexOf("Melee") === -1)
					continue;
				const distance = unit.position.distanceTo(position);
				if (distance < closestDistance)
				{
					closest = unit;
					closestDistance = distance;
				}
			}
			if (closest)
			{
				this.BattleCommand(ent, { "type": "attack", "target": closest.id, "allowCapture": false });
				continue;
			}
		}
		let update = cmpUnitAI.IsIdle() || targetId !== undefined && !target && !targetIsStructure;
		if (!update && target && (subscribed.get(targetId) || 0) > 0)
		{
			update = true;
			subscribed.set(targetId, subscribed.get(targetId) - 1);
		}
		if (!update)
			continue;
		const range = this.BattleRange(ent, classes);
		const nearTarget = position.distanceTo(homePos) <= BATTLE_TARGET_RADIUS;
		const ignoresFleeing = classes.indexOf("FastMoving") === -1 && !ranged;
		let best = null;
		let bestScore = -Infinity;
		for (const unit of units)
		{
			const distance = unit.position.distanceTo(position);
			if (distance > range || ignoresFleeing && unit.fleeing && unit.classes.indexOf("Civilian") !== -1)
				continue;
			const vetoed = (subscribed.get(unit.id) || 0) > 0;
			if (vetoed && !nearTarget)
				continue;
			const score = (unit.classes.indexOf("Support") !== -1 ? 50 : 0) + (this.BattleCounters(ent, unit.classes) ? 100 : 0) -
				distance - (vetoed ? 20000 : 0);
			if (score > bestScore || score === bestScore && best && unit.id < best.id)
			{
				best = unit;
				bestScore = score;
			}
		}
		if (best)
		{
			this.BattleCommand(ent, { "type": "attack", "target": best.id, "allowCapture": false });
			subscribed.set(best.id, (subscribed.get(best.id) || (best.classes.indexOf("Champion") !== -1 ? -5 : -3)) + 1);
			continue;
		}
		if (!nearTarget)
		{
			if (cmpUnitAI.IsIdle() || targetId !== undefined)
				this.BattleCommand(ent, { "type": "attack-walk", "x": homePos.x, "z": homePos.y,
					"targetClasses": BATTLE_WALK_CLASSES, "allowCapture": true });
			continue;
		}
		const inRange = structures.filter(structure => structure.position.distanceTo(position) <= range)
			.sort((a, b) => (b.centre ? 1 : 0) - (a.centre ? 1 : 0) || a.id - b.id);
		if (inRange.length)
			this.BattleCommand(ent, { "type": "attack", "target": inRange[0].id, "allowCapture": true });
	}
};

Trigger.prototype.BattleState = function()
{
	const s = this.battle;
	s.wave = s.wave.filter(ent => this.BattleAlive(ent));
	let soldiers = 0;
	let civilians = 0;
	for (const ent of TriggerHelper.GetEntitiesByPlayer(BATTLE_DEFENDER))
	{
		if (!this.BattleAlive(ent))
			continue;
		const classes = this.BattleClasses(ent);
		if (classes.indexOf("Soldier") !== -1)
			++soldiers;
		else if (classes.indexOf("Civilian") !== -1)
			++civilians;
	}
	const homePos = this.BattlePosition(s.home);
	let near = 0;
	if (homePos)
		for (const ent of s.wave)
		{
			const position = this.BattlePosition(ent);
			if (position && position.distanceTo(homePos) <= BATTLE_NEAR)
				++near;
		}
	const now = Engine.QueryInterface(SYSTEM_ENTITY, IID_Timer).GetTime() / 1000;
	if (near && s.contact === null)
		s.contact = now;
	return {
		"t": now,
		"soldiers": soldiers,
		"civilians": civilians,
		"attackers": s.wave.length,
		"near": near,
		"lost": s.dead.soldiers,
		"civiliansLost": s.dead.civilians,
		"killed": s.dead.attackers,
		"lostValue": s.dead.lostValue,
		"killedValue": s.dead.killedValue
	};
};

Trigger.prototype.BattleResult = function(outcome)
{
	const s = this.battle;
	if (s.done)
		return;
	s.done = true;
	this.BattleCountDeaths();
	const state = this.BattleState();
	state.outcome = outcome;
	state.waveStart = s.waveStart;
	state.contact = s.contact;
	print("[SCENARIO] result " + JSON.stringify(state) + "\n");
};

Trigger.prototype.BattleTick = function()
{
	const s = this.battle;
	if (!s || s.done)
		return;
	this.BattleCountDeaths();
	const now = Engine.QueryInterface(SYSTEM_ENTITY, IID_Timer).GetTime();
	if (now >= s.launch)
	{
		s.launched = true;
		this.BattleControl(now);
	}
	if (now - s.lastReport >= BATTLE_REPORT_MS)
	{
		s.lastReport = now;
		const state = this.BattleState();
		print("[SCENARIO] tick " + JSON.stringify(state) + "\n");
		if (s.launched && state.attackers <= BATTLE_HELD * s.waveStart)
		{
			this.BattleResult("held");
			TriggerHelper.DefeatPlayer(BATTLE_ATTACKER, "Wave beaten (strategos scenario).");
		}
	}
};

Trigger.prototype.BattleOwnershipChanged = function(data)
{
	const s = this.battle;
	if (!s || s.done)
		return;
	if (data.entity == s.home && data.from == BATTLE_DEFENDER)
	{
		this.BattleResult("overrun");
		TriggerHelper.DefeatPlayer(BATTLE_DEFENDER, "Overrun (strategos scenario).");
		return;
	}
	if (data.to != INVALID_PLAYER || data.from <= 0)
		return;
	const classes = this.BattleClasses(data.entity);
	if (classes.indexOf("Unit") !== -1)
		s.dying.push({ "entity": data.entity, "from": data.from, "classes": classes, "value": this.BattleCost(data.entity) });
};

Trigger.prototype.BattleCountDeaths = function()
{
	const s = this.battle;
	for (const death of s.dying)
	{
		if (s.renamed.has(death.entity))
			continue;
		const soldier = death.classes.indexOf("Soldier") !== -1;
		if (death.from == BATTLE_ATTACKER && soldier)
		{
			++s.dead.attackers;
			s.dead.killedValue += death.value;
		}
		else if (death.from == BATTLE_DEFENDER && soldier)
		{
			++s.dead.soldiers;
			s.dead.lostValue += death.value;
		}
		else if (death.from == BATTLE_DEFENDER && death.classes.indexOf("Civilian") !== -1)
			++s.dead.civilians;
	}
	s.dying = [];
};

Trigger.prototype.BattleEntityRenamed = function(data)
{
	const s = this.battle;
	if (!s)
		return;
	s.renamed.add(data.entity);
	const index = s.wave.indexOf(data.entity);
	if (index !== -1)
		s.wave[index] = data.newentity;
};

{
	const cmpTrigger = Engine.QueryInterface(SYSTEM_ENTITY, IID_Trigger);
	cmpTrigger.RegisterTrigger("OnInitGame", "BattleInit", { "enabled": true });
	cmpTrigger.RegisterTrigger("OnOwnershipChanged", "BattleOwnershipChanged", { "enabled": true });
	cmpTrigger.RegisterTrigger("OnEntityRenamed", "BattleEntityRenamed", { "enabled": true });
	cmpTrigger.DoRepeatedly(BATTLE_TICK_MS, "BattleTick", {});
}
