import { GRANTED } from "simulation/ai/strategos/allocator.js";
import { REPORT_MS } from "simulation/ai/strategos/cadence.js";
import { awayFrom, direction, distanceBetween, toward } from "simulation/ai/strategos/geometry.js";
import { attack, gatherRequest, hold, huntPurpose, orderRequest, walkTo } from "simulation/ai/strategos/requests.js";

const ARRIVAL = 8;
const MIN_GAIN_S = 5;
const STANDOFF_MARGIN = 4;
const STANDOFF_SHARE = 0.75;
const STRIKE_REACH = 10;
const LURE_REACH = 20;
const FOLLOW_SHARE = 0.35;
const FOLLOW_MIN = 6;
const LEAD_MARGIN = 8;
const VISION_SHARE = 0.5;
const SPOT_TOLERANCE = 4;
const FACING = 0.8;
const RETARGET = 4;
const LIMIT_MS = 75000;
const KITE_LIMIT_MS = 150000;
const KITE_MARGIN = 4;
const KITE_SPEED = 1.25;
const ESCAPE_PULL = 0.5;
const ESCAPE_STRIDES = 2;
const WOUNDED = 0.4;
const FIT = 0.8;
const STRIKE_WAITS = 2;
const TIMING_MARGIN_MS = 200;
const KILL_MARGIN = 0.85;
const FIGHT_SHARE = 0.5;
const SPENT_MS = 60000;
const FOOD = "food";

export class Drives
{
	constructor(catalog, telemetry)
	{
		this.catalog = catalog;
		this.telemetry = telemetry;
		this.drives = new Map();
		this.spent = new Map();
		this.issued = new Map();
		this.lastTime = undefined;
		this.gap = undefined;
		this.tally = {};
	}

	save()
	{
		return { "drives": this.drives, "spent": this.spent, "lastTime": this.lastTime, "gap": this.gap, "tally": this.tally };
	}

	restore(data)
	{
		this.drives = data.drives;
		this.spent = data.spent;
		this.lastTime = data.lastTime;
		this.gap = data.gap;
		this.tally = data.tally;
	}

	observe(world)
	{
		if (this.lastTime !== undefined && world.time > this.lastTime)
			this.gap = world.time - this.lastTime;
		this.lastTime = world.time;
		this.issued = new Map();
		for (const [prey, time] of this.spent)
			if (world.time - time > SPENT_MS)
				this.spent.delete(prey);
		if (Object.keys(this.tally).length && this.telemetry.due("HUNT", world.time, REPORT_MS))
		{
			this.telemetry.line("HUNT", world.time, this.tally);
			this.tally = {};
		}
	}

	hunters()
	{
		return new Set(this.drives.keys());
	}

	quarries()
	{
		return new Set([...this.drives.values()].map(drive => drive.prey));
	}

	anchorFor(world, prey)
	{
		let best = null;
		let bestDistance = Infinity;
		for (const anchor of world.anchors)
		{
			if (!anchor.types.includes(FOOD) || world.regionOf(anchor.position) !== prey.region)
				continue;
			const distance = distanceBetween(anchor.position, prey.position) - anchor.radius;
			if (distance < bestDistance)
			{
				best = anchor;
				bestDistance = distance;
			}
		}
		return best && { "anchor": best, "distance": bestDistance };
	}

	survives(strike, hitpoints)
	{
		const blows = Math.ceil(KILL_MARGIN * hitpoints / strike.damage);
		return blows >= 2 && 1000 * (strike.prepare + (blows - 1) * strike.repeat) >= this.gap + TIMING_MARGIN_MS;
	}

	fight(worker, prey, strike, quarry)
	{
		const dealt = this.catalog.hitRate(worker.template, prey.template, this.catalog.player, 0);
		if (!(dealt > 0))
			return null;
		const taken = this.catalog.hitRate(prey.template, worker.template, 0, this.catalog.player);
		if (prey.hitpoints / dealt * taken < FIGHT_SHARE * worker.hitpoints)
			return "stand";
		if (strike.range > quarry.reach + quarry.runSpeed * this.gap / 1000 + 2 * KITE_MARGIN &&
		    worker.profile.speed > KITE_SPEED * quarry.runSpeed)
			return "kite";
		return null;
	}

