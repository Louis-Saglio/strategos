import { PATIENCE_MS, RETRY_MS } from "simulation/ai/strategos/cadence.js";
import { arriving, covering, engagement, forecast, walkSeconds, within } from "simulation/ai/strategos/forecast.js";
import { squareDistance } from "simulation/ai/strategos/geometry.js";
import { NO_STATE } from "simulation/ai/strategos/unitstate.js";
import { Hysteresis } from "simulation/ai/strategos/switches.js";
import { GATHER_EFFICIENCY, TECH_HORIZON_S, TRAINING_BATCH, exchangeOutlook, groupOutput } from "simulation/ai/strategos/valuation.js";

export class Posture
{
	constructor(catalog)
	{
		this.catalog = catalog;
		this.supplied = 0;
		this.exposed = new Hysteresis(false);
		this.drafted = 0;
		this.draftedAt = 0;
		this.phaseWanted = 0;
	}

	save()
	{
		return { "supplied": this.supplied, "exposed": this.exposed.save(), "drafted": this.drafted, "draftedAt": this.draftedAt, "phaseWanted": this.phaseWanted,
			"stance": this.stance, "blockedSince": this.blockedSince };
	}

	restore(data)
	{
		this.supplied = data.supplied;
		this.exposed.restore(data.exposed);
		this.drafted = data.drafted;
		this.draftedAt = data.draftedAt;
		this.phaseWanted = data.phaseWanted;
		this.stance = data.stance;
		this.blockedSince = data.blockedSince;
	}

	assess(world, plan)
	{
		const lines = this.soldierLines(world);
		const choices = lines.filter(line => line.trainer.trainable.some(name => this.catalog.isCivilian(name)));
		const fixed = lines.filter(line => !choices.includes(line));
		const supplied = this.supply(world, plan, fixed, choices);
		const drafted = this.draft(world, plan, fixed, choices);
		const exposed = this.expose(world, plan) ? choices.length : 0;
		const count = Math.max(supplied, drafted, exposed);
		const soldiers = choices.slice(0, count).map(line => line.trainer.id);
		const allLines = count > 0 && count === choices.length;
		const saturated = choices.length > 0 && supplied === choices.length;
		const changed = !this.stance || this.stance.saturated !== saturated || this.stance.drafted.length !== soldiers.length ||
			this.stance.drafted.some((id, index) => id !== soldiers[index]) || this.stance.allLines !== allLines;
		if (changed)
			this.stance = Object.freeze({ "drafted": soldiers, "supplied": supplied, "exposed": exposed > 0, "allLines": allLines,
				"saturated": saturated, "ready": this.ready });
		return { "stance": this.stance, "advancePhase": this.wantsPhase(world, plan), "changed": changed };
	}

	expose(world, plan)
	{
		if (!world.home)
			return this.exposed.below(Infinity, 1, plan.margin);
		const centre = world.home.position;
		const enemies = this.strongestArrivals(world, centre);
		const ours = world.fighters.filter(fighter => fighter.region === world.homeRegion);
		const close = within(ours, centre);
		const coming = arriving(this.catalog, ours, centre, new Set(close.map(unit => unit.id)), false, Infinity, true);
		const horizonS = enemies.reduce((last, entry) => Math.max(last, entry.seconds), 0) + plan.guard.horizonS;
		const outlook = enemies.length ? forecast(engagement(this.catalog, close, [], covering(world.holders, centre, []), [], coming, enemies, true),
			{ "horizonS": horizonS, "arrivals": 1, "joinScale": 0, "handicap": 1 / plan.margin }) : null;
		const exchange = outlook ? outlook.theirs.value / Math.max(1, outlook.ours.value) : Infinity;
		return this.exposed.below(exchange, 1, plan.margin);
	}

	strongestArrivals(world, centre)
	{
		const byOwner = new Map();
		for (const entry of this.enemyArrivals(world, centre))
		{
			if (!byOwner.has(entry.unit.owner))
				byOwner.set(entry.unit.owner, { "entries": [], "value": 0 });
			const record = byOwner.get(entry.unit.owner);
			record.entries.push(entry);
			record.value += this.catalog.costSum(entry.unit.template);
		}
		let best = null;
		for (const [, record] of [...byOwner].sort((a, b) => a[0] - b[0]))
			if (!best || record.value > best.value)
				best = record;
		return best ? best.entries : [];
	}

