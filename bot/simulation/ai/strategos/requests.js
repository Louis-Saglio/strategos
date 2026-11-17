function compose(source, purpose, action, claims, value, urgency)
{
	return { "source": source, "purpose": purpose, "action": action, "claims": claims, "value": value, "urgency": urgency };
}

function reservation(source, purpose, claims, value, urgency)
{
	return { "source": source, "purpose": purpose, "claims": claims, "value": value, "urgency": urgency };
}

function garrisonSlot(holder)
{
	return "garrison-" + holder;
}

export function hold()
{
	return { "type": "hold" };
}

export function walkTo(x, z)
{
	return { "type": "walk", "x": x, "z": z };
}

export function attackWalkTo(x, z, targetClasses)
{
	return { "type": "attack-walk", "x": x, "z": z, "targetClasses": targetClasses };
}

export function attack(target)
{
	return { "type": "attack", "target": target };
}

export function capture(target)
{
	return { "type": "capture", "target": target };
}

export function garrisonIn(target)
{
	return { "type": "garrison", "target": target };
}

export function collect(target)
{
	return { "type": "collect", "target": target };
}

export function stance(name)
{
	return { "type": "stance", "name": name };
}

export function tradeRoute(target, origin)
{
	return { "type": "trade-route", "target": target, "source": origin };
}

export function orderRequest(source, purpose, unit, action, value, urgency)
{
	return compose(source, purpose, Object.assign({ "unit": unit }, action), { "units": [unit] }, value, urgency);
}

export function memberRequest(source, purpose, unit, engaged, order, value, urgency)
{
	return orderRequest(source, purpose, unit, engaged ? hold() : order, value, urgency);
}

export function stanceRequest(source, purpose, unit, name, value, urgency)
{
	return compose(source, purpose, Object.assign({ "unit": unit }, stance(name)), {}, value, urgency);
}

export function gatherRequest(source, purpose, worker, target, resource, value, urgency)
{
	return compose(source, purpose, { "type": "gather", "worker": worker, "target": target, "resource": resource },
		{ "units": [worker] }, value, urgency);
}

export function repairRequest(source, purpose, worker, target, value, urgency)
{
	return compose(source, purpose, { "type": "repair", "worker": worker, "target": target }, { "units": [worker] }, value, urgency);
}

export function trainRequest(source, purpose, trainer, template, count, cost, population, value, urgency)
{
	return compose(source, purpose, { "type": "train", "trainer": trainer, "template": template, "count": count },
		{ "resources": cost, "population": population, "slots": [trainer] }, value, urgency);
}

export function buildRequest(source, purpose, template, site, builders, cost, value, urgency)
{
	return reserving(compose(source, purpose,
		{ "type": "construct", "template": template, "x": site.x, "z": site.z, "angle": site.angle, "builders": builders },
		{ "resources": cost, "units": builders }, value, urgency));
}

export function researchRequest(source, purpose, researcher, tech, payback, cost, value, urgency)
{
	return compose(source, purpose, { "type": "research", "researcher": researcher, "tech": tech, "payback": payback },
		{ "resources": cost, "slots": [researcher] }, value, urgency);
}

export function upgradeRequest(source, purpose, entity, template, cost, value, urgency)
{
	return compose(source, purpose, { "type": "upgrade", "entity": entity, "template": template },
		{ "resources": cost, "slots": ["upgrade-" + entity] }, value, urgency);
}

export function barterRequest(source, purpose, sell, buy, amount, rate, value, urgency)
{
	return converting(compose(source, purpose, { "type": "barter", "sell": sell, "buy": buy, "amount": amount, "rate": rate },
		{ "resources": { [sell]: amount } }, value, urgency));
}

export function goodsRequest(source, purpose, goods, value, urgency)
{
	return compose(source, purpose, { "type": "trading-goods", "goods": goods }, {}, value, urgency);
}

export function deleteRequest(source, purpose, target, value, urgency)
{
	return compose(source, purpose, { "type": "delete", "target": target }, {}, value, urgency);
}

export function deleteHolderRequest(source, purpose, target, value, urgency)
{
	return compose(source, purpose, { "type": "delete", "target": target }, { "slots": [garrisonSlot(target)] }, value, urgency);
}

export function unloadRequest(source, purpose, holder, units, value, urgency)
{
	return compose(source, purpose, { "type": "unload", "holder": holder, "units": units }, { "slots": [garrisonSlot(holder)] }, value, urgency);
}

export function unloadAllRequest(source, purpose, holder, value, urgency)
{
	return compose(source, purpose, { "type": "unload-all", "holder": holder }, { "slots": [garrisonSlot(holder)] }, value, urgency);
}

export function fundRequest(source, purpose, cost, value, urgency)
{
	return converting(reserving(reservation(source, purpose, { "resources": cost }, value, urgency)));
}

export function roomRequest(source, purpose, population, value, urgency)
{
	return reservation(source, purpose, { "population": population }, value, urgency);
}

export function reserving(request)
{
	return Object.assign(request, { "reserve": true });
}

export function inTier(request, tier)
{
	return Object.assign(request, { "tier": tier });
}

export function pressing(request, urgency)
{
	return Object.assign(request, { "urgency": urgency });
}

export function noting(request, note)
{
	return Object.assign(request, { "note": note });
}

function converting(request)
{
	return Object.assign(request, { "conversion": true });
}