	plan(world, worker, prey)
	{
		if (this.gap === undefined || this.spent.has(prey.id) || prey.domestic || !prey.armed && prey.hitpoints < prey.maxHitpoints ||
		    prey.gatherers > 1 || !worker.template || prey.region !== worker.region)
			return null;
		const strike = this.catalog.strike(worker.template, prey.template, 0);
		const quarry = this.catalog.quarry(prey.template);
		const capacity = worker.profile.capacities[FOOD] || 0;
		const speed = worker.profile.speed;
		const goal = this.anchorFor(world, prey);
		if (!strike || !(strike.damage > 0) || !(quarry.runSpeed > 0) || !(capacity > 0) || !(speed > 0) || !goal)
			return null;
		const drive = {
			"hunter": worker.id,
			"prey": prey.id,
			"anchor": goal.anchor.id,
			"armed": prey.armed,
			"phase": "approach",
			"since": world.time,
			"struck": false,
			"waits": 0,
			"strike": strike,
			"pace": quarry.runSpeed,
			"reach": quarry.reach,
			"vision": quarry.vision,
			"spot": null
		};
		if (prey.armed)
		{
			drive.fight = this.fight(worker, prey, strike, quarry);
			if (!drive.fight || !(speed > quarry.runSpeed) || worker.hitpoints < FIT * this.catalog.combat(worker.template).hp)
				return null;
			if (strike.range <= quarry.reach + KITE_MARGIN)
				drive.phase = "fight";
			drive.standoff = Math.min(strike.range - STANDOFF_MARGIN, Math.max(LURE_REACH, this.safety(drive)));
			return drive;
		}
		if (!this.survives(strike, prey.hitpoints) || !(quarry.fleeDistance > 0) ||
		    goal.distance <= ARRIVAL + quarry.runSpeed * this.gap / 1000)
			return null;
		drive.standoff = strike.range > STRIKE_REACH + STANDOFF_MARGIN ? STRIKE_REACH : STANDOFF_SHARE * strike.range;
		drive.follow = Math.max(FOLLOW_MIN, FOLLOW_SHARE * (drive.standoff + quarry.fleeDistance));
		const spot = awayFrom(prey.position, goal.anchor.position, drive.standoff);
		const pushed = goal.distance - ARRIVAL;
		const saved = 2 * Math.ceil(prey.amount / capacity) * pushed / speed;
		const detour = Math.max(0, distanceBetween(worker.position, spot) - Math.max(0, distanceBetween(worker.position, prey.position) - strike.range));
		if (saved - pushed / quarry.runSpeed - detour / speed < MIN_GAIN_S)
			return null;
		return drive;
	}

	start(world, plan, worker, prey)
	{
		const drive = this.plan(world, worker, prey);
		if (!drive)
			return null;
		this.drives.set(worker.id, drive);
		this.count(drive.armed ? "lured" : "driven");
		return this.step(world, plan, drive, worker, prey);
	}

	requests(world, plan)
	{
		const workers = new Map(world.workers.map(worker => [worker.id, worker]));
		const game = new Map(world.game.map(prey => [prey.id, prey]));
		const requests = [];
		for (const drive of [...this.drives.values()])
		{
			const worker = workers.get(drive.hunter);
			const prey = game.get(drive.prey);
			if (!worker || !prey)
			{
				this.end(drive, prey ? "hunter" : drive.armed || drive.phase === "kill" ? "killed" : "gone");
				continue;
			}
			const request = this.step(world, plan, drive, worker, prey);
			if (request)
				requests.push(request);
		}
		return requests;
	}

