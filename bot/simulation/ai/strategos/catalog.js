const RESISTANCE_BASE = 0.9;

export class Catalog
{
	constructor(gameState)
	{
		this.gameState = gameState;
		this.civ = gameState.getPlayerCiv();
		this.codes = Resources.GetCodes();
		this.templates = new Map();
		this.trainables = new Map();
		this.buildables = new Map();
		this.footprints = new Map();
		this.availability = new Map();
		this.gatherProfiles = new Map();
		this.researchables = new Map();
		this.researchOpen = new Map();
		this.technologies = new Map();
		this.combats = new Map();
		this.hitRates = new Map();
		this.breakers = new Map();
		this.availabilityTime = undefined;
	}

	refreshTurnCaches()
	{
		const time = this.gameState.getTimeElapsed();
		if (time !== this.availabilityTime)
		{
			this.availability.clear();
			this.gatherProfiles.clear();
			this.researchOpen.clear();
			this.availabilityTime = time;
		}
	}

	available(name)
	{
		this.refreshTurnCaches();
		if (!this.availability.has(name))
			this.availability.set(name, !this.gameState.isTemplateDisabled(name) && this.template(name).available(this.gameState));
		return this.availability.get(name);
	}

	template(name)
	{
		if (!this.templates.has(name))
			this.templates.set(name, this.gameState.getTemplate(name));
		return this.templates.get(name);
	}

	producerList(cache, entity, list)
	{
		const producer = entity.templateName();
		if (!cache.has(producer))
			cache.set(producer, (list.call(entity, this.civ) || []).filter(name => name && this.template(name)));
		return cache.get(producer).filter(name => this.available(name));
	}

	trainable(entity)
	{
		return this.producerList(this.trainables, entity, entity.trainableEntities);
	}

	buildable(entity)
	{
		return this.producerList(this.buildables, entity, entity.buildableEntities);
	}

	cost(name)
	{
		const raw = this.template(name).cost();
		const cost = {};
		for (const code of this.codes)
			cost[code] = raw[code] || 0;
		return cost;
	}

	costSum(name)
	{
		const cost = this.cost(name);
		return this.codes.reduce((sum, code) => sum + cost[code], 0);
	}

	population(name)
	{
		return +(this.template(name).get("Cost/Population") || 0);
	}

	populationBonus(name)
	{
		return this.template(name).getPopulationBonus();
	}

	buildTime(name)
	{
		return this.template(name).buildTime() || 0;
	}

	isSoldier(name)
	{
		const template = this.template(name);
		return !!template && template.hasClass("Soldier");
	}

	isCivilian(name)
	{
		return this.isWorker(name) && !this.isSoldier(name);
	}

	isFighter(name)
	{
		const template = this.template(name);
		return !!template && template.hasClass("Soldier") && !template.hasClass("Hero");
	}

	isWorker(name)
	{
		const template = this.template(name);
		return template.hasClass("Worker") && template.isGatherer();
	}

	gatherTypes(template)
	{
		return this.codes.filter(code => template.canGather(code));
	}

	gathering(template)
	{
		this.refreshTurnCaches();
		const name = template.templateName();
		if (!this.gatherProfiles.has(name))
		{
			const capacities = {};
			for (const code of this.codes)
				capacities[code] = +(template.get("ResourceGatherer/Capacities/" + code) || 0);
			this.gatherProfiles.set(name, Object.freeze({
				"rates": Object.freeze(template.resourceGatherRates() || {}),
				"capacities": Object.freeze(capacities)
			}));
		}
		return this.gatherProfiles.get(name);
	}

	technology(name)
	{
		if (!this.technologies.has(name))
		{
			const tech = this.gameState.getTemplate(name);
			this.technologies.set(name, Object.freeze({
				"modifications": tech && tech.modifications() || [],
				"affects": tech && tech.affects() || null,
				"affectLists": tech && tech.affects() && tech.affects().length ? tech.affects().map(affect => affect.split(/\s+/)) : [[]],
				"researchTime": tech ? tech.researchTime() : 0
			}));
		}
		return this.technologies.get(name);
	}

