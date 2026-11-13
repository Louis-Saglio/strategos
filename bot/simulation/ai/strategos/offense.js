import { squareDistance } from "simulation/ai/strategos/world.js";
import { captureOutlook } from "simulation/ai/strategos/valuation.js";

const RALLY_FRACTION = 0.35;
const RALLY_MAX_DISTANCE = 120;
const RALLY_RADIUS = 30;
const RALLY_QUORUM = 0.8;
const RALLY_TIMEOUT_MS = 45000;
const HOME_RADIUS = 50;
const RETURN_TIMEOUT_MS = 60000;
const HOME_ALARM_THREATS = 6;
const HOME_CALM_THREATS = 3;
const ARMY_REACH = 150;
const RETREAT_FRACTION = 0.4;
const ASSAULT_RADIUS = 80;
const ASSAULT_ENTER_SHARE = 0.1;
const ASSAULT_EXIT_SHARE = 0.25;
const COVER_MARGIN = 8;
const TARGET_DISTANCE_SCALE = 200;
const TARGET_WEIGHTS = { "centre": 3, "defensive": 2, "other": 1 };
const HOLD_MARGIN = 2;
const HOLD_RADIUS = 80;
const MOVING_STATES = ["COMBAT", "WALKING", "APPROACHING", "CHASING", "CAPTURE", "ATTACK"];
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
	}

	requests(world, priorities)
	{
		const home = world.centres[0];
		if (!home)
			return [];
		const holding = this.holdRequests(world, priorities);
		const held = new Set(holding.filter(request => request.action.type === "garrison").map(request => request.action.unit));
		return holding.concat(this.armyRequests(world, priorities, home, held), this.breakerRequests(world, priorities, home));
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
				"value": priorities.values.siege,
				"urgency": 1,
				"reserve": true
			});
		}
		if (this.mode === "home")
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
		const members = world.fighters.filter(fighter => this.army.has(fighter.id));
		this.army = new Set(members.map(fighter => fighter.id));
		if (this.mode === "home")
			return this.launch(world, priorities, home);
		const free = members.filter(member => !held.has(member.id) && !member.state.includes("GARRISON"));
		const reason = this.mode !== "return" && this.retreatReason(world, priorities, free, home);
		if (reason)
			this.switchMode(world, "return", {
				"alive": members.length, "launched": this.launchSize, "reason": reason, "threats": world.threats.length
			});
		if (this.mode === "rally")
			return this.rallyRequests(world, priorities, free);
		if (this.mode === "attack")
			return this.attackRequests(world, priorities, free, home);
		return this.returnRequests(world, priorities, free, home);
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

	chooseTarget(world, priorities, members, from)
	{
		let best = null;
		let bestScore = 0;
		for (const target of world.enemyStructures)
		{
			if (!this.feasible(world, priorities, members, target, priorities.offense.capture.enter))
				continue;
			const weight = target.centre ? TARGET_WEIGHTS.centre : target.fire.arrows ? TARGET_WEIGHTS.defensive : TARGET_WEIGHTS.other;
			const score = weight * target.value / (1 + Math.sqrt(squareDistance(target.position, from)) / TARGET_DISTANCE_SCALE);
			if (score > bestScore || (score === bestScore && best && target.id < best.id))
			{
				best = target;
				bestScore = score;
			}
		}
		return best;
	}

	launch(world, priorities, home)
	{
		const offense = priorities.offense;
		if (world.threats.length >= HOME_CALM_THREATS || !world.enemyTargets.length)
			return [];
		const available = world.fighters.filter(fighter => !fighter.state.includes("COMBAT"));
		if (available.length < offense.minArmy || available.length < offense.superiority * world.enemySoldiers)
			return [];
		const target = this.chooseTarget(world, priorities, available, home.position);
		if (!target)
			return [];
		this.target = target;
		this.attacked.add(target.id);
		this.resistance = null;
		const dx = target.position[0] - home.position[0];
		const dz = target.position[1] - home.position[1];
		const length = Math.sqrt(dx * dx + dz * dz) || 1;
		const step = Math.min(RALLY_MAX_DISTANCE, RALLY_FRACTION * length);
		this.rally = [home.position[0] + dx / length * step, home.position[1] + dz / length * step];
		this.army = new Set(available.map(fighter => fighter.id));
		this.launchSize = this.army.size;
		this.switchMode(world, "rally", { "target": target.id, "value": target.value, "centre": target.centre, "enemySoldiers": world.enemySoldiers });
		return this.rallyRequests(world, priorities, available);
	}

	retreatReason(world, priorities, members, home)
	{
		if (this.threatsOutOfReach(world, members, home) >= HOME_ALARM_THREATS)
			return "alarm";
		if (members.length < this.launchSize * RETREAT_FRACTION)
			return "losses";
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

	threatsOutOfReach(world, members, home)
	{
		if (this.mode !== "attack" || !members.length || world.threats.length < HOME_ALARM_THREATS)
			return world.threats.length;
		const centre = this.armyCentre(members);
		const limit = ARMY_REACH * ARMY_REACH;
		return world.threats.filter(threat => {
			const distance = squareDistance(threat.position, centre);
			return distance > limit || squareDistance(threat.position, home.position) < distance;
		}).length;
	}

	retarget(world, priorities, members)
	{
		if (!members.length)
			return false;
		const target = this.chooseTarget(world, priorities, members, this.armyCentre(members));
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
			return this.attackRequests(world, priorities, members, world.centres[0]);
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
		const margins = priorities.offense.capture;
		if (target.fire && this.resistance)
		{
			this.resistance.regen = Math.max(this.resistance.regen, target.regen);
			this.resistance.arrows = Math.max(this.resistance.arrows, target.fire.arrows);
		}
		let capturable = this.feasible(world, priorities, members, target, this.assaulting ? margins.exit : margins.enter);
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
		if (!away.length || world.time - this.since >= RETURN_TIMEOUT_MS)
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
