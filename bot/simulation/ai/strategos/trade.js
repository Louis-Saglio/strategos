import { exchangeOutlook } from "simulation/ai/strategos/valuation.js";

const DEAL_AMOUNT = 100;
const MIN_RATE = 0.65;

export class Trade
{
	requests(world, priorities)
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
		return [{
			"source": "trade",
			"action": { "type": "barter", "sell": sell, "buy": buy, "amount": DEAL_AMOUNT, "rate": rate(sell) },
			"claims": { "resources": { [sell]: DEAL_AMOUNT } },
			"value": priorities.values.barter,
			"urgency": 1,
			"conversion": true
		}];
	}
}
