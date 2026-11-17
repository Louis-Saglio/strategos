import { RETRY_MS } from "simulation/ai/strategos/cadence.js";
import { centroid, squareDistance } from "simulation/ai/strategos/geometry.js";
import { EMBARK_MIN_SHARE, MIN_SETTLERS } from "simulation/ai/strategos/naval-convoys.js";
import { objectiveFrom, remoteShore, shoreNear, shorePoints } from "simulation/ai/strategos/naval-shores.js";
import { Retry } from "simulation/ai/strategos/switches.js";

const HOME_CALM_THREATS = 3;
const LANDING_CLEARANCE = 40;
const SETTLER_SHARE = 3;
const MAX_FERRIES = 3;

export class Crossings
{
	constructor(catalog, telemetry, convoys, commitments)
	{
		this.catalog = catalog;
		this.telemetry = telemetry;
		this.convoys = convoys;
		this.commitments = commitments;
		this.tried = new Retry();
	}

	plan(world, priorities)
	{
		this.planSettlement(world, priorities);
		this.planFerry(world, priorities);
		return this.planInvasion(world, priorities);
	}

	freeTransports(world, sea, origin)
	{
		return world.ships
			.filter(ship => ship.capacity > 0 && !ship.bombard && !ship.cargo.length && ship.sea === sea && !this.commitments.holds(ship.id))
			.map(ship => ({ ship, "distance": squareDistance(ship.position, origin) }))
			.sort((a, b) => a.distance - b.distance || a.ship.id - b.ship.id)
			.map(entry => entry.ship);
	}

	planSettlement(world, priorities)
	{
		const colony = priorities.colony;
		if (!colony || this.commitments.underWay("settle").some(convoy => convoy.objective === colony.region) ||
		    world.settlers.some(settler => settler.region === colony.region))
			return;
		const dock = world.docks.find(candidate => candidate.region === world.homeRegion && candidate.sea === colony.sea);
		if (!dock)
			return;
		const ship = this.freeTransports(world, colony.sea, dock.position)[0];
		const structure = colony.kind === "centre" ? name => this.catalog.isSettlement(name) :
			name => this.catalog.isShoreStructure(name) && this.catalog.trainsTransports(name);
		const able = world.workers.filter(worker => worker.region === world.homeRegion && !this.commitments.holds(worker.id) &&
			worker.buildable.some(structure));
		if (!ship || able.length < MIN_SETTLERS || !this.tried.attempt(world.time, RETRY_MS, "settle"))
			return;
		const wanted = Math.max(MIN_SETTLERS, Math.min(colony.kind === "centre" ? priorities.naval.founders : priorities.naval.settlers,
			Math.floor(able.length / SETTLER_SHARE)));
		const party = able
			.map(worker => ({ worker, "distance": squareDistance(worker.position, dock.position) }))
			.sort((a, b) => (b.worker.soldier ? 1 : 0) - (a.worker.soldier ? 1 : 0) || a.distance - b.distance || a.worker.id - b.worker.id)
			.slice(0, Math.min(ship.capacity, wanted))
			.map(entry => entry.worker);
		this.convoys.launch(world, "settle", [ship], party, { "region": world.homeRegion, "sea": colony.sea, "position": dock.position },
			{ "region": colony.region, "position": colony.position }, MIN_SETTLERS, { "build": colony.kind });
	}

	planFerry(world, priorities)
	{
		const ferry = priorities.ferry;
		if (!ferry || this.commitments.underWay("ferry").length >= MAX_FERRIES)
			return;
		const dock = world.docks.find(candidate => candidate.region === ferry.from && candidate.sea === ferry.sea);
		const arrival = world.docks.find(candidate => candidate.region === ferry.to);
		if (!dock || !arrival)
			return;
		const ship = this.freeTransports(world, ferry.sea, dock.position)[0];
		if (!ship || !this.tried.attempt(world.time, RETRY_MS, "ferry"))
			return;
		const rank = worker => worker.idle ? -1 : ferry.excess.indexOf(worker.gathering);
		const able = world.workers.filter(worker => worker.region === ferry.from && !this.commitments.holds(worker.id) &&
			worker.gatherTypes.includes(ferry.code) && (worker.idle || worker.gathering && worker.gathering !== ferry.code) &&
			!worker.state.repairing && !worker.state.fighting);
		const party = able
			.map(worker => ({ worker, "rank": rank(worker), "distance": squareDistance(worker.position, dock.position) }))
			.filter(entry => entry.rank >= -1)
			.sort((a, b) => a.rank - b.rank || (a.worker.soldier ? 1 : 0) - (b.worker.soldier ? 1 : 0) || a.distance - b.distance ||
				a.worker.id - b.worker.id)
			.slice(0, Math.min(ship.capacity, ferry.count))
			.map(entry => entry.worker);
		if (party.length < MIN_SETTLERS)
			return;
		this.convoys.launch(world, "ferry", [ship], party, { "region": ferry.from, "sea": ferry.sea, "position": dock.position },
			{ "region": ferry.to, "position": arrival.position }, MIN_SETTLERS, { "code": ferry.code });
	}

