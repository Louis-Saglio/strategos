const STATE_FLAGS = {
	"fighting": ["COMBAT"],
	"striking": ["ATTACKING"],
	"walking": ["WALKING"],
	"moving": ["COMBAT", "WALKING", "APPROACHING", "CHASING", "CAPTURE", "ATTACK"],
	"garrisoning": ["GARRISON"],
	"gathering": ["GATHER"],
	"returning": ["RETURNRESOURCE"],
	"hauling": ["RETURNINGRESOURCE", "RETURNRESOURCE"],
	"repairing": ["REPAIR"],
	"working": ["GATHER", "RETURNRESOURCE", "REPAIR", "GARRISON"],
	"collecting": ["COLLECTTREASURE"],
	"healing": ["HEAL"],
	"trading": ["TRADE"]
};
const STATES = new Map();

function stateNamed(name)
{
	let state = STATES.get(name);
	if (!state)
	{
		state = {};
		for (const flag in STATE_FLAGS)
			state[flag] = STATE_FLAGS[flag].some(mark => name.includes(mark));
		STATES.set(name, Object.freeze(state));
	}
	return state;
}

export function stateOf(ent)
{
	return stateNamed(ent.unitAIState() || "");
}

export const NO_STATE = stateNamed("");
