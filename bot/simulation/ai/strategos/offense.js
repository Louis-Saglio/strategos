import { PATIENCE_MS, REPORT_MS } from "simulation/ai/strategos/cadence.js";
import { squareDistance } from "simulation/ai/strategos/world.js";
import { GATHER_EFFICIENCY, captureOutlook, resourcePrices } from "simulation/ai/strategos/valuation.js";
import { prospect } from "simulation/ai/strategos/forecast.js";

const RALLY_FRACTION = 0.35;
const RALLY_MAX_DISTANCE = 120;
const RALLY_RADIUS = 30;
const RALLY_QUORUM = 0.8;
const RALLY_TIMEOUT_MS = 45000;
const HOME_RADIUS = 50;
const RETREAT_FRACTION = 0.25;
const COMMIT_MS = 10000;
const FRONT_MIN = 3;
const PRIZE_HORIZON_S = 60;
const ASSAULT_RADIUS = 80;
const ASSAULT_ENTER_SHARE = 0.1;
const ASSAULT_EXIT_SHARE = 0.25;
const COVER_MARGIN = 8;
const TARGET_DISTANCE_SCALE = 200;
const TARGET_WEIGHTS = { "centre": 3, "defensive": 2, "other": 1 };
const HOLD_MARGIN = 2;
const HOLD_RADIUS = 80;
const MOVING_STATES = ["COMBAT", "WALKING", "APPROACHING", "CHASING", "CAPTURE", "ATTACK"];
const STORM_MIN_ARMY = 30;
const STORM_SUPERIORITY = 2;
const TARGET_CLASSES = { "attack": ["Unit", "Structure"], "avoid": ["Palisade", "Wall"] };
const UNIT_CLASSES = { "attack": ["Unit"], "avoid": ["Palisade", "Wall"] };

export class Offense
{
	constructor(catalog, telemetry)
	{
		this.catalog = catalog;
		this.telemetry = telemetry;
		this.mode = "home";
		this.army = new Set();
		this.launchSize = 0;
		this.since = 0;
		this.target = null;
		this.rally = null;
		this.assaulting = false;
		this.resistance = null;
		this.attacked = new Set();
		this.region = 0;
		this.base = null;
		this.overseas = false;
	}

	requests(world, priorities)
	{
		const home = world.centres[0];
		if (!home)
			return [];
		if (!world.enemyStructures.length && world.enemyTargets.length)
			return this.mopUpRequests(world, priorities);
		const holding = this.holdRequests(world, priorities);
		const held = new Set(holding.filter(request => request.action.type === "garrison").map(request => request.action.unit));
		return holding.concat(this.armyRequests(world, priorities, home, held), this.breakerRequests(world, priorities, home),
			this.strayRequests(world, priorities, home, held));
	}

	strayRequests(world, priorities, home, held)
	{
		return world.fighters
			.filter(fighter => fighter.region === world.homeRegion && !this.army.has(fighter.id) && !held.has(fighter.id) &&
				fighter.state.includes("COMBAT") && !world.ownSide(fighter.position))
			.map(fighter => this.order(fighter, { "type": "walk", "x": home.position[0], "z": home.position[1] }, priorities));
	}

	mopUpRequests(world, priorities)
	{
		const requests = [];
		for (const fighter of world.fighters)
		{
			if (MOVING_STATES.some(state => fighter.state.includes(state)))
				continue;
			let best = null;
			let nearest = Infinity;
			for (const target of world.enemyTargets)
			{
				const distance = squareDistance(target.position, fighter.position);
				if (target.region === fighter.region && distance < nearest)
				{
					best = target;
					nearest = distance;
				}
			}
			if (best)
				requests.push(this.order(fighter, { "type": "attack-walk", "x": best.position[0], "z": best.position[1],
					"targetClasses": best.unit ? UNIT_CLASSES : TARGET_CLASSES }, priorities));
		}
		if (requests.length && !this.mopping)
		{
			this.mopping = true;
			this.telemetry.line("ATTACK", world.time, { "mode": "mopup", "units": requests.length, "left": world.enemyTargets.length });
		}
		return requests;
	}

