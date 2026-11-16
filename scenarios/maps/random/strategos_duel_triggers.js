/**
 * Strategos scenario "duel": what does a fight between two groups of
 * soldiers cost each side, with nothing else around?
 *
 * No AI plays (both players are `none`). The trigger script fights a list
 * of duels one after the other at the centre of the map, out of reach of
 * every structure: it spawns a group for each player 60 m apart, orders
 * both to attack-walk to the other's place, reports every second, and
 * clears the field when a side is dead or after 120 s. One game is the
 * whole list, so a seed (which draws the two civs) gives every case once.
 *
 * A case is [kind, count, kind, count] for players 1 and 2; a kind is
 *   m  the civ's first basic melee infantry citizen-soldier,
 *   r  its first basic ranged infantry citizen-soldier,
 *   x  half of each (melee in front).
 * A case whose civ lacks the unit is skipped. Player 1 is always the
 * larger side; the sizes run from equal to 8 to 1, with 1.2 and 1.5 to 1
 * to see how safe a narrow superiority is.
 *
 * stdout protocol:
 *   [DUEL] start {"case", "t", "kinds", "sides": [SIDE, SIDE]}
 *     SIDE is what the bot's [FORECAST] line prints for a force, so that
 *     tools/duel.py feeds it to the bot's forecast.js as it is:
 *     {"groups": [[template, count, hit points, ranged, cost, engaged, at]...],
 *      "rates": [[...]...], "fire": [...]}: one group per template, every
 *     unit engaged, nobody arriving; `rates` is what one unit of a group
 *     deals per second to a unit of each group of the other side (best
 *     attack type: damage through the target's resistance, class bonuses,
 *     over the repeat time), as catalog.hitRate() of the bot computes it,
 *     from the unmodified templates; no fire.
 *   [DUEL] tick {"case", "t", "alive": [[...], [...]], "hp": [[...], [...]]}
 *     every second: units alive and hit points left per group of each side.
 *   [DUEL] end {"case", "t", "alive": [n1, n2], "reason": "dead" | "limit"}
 *   [SCENARIO] result {"t", "duels"}
 *
 * The game ends when the list is done: player 2 is defeated (the outcome
 * carries no meaning; tools/duel.py reads the [DUEL] lines).
 */

const DUEL_GAP = 60;
const DUEL_SPACING = 2.5;
const DUEL_FRONT = 12;
const DUEL_LIMIT_MS = 120000;
const DUEL_PAUSE_MS = 4000;
const DUEL_TICK_MS = 1000;
const DUEL_RESISTANCE_BASE = 0.9;
const DUEL_CASES = [
	["m", 10, "m", 10], ["r", 10, "r", 10], ["r", 10, "m", 10], ["m", 10, "r", 10], ["x", 10, "x", 10],
	["m", 30, "m", 30], ["r", 30, "r", 30], ["r", 30, "m", 30], ["m", 30, "r", 30], ["x", 30, "x", 30],
	["m", 60, "m", 60], ["r", 60, "r", 60], ["x", 60, "x", 60],
	["m", 20, "m", 10], ["r", 20, "r", 10], ["r", 20, "m", 10], ["m", 20, "r", 10], ["x", 20, "x", 10],
	["m", 40, "m", 10], ["r", 40, "r", 10], ["r", 40, "m", 10], ["m", 40, "r", 10], ["x", 40, "x", 10],
	["m", 80, "m", 10], ["r", 80, "r", 10], ["r", 80, "m", 10], ["m", 80, "r", 10], ["x", 80, "x", 10],
	["m", 60, "m", 30], ["r", 60, "r", 30], ["x", 60, "x", 30],
	["m", 90, "m", 30], ["r", 90, "r", 30], ["x", 90, "x", 30],
	["m", 36, "m", 30], ["r", 36, "r", 30], ["x", 36, "x", 30],
	["m", 45, "m", 30], ["r", 45, "r", 30], ["x", 45, "x", 30]
];

