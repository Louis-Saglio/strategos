import { byClass } from "simulation/ai/common-api/filters.js";
import { squareDistance } from "simulation/ai/strategos/geometry.js";
import { landRegionsOf } from "simulation/ai/strategos/terrain.js";
import { stateOf } from "simulation/ai/strategos/unitstate.js";

export function homeRegionOf(gameState, centres)
{
	return centres.length ? gameState.sharedScript.accessibility.getAccessValue(centres[0].position) : 0;
}

function presence(accessibility, present)
{
	const regions = new Map();
	const regionEntry = region => {
		if (!regions.has(region))
			regions.set(region, { "id": region, "workers": 0, "idle": 0, "settlers": 0, "fighters": 0, "anchors": 0, "docks": 0, "centres": 0,
				"enemyStructures": 0 });
		return regions.get(region);
	};
	for (const worker of present.workers)
	{
		const entry = regionEntry(worker.region);
		entry.workers += 1;
		if (worker.idle)
			entry.idle += 1;
	}
	for (const settler of present.settlers)
		regionEntry(settler.region).settlers += 1;
	for (const fighter of present.fighters)
		regionEntry(fighter.region).fighters += 1;
	for (const region of landRegionsOf(accessibility, present.anchors))
		regionEntry(region).anchors += 1;
	for (const dock of present.docks)
		regionEntry(dock.region).docks += 1;
	for (const centre of present.centres)
		regionEntry(accessibility.getAccessValue(centre.position)).centres += 1;
	for (const structure of present.enemyStructures)
		regionEntry(structure.region).enemyStructures += 1;
	return [...regions.values()].sort((a, b) => a.id - b.id).map(entry => Object.freeze(entry));
}

function seaCrossing(accessibility, homeRegion, seas, centres, objectives)
{
	let crossing = null;
	if (centres.length && objectives.length && !objectives.some(target => target.region === homeRegion))
	{
		const home = centres[0].position;
		for (const target of objectives)
		{
			const sea = seas.find(candidate => (accessibility.regionLinks[candidate] || []).includes(target.region));
			if (sea === undefined)
				continue;
			const distance = squareDistance(target.position, home);
			if (!crossing || distance < crossing.distance || (distance === crossing.distance && target.id < crossing.target))
				crossing = { "target": target.id, "position": target.position, "region": target.region, "sea": sea, "distance": distance };
		}
	}
	return crossing ? Object.freeze(crossing) : null;
}

function relicsSeen(gameState)
{
	const accessibility = gameState.sharedScript.accessibility;
	const relics = [];
	for (const ent of gameState.updatingGlobalCollection("strategos-relics", byClass("Relic")).values())
		if (ent.position())
			relics.push(Object.freeze({
				"id": ent.id(),
				"position": ent.position(),
				"owner": ent.owner(),
				"region": accessibility.getAccessValue(ent.position()),
				"state": stateOf(ent)
			}));
	return relics.sort((a, b) => a.id - b.id);
}

export function mapSection(gameState, homeRegion, present)
{
	const accessibility = gameState.sharedScript.accessibility;
	const seas = accessibility.regionLinks[homeRegion] || [];
	return {
		"now": {
			"mapSize": accessibility.width * accessibility.cellSize,
			"grids": Object.freeze({
				"passability": gameState.getPassabilityMap(),
				"territory": gameState.sharedScript.territoryMap,
				"buildingLand": gameState.getPassabilityClassMask("building-land"),
				"buildingShore": gameState.getPassabilityClassMask("building-shore")
			}),
			"homeRegion": homeRegion,
			"seas": Object.freeze(seas.slice()),
			"regionLinks": accessibility.regionLinks,
			"regionOf": position => accessibility.getAccessValue(position),
			"regionArea": region => (accessibility.regionSize[region] || 0) * accessibility.cellSize * accessibility.cellSize,
			"regions": Object.freeze(presence(accessibility, present)),
			"ownSide": position => {
				let own = Infinity;
				for (const centre of present.centres)
					own = Math.min(own, squareDistance(centre.position, position));
				let theirs = Infinity;
				for (const centre of present.enemyCentres)
					theirs = Math.min(theirs, squareDistance(centre.position, position));
				return own <= theirs;
			},
			"crossing": seaCrossing(accessibility, homeRegion, seas, present.centres, present.enemyTargets)
		},
		"later": {
			"relics": () => Object.freeze(relicsSeen(gameState))
		}
	};
}
