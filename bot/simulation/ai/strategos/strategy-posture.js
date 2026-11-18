import { PATIENCE_MS } from "simulation/ai/strategos/cadence.js";
import { arriving, covering, engagement, forecast, walkSeconds, within } from "simulation/ai/strategos/forecast.js";
import { squareDistance } from "simulation/ai/strategos/geometry.js";
import { NO_STATE } from "simulation/ai/strategos/unitstate.js";
import { Hysteresis } from "simulation/ai/strategos/switches.js";
import { TRAINING_BATCH, exchangeOutlook } from "simulation/ai/strategos/valuation.js";

export class Posture
{
	constructor(catalog)
	{
		this.catalog = catalog;
		this.plenty = new Hysteresis(false);
		this.underThreat = new Hysteresis(false);
		this.phaseWanted = 0;
	}

	save()
	{
		return { "plenty": this.plenty.save(), "underThreat": this.underThreat.save(), "phaseWanted": this.phaseWanted, "raidedAt": this.raidedAt,
			"stance": this.stance, "blockedSince": this.blockedSince };
	}

	restore(data)
	{
		this.plenty.restore(data.plenty);
		this.underThreat.restore(data.underThreat);
		this.phaseWanted = data.phaseWanted;
		this.raidedAt = data.raidedAt;
		this.stance = data.stance;
		this.blockedSince = data.blockedSince;
	}

	assess(world, plan)
	{
		const military = plan.military;
		const level = this.plenty.threshold(military.plenty.enter, military.plenty.exit);
		this.plenty.on = world.codes.every(code => world.resources[code] >= level);
		const target = this.plenty.on ? military.civilianFloor : Math.min(military.civilianTarget, Math.round(military.civilianShare * world.populationMax));
		const hostiles = world.threats.length + world.wild.length;
		if (hostiles >= military.raid.hostiles && hostiles >= military.raid.share * (world.fighters.length + world.garrisonedSoldiers))
			this.raidedAt = world.time;
		const raided = this.raidedAt !== undefined && world.time - this.raidedAt < military.raid.memoryMs || this.threatened(world, plan);
		const changed = !this.stance || this.stance.civilianTarget !== target || this.stance.plentiful !== this.plenty.on ||
			this.stance.raided !== raided;
		if (changed)
			this.stance = Object.freeze({ "civilianTarget": target, "plentiful": this.plenty.on, "raided": raided });
		return { "stance": this.stance, "advancePhase": this.wantsPhase(world, plan), "changed": changed };
	}

	threatened(world, plan)
	{
		const threat = plan.military.threat;
		const home = world.home;
		const ready = world.enemyFighters.filter(unit => !unit.state.working);
		if (!home || ready.length < threat.minEnemy)
		{
			this.underThreat.on = false;
			return false;
		}
		const ours = world.fighters.filter(fighter => fighter.region === world.homeRegion);
		const cover = covering(world.holders, home.position, []);
		const outlook = forecast(engagement(this.catalog, ours, ready, cover, [], [], [], true),
			{ "horizonS": threat.horizonS, "joinScale": 0 });
		const ratio = outlook.theirs.value / Math.max(1, outlook.ours.value);
		return this.underThreat.below(ratio, threat.enter, threat.exit);
	}

	homeOutlook(world, plan)
	{
		const home = world.home;
		if (!home)
			return null;
		const centre = home.position;
		const enemies = this.enemyArrivals(world, centre);
		const ours = world.fighters.filter(fighter => fighter.region === world.homeRegion);
		const close = within(ours, centre);
		const coming = arriving(this.catalog, ours, centre, new Set(close.map(unit => unit.id)), false, Infinity, true);
		const latest = enemies.reduce((last, entry) => Math.max(last, entry.seconds), 0);
		const horizonS = latest + plan.guard.horizonS;
		const opposing = enemies.concat(this.enemyRecruits(world, centre, horizonS));
		const cover = covering(world.holders, centre, []);
		const lines = this.soldierLines(world);
		const ratios = [];
		const recruits = [];
		for (let count = 0; count <= lines.length; ++count)
		{
			const made = this.recruits(world, centre, lines.slice(0, count), horizonS);
			recruits.push(made.length);
			const outlook = forecast(engagement(this.catalog, close, [], cover, [], coming.concat(made), opposing, true),
				{ "horizonS": horizonS, "arrivals": 1, "joinScale": 0 });
			ratios.push([outlook.ours.left, outlook.theirs.left, Math.round(outlook.theirs.value / Math.max(1, outlook.ours.value) * 100) / 100]);
		}
		const sorted = enemies.map(entry => entry.seconds).sort((a, b) => a - b);
		return {
			"enemy": enemies.length,
			"enemyRecruits": opposing.length - enemies.length,
			"arrivalS": sorted.length ? Math.round(sorted[Math.floor(sorted.length / 2)]) : null,
			"horizonS": Math.round(horizonS),
			"present": close.length,
			"coming": coming.length,
			"lines": lines.length,
			"recruits": recruits,
			"outcomes": ratios
		};
	}

