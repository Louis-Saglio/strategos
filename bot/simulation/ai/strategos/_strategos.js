import { BaseAI } from "simulation/ai/common-api/baseAI.js";
import { Allocator } from "simulation/ai/strategos/allocator.js";
import { Catalog } from "simulation/ai/strategos/catalog.js";
import { Construction } from "simulation/ai/strategos/construction.js";
import { Defense } from "simulation/ai/strategos/defense.js";
import { Economy } from "simulation/ai/strategos/economy.js";
import { Executor } from "simulation/ai/strategos/executor.js";
import { Research } from "simulation/ai/strategos/research.js";
import { Strategy } from "simulation/ai/strategos/strategy.js";
import { Telemetry } from "simulation/ai/strategos/telemetry.js";
import { ResourceIndex, buildWorld } from "simulation/ai/strategos/world.js";

const DECISION_PERIOD = 8;
const DECISION_PHASE = 5;
const REPORT_PERIOD_MS = 60000;

export function StrategosBot(settings)
{
	BaseAI.call(this, settings);
	this.difficulty = settings.difficulty;
	this.behavior = settings.behavior;
}

StrategosBot.prototype = Object.create(BaseAI.prototype);

StrategosBot.prototype.CustomInit = function(gameState)
{
	this.telemetry = new Telemetry(this.player);
	this.catalog = new Catalog(gameState);
	this.resourceIndex = new ResourceIndex(this.player, this.catalog.codes);
	this.strategy = new Strategy(this.catalog.codes);
	this.subsystems = [new Defense(this.telemetry), new Economy(this.catalog), new Construction(this.catalog, this.player),
		new Research(this.catalog)];
	this.allocator = new Allocator(this.catalog.codes);
	this.executor = new Executor(gameState, this.catalog.civ, this.telemetry);
	this.telemetry.line("STRATEGOS", gameState.getTimeElapsed(), {
		"civ": this.catalog.civ,
		"difficulty": this.difficulty,
		"behavior": this.behavior
	});
};

StrategosBot.prototype.OnUpdate = function()
{
	if (this.gameState.playerData.state === "active" && (this.turn + this.player) % DECISION_PERIOD === DECISION_PHASE)
		this.decide();
	this.turn += 1;
};

StrategosBot.prototype.decide = function()
{
	const started = Date.now();
	const stages = {};
	let mark = started;
	const lap = stage => {
		const now = Date.now();
		stages[stage] = now - mark;
		mark = now;
	};
	const pending = this.executor.reconcile(this.gameState.getTimeElapsed());
	const world = buildWorld(this.gameState, this.catalog, this.resourceIndex, pending, this.allocator.demand());
	lap("world");
	const priorities = this.strategy.update(world);
	const requests = [];
	for (const subsystem of this.subsystems)
	{
		requests.push(...subsystem.requests(world, priorities));
		lap(subsystem.constructor.name);
	}
	const grants = this.allocator.allocate(world, requests);
	this.executor.execute(world, grants);
	lap("allocateExecute");
	this.telemetry.recordDecision(Date.now() - started, stages);
	this.report(world, priorities);
};

StrategosBot.prototype.report = function(world, priorities)
{
	if (this.strategy.changed)
		this.telemetry.line("STRAT", world.time, priorities);
	if (!this.telemetry.due("REPORT", world.time, REPORT_PERIOD_MS))
		return;
	this.telemetry.line("ALLOC", world.time, this.allocator.flushLedger());
	this.telemetry.line("ECO", world.time, {
		"population": world.population,
		"populationLimit": world.populationLimit,
		"foundations": world.foundations.length,
		"workers": world.workers.length,
		"idle": world.workers.filter(worker => worker.idle).length,
		"gatherers": world.gatherers,
		"resources": world.resources,
		"spendRate": Object.fromEntries(world.codes.map(code => [code, Math.round(world.demand.spendRate[code] * 100) / 100])),
		"unmet": world.demand.unmet,
		"shares": Object.fromEntries(world.codes.map(code => [code, Math.round(priorities.gatherShares[code] * 100) / 100]))
	});
	this.telemetry.flushDecisions(world.time);
};