	modificationApplies(info, modification, classes)
	{
		const extra = modification.affects ? modification.affects.split(/\s+/) : [];
		return info.affectLists.some(list => list.concat(extra).every(cls =>
			cls[0] === "!" ? !classes.includes(cls.slice(1)) : classes.includes(cls)));
	}

	techCost(name, researcherTemplate)
	{
		const tech = this.gameState.getTemplate(name);
		const raw = tech && tech.cost(this.template(researcherTemplate)) || {};
		const cost = {};
		for (const code of this.codes)
			cost[code] = raw[code] || 0;
		return cost;
	}

	meanRates(template)
	{
		const raw = this.gathering(template).rates;
		const sums = {};
		const counts = {};
		for (const key in raw)
		{
			const code = key.split(".")[0];
			sums[code] = (sums[code] || 0) + raw[key];
			counts[code] = (counts[code] || 0) + 1;
		}
		const rates = {};
		for (const code of this.codes)
			rates[code] = counts[code] ? sums[code] / counts[code] : 0;
		return rates;
	}

	combat(name)
	{
		if (!this.combats.has(name))
		{
			const template = this.template(name);
			const attacks = {};
			for (const type of template.attackTypes() || [])
			{
				const damage = type === "Capture" || type === "Slaughter" ? null : template.attackStrengths(type);
				if (!damage)
					continue;
				const bonuses = [];
				const raw = template.get("Attack/" + type + "/Bonuses") || {};
				for (const key in raw)
				{
					const classes = template.get("Attack/" + type + "/Bonuses/" + key + "/Classes");
					if (classes)
						bonuses.push(Object.freeze({ "classes": classes, "multiplier": +template.get("Attack/" + type + "/Bonuses/" + key + "/Multiplier") || 1 }));
				}
				attacks[type] = Object.freeze({ "repeat": template.attackTimes(type).repeat / 1000, "damage": Object.freeze(damage),
					"bonuses": Object.freeze(bonuses) });
			}
			const resistance = (template.resistanceStrengths() || {}).Damage || {};
			const ranged = !!attacks.Ranged;
			const reach = ranged ? template.attackRange("Ranged") : attacks.Melee && template.attackRange("Melee");
			this.combats.set(name, Object.freeze({
				"hp": template.maxHitpoints(),
				"ranged": ranged,
				"range": reach ? +reach.max || 0 : 0,
				"speed": template.walkSpeed() || 0,
				"classes": Object.freeze(template.classes() || []),
				"attacks": Object.freeze(attacks),
				"resistance": Object.freeze(Object.assign({}, resistance))
			}));
		}
		return this.combats.get(name);
	}

	hitRate(attacker, target)
	{
		const key = attacker + "|" + target;
		if (!this.hitRates.has(key))
		{
			const own = this.combat(attacker);
			const other = this.combat(target);
			let best = 0;
			for (const type in own.attacks)
			{
				const attack = own.attacks[type];
				let damage = 0;
				for (const kind in attack.damage)
					damage += attack.damage[kind] * Math.pow(RESISTANCE_BASE, other.resistance[kind] || 0);
				let multiplier = 1;
				for (const bonus of attack.bonuses)
					if (MatchesClassList(other.classes, bonus.classes))
						multiplier *= bonus.multiplier;
				best = Math.max(best, damage * multiplier / Math.max(0.1, attack.repeat));
			}
			this.hitRates.set(key, best);
		}
		return this.hitRates.get(key);
	}

	researchable(entity)
	{
		const producer = entity.templateName();
		if (!this.researchables.has(producer))
			this.researchables.set(producer, entity.researchableTechs(this.gameState, this.civ) || []);
		this.refreshTurnCaches();
		return this.researchables.get(producer).filter(name => {
			if (!this.researchOpen.has(name))
				this.researchOpen.set(name, this.gameState.canResearch(name));
			return this.researchOpen.get(name);
		});
	}