	beachhead(world, priorities, group, region, reserve)
	{
		const plan = priorities.offense.beachhead;
		const defenders = world.enemyFighters.filter(enemy => world.regionOf(enemy.position) === region).length;
		const holding = group.length < plan.superiority * defenders && reserve.length >= plan.reserve;
		if (holding !== (this.held === region))
		{
			this.held = holding ? region : null;
			this.telemetry.line("ATTACK", world.time, { "mode": holding ? "beachhead" : "advance", "army": group.length, "defenders": defenders,
				"reserve": reserve.length });
		}
		return holding;
	}

	stormRequests(world, priorities, group, region)
	{
		const centre = this.armyCentre(group);
		const target = world.enemyStructures.filter(structure => structure.region === region)
			.map(structure => ({ structure, "distance": squareDistance(structure.position, centre) }))
			.sort((a, b) => (a.structure.fire.arrows > 0 ? 1 : 0) - (b.structure.fire.arrows > 0 ? 1 : 0) || a.distance - b.distance ||
				a.structure.id - b.structure.id)
			.map(entry => entry.structure)[0];
		if (!target)
			return [];
		if (this.stormed !== target.id)
		{
			this.stormed = target.id;
			this.telemetry.line("ATTACK", world.time, { "mode": "storm", "target": target.id, "centre": target.centre, "army": group.length,
				"enemySoldiers": world.enemySoldiers });
		}
		return group.map(member => member.target === target.id ? this.order(member, { "type": "hold" }, priorities) :
			this.order(member, { "type": "attack", "target": target.id }, priorities));
	}

	holdRequests(world, priorities)
	{
		const requests = [];
		const taken = new Set();
		for (const structure of world.decaying)
		{
			if (!this.attacked.has(structure.id))
				continue;
			const pending = world.fighters.filter(fighter => fighter.state.includes("GARRISON") && fighter.target === structure.id);
			let regen = structure.regen + pending.reduce((sum, fighter) => sum + fighter.capture * structure.garrisonRegenRate, 0);
			const need = structure.decayRate + HOLD_MARGIN;
			if (regen >= need)
				continue;
			const chosen = [];
			if (structure.arrows)
			{
				const room = structure.free - pending.length;
				const near = world.fighters
					.filter(member => this.army.has(member.id) && !taken.has(member.id) && !member.state.includes("GARRISON") &&
						MatchesClassList(member.classes, structure.classes) &&
						squareDistance(member.position, structure.position) <= HOLD_RADIUS * HOLD_RADIUS)
					.sort((a, b) => squareDistance(a.position, structure.position) - squareDistance(b.position, structure.position) || a.id - b.id);
				for (const member of near)
				{
					if (regen >= need || chosen.length >= room)
						break;
					regen += member.capture * structure.garrisonRegenRate;
					chosen.push(member);
				}
			}
			if (regen >= need)
			{
				for (const member of chosen)
				{
					taken.add(member.id);
					requests.push(this.order(member, { "type": "garrison", "target": structure.id }, priorities));
				}
				this.telemetry.line("ATTACK", world.time, { "mode": "hold", "structure": structure.id, "units": chosen.length });
				continue;
			}
			if (pending.length)
				continue;
			this.telemetry.line("ATTACK", world.time, { "mode": "raze", "structure": structure.id });
			requests.push({
				"source": "offense",
				"action": { "type": "delete", "target": structure.id },
				"claims": { "slots": ["garrison-" + structure.id] },
				"value": priorities.values.offense,
				"urgency": 1
			});
		}
		return requests;
	}

