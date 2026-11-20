import { WONDER } from "simulation/ai/strategos/construction-needs.js";
import { Guard, Relics } from "simulation/ai/strategos/guard.js";
import { Hysteresis } from "simulation/ai/strategos/switches.js";

const GAME_ENTER = 2000;
const GAME_EXIT = 800;

const BASE = {
	"values": { "shelter": 70, "founding": 65, "defend": 60, "relic": 35, "ferry": 45, "offense": 30, "wonder": 26, "build": 25, "treasure": 22, "assignIdleWorker": 20, "house": 15, "farm": 14, "fishing": 14, "phase": 16, "research": 13, "investment": 12, "support": 11, "trainWorker": 10, "barter": 9, "rebalance": 5 },
	"margin": 1.25,
	"minArmy": 25,
	"centreArea": 14000,
	"sites": { "wealthCap": 6000, "enemyClearance": 220 },
	"gatherShares": { "food": 0.5, "wood": 0.35, "stone": 0.05, "metal": 0.1 },
	"labour": { "smoothing": 0.1, "starvedMin": 4, "starvedShare": 0.12, "scarceWealth": 3000, "scarceCodes": ["wood", "stone", "metal"],
		"tradeScarceWealth": 3000, "tradeScarceCodes": ["stone", "metal"] },
	"military": { "civilianTarget": 80, "civilianShare": 0.4, "civilianFloor": 15,
		"plenty": { "enter": 8000, "exit": 3000 } },
	"phaseUpPopulation": { "2": 120, "3": 150 },
	"surplusPhaseFrom": 3,
	"blockedGrowth": { "room": 1 },
	"colonyPhasePopulation": 50,
	"guard": { "enter": 3, "exit": 1, "horizonS": 90, "near": 80 },
	"ferry": { "wealthPerWorker": 150, "minWealth": 600, "minParty": 3, "maxParty": 10 },
	"colony": { "maxHomeArea": 150000, "minArea": 6000, "max": 5, "distanceScale": 400, "starvedWeight": 4 },
	"forward": { "clearance": 250, "shore": 120 },
	"housing": { "base": 3, "perTrainer": 4 },
	"settlements": { "firstPopulation": 100, "populationPerSettlement": 70, "max": 4 },
	"docks": { "population": 40, "colonyPopulation": 20, "fishing": { "population": 20, "schools": 4, "reach": 300 }, "yardFishers": 18, "yardSpacing": 110 },
	"forwardBase": { "settlers": 15, "builders": 20, "reach": 120 },
	"tradePost": { "minDistance": 400 },
	"defense": { "engage": { "enter": 3, "exit": 2 } },
	"offense": { "breakers": { "perSoldiers": 25, "max": 5, "launch": 2 }, "exchange": { "maxCost": 0.3, "minCost": 0.1, "response": 1, "reaction": 0, "handicap": 0.8,
			"dominance": { "horizonS": 120 }, "attrition": { "min": 0.6, "max": 1.6 }, "reach": { "launch": 300 } },
		"targetsTried": 6, "recall": 0.1, "reinforce": { "min": 20 },
		"beachhead": { "superiority": 1, "reserve": 10 } },
	"hunting": { "hunters": 0, "meatPerHunter": 600, "relay": false },
	"medics": { "soldiersPerHealer": 12, "woundsPerHealer": 300, "max": 8 },
	"trade": { "minRate": 0.3, "richRate": 0.5, "max": 10, "populationPerTrader": 20 },
	"naval": { "maxCapacity": 200, "superiority": 1, "carried": 0.8, "seaSuperiority": 1.5, "settlers": 6, "founders": 10, "yardCrowd": 70, "reinforcement": 10, "massShare": 0.5, "edge": 1.3, "huntSuperiority": 1.2, "fleetMax": 24, "fightersPerShip": 8,
		"raid": { "minShips": 4, "reach": 50, "clearance": 12, "minPrey": 3, "hull": 0.35, "preyPerValue": 0.01 },
		"fishClearance": { "battery": 15, "structure": 70, "soldier": 65, "berth": 12, "flight": 90 },
		"bombard": { "ships": 6, "margin": 6, "clearance": 10, "bearings": 18, "searoom": 12, "tried": 40, "arrive": 20 },
		"fishing": { "maxBoats": 12, "perFish": 2 } },
	"behaviours": Object.freeze([]),
	"needs": Object.freeze([])
};

const PLANS = [
	{ "name": "regicide", "applies": context => context.victory.includes("regicide"), "set": {}, "behaviours": [Guard], "needs": [] },
	{ "name": "relics", "applies": context => context.victory.includes("capture_the_relic"), "set": {}, "behaviours": [Relics], "needs": [] },
	{ "name": "wonder", "applies": context => context.victory.includes("wonder"), "set": {}, "behaviours": [], "needs": [WONDER] },
	{ "name": "hunt", "applies": (context, signals) => signals.game, "set": { "hunting": { "hunters": 4, "relay": true } }, "behaviours": [], "needs": [] }
];

function overlay(base, set)
{
	const result = Object.assign({}, base);
	for (const key in set)
		result[key] = set[key] !== null && typeof set[key] === "object" && !Array.isArray(set[key]) && base[key] !== undefined ?
			overlay(base[key], set[key]) : set[key];
	return Object.freeze(result);
}

export class Plans
{
	constructor()
	{
		this.names = null;
		this.table = BASE;
		this.game = new Hysteresis(false);
	}

	save()
	{
		return { "names": this.names, "game": this.game.save() };
	}

	restore(data)
	{
		this.game.restore(data.game);
		if (data.names)
			this.choose(PLANS.filter(plan => data.names.includes(plan.name)));
	}

	select(context)
	{
		const signals = { "game": this.game.atLeast(context.wildMeat || 0, GAME_ENTER, GAME_EXIT) };
		const plans = PLANS.filter(plan => plan.applies(context, signals));
		if (this.names && plans.length === this.names.length && plans.every((plan, index) => plan.name === this.names[index]))
			return false;
		this.choose(plans);
		return true;
	}

	choose(plans)
	{
		this.names = Object.freeze(plans.map(plan => plan.name));
		this.table = overlay(plans.reduce((table, plan) => overlay(table, plan.set), BASE), {
			"behaviours": Object.freeze([...new Set(plans.flatMap(plan => plan.behaviours))]),
			"needs": Object.freeze([...new Set(plans.flatMap(plan => plan.needs))])
		});
	}
}