	footprint(name)
	{
		if (!this.footprints.has(name))
		{
			const template = this.template(name);
			let width = 0;
			let depth = 0;
			if (template.get("Obstruction/Static"))
			{
				width = +template.get("Obstruction/Static/@width");
				depth = +template.get("Obstruction/Static/@depth");
			}
			else if (template.get("Footprint/Square"))
			{
				width = +template.get("Footprint/Square/@width");
				depth = +template.get("Footprint/Square/@depth");
			}
			else if (template.get("Footprint/Circle"))
				width = depth = 2 * +template.get("Footprint/Circle/@radius");
			this.footprints.set(name, Object.freeze({ "width": width, "depth": depth }));
		}
		return this.footprints.get(name);
	}

	isBreaker(name)
	{
		if (!this.breakers.has(name))
		{
			const template = this.template(name);
			const breaks = !!template && (template.attackTypes() || []).some(type => {
				const preferred = template.get("Attack/" + type + "/PreferredClasses/_string") || "";
				const restricted = template.get("Attack/" + type + "/RestrictedClasses/_string") || "";
				return preferred.split(/\s+/).includes("Structure") && restricted.split(/\s+/).includes("Organic");
			});
			this.breakers.set(name, breaks);
		}
		return this.breakers.get(name);
	}

	trainsBreakers(name)
	{
		return this.trains(name, unit => this.isBreaker(unit));
	}

	trainsWorkers(name)
	{
		return this.trains(name, unit => this.isWorker(unit));
	}

	trainsOnlySoldierWorkers(name)
	{
		return this.trains(name, unit => this.isWorker(unit) && this.isSoldier(unit)) &&
			!this.trains(name, unit => this.isCivilian(unit));
	}

	trains(name, accept)
	{
		const trainable = this.template(name).trainableEntities(this.civ) || [];
		return trainable.some(unit => unit && this.template(unit) && this.available(unit) && accept(unit));
	}

	maxGatherers(name)
	{
		return this.template(name).maxGatherers();
	}

	isFarm(name)
	{
		const template = this.template(name);
		const type = template.resourceSupplyType();
		return !!type && type.generic === "food" && template.resourceSupplyMax() === Infinity && template.hasClass("Structure");
	}

	dropsiteTypes(name)
	{
		return this.template(name).resourceDropsiteTypes() || [];
	}

	spacing(name)
	{
		const distance = this.template(name).buildDistance();
		return distance && distance.FromClass ? { "fromClass": distance.FromClass, "min": +(distance.MinDistance || 0) } : null;
	}

	isBarterMarket(name)
	{
		const template = this.template(name);
		return !!template && template.hasClass("Barter") && template.hasClass("Structure");
	}

	isSettlement(name)
	{
		const template = this.template(name);
		const placement = template.buildPlacementType() || "land";
		const distance = template.buildDistance();
		return placement === "land" && template.hasClass("CivCentre") && !!template.hasBuildTerritory("neutral") &&
			(!distance || !!distance.FromClass && !distance.MaxDistance);
	}

	isShoreStructure(name)
	{
		return (this.template(name).buildPlacementType() || "land") === "shore";
	}

	transportCapacity(name)
	{
		const template = this.template(name);
		if (!template || !template.hasClass("Ship"))
			return 0;
		const accepted = (template.get("GarrisonHolder/List/_string") || "").split(/\s+/);
		return accepted.includes("Soldier") || accepted.includes("Infantry") ? +(template.get("GarrisonHolder/Max") || 0) : 0;
	}

	trainsTransports(name)
	{
		return this.trains(name, unit => this.transportCapacity(unit) > 0);
	}

	isPlaceableOnLand(name)
	{
		const template = this.template(name);
		const placement = template.buildPlacementType() || "land";
		return placement === "land" && !!template.hasBuildTerritory("own") && !template.buildDistance();
	}
}
