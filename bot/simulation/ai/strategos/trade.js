import { distanceBetween } from "simulation/ai/strategos/geometry.js";
import { barterRequest, goodsRequest, noting, orderRequest, tradeRoute, trainRequest } from "simulation/ai/strategos/requests.js";
import { TRADE_GAIN_DAMPING, TRADE_GAIN_DISTANCE, TRADE_GAIN_MAP } from "simulation/ai/strategos/rules.js";
import { exchangeOutlook } from "simulation/ai/strategos/valuation.js";

const DEAL_AMOUNT = 100;
const MIN_RATE = 0.65;

function routeGain(distance, mapSize, multiplier)
{
	const gain = length => length * length / (1 + TRADE_GAIN_DAMPING * length / mapSize);
	return multiplier * Math.sqrt(TRADE_GAIN_MAP / mapSize) * gain(distance) / gain(TRADE_GAIN_DISTANCE);
}

function bestRoute(world, caravan)
{
	let best = null;
	if (!caravan)
		return best;
	for (let i = 0; i < world.markets.length; ++i)
		for (let j = i + 1; j < world.markets.length; ++j)
		{
			const a = world.markets[i];
			const b = world.markets[j];
			if (a.region !== b.region)
				continue;
			if (!a.own && !b.own)
				continue;
			const distance = distanceBetween(a.position, b.position);
			const gain = routeGain(distance, world.mapSize, caravan.gain) * (a.own && b.own ? 1 : 1 + Math.max(a.bonus, b.bonus));
			const rate = gain / Math.max(1, distance / Math.max(1, caravan.speed));
			if (!best || rate > best.rate || rate === best.rate && a.id + b.id < best.from.id + best.to.id)
				best = { "from": a, "to": b, "distance": distance, "gain": gain, "rate": rate };
		}
	return best;
}

export class Trade
{
	constructor(catalog, telemetry)
	{
		this.catalog = catalog;
		this.telemetry = telemetry;
		this.goods = "";
	}

	requests(world, plan, assessments)
	{
		return this.barterRequests(world, plan).concat(this.caravanRequests(world, plan, assessments));
	}

	caravanRequests(world, plan, assessments)
	{
		const trade = plan.trade;
		const route = bestRoute(world, this.catalog.caravan());
		const scarce = assessments.scarce;
		if (!route || route.rate < trade.minRate)
			return [];
		const requests = [];
		const wanted = scarce.length || route.rate >= trade.richRate ?
			Math.min(trade.max, Math.floor(world.population / trade.populationPerTrader)) : 0;
		if (world.traders.length < wanted)
			for (const trainer of world.trainers)
			{
				if (trainer.queueLength > 0)
					continue;
				const template = this.catalog.cheapest(trainer.trainable, name => this.catalog.isTrader(name));
				if (!template)
					continue;
				requests.push(trainRequest("trade", "trader", trainer.id, template, 1, this.catalog.cost(template),
					this.catalog.population(template), plan.values.support, 1));
				break;
			}
		if (!world.traders.length)
			return requests;
		const goods = scarce.length ? scarce : world.codes;
		const key = goods.join(",");
		if (key !== this.goods)
		{
			const shares = {};
			for (const code of world.codes)
				shares[code] = 0;
			goods.forEach((code, index) => { shares[code] = Math.floor(100 / goods.length) + (index < 100 % goods.length ? 1 : 0); });
			requests.push(noting(goodsRequest("trade", "goods", shares, plan.values.support, 1), { "goods": key, "report": {
				"route": Math.round(route.distance), "gain": Math.round(route.gain * 10) / 10, "goods": shares, "traders": world.traders.length
			} }));
		}
		for (const trader of world.traders)
			if (trader.idle || !trader.state.trading)
				requests.push(orderRequest("trade", "route", trader.id, tradeRoute(route.to.id, route.from.id), plan.values.support, 1));
		return requests;
	}

	settle(world, outcomes)
	{
		for (const { request, issued } of outcomes)
		{
			if (!issued || request.purpose !== "goods")
				continue;
			this.goods = request.note.goods;
			this.telemetry.line("TRADE", world.time, request.note.report);
		}
	}

	barterRequests(world, plan)
	{
		if (!world.barter.open || !world.barter.prices)
			return [];
		const { surplus, shortfall } = exchangeOutlook(world);
		const buy = world.codes
			.filter(code => shortfall[code] > 0)
			.sort((a, b) => shortfall[b] - shortfall[a] || (a < b ? -1 : 1))[0];
		if (!buy)
			return [];
		const prices = world.barter.prices;
		const rate = code => prices.sell[code] / prices.buy[buy];
		const sell = world.codes
			.filter(code => code !== buy && surplus[code] >= DEAL_AMOUNT && rate(code) >= MIN_RATE)
			.sort((a, b) => surplus[b] * rate(b) - surplus[a] * rate(a) || (a < b ? -1 : 1))[0];
		if (!sell)
			return [];
		return [barterRequest("trade", "barter", sell, buy, DEAL_AMOUNT, rate(sell), plan.values.barter, 1)];
	}
}