	breakerRequests(world, priorities, home)
	{
		const requests = [];
		const plan = priorities.offense.breakers;
		const wanted = Math.min(plan.max, Math.floor(world.fighters.length / plan.perSoldiers));
		const trains = trainer => trainer.trainable.some(name => this.catalog.isBreaker(name));
		const trainer = world.trainers.find(candidate => candidate.queueLength === 0 && trains(candidate));
		if (trainer && !world.trainers.some(candidate => candidate.queueLength > 0 && trains(candidate)) && world.breakers.length < wanted)
		{
			const template = trainer.trainable.filter(name => this.catalog.isBreaker(name))
				.sort((a, b) => this.catalog.costSum(a) - this.catalog.costSum(b) || (a < b ? -1 : 1))[0];
			requests.push({
				"source": "offense",
				"action": { "type": "train", "trainer": trainer.id, "template": template, "count": 1 },
				"claims": { "resources": this.catalog.cost(template), "population": this.catalog.population(template), "slots": [trainer.id] },
				"value": priorities.values.support,
				"urgency": 1,
				"reserve": true
			});
		}
		if (this.mode === "home" || this.overseas)
			return requests;
		const moving = breaker => MOVING_STATES.some(state => breaker.state.includes(state));
		for (const breaker of world.breakers)
		{
			let action = { "type": "hold" };
			if (this.mode === "attack" && breaker.target !== this.target.id)
				action = { "type": "attack", "target": this.target.id };
			else if (this.mode === "rally" && !moving(breaker))
				action = { "type": "walk", "x": this.rally[0], "z": this.rally[1] };
			else if (this.mode === "return" && !moving(breaker))
				action = { "type": "walk", "x": home.position[0], "z": home.position[1] };
			requests.push(this.order(breaker, action, priorities));
		}
		return requests;
	}

	armyRequests(world, priorities, home, held)
	{
		if (this.mode !== "home" && this.overseas)
			for (const fighter of world.fighters)
				if (fighter.region === this.region && !this.army.has(fighter.id))
				{
					this.army.add(fighter.id);
					this.launchSize += 1;
				}
		let members = world.fighters.filter(fighter => this.army.has(fighter.id));
		this.army = new Set(members.map(fighter => fighter.id));
		if (this.mode === "home")
			return this.launch(world, priorities, home);
		if (this.mode === "attack" && !this.overseas && this.reinforce(world, priorities, members, home))
			members = world.fighters.filter(fighter => this.army.has(fighter.id));
		home = { "position": this.base };
		const free = members.filter(member => !held.has(member.id) && !member.state.includes("GARRISON"));
		const reason = this.mode !== "return" && this.retreatReason(world, priorities, free, home);
		if (reason)
			this.switchMode(world, "return", Object.assign({
				"alive": members.length, "launched": this.launchSize, "reason": reason, "threats": world.threats.length
			}, reason === "outmatched" ? {
				"defenders": this.adverse.defenders, "coming": this.adverse.coming, "cost": Math.round(this.adverse.cost), "gain": Math.round(this.adverse.gain)
			} : {}));
		if (this.mode === "rally")
			return this.rallyRequests(world, priorities, free);
		if (this.mode === "attack")
			return this.attackRequests(world, priorities, free, home);
		return this.returnRequests(world, priorities, free, home);
	}

	reinforce(world, priorities, members, home)
	{
		const plan = priorities.offense.reinforce;
		if (!priorities.guard.holds || !members.length || !world.enemyStructures.some(structure => structure.id === this.target.id))
			return false;
		const joiners = world.fighters.filter(fighter => fighter.region === world.homeRegion && !this.army.has(fighter.id) &&
			!priorities.guard.ids.has(fighter.id) && !fighter.state.includes("COMBAT"));
		if (joiners.length < plan.min)
			return false;
		const whole = members.concat(joiners);
		const outlook = this.worth(world, priorities, whole, this.target, home.position, this.forgone(world, joiners),
			this.superiority(world, priorities, whole));
		if (!outlook.worth)
			return false;
		for (const fighter of joiners)
			this.army.add(fighter.id);
		this.launchSize += joiners.length;
		this.telemetry.line("ATTACK", world.time, Object.assign({ "mode": "reinforce", "army": whole.length, "joined": joiners.length },
			this.described(outlook)));
		return true;
	}

	switchMode(world, mode, details)
	{
		this.mode = mode;
		this.since = world.time;
		this.assaulting = false;
		this.telemetry.line("ATTACK", world.time, Object.assign({ "mode": mode, "army": this.army.size }, details || {}));
	}

	coverFire(world, target)
	{
		let arrows = target.fire.arrows;
		let strongest = target.fire;
		for (const other of world.enemyStructures)
		{
			if (other.id === target.id || !other.fire.arrows)
				continue;
			const reach = other.range + COVER_MARGIN;
			if (squareDistance(other.position, target.position) > reach * reach)
				continue;
			arrows += other.fire.arrows;
			if (other.fire.arrows > strongest.arrows)
				strongest = other.fire;
		}
		return { "arrows": arrows, "repeat": strongest.repeat, "damage": strongest.damage };
	}

