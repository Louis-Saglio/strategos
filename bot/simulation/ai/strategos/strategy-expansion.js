import { RETRY_MS } from "simulation/ai/strategos/cadence.js";
import { distanceBetween, squareDistance } from "simulation/ai/strategos/geometry.js";
import { rankedSites } from "simulation/ai/strategos/sites.js";
import { Retry } from "simulation/ai/strategos/switches.js";
import { territoryAt } from "simulation/ai/strategos/terrain.js";

export class Expansion
{
	constructor(catalog)
	{
		this.catalog = catalog;
		this.colonySearched = new Retry();
		this.frontSearched = new Retry();
	}

	save()
	{
		return { "colonySearched": this.colonySearched.save(), "frontSearched": this.frontSearched.save(), "ferried": this.ferried,
			"colonySite": this.colonySite, "front": this.front };
	}

	restore(data)
	{
		this.colonySearched.restore(data.colonySearched);
		this.frontSearched.restore(data.frontSearched);
		this.ferried = data.ferried;
		this.colonySite = data.colonySite;
		this.front = data.front;
	}

	assess(world, plan, labour)
	{
		const ferry = this.ferry(world, plan, labour);
		this.changed = (this.ferried && this.ferried.to) !== (ferry && ferry.to);
		this.ferried = ferry;
		const colony = this.colony(world, plan, labour, ferry);
		const forward = this.forward(world, plan);
		return { "ferry": ferry, "colony": colony, "forward": forward, "changed": this.changed };
	}

	link(world, from, to)
	{
		return (world.regionLinks[from] || []).find(sea => (world.regionLinks[sea] || []).includes(to));
	}

	ferry(world, plan, labour)
	{
		const rules = plan.ferry;
		if (!world.centres.length || !labour.starved.length)
			return null;
		const ports = world.regions.filter(region => region.anchors > 0 && region.docks > 0);
		const from = ports.filter(region => region.idle >= rules.minParty).sort((a, b) => b.idle - a.idle || a.id - b.id)[0] ||
			ports.sort((a, b) => b.workers - a.workers || a.id - b.id)[0];
		if (!from)
			return null;
		for (const code of labour.starved)
		{
			let best = null;
			for (const region of world.regions)
			{
				if (region.id === from.id || !region.anchors || region.enemyStructures)
					continue;
				const sea = this.link(world, from.id, region.id);
				const wealth = world.regionWealth(region.id, code);
				const room = Math.floor(wealth / rules.wealthPerWorker) - region.workers;
				if (sea === undefined || wealth < rules.minWealth || room < rules.minParty)
					continue;
				if (!best || wealth > best.wealth)
					best = { "to": region.id, "sea": sea, "wealth": wealth, "room": room };
			}
			if (best)
				return Object.freeze({
					"from": from.id, "to": best.to, "sea": best.sea, "code": code,
					"count": Math.max(rules.minParty, Math.min(rules.maxParty, best.room, Math.round(labour.gaps[code]))),
					"excess": Object.freeze(labour.excess.filter(other => other !== code))
				});
		}
		return null;
	}

	colony(world, plan, labour, ferry)
	{
		const rules = plan.colony;
		const starved = ferry ? null : labour.short[0] || null;
		const outposts = world.regions.filter(region => region.id !== world.homeRegion && (region.docks > 0 || region.centres > 0)).length;
		if (!world.centres.length || !world.seas.length || outposts >= rules.max ||
		    world.regionArea(world.homeRegion) > rules.maxHomeArea && !starved)
			return null;
		const settlement = !starved && world.offered.some(name => this.catalog.isSettlement(name));
		if (this.colonySite && this.colonyOpen(world, plan, this.colonySite.position, this.colonySite.region) &&
		    (!starved || world.regionWealth(this.colonySite.region, starved) > 0 ||
		     world.regions.some(region => region.id === this.colonySite.region && region.settlers > 0)))
		{
			const kind = settlement && world.regionArea(this.colonySite.region) >= plan.centreArea ? "centre" : "dock";
			if (kind !== this.colonySite.kind)
			{
				this.colonySite = Object.freeze(Object.assign({}, this.colonySite, { "kind": kind }));
				this.changed = true;
			}
			return this.colonySite;
		}
		if (!this.colonySearched.attempt(world.time, RETRY_MS))
			return null;
		const found = this.findColony(world, plan, starved);
		this.colonySite = found && Object.freeze(Object.assign({}, found, {
			"starved": starved, "kind": settlement && world.regionArea(found.region) >= plan.centreArea ? "centre" : "dock"
		}));
		this.changed = this.changed || !!this.colonySite;
		return this.colonySite;
	}

	colonyOpen(world, plan, position, region)
	{
		const clearance = plan.sites.enemyClearance;
		return !world.regions.some(entry => entry.id === region && (entry.docks > 0 || entry.centres > 0 || entry.enemyStructures > 0)) &&
			!world.enemyStructures.some(structure => squareDistance(structure.position, position) < clearance * clearance);
	}

	findColony(world, plan, starved)
	{
		const rules = plan.colony;
		const grid = world.wealth;
		if (!world.codes.every(code => grid.totals[code]))
			return null;
		const home = world.home.position;
		const best = rankedSites(grid, world.codes, plan.sites.wealthCap, starved, rules.starvedWeight,
			position => {
				const region = world.regionOf(position);
				if (region < 2 || region === world.homeRegion || world.regionArea(region) < rules.minArea)
					return null;
				const sea = world.seas.find(candidate => (world.regionLinks[candidate] || []).includes(region));
				return sea === undefined || !this.colonyOpen(world, plan, position, region) ? null : { "region": region, "sea": sea };
			},
			(wealth, position) => {
				const score = wealth / (1 + distanceBetween(position, home) / rules.distanceScale);
				return score > 0 ? score : null;
			})[0];
		return best ? { "position": Object.freeze(best.position), "region": best.stand.region, "sea": best.stand.sea } : null;
	}

	forward(world, plan)
	{
		const rules = plan.forward;
		const crossing = world.crossing;
		if (!crossing || !world.offered.some(name => this.catalog.isSettlement(name)) ||
		    world.regions.some(region => region.id === crossing.region && region.centres > 0))
			return null;
		const clear = position => territoryAt(world.grids.territory, position[0], position[1]).owner === 0 &&
			!world.enemyStructures.some(structure => squareDistance(structure.position, position) < rules.clearance * rules.clearance);
		if (this.front && this.front.region === crossing.region && clear(this.front.position))
			return this.front;
		if (!this.frontSearched.attempt(world.time, RETRY_MS))
			return null;
		const grid = world.wealth;
		const best = rankedSites(grid, world.codes, plan.sites.wealthCap, null, 1,
			(position, index) => {
				if (world.regionOf(position) !== crossing.region || !world.codes.some(code => grid.totals[code] && grid.totals[code][index] > 0) ||
				    !clear(position))
					return null;
				const landing = Math.min(...world.shores.filter(shore => shore.region === crossing.region && shore.sea === crossing.sea)
					.map(shore => squareDistance(shore.land, position)));
				return landing > rules.shore * rules.shore ? null : true;
			},
			(wealth, position) => -squareDistance(position, crossing.position))[0];
		this.front = best ? Object.freeze({ "region": crossing.region, "sea": crossing.sea, "position": Object.freeze(best.position) }) : null;
		this.changed = this.changed || !!this.front;
		return this.front;
	}
}