	step(world, plan, drive, worker, prey)
	{
		const anchor = world.anchors.find(candidate => candidate.id === drive.anchor);
		if (!anchor)
			return this.finish(plan, drive, prey, "anchor");
		const distance = distanceBetween(anchor.position, prey.position) - anchor.radius;
		const stride = drive.pace * this.gap / 1000;
		if (drive.armed && drive.phase !== "fight")
		{
			if (worker.hitpoints < WOUNDED * this.catalog.combat(worker.template).hp)
				return this.finish(plan, drive, prey, "wounded", distance, anchor);
			const danger = this.danger(world, worker);
			if (danger.gap < this.safety(drive))
				return this.walk(plan, drive, worker, this.escape(drive, worker, danger.threat, anchor));
		}
		if (drive.phase === "kite")
			return world.time - drive.since > KITE_LIMIT_MS ? this.finish(plan, drive, prey, "late", distance, anchor) :
				this.kite(plan, drive, worker, prey);
		if (drive.phase === "fight")
		{
			if (world.time - drive.since > LIMIT_MS)
				return this.finish(plan, drive, prey, "late", distance);
			if (drive.engaged && !worker.idle)
				return this.order(plan, drive, hold());
			drive.engaged = true;
			return this.track(drive, gatherRequest("economy", huntPurpose("fight"), drive.hunter, prey.id, FOOD, plan.values.assignIdleWorker, 1));
		}
		if (drive.phase === "kill")
		{
			if (distance > ARRIVAL + stride && prey.fleeing && world.time - drive.since <= LIMIT_MS)
			{
				drive.phase = "drive";
				drive.spot = null;
				this.count("overshot");
				return this.walk(plan, drive, worker, this.lead(drive, prey, anchor));
			}
			return worker.idle ? this.finish(plan, drive, prey, "idle", distance) : this.order(plan, drive, hold());
		}
		if (distance <= ARRIVAL + stride / 2)
			return this.close(world, plan, drive, worker, prey, anchor, distance);
		if (world.time - drive.since > LIMIT_MS)
			return this.finish(plan, drive, prey, "late", distance, anchor);
		const side = drive.armed ? toward : awayFrom;
		if (drive.phase === "approach")
		{
			if (!drive.armed && prey.hitpoints < prey.maxHitpoints && !drive.struck)
				return this.finish(plan, drive, prey, "taken", distance, anchor);
			const spot = side(prey.position, anchor.position, drive.standoff);
			if (distanceBetween(worker.position, spot) <= SPOT_TOLERANCE || worker.idle && this.facing(drive, worker, prey, anchor) &&
			    (!drive.armed || distanceBetween(worker.position, prey.position) >= this.safety(drive)))
			{
				drive.phase = "strike";
				drive.waits = 0;
				drive.hitpoints = prey.hitpoints;
				return this.order(plan, drive, attack(prey.id));
			}
			return this.walk(plan, drive, worker, spot);
		}
		if (drive.phase === "strike")
		{
			if (prey.hitpoints < drive.hitpoints)
			{
				drive.phase = drive.armed ? "lure" : "drive";
				drive.struck = true;
				drive.spot = null;
				return this.walk(plan, drive, worker, this.lead(drive, prey, anchor));
			}
			drive.waits += 1;
			if (drive.waits > STRIKE_WAITS)
				return drive.armed ? this.close(world, plan, drive, worker, prey, anchor, distance) :
					this.finish(plan, drive, prey, "missed", distance);
			return this.order(plan, drive, hold());
		}
		if (drive.armed ? !prey.fighting : !prey.fleeing)
		{
			if (!drive.armed && !this.survives(drive.strike, prey.hitpoints))
				return this.finish(plan, drive, prey, "stopped", distance);
			drive.phase = "approach";
			drive.spot = null;
			this.count("restruck");
			return this.walk(plan, drive, worker, side(prey.position, anchor.position, drive.standoff));
		}
		return this.walk(plan, drive, worker, this.lead(drive, prey, anchor));
	}

	lead(drive, prey, anchor)
	{
		if (!drive.armed)
			return awayFrom(prey.position, anchor.position, drive.follow);
		const stride = drive.pace * this.gap / 1000;
		return toward(prey.position, anchor.position, Math.min(drive.reach + 2 * stride + LEAD_MARGIN, VISION_SHARE * drive.vision));
	}