	outlookOf(world, members, target)
	{
		const expected = this.expected(target);
		return captureOutlook(members, Object.assign({}, expected, { "fire": this.coverFire(world, expected) }));
	}

	feasible(world, priorities, members, target, margin)
	{
		if (!target.points)
			return false;
		if (target.centre && world.breakers.length >= priorities.offense.breakers.launch)
			return true;
		return this.outlookOf(world, members, target).reach >= margin * target.points;
	}

	armyValue(members)
	{
		return members.reduce((sum, member) => sum + this.catalog.costSum(member.template), 0);
	}

	prize(world, priorities, members, target)
	{
		if (target.centre && world.breakers.length >= priorities.offense.breakers.launch)
			return target.value;
		const net = this.outlookOf(world, members, target).power - this.expected(target).regen;
		return net > 0 ? target.value * Math.min(1, PRIZE_HORIZON_S * net / Math.max(1, target.points)) : 0;
	}

	plan(priorities, reach, massed)
	{
		const exchange = priorities.offense.exchange;
		return { "reach": reach, "response": exchange.response, "reaction": exchange.reaction, "massed": massed,
			"horizonS": massed ? exchange.dominance.horizonS : undefined };
	}

	attrition(world, priorities)
	{
		const plan = priorities.offense.exchange.attrition;
		let gathering = 0;
		for (const code of world.codes)
			gathering += world.gatherers[code];
		return Math.min(plan.max, Math.max(plan.min, world.enemyGatherers / Math.max(1, gathering)));
	}

	gatherRate(worker)
	{
		const rates = worker.profile.rates;
		if (worker.kind)
			return rates[worker.kind] || 0;
		let rate = Infinity;
		for (const kind in rates)
			if (kind.startsWith(worker.gathering + ".") && rates[kind] > 0)
				rate = Math.min(rate, rates[kind]);
		return isFinite(rate) ? rate : 0;
	}

	forgone(world, members)
	{
		const prices = resourcePrices(world);
		const working = new Map();
		for (const worker of world.workers)
			if (worker.soldier && worker.gathering && prices[worker.gathering] !== undefined)
				working.set(worker.id, GATHER_EFFICIENCY * this.gatherRate(worker) * prices[worker.gathering]);
		let income = 0;
		let speed = 0;
		for (const member of members)
		{
			income += working.get(member.id) || 0;
			speed += this.catalog.combat(member.template).speed / members.length;
		}
		return { "income": income, "speed": Math.max(1, speed) };
	}

	superiority(world, priorities, members)
	{
		const whole = prospect(this.catalog, members, this.armyCentre(members), world.enemyFighters, [],
			Object.assign(this.plan(priorities, Infinity, true), { "hidden": world.enemyHidden, "handicap": priorities.offense.exchange.handicap }));
		return { "cost": whole.cost, "gain": whole.gain, "opposing": whole.opposing, "ratio": whole.cost > 0 ? whole.gain / whole.cost : Infinity };
	}

	worth(world, priorities, members, target, from, forgone, field)
	{
		const exchange = priorities.offense.exchange;
		const distance = Math.sqrt(squareDistance(target.position, from));
		const walk = distance / forgone.speed;
		const outlook = prospect(this.catalog, members, target.position, world.enemyFighters, world.enemyStructures,
			Object.assign(this.plan(priorities, exchange.reach.launch + distance),
				{ "prey": world.enemyCivilians, "preyReach": exchange.reach.launch, "lead": walk, "handicap": exchange.handicap,
					"muster": world.enemyMuster }));
		outlook.prize = this.prize(world, priorities, members, target);
		outlook.trip = forgone.income * 2 * walk;
		outlook.army = this.armyValue(members);
		outlook.attrition = this.attrition(world, priorities);
		outlook.field = field;
		outlook.dominant = field.ratio >= priorities.margin * outlook.attrition;
		outlook.worth = outlook.dominant && outlook.cost <= exchange.maxCost * outlook.army ||
			outlook.gain + outlook.prize >= priorities.margin * outlook.attrition * (outlook.cost + outlook.trip);
		return outlook;
	}

