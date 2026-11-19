import { BaseAI } from "simulation/ai/common-api/baseAI.js";
import { Allocator, GRANTED } from "simulation/ai/strategos/allocator.js";
import { BattleLog } from "simulation/ai/strategos/battles.js";
import { Catalog } from "simulation/ai/strategos/catalog.js";
import { Construction } from "simulation/ai/strategos/construction.js";
import { Defense } from "simulation/ai/strategos/defense.js";
import { Economy } from "simulation/ai/strategos/economy.js";
import { Executor } from "simulation/ai/strategos/executor.js";
import { Medics } from "simulation/ai/strategos/medics.js";
import { Naval } from "simulation/ai/strategos/naval.js";
import { Offense } from "simulation/ai/strategos/offense.js";
import { Recruitment } from "simulation/ai/strategos/recruitment.js";
import { Research } from "simulation/ai/strategos/research.js";
import { Strategy } from "simulation/ai/strategos/strategy.js";
import { Stopwatch, Telemetry } from "simulation/ai/strategos/telemetry.js";
import { Upgrades } from "simulation/ai/strategos/upgrades.js";
import { Trade } from "simulation/ai/strategos/trade.js";
import { REPORT_MS } from "simulation/ai/strategos/cadence.js";
import { buildWorld } from "simulation/ai/strategos/world.js";
import { LossIndex, MusterIndex, ResourceIndex, ShoreIndex } from "simulation/ai/strategos/world-memory.js";

const DECISION_PERIOD = 8;
const DECISION_PHASE = 5;

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
	this.shoreIndex = new ShoreIndex();
	this.lossIndex = new LossIndex(this.player);
	this.musterIndex = new MusterIndex();
	this.battleLog = new BattleLog(this.catalog, this.telemetry);
	this.strategy = new Strategy(this.catalog.codes, this.catalog);
	this.behaviours = [];
	this.subsystems = [new Defense(this.catalog, this.telemetry), new Offense(this.catalog, this.telemetry), new Naval(this.catalog, this.telemetry),
		new Recruitment(this.catalog, this.telemetry), new Economy(this.catalog, this.telemetry), new Construction(this.catalog, this.player, this.telemetry),
		new Research(this.catalog), new Trade(this.telemetry), new Medics(),
		new Upgrades(this.catalog, this.telemetry)];
	this.allocator = new Allocator(this.catalog.codes);
	this.executor = new Executor(gameState, this.catalog.civ, this.telemetry);
	const saved = this.saved;
	this.saved = undefined;
	if (saved)
	{
		this.restore(saved, gameState);
		return;
	}
	this.telemetry.line("STRATEGOS", gameState.getTimeElapsed(), {
		"civ": this.catalog.civ,
		"difficulty": this.difficulty,
		"behavior": this.behavior
	});
};

StrategosBot.prototype.Serialize = function()
{
	if (this.saved !== undefined)
		return this.saved;
	if (!this.catalog)
		return null;
	const context = { "shoreIndex": point => this.shoreIndex.indexOf(this.gameState, point) };
	return {
		"turn": this.turn,
		"telemetry": this.telemetry.save(),
		"catalog": this.catalog.save(),
		"resourceIndex": this.resourceIndex.save(),
		"shoreIndex": this.shoreIndex.save(),
		"lossIndex": this.lossIndex.save(),
		"musterIndex": this.musterIndex.save(),
		"battleLog": this.battleLog.save(),
		"strategy": this.strategy.save(),
		"behaviours": this.behaviours.map(behaviour => behaviour.save()),
		"subsystems": this.subsystems.map(subsystem => subsystem.save ? subsystem.save(context) : null),
		"allocator": this.allocator.save(),
		"executor": this.executor.save()
	};
};

StrategosBot.prototype.Deserialize = function(data, sharedScript)
{
	BaseAI.prototype.Deserialize.call(this, data, sharedScript);
	this.saved = data;
};

StrategosBot.prototype.restore = function(data, gameState)
{
	this.turn = data.turn;
	this.telemetry.restore(data.telemetry);
	this.catalog.restore(data.catalog);
	this.resourceIndex.restore(data.resourceIndex);
	this.shoreIndex.restore(data.shoreIndex);
	this.lossIndex.restore(data.lossIndex);
	this.musterIndex.restore(data.musterIndex);
	this.battleLog.restore(data.battleLog);
	this.strategy.restore(data.strategy);
	const plan = this.strategy.plans.table;
	const context = { "shore": index => this.shoreIndex.at(gameState, index), "needs": plan.needs };
	this.behaviours = plan.behaviours.map(Behaviour => new Behaviour(this.catalog, this.telemetry));
	this.behaviours.forEach((behaviour, index) => behaviour.restore(data.behaviours[index]));
	this.subsystems.forEach((subsystem, index) => {
		if (subsystem.restore)
			subsystem.restore(data.subsystems[index], context);
	});
	this.allocator.restore(data.allocator);
	this.executor.restore(data.executor);
};

