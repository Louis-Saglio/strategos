import { PATIENCE_MS } from "simulation/ai/strategos/cadence.js";
import { covering, engagement, forecast } from "simulation/ai/strategos/forecast.js";
import { Hysteresis } from "simulation/ai/strategos/switches.js";
import { exchangeOutlook } from "simulation/ai/strategos/valuation.js";

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
