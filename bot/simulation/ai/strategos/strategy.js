const OPENING = {
	"gatherShares": { "food": 0.5, "wood": 0.35, "stone": 0.05, "metal": 0.1 },
	"values": { "build": 25, "assignIdleWorker": 20, "house": 15, "trainWorker": 10 },
	"housing": { "base": 3, "perTrainer": 4 }
};

export class Strategy
{
	constructor(codes)
	{
		this.codes = codes;
		this.priorities = null;
	}

	update(world)
	{
		if (!this.priorities)
		{
			const shares = {};
			for (const code of this.codes)
				shares[code] = OPENING.gatherShares[code] || 0;
			this.priorities = Object.freeze({
				"phase": "opening",
				"gatherShares": Object.freeze(shares),
				"values": Object.freeze(Object.assign({}, OPENING.values)),
				"housing": Object.freeze(Object.assign({}, OPENING.housing))
			});
			this.changed = true;
		}
		else
			this.changed = false;
		return this.priorities;
	}
}
