import { Expansion } from "simulation/ai/strategos/strategy-expansion.js";
import { HomeGuard } from "simulation/ai/strategos/strategy-guard.js";
import { Labour } from "simulation/ai/strategos/strategy-labour.js";
import { Plans } from "simulation/ai/strategos/strategy-plans.js";
import { Posture } from "simulation/ai/strategos/strategy-posture.js";
import { strategyReport } from "simulation/ai/strategos/strategy-report.js";

export class Strategy
{
	constructor(codes, catalog)
	{
		this.plans = new Plans();
		this.posture = new Posture(catalog);
		this.labour = new Labour(codes, catalog, this.plans.table);
		this.guard = new HomeGuard(catalog);
		this.expansion = new Expansion(catalog);
	}

	update(world)
	{
		const selected = this.plans.select(world.context);
		const plan = this.plans.table;
		const posture = this.posture.assess(world, plan);
		const labour = this.labour.assess(world, plan, posture.stance.civilianTarget);
		const guard = this.guard.assess(world, plan);
		const expansion = this.expansion.assess(world, plan, labour);
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

	report()
	{
		return strategyReport(this.plans.names, this.plan, this.assessments);
	}
}
