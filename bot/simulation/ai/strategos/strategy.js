import { Expansion } from "simulation/ai/strategos/strategy-expansion.js";
import { HomeGuard } from "simulation/ai/strategos/strategy-guard.js";
import { Labour } from "simulation/ai/strategos/strategy-labour.js";
import { Plans } from "simulation/ai/strategos/strategy-plans.js";
import { Posture } from "simulation/ai/strategos/strategy-posture.js";

export class Strategy
{
	constructor(codes, catalog)
	{
		this.plans = new Plans();
		this.posture = new Posture(catalog);
		this.labour = new Labour(codes, catalog);
		this.guard = new HomeGuard(catalog);
		this.expansion = new Expansion(catalog);
	}

	save()
	{
		return { "plans": this.plans.save(), "posture": this.posture.save(), "labour": this.labour.save(), "guard": this.guard.save(),
			"expansion": this.expansion.save() };
	}

	restore(data)
	{
		this.plans.restore(data.plans);
		this.posture.restore(data.posture);
		this.labour.restore(data.labour);
		this.guard.restore(data.guard);
		this.expansion.restore(data.expansion);
	}

	update(world)
	{
		const wildMeat = world.game.filter(prey => !prey.domestic && !prey.armed && prey.region === world.homeRegion)
			.reduce((sum, prey) => sum + prey.amount, 0);
		const selected = this.plans.select(Object.assign({ "wildMeat": wildMeat }, world.context));
		const plan = this.plans.table;
		const posture = this.posture.assess(world, plan);
		const labour = this.labour.assess(world, plan, posture.stance.drafted);
		const guard = this.guard.assess(world, plan);
		const expansion = this.expansion.assess(world, plan, labour);
		this.selected = selected;
		this.changed = selected || posture.changed || labour.changed || expansion.changed;
		this.plan = plan;
		this.assessments = Object.freeze({
			"posture": posture.stance,
			"advancePhase": posture.advancePhase,
			"gatherShares": labour.gatherShares,
			"starved": labour.starved,
			"short": labour.short,
			"scarce": labour.scarce,
			"guard": guard,
			"ferry": expansion.ferry,
			"colony": expansion.colony,
			"forward": expansion.forward
		});
	}

	homeReport(world)
	{
		return this.posture.homeOutlook(world, this.plan);
	}

	report()
	{
		return { "plans": this.plans.names, "table": this.selected ? plain(this.plan) : undefined, "assessments": plain(this.assessments) };
	}
}

function plain(value)
{
	if (typeof value === "function")
		return value.name;
	if (value instanceof Set)
		return [...value];
	if (Array.isArray(value))
		return value.map(plain);
	if (value === null || typeof value !== "object")
		return value;
	if (typeof value.id === "number")
		return value.id;
	if (typeof value.report === "function")
		return plain(value.report());
	return Object.fromEntries(Object.keys(value).map(key => [key, plain(value[key])]));
}
