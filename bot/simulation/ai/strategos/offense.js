import { PATIENCE_MS, REPORT_MS } from "simulation/ai/strategos/cadence.js";
import { centroid, distanceBetween, firstListed, nearest, squareDistance, toward } from "simulation/ai/strategos/geometry.js";
import { Operations } from "simulation/ai/strategos/operations.js";
import { attack, attackWalkTo, capture, deleteHolderRequest, garrisonIn, hold, memberRequest, orderRequest, reserving, trainRequest, walkTo } from "simulation/ai/strategos/requests.js";
import { Change, Hysteresis } from "simulation/ai/strategos/switches.js";
import { GATHER_EFFICIENCY, captureOutlook, resourcePrices } from "simulation/ai/strategos/valuation.js";
import { REACH_RADIUS, prospect } from "simulation/ai/strategos/forecast.js";

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
		this.attacks = new Operations("offense", "ATTACK", telemetry);
		this.attacked = new Set();
		this.resistanceMet = null;
		this.mopping = new Change();
		this.stormed = new Change();
	}

	requests(world, plan, assessments)
	{
		const home = world.home;
		if (!home)
			return [];
		if (!world.enemyStructures.length && world.enemyTargets.length)
			return this.mopUpRequests(world, plan);
		const holding = this.holdRequests(world, plan);
		const held = new Set(holding.filter(request => request.action.type === "garrison").map(request => request.action.unit));
		return holding.concat(this.armyRequests(world, plan, assessments, home, held), this.breakerRequests(world, plan, home),
			this.strayRequests(world, plan, home, held));
	}

	settle(world, outcomes)
	{
		this.attacks.settle(outcomes);
	}

	enlisted()
	{
		return new Set([].concat(...this.attacks.list.map(operation => operation.members)));
	}

	strayRequests(world, plan, home, held)
	{
		const enlisted = this.enlisted();
		return world.fighters
			.filter(fighter => fighter.region === world.homeRegion && !enlisted.has(fighter.id) && !held.has(fighter.id) &&
				fighter.state.fighting && !world.ownSide(fighter.position))
			.map(fighter => this.order("stray", fighter, walkTo(home.position[0], home.position[1]), plan));
	}

	mopUpRequests(world, plan)
	{
		const requests = [];
		for (const fighter of world.fighters)
		{
			if (fighter.state.moving)
				continue;
			const best = nearest(world.enemyTargets, fighter.position, firstListed, target => target.region === fighter.region).item;
			if (best)
				requests.push(this.order("mop-up", fighter, attackWalkTo(best.position[0], best.position[1],
					best.unit ? UNIT_CLASSES : TARGET_CLASSES), plan));
		}
		if (requests.length && this.mopping.to(true))
			this.telemetry.line("ATTACK", world.time, { "mode": "mopup", "units": requests.length, "left": world.enemyTargets.length });
		return requests;
	}

	beachhead(world, plan, group, region, reserve)
	{
		const beachhead = plan.offense.beachhead;
		const defenders = world.enemyFighters.filter(enemy => world.regionOf(enemy.position) === region).length;
		const holding = group.length < beachhead.superiority * defenders && reserve.length >= beachhead.reserve;
		if (holding !== (this.held === region))
		{
			this.held = holding ? region : null;
			this.telemetry.line("ATTACK", world.time, { "mode": holding ? "beachhead" : "advance", "army": group.length, "defenders": defenders,
				"reserve": reserve.length });
		}
		return holding;
	}

	stormRequests(world, plan, group, region)
	{
		const centre = centroid(group);
		const target = world.enemyStructures.filter(structure => structure.region === region)
			.map(structure => ({ structure, "distance": squareDistance(structure.position, centre) }))
			.sort((a, b) => (a.structure.fire.arrows > 0 ? 1 : 0) - (b.structure.fire.arrows > 0 ? 1 : 0) || a.distance - b.distance ||
				a.structure.id - b.structure.id)
			.map(entry => entry.structure)[0];
		if (!target)
			return [];
		if (this.stormed.to(target.id))
			this.telemetry.line("ATTACK", world.time, { "mode": "storm", "target": target.id, "centre": target.centre, "army": group.length,
				"enemySoldiers": world.enemySoldiers });
		return group.map(member => member.target === target.id ? this.order("storm", member, hold(), plan) :
			this.order("storm", member, attack(target.id), plan));
	}

	holdRequests(world, plan)
	{
		const requests = [];
		const taken = new Set();
		const enlisted = this.enlisted();
		for (const structure of world.decaying)
		{
			if (!this.attacked.has(structure.id))
				continue;
			const pending = world.fighters.filter(fighter => fighter.state.garrisoning && fighter.target === structure.id);
			let regen = structure.regen + pending.reduce((sum, fighter) => sum + fighter.capture * structure.garrisonRegenRate, 0);
			const need = structure.decayRate + HOLD_MARGIN;
			if (regen >= need)
				continue;
			const chosen = [];
			if (structure.arrows)
			{
				const room = structure.free - pending.length;
				const near = world.fighters
					.filter(member => enlisted.has(member.id) && !taken.has(member.id) && !member.state.garrisoning &&
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
					requests.push(this.order("occupy", member, garrisonIn(structure.id), plan));
				}
				this.telemetry.line("ATTACK", world.time, { "mode": "hold", "structure": structure.id, "units": chosen.length });
				continue;
			}
			if (pending.length)
				continue;
			this.telemetry.line("ATTACK", world.time, { "mode": "raze", "structure": structure.id });
			requests.push(deleteHolderRequest("offense", "raze", structure.id, plan.values.offense, 1));
		}
		return requests;
	}

	breakerRequests(world, plan, home)
	{
		const requests = [];
		const breakers = plan.offense.breakers;
		const wanted = Math.min(breakers.max, Math.floor(world.fighters.length / breakers.perSoldiers));
		const trains = trainer => trainer.trainable.some(name => this.catalog.isBreaker(name));
		const trainer = world.trainers.find(candidate => candidate.queueLength === 0 && trains(candidate));
		if (trainer && !world.trainers.some(candidate => candidate.queueLength > 0 && trains(candidate)) && world.breakers.length < wanted)
		{
			const template = trainer.trainable.filter(name => this.catalog.isBreaker(name))
				.sort((a, b) => this.catalog.costSum(a) - this.catalog.costSum(b) || (a < b ? -1 : 1))[0];
			requests.push(reserving(trainRequest("offense", "breaker", trainer.id, template, 1, this.catalog.cost(template),
				this.catalog.population(template), plan.values.support, 1)));
		}
		const followed = this.attacks.list.find(operation => !operation.overseas);
		if (!followed)
			return requests;
		for (const breaker of world.breakers)
		{
			let action = hold();
			if (followed.state === "attack" && breaker.target !== followed.objective.id)
				action = attack(followed.objective.id);
			else if (followed.state === "rally" && !breaker.state.moving)
				action = walkTo(followed.rally[0], followed.rally[1]);
			else if (followed.state === "return" && !breaker.state.moving)
				action = walkTo(home.position[0], home.position[1]);
			requests.push(this.order("siege", breaker, action, plan));
		}
		return requests;
	}

	armyRequests(world, plan, assessments, home, held)
	{
		const out = this.attacks.list.slice();
		if (!out.length)
			return this.launch(world, plan, assessments, home);
		return [].concat(...out.map(operation => this.advance(world, plan, assessments, operation, home, held)));
	}

	present(world, operation)
	{
		const members = new Set(operation.members);
		return world.fighters.filter(fighter => members.has(fighter.id));
	}

	advance(world, plan, assessments, operation, home, held)
	{
		if (operation.overseas)
		{
			const enlisted = this.enlisted();
			for (const fighter of world.fighters)
				if (fighter.region === operation.region && !enlisted.has(fighter.id))
				{
					operation.members.push(fighter.id);
					operation.launchSize += 1;
				}
		}
		let members = this.present(world, operation);
		operation.members = members.map(fighter => fighter.id);
		if (operation.state === "attack" && !operation.overseas && this.reinforce(world, plan, assessments, operation, members, home))
			members = this.present(world, operation);
		home = { "position": operation.base };
		const free = members.filter(member => !held.has(member.id) && !member.state.garrisoning);
		const reason = operation.state !== "return" && this.retreatReason(world, plan, assessments, operation, free, home);
		if (reason)
			this.move(world, operation, "return", Object.assign({
				"alive": members.length, "launched": operation.launchSize, "reason": reason, "threats": world.threats.length
			}, reason === "outmatched" ? {
				"defenders": this.adverse.defenders, "coming": this.adverse.coming, "cost": Math.round(this.adverse.cost), "gain": Math.round(this.adverse.gain)
			} : {}));
		if (operation.state === "rally")
			return this.rallyRequests(world, plan, operation, free);
		if (operation.state === "attack")
			return this.attackRequests(world, plan, operation, free, home);
		return this.returnRequests(world, plan, operation, free, home);
	}

	reinforce(world, plan, assessments, operation, members, home)
	{
		const reinforce = plan.offense.reinforce;
		if (!assessments.guard.holds || !members.length || !world.enemyStructures.some(structure => structure.id === operation.objective.id))
			return false;
		const enlisted = this.enlisted();
		const joiners = world.fighters.filter(fighter => fighter.region === world.homeRegion && !enlisted.has(fighter.id) &&
			!assessments.guard.ids.has(fighter.id) && !fighter.state.fighting);
		if (joiners.length < reinforce.min)
			return false;
		const whole = members.concat(joiners);
		const outlook = this.worth(world, plan, whole, operation.objective, home.position, this.forgone(world, joiners),
			this.superiority(world, plan, whole), operation.resistance);
		if (!outlook.worth)
			return false;
		operation.members = operation.members.concat(joiners.map(fighter => fighter.id));
		operation.launchSize += joiners.length;
		this.telemetry.line("ATTACK", world.time, Object.assign({ "mode": "reinforce", "army": whole.length, "joined": joiners.length },
			this.described(outlook)));
		return true;
	}

	move(world, operation, state, details)
	{
		operation.assaulting = false;
		this.attacks.enter(operation, world.time, state, Object.assign({ "mode": state, "army": operation.members.length }, details || {}));
	}

	threshold(operation, enter, exit)
	{
		return new Hysteresis(operation.assaulting).threshold(enter, exit);
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

	outlookOf(world, members, target, seen)
	{
		const expected = this.expected(target, seen);
		return captureOutlook(members, Object.assign({}, expected, { "fire": this.coverFire(world, expected) }));
	}

	feasible(world, plan, members, target, margin, seen)
	{
		if (!target.points)
			return false;
		if (target.centre && world.breakers.length >= plan.offense.breakers.launch)
			return true;
		return this.outlookOf(world, members, target, seen).reach >= margin * target.points;
	}

	armyValue(members)
	{
		return members.reduce((sum, member) => sum + this.catalog.costSum(member.template), 0);
	}

	prize(world, plan, members, target, seen)
	{
		if (target.centre && world.breakers.length >= plan.offense.breakers.launch)
			return target.value;
		const net = this.outlookOf(world, members, target, seen).power - this.expected(target, seen).regen;
		return net > 0 ? target.value * Math.min(1, PRIZE_HORIZON_S * net / Math.max(1, target.points)) : 0;
	}

	terms(plan, reach, massed)
	{
		const exchange = plan.offense.exchange;
		return { "reach": reach, "response": exchange.response, "reaction": exchange.reaction, "massed": massed,
			"horizonS": massed ? exchange.dominance.horizonS : undefined };
	}

	attrition(world, plan)
	{
		const attrition = plan.offense.exchange.attrition;
		let gathering = 0;
		for (const code of world.codes)
			gathering += world.gatherers[code];
		return Math.min(attrition.max, Math.max(attrition.min, world.enemyGatherers / Math.max(1, gathering)));
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

	superiority(world, plan, members)
	{
		const whole = prospect(this.catalog, members, centroid(members), world.enemyFighters, [],
			Object.assign(this.terms(plan, Infinity, true), { "hidden": world.enemyHidden, "handicap": plan.offense.exchange.handicap }));
		return { "cost": whole.cost, "gain": whole.gain, "opposing": whole.opposing, "ratio": whole.cost > 0 ? whole.gain / whole.cost : Infinity };
	}

	worth(world, plan, members, target, from, forgone, field, seen)
	{
		const exchange = plan.offense.exchange;
		const distance = distanceBetween(target.position, from);
		const walk = distance / forgone.speed;
		const outlook = prospect(this.catalog, members, target.position, world.enemyFighters, world.enemyStructures,
			Object.assign(this.terms(plan, exchange.reach.launch + distance),
				{ "prey": world.enemyCivilians, "preyReach": exchange.reach.launch, "lead": walk, "handicap": exchange.handicap,
					"muster": world.enemyMuster }));
		outlook.prize = this.prize(world, plan, members, target, seen);
		outlook.trip = forgone.income * 2 * walk;
		outlook.army = this.armyValue(members);
		outlook.attrition = this.attrition(world, plan);
		outlook.field = field;
		outlook.dominant = field.ratio >= plan.margin * outlook.attrition;
		outlook.worth = outlook.dominant && outlook.cost <= exchange.maxCost * outlook.army ||
			outlook.gain + outlook.prize >= plan.margin * outlook.attrition * (outlook.cost + outlook.trip);
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

	outmatched(world, plan, operation, members)
	{
		if (!members.length)
			return null;
		const exchange = plan.offense.exchange;
		const front = members.filter(member => member.state.fighting);
		const outlook = prospect(this.catalog, members, centroid(front.length >= FRONT_MIN ? front : members), world.enemyFighters,
			world.enemyStructures, Object.assign(this.terms(plan, REACH_RADIUS), { "prey": world.enemyCivilians }));
		const prize = operation.assaulting ? this.prize(world, plan, members, operation.objective, operation.resistance) : 0;
		return outlook.cost >= exchange.minCost * this.armyValue(members) &&
			outlook.gain + prize < this.attrition(world, plan) * outlook.cost / plan.margin ? outlook : null;
	}

	chooseTarget(world, plan, members, from, region, seen, gated)
	{
		const ranked = [];
		for (const target of world.enemyStructures)
		{
			if (target.region !== region || !this.feasible(world, plan, members, target, plan.margin, seen))
				continue;
			const weight = target.centre ? TARGET_WEIGHTS.centre : target.fire.arrows ? TARGET_WEIGHTS.defensive : TARGET_WEIGHTS.other;
			const score = weight * target.value / (1 + distanceBetween(target.position, from) / TARGET_DISTANCE_SCALE);
			if (score > 0)
				ranked.push({ target, score });
		}
		ranked.sort((a, b) => b.score - a.score || a.target.id - b.target.id);
		if (!gated)
			return ranked.length ? ranked[0].target : null;
		const forgone = this.forgone(world, members);
		const field = this.superiority(world, plan, members);
		this.refused = null;
		for (const { target } of ranked.slice(0, plan.offense.targetsTried))
		{
			const outlook = this.worth(world, plan, members, target, from, forgone, field, seen);
			if (outlook.worth)
			{
				this.outlook = outlook;
				return target;
			}
			this.refused = this.refused || { "target": target.id, "army": members.length, "outlook": outlook };
		}
		return null;
	}

	launch(world, plan, assessments, home)
	{
		this.refused = null;
		if (!assessments.guard.holds || !world.enemyTargets.length)
			return [];
		const enlisted = this.enlisted();
		const groups = new Map();
		for (const fighter of world.fighters)
		{
			if (fighter.region === world.homeRegion && fighter.state.fighting || assessments.guard.ids.has(fighter.id) || enlisted.has(fighter.id))
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
		let theatre = null;
		let storm = null;
		for (const region of regions)
		{
			const group = groups.get(region);
			if (group.length < plan.minArmy)
				continue;
			if (region !== world.homeRegion && this.beachhead(world, plan, group, region, groups.get(world.homeRegion) || []))
				continue;
			const origin = region === world.homeRegion ? home.position : centroid(group);
			const found = this.chooseTarget(world, plan, group, origin, region, this.resistanceMet, region === world.homeRegion);
			if (!found && !storm && region !== world.homeRegion && !world.breakers.length && group.length >= STORM_MIN_ARMY &&
			    group.length >= STORM_SUPERIORITY * world.enemySoldiers)
				storm = { group, region };
			if (!found)
				continue;
			available = group;
			target = found;
			base = origin;
			theatre = region;
			break;
		}
		if (!target && this.refused && this.telemetry.due("ATTACK-wait", world.time, REPORT_MS))
			this.telemetry.line("ATTACK", world.time, Object.assign({ "mode": "wait", "army": this.refused.army, "target": this.refused.target,
				"enemySoldiers": world.enemySoldiers }, this.described(this.refused.outlook)));
		if (!target)
			return storm ? this.stormRequests(world, plan, storm.group, storm.region) : [];
		this.attacked.add(target.id);
		const step = Math.min(RALLY_MAX_DISTANCE, RALLY_FRACTION * (distanceBetween(target.position, base) || 1));
		const operation = Object.assign(this.attacks.open("attack"), {
			"objective": target, "rally": toward(base, target.position, step), "base": base, "region": theatre,
			"overseas": theatre !== world.homeRegion, "members": available.map(fighter => fighter.id), "launchSize": available.length,
			"resistance": null, "assaulting": false
		});
		this.move(world, operation, "rally", Object.assign({
			"target": target.id, "value": target.value, "centre": target.centre, "enemySoldiers": world.enemySoldiers
		}, operation.overseas ? {} : this.described(this.outlook)));
		return this.rallyRequests(world, plan, operation, available);
	}

	retreatReason(world, plan, assessments, operation, members, home)
	{
		if (!operation.overseas && !assessments.guard.holds && assessments.guard.value >= plan.offense.recall * this.armyValue(members))
			return "alarm";
		if (!operation.overseas && members.length < operation.launchSize * RETREAT_FRACTION)
			return "losses";
		if (!operation.overseas && operation.state === "attack" && world.time - operation.since >= COMMIT_MS)
		{
			this.adverse = this.outmatched(world, plan, operation, members);
			if (this.adverse)
				return "outmatched";
		}
		if (operation.state === "attack" && !world.enemyStructures.some(structure => structure.id === operation.objective.id) &&
			!this.retarget(world, plan, operation, members))
			return "done";
		return null;
	}

	retarget(world, plan, operation, members)
	{
		if (!members.length)
			return false;
		const target = this.chooseTarget(world, plan, members, centroid(members), operation.region, operation.resistance);
		if (!target)
			return false;
		operation.objective = target;
		this.attacked.add(target.id);
		operation.assaulting = false;
		operation.resistance = { "id": target.id, "regen": 0, "arrows": 0 };
		this.telemetry.line("ATTACK", world.time, { "mode": "retarget", "target": target.id, "value": target.value, "centre": target.centre });
		return true;
	}

	expected(target, seen)
	{
		if (!seen || seen.id !== target.id)
			return target;
		return Object.assign({}, target, {
			"regen": Math.max(target.regen, seen.regen),
			"fire": Object.assign({}, target.fire, { "arrows": Math.max(target.fire.arrows, seen.arrows) })
		});
	}

	order(purpose, member, action, plan)
	{
		return orderRequest("offense", purpose, member.id, action, plan.values.offense, 1);
	}

	member(operation, purpose, fighter, engaged, order, plan)
	{
		return this.attacks.serving(memberRequest("offense", purpose, fighter.id, engaged, order, plan.values.offense, 1), operation);
	}

	rallyRequests(world, plan, operation, members)
	{
		const limit = RALLY_RADIUS * RALLY_RADIUS;
		const arrived = members.filter(member => squareDistance(member.position, operation.rally) <= limit).length;
		if (arrived >= RALLY_QUORUM * members.length || world.time - operation.since >= RALLY_TIMEOUT_MS)
		{
			this.move(world, operation, "attack", { "arrived": arrived });
			operation.resistance = { "id": operation.objective.id, "regen": 0, "arrows": 0 };
			return this.attackRequests(world, plan, operation, members, { "position": operation.base });
		}
		return members.map(member => this.member(operation, "rally", member, squareDistance(member.position, operation.rally) <= limit,
			walkTo(operation.rally[0], operation.rally[1]), plan));
	}

	exposure(world, operation, position)
	{
		for (const structure of world.enemyStructures)
		{
			if (!structure.fire.arrows || structure.id === operation.objective.id)
				continue;
			const reach = structure.range + COVER_MARGIN;
			if (squareDistance(structure.position, position) <= reach * reach)
				return structure;
		}
		return null;
	}

	attackRequests(world, plan, operation, members, home)
	{
		const limit = ASSAULT_RADIUS * ASSAULT_RADIUS;
		const defenders = new Set(world.enemyFighters
			.filter(enemy => squareDistance(enemy.position, operation.objective.position) <= limit)
			.map(enemy => enemy.id));
		let target = world.enemyStructures.find(candidate => candidate.id === operation.objective.id) || operation.objective;
		if (target.fire && operation.resistance)
		{
			operation.resistance.regen = Math.max(operation.resistance.regen, target.regen);
			operation.resistance.arrows = Math.max(operation.resistance.arrows, target.fire.arrows);
		}
		let capturable = this.feasible(world, plan, members, target,
			this.threshold(operation, plan.margin, 1 / plan.margin), operation.resistance);
		if (!capturable && this.retarget(world, plan, operation, members))
		{
			target = operation.objective;
			capturable = true;
		}
		const outlook = this.outlookOf(world, members, target, operation.resistance);
		const assault = capturable &&
			defenders.size < this.threshold(operation, ASSAULT_ENTER_SHARE, ASSAULT_EXIT_SHARE) * members.length;
		const details = {
			"army": members.length, "defenders": defenders.size, "power": outlook.power, "regen": target.regen,
			"points": target.points, "reach": Math.round(Math.min(outlook.reach, 1e6)), "arrows": target.fire && target.fire.arrows
		};
		if (!capturable && !world.breakers.length && defenders.size < ASSAULT_ENTER_SHARE * members.length)
		{
			this.move(world, operation, "return",
				Object.assign(details, { "alive": members.length, "launched": operation.launchSize, "reason": "uncapturable" }));
			return this.returnRequests(world, plan, operation, members, home);
		}
		if (assault !== operation.assaulting)
		{
			operation.assaulting = assault;
			this.telemetry.line("ATTACK", world.time, Object.assign({ "mode": assault ? "assault" : "fight" }, details));
		}
		if (assault)
		{
			const fighting = new Set(world.enemyFighters.map(enemy => enemy.id));
			return members.map(member => {
				const engaged = member.target === target.id || member.state.fighting && fighting.has(member.target);
				const near = squareDistance(member.position, target.position) <= limit;
				return this.member(operation, "assault", member, engaged || !near && member.state.moving,
					near ? capture(target.id) : attackWalkTo(target.position[0], target.position[1], UNIT_CLASSES), plan);
			});
		}
		return members.map(member => {
			if (this.exposure(world, operation, member.position))
				return this.member(operation, "pull-back", member, member.state.walking,
					walkTo(operation.rally[0], operation.rally[1]), plan);
			const capturing = member.target === target.id;
			return this.member(operation, "fight", member, !capturing && member.state.moving,
				attackWalkTo(target.position[0], target.position[1], capturing ? UNIT_CLASSES : TARGET_CLASSES), plan);
		});
	}

	returnRequests(world, plan, operation, members, home)
	{
		const limit = HOME_RADIUS * HOME_RADIUS;
		const away = members.filter(member => squareDistance(member.position, home.position) > limit);
		if (!away.length || world.time - operation.since >= PATIENCE_MS)
		{
			this.resistanceMet = operation.resistance;
			this.attacks.enter(operation, world.time, "home", { "mode": "home" });
			this.attacks.close(operation);
			return [];
		}
		return away.map(member => this.member(operation, "return", member, member.state.walking,
			walkTo(home.position[0], home.position[1]), plan));
	}
}
