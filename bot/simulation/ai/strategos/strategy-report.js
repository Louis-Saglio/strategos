export function strategyReport(names, plan, assessments)
{
	const naval = plan.naval;
	return {
		"plans": names,
		"margin": plan.margin,
		"gatherShares": assessments.gatherShares,
		"values": plan.values,
		"housing": plan.housing,
		"military": Object.assign({}, plan.military, assessments.posture),
		"offense": Object.assign({ "minArmy": plan.minArmy }, plan.offense),
		"guard": {
			"hostiles": assessments.guard.group.length,
			"needed": assessments.guard.needed.length,
			"ratio": assessments.guard.ratio,
			"holds": assessments.guard.holds,
			"value": assessments.guard.value
		},
		"guardPlan": { "enter": plan.guard.enter, "exit": plan.guard.exit, "engage": plan.defense.engage, "horizonS": plan.guard.horizonS,
			"near": plan.guard.near },
		"expansion": plan.settlements,
		"medics": plan.medics,
		"trade": { "minRate": plan.trade.minRate, "richRate": plan.trade.richRate, "minDistance": plan.tradePost.minDistance, "max": plan.trade.max,
			"populationPerTrader": plan.trade.populationPerTrader, "scarceWealth": plan.labour.tradeScarceWealth,
			"scarceCodes": plan.labour.tradeScarceCodes },
		"scarce": assessments.scarce,
		"naval": { "dockPopulation": plan.docks.population, "fishDock": plan.docks.fishing, "maxCapacity": naval.maxCapacity,
			"superiority": naval.superiority, "carried": naval.carried, "seaSuperiority": naval.seaSuperiority, "settlers": naval.settlers,
			"founders": naval.founders, "yardFishers": plan.docks.yardFishers, "yardSpacing": plan.docks.yardSpacing, "yardCrowd": naval.yardCrowd,
			"reinforcement": naval.reinforcement, "massShare": naval.massShare, "edge": naval.edge, "huntSuperiority": naval.huntSuperiority,
			"fleetMax": naval.fleetMax, "fightersPerShip": naval.fightersPerShip, "raid": naval.raid, "fishClearance": naval.fishClearance,
			"bombard": naval.bombard, "fishing": naval.fishing },
		"protectHero": plan.protectHero,
		"seekRelics": plan.seekRelics,
		"raiseWonder": plan.raiseWonder,
		"colony": assessments.colony,
		"colonyPlan": { "dockPopulation": plan.docks.colonyPopulation, "maxHomeArea": plan.colony.maxHomeArea, "minArea": plan.colony.minArea,
			"centreArea": plan.centreArea, "enemyClearance": plan.sites.enemyClearance, "max": plan.colony.max, "wealthCap": plan.sites.wealthCap,
			"distanceScale": plan.colony.distanceScale, "starvedWeight": plan.colony.starvedWeight, "phasePopulation": plan.colonyPhasePopulation },
		"ferry": assessments.ferry,
		"forward": assessments.forward,
		"forwardPlan": Object.assign({}, plan.forwardBase, plan.forward),
		"starved": assessments.starved,
		"short": assessments.short,
		"advancePhase": assessments.advancePhase
	};
}