	supply(world, plan, fixed, choices)
	{
		const room = Math.max(0, world.populationMax - world.population - world.queuedPopulation) / TECH_HORIZON_S;
		const covered = (count, factor) => {
			const flow = {};
			for (const code of world.codes)
				flow[code] = 0;
			const batch = {};
			for (const code of world.codes)
				batch[code] = 0;
			let population = 0;
			for (const line of fixed.concat(choices.slice(0, count)))
			{
				const cost = this.catalog.cost(line.template);
				for (const code of world.codes)
				{
					flow[code] += cost[code] / line.seconds;
					batch[code] += cost[code] * TRAINING_BATCH;
				}
				population += this.catalog.population(line.template) / line.seconds;
			}
			const share = population > room ? room / population : 1;
			const banked = world.codes.every(code => !(flow[code] > 0) || world.resources[code] >= factor * share * flow[code] * TECH_HORIZON_S);
			const fed = world.codes.every(code => !(flow[code] > 0) ||
				world.demand.income[code] >= factor * share * flow[code] && world.resources[code] >= factor * batch[code]);
			return banked || fed;
		};
		let count = Math.min(this.supplied, choices.length);
		while (count < choices.length && covered(count + 1, plan.margin))
			++count;
		while (count > 0 && !covered(count, 1 / plan.margin))
			--count;
		this.supplied = count;
		return count;
	}

	draft(world, plan, fixed, choices)
	{
		const ready = world.home ? world.enemyFighters.filter(unit => !unit.state.working) : [];
		const held = Math.min(this.drafted, choices.length);
		const settled = world.time - this.draftedAt >= RETRY_MS;
		let wanted = settled ? 0 : held;
		if (ready.length && choices.length)
		{
			const centre = world.home.position;
			const enemies = arriving(this.catalog, ready, centre, new Set(), false, Infinity, true);
			const ours = world.fighters.filter(fighter => fighter.region === world.homeRegion);
			const close = within(ours, centre);
			const coming = arriving(this.catalog, ours, centre, new Set(close.map(unit => unit.id)), false, Infinity, true);
			const horizonS = enemies.reduce((last, entry) => Math.max(last, entry.seconds), 0) + plan.guard.horizonS;
			const cover = covering(world.holders, centre, []);
			const values = [];
			const growths = [];
			let best = 0;
			for (let count = 0; count <= choices.length; ++count)
			{
				const outlook = forecast(engagement(this.catalog, close, [], cover, [], coming.concat(
					this.recruits(world, centre, fixed.concat(choices.slice(0, count)), horizonS)), enemies, true),
					{ "horizonS": horizonS, "arrivals": 1, "joinScale": 0, "handicap": 1 / plan.margin });
				growths.push(this.growth(world, plan, choices.slice(count), horizonS, !(outlook.theirs.left > 0)));
				values.push(outlook.theirs.value - outlook.ours.value + growths[count]);
				if (values[count] > values[best])
					best = count;
			}
			const worth = values[best] - values[held] > (plan.margin - 1) * Math.abs(growths[best] - growths[held]);
			wanted = best !== held && worth && (best > held || settled) ? best : held;
		}
		if (wanted > held)
			this.draftedAt = world.time;
		this.drafted = wanted;
		this.ready = ready.length;
		return wanted;
	}

	growth(world, plan, lines, horizonS, stands)
	{
		const unpriced = {};
		for (const code of world.codes)
			unpriced[code] = 1;
		const measured = groupOutput(world, unpriced, "civilian");
		let value = 0;
		for (const line of lines)
		{
			const template = this.catalog.cheapest(line.trainer.trainable, name => this.catalog.isCivilian(name));
			const seconds = this.catalog.buildTime(template) * Math.pow(TRAINING_BATCH, line.trainer.batchTimeModifier) / TRAINING_BATCH;
			const rate = measured !== undefined ? measured : this.civilianRate(world, plan, template);
			for (let made = seconds; seconds > 0 && made < horizonS; made += seconds)
				value += stands ? rate * (horizonS - made) : -this.catalog.costSum(template);
		}
		return value;
	}

	civilianRate(world, plan, template)
	{
		const rates = this.catalog.gathering(this.catalog.template(template)).rates;
		let rate = 0;
		for (const code of world.codes)
		{
			let best = 0;
			for (const kind in rates)
				if (kind.split(".")[0] === code)
					best = Math.max(best, rates[kind]);
			rate += (plan.gatherShares[code] || 0) * best;
		}
		return GATHER_EFFICIENCY * rate;
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
		if (this.phaseWanted === next || this.stance.saturated && !!world.nextPhaseTech)
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