	enemyArrivals(world, centre)
	{
		const arrivals = arriving(this.catalog, world.enemyFighters, centre, new Set(), false, Infinity, true);
		for (const unit of world.enemyHidden)
		{
			const origin = this.nearestCentre(world, unit.owner, centre);
			if (origin)
				arrivals.push({ "unit": unit, "seconds": walkSeconds(this.catalog, unit.template, unit.owner, squareDistance(origin, centre)) });
		}
		return arrivals;
	}

	nearestCentre(world, owner, centre)
	{
		const record = world.players.find(player => player.id === owner);
		let best = null;
		for (const structure of record ? record.centres : [])
			if (!best || squareDistance(structure.position, centre) < squareDistance(best, centre))
				best = structure.position;
		return best;
	}

	enemyRecruits(world, centre, horizonS)
	{
		const recruits = [];
		for (const record of world.players)
		{
			if (record.relation !== "enemy" || record.defeated)
				continue;
			const origin = this.nearestCentre(world, record.id, centre);
			if (!origin)
				continue;
			for (const group of record.muster)
			{
				const walk = walkSeconds(this.catalog, group.template, group.owner, squareDistance(origin, centre));
				const hitpoints = this.catalog.combat(group.template, group.owner).hp;
				for (let k = 1; k / group.rate + walk < horizonS; ++k)
					recruits.push({ "unit": { "id": -(recruits.length + 1), "template": group.template, "owner": group.owner, "hitpoints": hitpoints,
						"state": NO_STATE }, "seconds": k / group.rate + walk });
			}
		}
		return recruits;
	}

	soldierLines(world)
	{
		const lines = [];
		for (const trainer of world.trainers)
		{
			const template = this.catalog.cheapest(trainer.trainable, name => this.catalog.isFighter(name));
			if (!template || !trainer.position)
				continue;
			const seconds = this.catalog.buildTime(template) * Math.pow(TRAINING_BATCH, trainer.batchTimeModifier) / TRAINING_BATCH;
			if (seconds > 0)
				lines.push({ "trainer": trainer, "template": template, "seconds": seconds });
		}
		return lines.sort((a, b) => a.seconds - b.seconds || a.trainer.id - b.trainer.id);
	}

	recruits(world, centre, lines, horizonS)
	{
		const events = [];
		for (const line of lines)
		{
			const walk = walkSeconds(this.catalog, line.template, world.player, squareDistance(line.trainer.position, centre));
			for (let k = 1; k * line.seconds + walk < horizonS; ++k)
				events.push({ "line": line, "made": k * line.seconds, "seconds": k * line.seconds + walk });
		}
		events.sort((a, b) => a.made - b.made || a.line.trainer.id - b.line.trainer.id);
		const spent = {};
		for (const code of world.codes)
			spent[code] = 0;
		let room = world.populationMax - world.population - world.queuedPopulation;
		const made = [];
		for (const event of events)
		{
			const cost = this.catalog.cost(event.line.template);
			const population = this.catalog.population(event.line.template);
			if (population > room || world.codes.some(code => spent[code] + cost[code] > world.resources[code] + world.demand.income[code] * event.made))
				continue;
			room -= population;
			for (const code of world.codes)
				spent[code] += cost[code];
			made.push({ "unit": { "id": -(made.length + 1), "template": event.line.template, "owner": world.player,
				"hitpoints": this.catalog.combat(event.line.template, world.player).hp, "state": NO_STATE }, "seconds": event.seconds });
		}
		return made;
	}

	wantsPhase(world, plan)
	{
		const next = world.phase + 1;
		if (this.phaseWanted === next || this.plenty.on && !!world.nextPhaseTech)
			return true;
		if (world.phase === 1 && world.population >= plan.colonyPhasePopulation && world.regions.some(region =>
			region.id !== world.homeRegion && region.docks > 0 && !region.centres && world.regionArea(region.id) >= plan.centreArea))
		{
			this.phaseWanted = next;
			return true;
		}
		const housed = world.population + world.queuedPopulation >= world.populationLimit - plan.blockedGrowth.room &&
			world.populationLimit < world.populationMax && !world.foundations.some(foundation => foundation.populationBonus > 0) &&
			!world.pendingConstructions.some(pending => this.catalog.populationBonus(pending.template) > 0);
		if (!housed)
			this.blockedSince = undefined;
		else if (this.blockedSince === undefined)
			this.blockedSince = world.time;
		const byBlockedGrowth = housed && world.time - this.blockedSince >= PATIENCE_MS && !!world.nextPhaseTech &&
			world.codes.every(code => world.resources[code] >= world.nextPhaseCost[code]);
		if (byBlockedGrowth)
			this.phaseWanted = next;
		const byPopulation = byBlockedGrowth || world.population >= (plan.phaseUpPopulation[next] || Infinity);
		const { surplus } = exchangeOutlook(world);
		const bySurplus = next >= plan.surplusPhaseFrom && !!world.nextPhaseTech &&
			world.codes.every(code => surplus[code] >= world.nextPhaseCost[code]);
		if (bySurplus)
			this.phaseWanted = next;
		return byPopulation || bySurplus;
	}
}