Trigger.prototype.DuelTemplate = function(player, classes)
{
	const civ = QueryPlayerIDInterface(player, IID_Identity).GetCiv();
	return TriggerHelper.GetTemplateNamesByClasses(classes + "+!Mercenary", civ, undefined, "Basic", true)
		.filter(name => /^units\/[a-z]+\/infantry_[a-z]+_b$/.test(name)).sort()[0];
};

Trigger.prototype.DuelProfile = function(name)
{
	const template = Engine.QueryInterface(SYSTEM_ENTITY, IID_TemplateManager).GetTemplate(name);
	const attacks = [];
	for (const type in template.Attack)
	{
		if (type === "Capture" || type === "Slaughter" || !template.Attack[type].Damage)
			continue;
		const bonuses = [];
		for (const key in template.Attack[type].Bonuses || {})
			bonuses.push({ "classes": template.Attack[type].Bonuses[key].Classes, "multiplier": +template.Attack[type].Bonuses[key].Multiplier || 1 });
		attacks.push({ "damage": template.Attack[type].Damage, "repeat": +template.Attack[type].RepeatTime / 1000, "bonuses": bonuses });
	}
	let cost = 0;
	for (const code in template.Cost.Resources)
		cost += +template.Cost.Resources[code];
	return {
		"name": name,
		"hp": +template.Health.Max,
		"ranged": !!template.Attack.Ranged,
		"cost": cost,
		"classes": GetIdentityClasses(template.Identity),
		"attacks": attacks,
		"resistance": template.Resistance && template.Resistance.Entity && template.Resistance.Entity.Damage || {}
	};
};

Trigger.prototype.DuelRate = function(attacker, target)
{
	let best = 0;
	for (const attack of attacker.attacks)
	{
		let damage = 0;
		for (const kind in attack.damage)
			damage += +attack.damage[kind] * Math.pow(DUEL_RESISTANCE_BASE, +target.resistance[kind] || 0);
		let multiplier = 1;
		for (const bonus of attack.bonuses)
			if (bonus.classes && MatchesClassList(target.classes, bonus.classes))
				multiplier *= bonus.multiplier;
		best = Math.max(best, damage * multiplier / Math.max(0.1, attack.repeat));
	}
	return Math.round(best * 100) / 100;
};

Trigger.prototype.DuelForce = function(player, kind, count)
{
	const melee = this.DuelTemplate(player, "CitizenSoldier+Infantry+Melee");
	const ranged = this.DuelTemplate(player, "CitizenSoldier+Infantry+Ranged");
	const wanted = kind === "m" ? [[melee, count]] : kind === "r" ? [[ranged, count]] :
		[[melee, Math.ceil(count / 2)], [ranged, Math.floor(count / 2)]];
	return wanted.every(entry => !!entry[0]) ? wanted.map(entry => ({ "profile": this.DuelProfile(entry[0]), "count": entry[1], "units": [] })) : null;
};

Trigger.prototype.DuelSpawn = function(force, player, front, direction)
{
	let row = 0;
	for (const group of force)
	{
		for (let i = 0; i < group.count; ++i)
		{
			const column = i % DUEL_FRONT;
			const ent = Engine.AddEntity(group.profile.name);
			const x = front.x - direction * (row + Math.floor(i / DUEL_FRONT)) * DUEL_SPACING;
			const z = front.z + (column - (DUEL_FRONT - 1) / 2) * DUEL_SPACING;
			Engine.QueryInterface(ent, IID_Position).JumpTo(x, z);
			Engine.QueryInterface(ent, IID_Ownership).SetOwner(player);
			group.units.push(ent);
		}
		row += Math.ceil(group.count / DUEL_FRONT);
	}
};

