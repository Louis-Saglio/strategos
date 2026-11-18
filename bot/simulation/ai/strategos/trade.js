import { barterRequest, goodsRequest, noting, orderRequest, tradeRoute } from "simulation/ai/strategos/requests.js";
import { exchangeOutlook } from "simulation/ai/strategos/valuation.js";

const DEAL_AMOUNT = 100;
const MIN_RATE = 0.65;

export class Trade
{
	constructor(telemetry)
	{
		this.telemetry = telemetry;
		this.goods = "";
	}

	save()
	{
		return { "goods": this.goods };
	}

	restore(data)
	{
		this.goods = data.goods;
	}

	requests(world, plan, assessments)
	{
		return this.barterRequests(world, plan).concat(this.caravanRequests(world, plan, assessments));
	}

	caravanRequests(world, plan, assessments)
	{
		const trade = plan.trade;
		const route = world.bestRoute;
		const scarce = assessments.scarce;
		if (!route || route.rate < trade.minRate)
			return [];
		const requests = [];
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