StrategosBot.prototype.OnUpdate = function()
{
	this.lossIndex.record(this.events, this.catalog);
	this.musterIndex.record(this.events);
	if (this.gameState.playerData.state === "active" && (this.turn + this.player) % DECISION_PERIOD === DECISION_PHASE)
		this.decide();
	this.turn += 1;
};

StrategosBot.prototype.decide = function()
{
	const stopwatch = new Stopwatch();
	const pending = this.executor.reconcile(this.gameState.getTimeElapsed());
	const world = buildWorld(this.gameState, this.catalog, this.resourceIndex, this.shoreIndex, this.lossIndex, this.musterIndex, pending,
		this.allocator.demand(), this.allocator.assignments(), stopwatch);
	stopwatch.lap("world");
	this.battleLog.observe(world);
	stopwatch.lap("BattleLog");
	this.strategy.update(world);
	const { plan, assessments } = this.strategy;
	this.enlist(plan.behaviours);
	stopwatch.lap("Strategy");
	const subsystems = this.behaviours.concat(this.subsystems);
	const requests = [];
	const emitted = [];
	for (const subsystem of subsystems)
	{
		const own = subsystem.requests(world, plan, assessments);
		emitted.push(own);
		requests.push(...own);
		stopwatch.lap(subsystem.constructor.name);
	}
	const outcomes = this.allocator.allocate(world, requests);
	this.executor.execute(world, outcomes.filter(entry => entry.outcome === GRANTED && entry.request.action));
	this.settle(world, subsystems, emitted, outcomes);
	stopwatch.lap("allocateExecute");
	this.telemetry.recordDecision(stopwatch);
	for (const trainer of world.trainers)
		this.telemetry.recordProduction(trainer.trainable.some(name => this.catalog.isCivilian(name)) ? "civilian" :
			trainer.trainable.some(name => this.catalog.isFighter(name)) ? "military" : "other", trainer.queueLength === 0);
	this.report(world, assessments);
};

StrategosBot.prototype.enlist = function(behaviours)
{
	const serving = new Map(this.behaviours.map(behaviour => [behaviour.constructor, behaviour]));
	this.behaviours = behaviours.map(Behaviour => serving.get(Behaviour) || new Behaviour(this.catalog, this.telemetry));
};

StrategosBot.prototype.settle = function(world, subsystems, emitted, outcomes)
{
	const outcomeOf = new Map();
	for (const entry of outcomes)
		outcomeOf.set(entry.request, entry);
	subsystems.forEach((subsystem, index) => {
		if (subsystem.settle)
			subsystem.settle(world, emitted[index].map(request => outcomeOf.get(request)));
	});
};

StrategosBot.prototype.report = function(world, assessments)
{
	if (this.strategy.changed)
		this.telemetry.line("STRAT", world.time, this.strategy.report());
	if (!this.telemetry.due("REPORT", world.time, REPORT_MS))
		return;
	this.telemetry.line("ALLOC", world.time, this.allocator.flushLedger());
	const home = this.strategy.homeReport(world);
	if (home)
		this.telemetry.line("HOME", world.time, home);
	this.telemetry.line("ECO", world.time, {
		"population": world.population,
		"populationLimit": world.populationLimit,
		"foundations": world.foundations.length,
		"fighters": world.fighters.length,
		"enemySoldiers": world.enemySoldiers,
		"workers": world.workers.length,
		"idle": world.workers.filter(worker => worker.idle).length,
		"gatherers": world.gatherers,
		"haul": Object.fromEntries(world.codes.map(code => [code, Math.round(world.hauls[code])])),
		"resources": world.resources,
		"spendRate": Object.fromEntries(world.codes.map(code => [code, Math.round(world.demand.spendRate[code] * 100) / 100])),
		"income": Object.fromEntries(world.codes.map(code => [code, Math.round(world.demand.income[code] * 100) / 100])),
		"unmet": world.demand.unmet,
		"shares": Object.fromEntries(world.codes.map(code => [code, Math.round(assessments.gatherShares[code] * 100) / 100]))
	});
	this.telemetry.flushProduction(world.time);
	this.telemetry.flushDecisions(world.time);
};
