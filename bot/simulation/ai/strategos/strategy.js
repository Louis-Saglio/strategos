const OPENING = {
	"gatherShares": { "food": 0.5, "wood": 0.35, "stone": 0.05, "metal": 0.1 },
	"values": { "assignIdleWorker": 20, "trainWorker": 10 }
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
				"values": Object.freeze(Object.assign({}, OPENING.values))
			});
			this.changed = true;
		}
		else
			this.changed = false;
		return this.priorities;
	}
}