	described(outlook)
	{
		return {
			"defenders": outlook.defenders, "prey": outlook.prey, "coming": outlook.coming, "recruits": outlook.recruits,
			"cost": Math.round(outlook.cost || 0),
			"gain": Math.round(outlook.gain || 0),
			"prize": Math.round(outlook.prize || 0), "trip": Math.round(outlook.trip || 0), "dominant": !!outlook.dominant,
			"attrition": outlook.attrition === undefined ? undefined : Math.round(outlook.attrition * 100) / 100,
			"field": outlook.field ? [Math.round(outlook.field.cost), Math.round(outlook.field.gain), Math.round(outlook.field.opposing)] : undefined,
			"armyValue": Math.round(outlook.army || 0)
		};
	}

	outmatched(world, priorities, members)
	{
		if (!members.length)
			return null;
		const exchange = priorities.offense.exchange;
		const front = members.filter(member => member.state.includes("COMBAT"));
		const outlook = prospect(this.catalog, members, this.armyCentre(front.length >= FRONT_MIN ? front : members), world.enemyFighters,
			world.enemyStructures, Object.assign(this.plan(priorities, exchange.reach.fight), { "prey": world.enemyCivilians }));
		const prize = this.assaulting ? this.prize(world, priorities, members, this.target) : 0;
		return outlook.cost >= exchange.minCost * this.armyValue(members) &&
			outlook.gain + prize < this.attrition(world, priorities) * outlook.cost / priorities.margin ? outlook : null;
	}

	chooseTarget(world, priorities, members, from, region, gated)
	{
		const ranked = [];
		for (const target of world.enemyStructures)
		{
			if (target.region !== region || !this.feasible(world, priorities, members, target, priorities.margin))
				continue;
			const weight = target.centre ? TARGET_WEIGHTS.centre : target.fire.arrows ? TARGET_WEIGHTS.defensive : TARGET_WEIGHTS.other;
			const score = weight * target.value / (1 + Math.sqrt(squareDistance(target.position, from)) / TARGET_DISTANCE_SCALE);
			if (score > 0)
				ranked.push({ target, score });
		}
		ranked.sort((a, b) => b.score - a.score || a.target.id - b.target.id);
		if (!gated)
			return ranked.length ? ranked[0].target : null;
		const forgone = this.forgone(world, members);
		const field = this.superiority(world, priorities, members);
		this.refused = null;
		for (const { target } of ranked.slice(0, priorities.offense.targetsTried))
		{
			const outlook = this.worth(world, priorities, members, target, from, forgone, field);
			if (outlook.worth)
			{
				this.outlook = outlook;
				return target;
			}
			this.refused = this.refused || { "target": target.id, "army": members.length, "outlook": outlook };
		}
		return null;
	}

	launch(world, priorities, home)
	{
		const offense = priorities.offense;
		this.refused = null;
		if (!priorities.guard.holds || !world.enemyTargets.length)
			return [];
		const groups = new Map();
		for (const fighter of world.fighters)
		{
			if (fighter.region === world.homeRegion && fighter.state.includes("COMBAT") || priorities.guard.ids.has(fighter.id))
				continue;
			if (!groups.has(fighter.region))
				groups.set(fighter.region, []);
			groups.get(fighter.region).push(fighter);
		}
		const regions = [...groups.keys()].sort((a, b) =>
			(b === world.homeRegion) - (a === world.homeRegion) || groups.get(b).length - groups.get(a).length || a - b);
		let available = null;
		let target = null;
		let base = null;
		let storm = null;
		for (const region of regions)
		{
			const group = groups.get(region);
			if (group.length < offense.minArmy)
				continue;
			if (region !== world.homeRegion && this.beachhead(world, priorities, group, region, groups.get(world.homeRegion) || []))
				continue;
			const origin = region === world.homeRegion ? home.position : this.armyCentre(group);
			const found = this.chooseTarget(world, priorities, group, origin, region, region === world.homeRegion);
			if (!found && !storm && region !== world.homeRegion && !world.breakers.length && group.length >= STORM_MIN_ARMY &&
			    group.length >= STORM_SUPERIORITY * world.enemySoldiers)
				storm = { group, region };
			if (!found)
				continue;
			available = group;
			target = found;
			base = origin;
			this.region = region;
			break;
		}
		if (!target && this.refused && this.telemetry.due("ATTACK-wait", world.time, REPORT_MS))
			this.telemetry.line("ATTACK", world.time, Object.assign({ "mode": "wait", "army": this.refused.army, "target": this.refused.target,
				"enemySoldiers": world.enemySoldiers }, this.described(this.refused.outlook)));
		if (!target)
			return storm ? this.stormRequests(world, priorities, storm.group, storm.region) : [];
		this.base = base;
		this.overseas = this.region !== world.homeRegion;
		this.target = target;
		this.attacked.add(target.id);
		this.resistance = null;
		const dx = target.position[0] - base[0];
		const dz = target.position[1] - base[1];
		const length = Math.sqrt(dx * dx + dz * dz) || 1;
		const step = Math.min(RALLY_MAX_DISTANCE, RALLY_FRACTION * length);
		this.rally = [base[0] + dx / length * step, base[1] + dz / length * step];
		this.army = new Set(available.map(fighter => fighter.id));
		this.launchSize = this.army.size;
		this.switchMode(world, "rally", Object.assign({
			"target": target.id, "value": target.value, "centre": target.centre, "enemySoldiers": world.enemySoldiers
		}, this.overseas ? {} : this.described(this.outlook)));
		return this.rallyRequests(world, priorities, available);
	}