	close(world, plan, drive, worker, prey, anchor, distance)
	{
		if (!drive.armed)
		{
			drive.phase = "kill";
			this.count("arrived");
			this.count("arrivedAt", Math.round(distance));
			return this.track(drive, gatherRequest("economy", huntPurpose("kill"), drive.hunter, prey.id, FOOD, plan.values.assignIdleWorker, 1));
		}
		if (drive.fight === "stand")
		{
			drive.phase = "fight";
			drive.since = world.time;
			drive.engaged = false;
			this.count("fought");
			this.count("foughtAt", Math.round(distance));
			return this.step(world, plan, drive, worker, prey);
		}
		drive.phase = "kite";
		drive.since = world.time;
		drive.spot = null;
		this.count("kited");
		return this.step(world, plan, drive, worker, prey);
	}

	safety(drive)
	{
		return drive.reach + drive.pace * this.gap / 1000 + KITE_MARGIN;
	}

	danger(world, worker)
	{
		let threat = null;
		let gap = Infinity;
		for (const other of world.game)
		{
			if (!other.armed || !other.fighting)
				continue;
			const distance = distanceBetween(worker.position, other.position);
			if (distance < gap)
			{
				threat = other;
				gap = distance;
			}
		}
		return { threat, gap };
	}

	escape(drive, worker, threat, anchor)
	{
		const away = direction(threat.position, worker.position);
		const home = direction(worker.position, anchor.position);
		const heading = [away[0] + ESCAPE_PULL * home[0], away[1] + ESCAPE_PULL * home[1]];
		return toward(worker.position, [worker.position[0] + heading[0], worker.position[1] + heading[1]],
			ESCAPE_STRIDES * drive.pace * this.gap / 1000 + KITE_MARGIN);
	}

	kite(plan, drive, worker, prey)
	{
		drive.spot = null;
		if (worker.state.striking && worker.target === prey.id)
			return this.order(plan, drive, hold());
		return this.order(plan, drive, attack(prey.id));
	}

	facing(drive, worker, prey, anchor)
	{
		const side = drive.armed ? direction(prey.position, anchor.position) : direction(anchor.position, prey.position);
		const from = direction(prey.position, worker.position);
		return distanceBetween(worker.position, prey.position) < drive.strike.range && side[0] * from[0] + side[1] * from[1] >= FACING;
	}

	walk(plan, drive, worker, spot)
	{
		if (drive.spot && distanceBetween(drive.spot, spot) <= RETARGET && !worker.idle)
			return this.order(plan, drive, hold());
		drive.spot = spot;
		return this.order(plan, drive, walkTo(spot[0], spot[1]));
	}

	order(plan, drive, action)
	{
		return this.track(drive, orderRequest("economy", huntPurpose(drive.phase), drive.hunter, action, plan.values.assignIdleWorker, 1));
	}

	track(drive, request)
	{
		this.issued.set(request, drive.hunter);
		return request;
	}

	finish(plan, drive, prey, reason, distance, anchor)
	{
		this.end(drive, reason, distance);
		if (drive.armed && drive.fight !== "stand")
			return anchor ? this.order(plan, drive, walkTo(anchor.position[0], anchor.position[1])) : null;
		return gatherRequest("economy", huntPurpose("kill"), drive.hunter, prey.id, FOOD, plan.values.assignIdleWorker, 1);
	}

	end(drive, reason, distance)
	{
		this.drives.delete(drive.hunter);
		this.spent.set(drive.prey, this.lastTime);
		this.count(reason);
		if (distance !== undefined)
			this.count(reason + "At", Math.round(distance));
	}

	count(key, amount)
	{
		this.tally[key] = (this.tally[key] || 0) + (amount === undefined ? 1 : amount);
	}

	settle(outcomes)
	{
		for (const entry of outcomes)
		{
			if (!entry || !this.issued.has(entry.request) || entry.outcome === GRANTED)
				continue;
			const drive = this.drives.get(this.issued.get(entry.request));
			if (drive)
				this.end(drive, "denied");
		}
	}
}