	planInvasion(world, priorities)
	{
		let verdict = { "why": this.commitments.underWay("invade").length ? "under way" :
			world.threats.length >= HOME_CALM_THREATS ? "threats" : world.ships.length < world.enemyWarships ? "sea" :
			!world.enemyTargets.length ? "no target" : "no army" };
		if (verdict.why !== "no army")
			return verdict;
		const offense = priorities.offense;
		const plan = priorities.naval;
		const groups = new Map();
		for (const fighter of world.fighters)
		{
			if (fighter.state.fighting || this.commitments.holds(fighter.id))
				continue;
			if (!groups.has(fighter.region))
				groups.set(fighter.region, []);
			groups.get(fighter.region).push(fighter);
		}
		const present = new Map(world.regions.map(region => [region.id, region]));
		const order = [...groups.keys()].sort((a, b) =>
			(b === world.homeRegion) - (a === world.homeRegion) || groups.get(b).length - groups.get(a).length || a - b);
		for (const region of order)
		{
			const group = groups.get(region);
			if (present.has(region) && present.get(region).enemyStructures > 0)
				continue;
			const centre = centroid(group);
			const objective = objectiveFrom(world, region, region === world.homeRegion ? world.home.position : centre);
			const note = (why, details) => {
				if (verdict.why === "no army" || region === world.homeRegion)
					verdict = Object.assign({ "why": why, "from": region, "group": group.length }, details || {});
			};
			if (!objective)
			{
				note("no objective");
				continue;
			}
			const landed = present.has(objective.region) ? present.get(objective.region).fighters : 0;
			const least = landed >= offense.minArmy ? plan.reinforcement : offense.minArmy;
			const state = { "landed": landed, "enemy": world.enemySoldiers };
			if (group.length < least)
			{
				note("small", state);
				continue;
			}
			if (group.length + landed < plan.superiority * world.enemySoldiers)
			{
				note("inferior", state);
				continue;
			}
			if (landed < offense.minArmy && group.length < plan.edge * world.enemySoldiers &&
			    group.length < plan.massShare * world.populationMax)
			{
				note("no edge", state);
				continue;
			}
			const dock = world.docks.find(candidate => candidate.region === region && candidate.sea === objective.sea);
			const beach = dock ? null : shoreNear(world, region, objective.sea, centre);
			if (!dock && !beach)
			{
				note("no quay", state);
				continue;
			}
			const origin = dock ? dock.position : beach.water;
			const ships = this.freeTransports(world, objective.sea, origin).slice(priorities.colony || priorities.ferry ? 1 : 0);
			const capacity = ships.reduce((sum, ship) => sum + ship.capacity, 0);
			if (capacity < Math.min(least, group.length) || landed < offense.minArmy &&
			    capacity < plan.carried * Math.min(group.length, plan.maxCapacity))
			{
				note("no ships", Object.assign(state, { "capacity": capacity, "ships": ships.length }));
				continue;
			}
			note("launch", state);
			if (!this.tried.attempt(world.time, RETRY_MS, "invade"))
				return verdict;
			const sheltered = shore => !world.enemyStructures.some(structure => {
				if (!structure.fire.arrows)
					return false;
				const reach = structure.range + LANDING_CLEARANCE;
				return squareDistance(structure.position, shore.land) <= reach * reach;
			});
			const party = group
				.map(fighter => ({ fighter, "distance": squareDistance(fighter.position, origin) }))
				.sort((a, b) => a.distance - b.distance || a.fighter.id - b.fighter.id)
				.slice(0, capacity)
				.map(entry => entry.fighter);
			const used = [];
			let room = 0;
			for (const ship of ships)
			{
				if (room >= party.length)
					break;
				used.push(ship);
				room += ship.capacity;
			}
			const front = priorities.forward && priorities.forward.region === objective.region && priorities.forward.sea === objective.sea ?
				priorities.forward : null;
			const covered = !front && !shorePoints(world, objective.region, objective.sea, objective.position, 1, sheltered).length;
			const remote = covered ? remoteShore(world, objective.region, objective.sea) : null;
			const to = front ? { "region": objective.region, "position": front.position } :
				remote ? { "region": objective.region, "position": remote.land } :
				{ "region": objective.region, "position": objective.position, "accept": sheltered };
			if (!this.convoys.launch(world, "invade", used, party, { "region": region, "sea": objective.sea, "position": origin }, to,
				EMBARK_MIN_SHARE * party.length, { "from": region, "landed": landed, "enemySoldiers": world.enemySoldiers, "covered": covered,
					"forward": !!front }))
				this.telemetry.line("NAVAL", world.time, { "noLanding": objective.region });
			return verdict;
		}
		return verdict;
	}
}