	retreatReason(world, priorities, members, home)
	{
		if (!this.overseas && !priorities.guard.holds && priorities.guard.value >= priorities.offense.recall * this.armyValue(members))
			return "alarm";
		if (!this.overseas && members.length < this.launchSize * RETREAT_FRACTION)
			return "losses";
		if (!this.overseas && this.mode === "attack" && world.time - this.since >= COMMIT_MS)
		{
			this.adverse = this.outmatched(world, priorities, members);
			if (this.adverse)
				return "outmatched";
		}
		if (this.mode === "attack" && !world.enemyStructures.some(structure => structure.id === this.target.id) &&
			!this.retarget(world, priorities, members))
			return "done";
		return null;
	}

	armyCentre(members)
	{
		const centre = [0, 0];
		for (const member of members)
		{
			centre[0] += member.position[0] / members.length;
			centre[1] += member.position[1] / members.length;
		}
		return centre;
	}

	retarget(world, priorities, members)
	{
		if (!members.length)
			return false;
		const target = this.chooseTarget(world, priorities, members, this.armyCentre(members), this.region);
		if (!target)
			return false;
		this.target = target;
		this.attacked.add(target.id);
		this.assaulting = false;
		this.resistance = { "id": this.target.id, "regen": 0, "arrows": 0 };
		this.telemetry.line("ATTACK", world.time, { "mode": "retarget", "target": this.target.id, "value": target.value, "centre": target.centre });
		return true;
	}

	expected(target)
	{
		const seen = this.resistance;
		if (!seen || seen.id !== target.id)
			return target;
		return Object.assign({}, target, {
			"regen": Math.max(target.regen, seen.regen),
			"fire": Object.assign({}, target.fire, { "arrows": Math.max(target.fire.arrows, seen.arrows) })
		});
	}

	order(member, action, priorities)
	{
		return {
			"source": "offense",
			"action": Object.assign({ "unit": member.id }, action),
			"claims": { "workers": [member.id] },
			"value": priorities.values.offense,
			"urgency": 1
		};
	}

	rallyRequests(world, priorities, members)
	{
		const limit = RALLY_RADIUS * RALLY_RADIUS;
		const arrived = members.filter(member => squareDistance(member.position, this.rally) <= limit).length;
		if (arrived >= RALLY_QUORUM * members.length || world.time - this.since >= RALLY_TIMEOUT_MS)
		{
			this.switchMode(world, "attack", { "arrived": arrived });
			this.resistance = { "id": this.target.id, "regen": 0, "arrows": 0 };
			return this.attackRequests(world, priorities, members, { "position": this.base });
		}
		return members.map(member => squareDistance(member.position, this.rally) <= limit ?
			this.order(member, { "type": "hold" }, priorities) :
			this.order(member, { "type": "walk", "x": this.rally[0], "z": this.rally[1] }, priorities));
	}

