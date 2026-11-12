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
const RETREAT_FRACTION = 0.4;
const ASSAULT_RADIUS = 80;
const ASSAULT_ENTER_SHARE = 0.1;
const ASSAULT_EXIT_SHARE = 0.25;
const MOVING_STATES = ["COMBAT", "WALKING", "APPROACHING", "CHASING", "CAPTURE", "ATTACK"];
const TARGET_CLASSES = { "attack": ["Unit", "Structure"], "avoid": ["Palisade", "Wall"] };
const UNIT_CLASSES = { "attack": ["Unit"], "avoid": ["Palisade", "Wall"] };

export class Offense
{
	constructor(telemetry)
	{
		this.telemetry = telemetry;
		this.mode = "home";
		this.army = new Set();
		this.launchSize = 0;
		this.since = 0;
		this.target = null;
		this.rally = null;
		this.assaulting = false;
		this.resistance = null;
	}

	requests(world, priorities)
	{
		const members = world.fighters.filter(fighter => this.army.has(fighter.id));
		this.army = new Set(members.map(fighter => fighter.id));
		const home = world.centres[0];
		if (!home)
			return [];
		if (this.mode === "home")
			return this.launch(world, priorities, home);
		if (this.mode !== "return" && this.shouldRetreat(world, members))
			this.switchMode(world, "return", { "alive": members.length, "launched": this.launchSize });
		if (this.mode === "rally")
			return this.rallyRequests(world, priorities, members);
		if (this.mode === "attack")
			return this.attackRequests(world, priorities, members, home);
		return this.returnRequests(world, priorities, members, home);
	}

	switchMode(world, mode, details)
	{
		this.mode = mode;
		this.since = world.time;
		this.assaulting = false;
		this.telemetry.line("ATTACK", world.time, Object.assign({ "mode": mode, "army": this.army.size }, details || {}));
	}

	launch(world, priorities, home)
	{
		const offense = priorities.offense;
		if (world.threats.length || !world.enemyCentres.length)
			return [];
		const available = world.fighters.filter(fighter => !fighter.state.includes("COMBAT"));
		if (available.length < offense.minArmy || available.length < offense.superiority * world.enemySoldiers)
			return [];
		const target = world.enemyCentres
			.slice()
			.sort((a, b) => squareDistance(a.position, home.position) - squareDistance(b.position, home.position) || a.id - b.id)[0];
		const outlook = captureOutlook(available, this.expected(target));
		if (outlook.reach < offense.capture.enter * target.points)
			return [];
		this.target = target;
		const dx = target.position[0] - home.position[0];
		const dz = target.position[1] - home.position[1];
		const length = Math.sqrt(dx * dx + dz * dz) || 1;
		const step = Math.min(RALLY_MAX_DISTANCE, RALLY_FRACTION * length);
		this.rally = [home.position[0] + dx / length * step, home.position[1] + dz / length * step];
		this.army = new Set(available.map(fighter => fighter.id));
		this.launchSize = this.army.size;
		this.switchMode(world, "rally", { "target": target.id, "enemySoldiers": world.enemySoldiers });
		return this.rallyRequests(world, priorities, available);
	}

	shouldRetreat(world, members)
	{
		if (world.threats.length >= HOME_ALARM_THREATS)
			return true;
		if (members.length < this.launchSize * RETREAT_FRACTION)
			return true;
		return this.mode === "attack" && !world.enemyCentres.some(centre => centre.id === this.target.id) &&
			!this.retarget(world);
	}

	retarget(world)
	{
		if (!world.enemyCentres.length)
			return false;
		const from = this.target.position;
		this.target = world.enemyCentres
			.slice()
			.sort((a, b) => squareDistance(a.position, from) - squareDistance(b.position, from) || a.id - b.id)[0];
		this.assaulting = false;
		this.resistance = { "id": this.target.id, "regen": 0, "arrows": 0 };
		this.telemetry.line("ATTACK", world.time, { "mode": "retarget", "target": this.target.id });
		return true;
	}

	expected(centre)
	{
		const seen = this.resistance;
		if (!seen || seen.id !== centre.id)
			return centre;
		return Object.assign({}, centre, {
			"regen": Math.max(centre.regen, seen.regen),
			"fire": Object.assign({}, centre.fire, { "arrows": Math.max(centre.fire.arrows, seen.arrows) })
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

	attackRequests(world, priorities, members, home)
	{
		const limit = ASSAULT_RADIUS * ASSAULT_RADIUS;
		const defenders = new Set(world.enemyFighters
			.filter(enemy => squareDistance(enemy.position, this.target.position) <= limit)
			.map(enemy => enemy.id));
		const centre = world.enemyCentres.find(candidate => candidate.id === this.target.id) || this.target;
		const margins = priorities.offense.capture;
		const outlook = centre.fire ? captureOutlook(members, centre) : { "power": 0, "losses": 0, "reach": 0 };
		const capturable = outlook.reach >= (this.assaulting ? margins.exit : margins.enter) * (centre.points || 0);
		const assault = capturable &&
			defenders.size < (this.assaulting ? ASSAULT_EXIT_SHARE : ASSAULT_ENTER_SHARE) * members.length;
		const details = {
			"army": members.length, "defenders": defenders.size, "power": outlook.power, "regen": centre.regen,
			"points": centre.points, "reach": Math.round(Math.min(outlook.reach, 1e6)), "arrows": centre.fire && centre.fire.arrows
		};
		if (centre.fire && this.resistance)
		{
			this.resistance.regen = Math.max(this.resistance.regen, centre.regen);
			this.resistance.arrows = Math.max(this.resistance.arrows, centre.fire.arrows);
		}
		if (!assault && !capturable && defenders.size < ASSAULT_ENTER_SHARE * members.length)
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
			return members.map(member => member.target === this.target.id ||
				member.state.includes("COMBAT") && fighting.has(member.target) ?
				this.order(member, { "type": "hold" }, priorities) :
				this.order(member, { "type": "capture", "target": this.target.id }, priorities));
		}
		return members.map(member => {
			if (member.target === this.target.id)
				return this.order(member, { "type": "attack-walk", "x": this.target.position[0], "z": this.target.position[1],
					"targetClasses": UNIT_CLASSES }, priorities);
			return MOVING_STATES.some(state => member.state.includes(state)) ?
				this.order(member, { "type": "hold" }, priorities) :
				this.order(member, { "type": "attack-walk", "x": this.target.position[0], "z": this.target.position[1],
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
