export function captureStrength(ent)
{
	return +(ent.get("Attack/Capture/Capture") || 0);
}

export function captureRegen(gameState, ent)
{
	let regen = +(ent.get("Capturable/RegenRate") || 0);
	const factor = +(ent.get("Capturable/GarrisonRegenRate") || 0);
	for (const id of ent.garrisoned() || [])
	{
		const unit = gameState.getEntityById(id);
		regen += factor * (unit ? captureStrength(unit) : 0);
	}
	return regen;
}

export function defensiveFire(gameState, ent)
{
	const damage = ent.get("BuildingAI") && ent.attackStrengths("Ranged");
	if (!damage)
		return Object.freeze({ "arrows": 0, "repeat": 1, "damage": Object.freeze({}) });
	const classes = ent.get("BuildingAI/GarrisonArrowClasses") || "";
	let shooters = 0;
	for (const id of ent.garrisoned() || [])
	{
		const unit = gameState.getEntityById(id);
		if (unit && MatchesClassList(unit.classes(), classes))
			shooters += 1;
	}
	const arrows = (+ent.get("BuildingAI/DefaultArrowCount") || 0) +
		Math.round(shooters * (+ent.get("BuildingAI/GarrisonArrowMultiplier") || 0));
	return Object.freeze({
		"arrows": Math.min(arrows, +ent.get("BuildingAI/MaxArrowCount") || Infinity),
		"repeat": ent.attackTimes("Ranged").repeat / 1000,
		"damage": Object.freeze(damage)
	});
}

export function capturePointsToTake(ent, player)
{
	const points = ent.capturePoints() || [];
	let total = 0;
	for (let owner = 0; owner < points.length; ++owner)
		if (owner !== player)
			total += points[owner];
	return total;
}