Trigger.prototype.DuelSide = function(force, other)
{
	return {
		"groups": force.map(group => [group.profile.name.replace(/^units\//, ""), group.count, group.count * group.profile.hp,
			group.profile.ranged ? 1 : 0, group.profile.cost, group.count, 0]),
		"rates": force.map(group => other.map(target => this.DuelRate(group.profile, target.profile))),
		"fire": other.map(() => 0)
	};
};

Trigger.prototype.DuelBegin = function()
{
	const s = this.duel;
	while (s.next < DUEL_CASES.length)
	{
		const [kindA, countA, kindB, countB] = DUEL_CASES[s.next];
		const forces = [this.DuelForce(1, kindA, countA), this.DuelForce(2, kindB, countB)];
		s.next += 1;
		if (!forces[0] || !forces[1])
			continue;
		const half = DUEL_GAP / 2;
		const fronts = [{ "x": s.centre.x - half, "z": s.centre.z }, { "x": s.centre.x + half, "z": s.centre.z }];
		this.DuelSpawn(forces[0], 1, fronts[0], 1);
		this.DuelSpawn(forces[1], 2, fronts[1], -1);
		for (const player of [1, 2])
			ProcessCommand(player, {
				"type": "attack-walk",
				"entities": forces[player - 1].reduce((all, group) => all.concat(group.units), []),
				"x": fronts[2 - player].x,
				"z": fronts[2 - player].z,
				"targetClasses": { "attack": ["Unit"] },
				"allowCapture": false,
				"queued": false
			});
		s.current = { "case": s.next - 1, "forces": forces, "started": TriggerHelper.GetTime() };
		s.fought += 1;
		print("[DUEL] start " + JSON.stringify({
			"case": s.current.case,
			"t": s.current.started / 1000,
			"kinds": DUEL_CASES[s.current.case],
			"sides": [this.DuelSide(forces[0], forces[1]), this.DuelSide(forces[1], forces[0])]
		}) + "\n");
		return;
	}
	s.done = true;
	print("[SCENARIO] result " + JSON.stringify({ "t": TriggerHelper.GetTime() / 1000, "duels": s.fought }) + "\n");
	TriggerHelper.DefeatPlayer(2, "Duels done (strategos scenario).");
};

Trigger.prototype.DuelTick = function()
{
	const s = this.duel;
	if (!s || s.done)
		return;
	const now = TriggerHelper.GetTime();
	if (!s.current)
	{
		if (now >= s.resume)
			this.DuelBegin();
		return;
	}
	const alive = [];
	const hp = [];
	for (const force of s.current.forces)
	{
		const counts = [];
		const points = [];
		for (const group of force)
		{
			group.units = group.units.filter(ent => {
				const cmpHealth = Engine.QueryInterface(ent, IID_Health);
				return cmpHealth && cmpHealth.GetHitpoints() > 0;
			});
			counts.push(group.units.length);
			points.push(Math.round(group.units.reduce((sum, ent) => sum + Engine.QueryInterface(ent, IID_Health).GetHitpoints(), 0)));
		}
		alive.push(counts);
		hp.push(points);
	}
	print("[DUEL] tick " + JSON.stringify({ "case": s.current.case, "t": now / 1000, "alive": alive, "hp": hp }) + "\n");
	const left = alive.map(counts => counts.reduce((sum, count) => sum + count, 0));
	const dead = left[0] === 0 || left[1] === 0;
	if (!dead && now - s.current.started < DUEL_LIMIT_MS)
		return;
	print("[DUEL] end " + JSON.stringify({ "case": s.current.case, "t": now / 1000, "alive": left, "reason": dead ? "dead" : "limit" }) + "\n");
	for (const force of s.current.forces)
		for (const group of force)
			for (const ent of group.units)
				Engine.DestroyEntity(ent);
	s.current = null;
	s.resume = now + DUEL_PAUSE_MS;
};

Trigger.prototype.DuelInit = function()
{
	const size = TriggerHelper.GetMapSizeTerrain();
	this.duel = { "centre": { "x": size / 2, "z": size / 2 }, "next": 0, "fought": 0, "current": null, "resume": 0, "done": false };
};

{
	const cmpTrigger = Engine.QueryInterface(SYSTEM_ENTITY, IID_Trigger);
	cmpTrigger.RegisterTrigger("OnInitGame", "DuelInit", { "enabled": true });
	cmpTrigger.DoRepeatedly(DUEL_TICK_MS, "DuelTick", {});
}