	exposure(world, position)
	{
		for (const structure of world.enemyStructures)
		{
			if (!structure.fire.arrows || structure.id === this.target.id)
				continue;
			const reach = structure.range + COVER_MARGIN;
			if (squareDistance(structure.position, position) <= reach * reach)
				return structure;
		}
		return null;
	}

	attackRequests(world, priorities, members, home)
	{
		const limit = ASSAULT_RADIUS * ASSAULT_RADIUS;
		const defenders = new Set(world.enemyFighters
			.filter(enemy => squareDistance(enemy.position, this.target.position) <= limit)
			.map(enemy => enemy.id));
		let target = world.enemyStructures.find(candidate => candidate.id === this.target.id) || this.target;
		if (target.fire && this.resistance)
		{
			this.resistance.regen = Math.max(this.resistance.regen, target.regen);
			this.resistance.arrows = Math.max(this.resistance.arrows, target.fire.arrows);
		}
		let capturable = this.feasible(world, priorities, members, target, this.assaulting ? 1 / priorities.margin : priorities.margin);
		if (!capturable && this.retarget(world, priorities, members))
		{
			target = this.target;
			capturable = true;
		}
		const outlook = this.outlookOf(world, members, target);
		const assault = capturable &&
			defenders.size < (this.assaulting ? ASSAULT_EXIT_SHARE : ASSAULT_ENTER_SHARE) * members.length;
		const details = {
			"army": members.length, "defenders": defenders.size, "power": outlook.power, "regen": target.regen,
			"points": target.points, "reach": Math.round(Math.min(outlook.reach, 1e6)), "arrows": target.fire && target.fire.arrows
		};
		if (!capturable && !world.breakers.length && defenders.size < ASSAULT_ENTER_SHARE * members.length)
		{
			this.switchMode(world, "return", Object.assign(details, { "alive": members.length, "launched": this.launchSize, "reason": "uncapturable" }));
			return this.returnRequests(world, priorities, members, home);
		}
		if (assault !== this.assaulting)
		{
			this.assaulting = assault;
			this.telemetry.line("ATTACK", world.time, Object.assign({ "mode": assault ? "assault" : "fight" }, details));
		}
		if (assault)
		{
			const fighting = new Set(world.enemyFighters.map(enemy => enemy.id));
			return members.map(member => {
				if (member.target === target.id || member.state.includes("COMBAT") && fighting.has(member.target))
					return this.order(member, { "type": "hold" }, priorities);
				if (squareDistance(member.position, target.position) <= limit)
					return this.order(member, { "type": "capture", "target": target.id }, priorities);
				return MOVING_STATES.some(state => member.state.includes(state)) ?
					this.order(member, { "type": "hold" }, priorities) :
					this.order(member, { "type": "attack-walk", "x": target.position[0], "z": target.position[1],
						"targetClasses": UNIT_CLASSES }, priorities);
			});
		}
		return members.map(member => {
			if (this.exposure(world, member.position))
				return member.state.includes("WALKING") ?
					this.order(member, { "type": "hold" }, priorities) :
					this.order(member, { "type": "walk", "x": this.rally[0], "z": this.rally[1] }, priorities);
			if (member.target === target.id)
				return this.order(member, { "type": "attack-walk", "x": target.position[0], "z": target.position[1],
					"targetClasses": UNIT_CLASSES }, priorities);
			return MOVING_STATES.some(state => member.state.includes(state)) ?
				this.order(member, { "type": "hold" }, priorities) :
				this.order(member, { "type": "attack-walk", "x": target.position[0], "z": target.position[1],
					"targetClasses": TARGET_CLASSES }, priorities);
		});
	}

	returnRequests(world, priorities, members, home)
	{
		const limit = HOME_RADIUS * HOME_RADIUS;
		const away = members.filter(member => squareDistance(member.position, home.position) > limit);
		if (!away.length || world.time - this.since >= PATIENCE_MS)
		{
			this.mode = "home";
			this.army = new Set();
			this.telemetry.line("ATTACK", world.time, { "mode": "home" });
			return [];
		}
		return away.map(member => member.state.includes("WALKING") ?
			this.order(member, { "type": "hold" }, priorities) :
			this.order(member, { "type": "walk", "x": home.position[0], "z": home.position[1] }, priorities));
	}
}
