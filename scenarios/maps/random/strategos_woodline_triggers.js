/**
 * Strategos scenario "woodline": how much wood does a gatherer deliver,
 * against the distance from its storehouse to the forest, the number of
 * gatherers sharing that storehouse and the way they are managed?
 *
 * No AI plays (every player is `none`). Each player is one case, set up at
 * the start around its civic centre: a rectangular forest of
 * WOOD_ROWS x WOOD_COLUMNS trees (WOOD_TREE, WOOD_SPACING m apart with up
 * to WOOD_JITTER m of fixed jitter) whose near edge is WOOD_FOREST_OFFSET m
 * from the centre, toward the map's edge; a storehouse of the player's civ
 * between the centre and the forest, its obstruction `gap` m from the
 * centres of the first row of trees (the civic centre is then farther from
 * every tree than the storehouse); and `gatherers` female citizens of the
 * civ spawned around the storehouse. At WOOD_START_MS they are set to work
 * for WOOD_DURATION_MS, by one of two policies:
 *   engine   every gatherer is ordered to the tree nearest the storehouse,
 *            once; the engine does the rest (a gatherer finding the tree
 *            full or used up takes the nearest tree to where it stands);
 *   managed  every gatherer is given its own tree, the one nearest the
 *            storehouse among the trees holding fewer than `cap` of the
 *            case's gatherers (each counted on the tree of its order, a
 *            gatherer walking back still holding its tree); every
 *            WOOD_TICK_MS an idle gatherer gets such a tree, a gatherer
 *            walking back to the storehouse whose tree is gone or lies
 *            more than WOOD_MARGIN m farther than the best such tree is
 *            given that tree (it drops its load first, the order costs no
 *            walk), and a gatherer the engine sent to a tree of its own
 *            choosing that lies more than WOOD_MARGIN m farther than the
 *            best is given the best.
 * The map name selects the list of cases (WOOD_CASES, one per player id;
 * a player with no case gets nothing).
 *
 * stdout protocol:
 *   [WOODLINE] start {"player", "policy", "gatherers", "gap", "cap", "trees", "wood", "measuredGap"}
 *     measuredGap: the obstruction distance from the storehouse to the
 *     nearest tree.
 *   [WOODLINE] tick {"t", "player", "wood", "haul"}
 *     every WOOD_REPORT_MS: wood gathered by the player since the start
 *     (statistics tracker), and the mean obstruction distance from the
 *     storehouse to the trees its gatherers hold.
 *   [WOODLINE] result {"t", "player", "policy", "gatherers", "gap", "cap", "wood", "perGatherer", "orders"}
 *     at WOOD_START_MS + WOOD_DURATION_MS: wood gathered in the case's
 *     time and per gatherer per second, the orders the policy gave.
 * The harness gather census (`[HARNESS] gather`) gives each player's
 * gathering, walking and hauling time. Run with -l 6 and -R 0.
 */

const WOOD_FOREST_OFFSET = 130;
const WOOD_ROWS = 12;
const WOOD_COLUMNS = 18;
const WOOD_SPACING = 4;
const WOOD_JITTER = 1;
const WOOD_TREE = "gaia/tree/temperate";
const WOOD_TICK_MS = 1000;
const WOOD_REPORT_MS = 60000;
const WOOD_START_MS = 2000;
const WOOD_DURATION_MS = 300000;
const WOOD_MARGIN = 3;
const WOOD_GATHERER = "support_female_citizen";
const WOOD_CASES = {
	"n": [["engine", 5, 3, 8], ["engine", 10, 3, 8], ["engine", 20, 3, 8], ["engine", 40, 3, 8],
		["managed", 5, 3, 2], ["managed", 10, 3, 2], ["managed", 20, 3, 2], ["managed", 40, 3, 2]],
	"d": [["managed", 10, 3, 2], ["managed", 10, 8, 2], ["managed", 10, 15, 2], ["managed", 10, 25, 2],
		["managed", 10, 35, 2], ["managed", 10, 50, 2], ["managed", 10, 70, 2], ["managed", 10, 90, 2]],
	"c": [["managed", 20, 3, 1], ["managed", 20, 3, 2], ["managed", 20, 3, 3], ["managed", 20, 3, 4],
		["managed", 20, 3, 6], ["managed", 20, 3, 8], ["engine", 20, 15, 8], ["managed", 20, 15, 2]]
};

Trigger.prototype.WoodPosition = function(ent)
{
	const cmpPosition = Engine.QueryInterface(ent, IID_Position);
	return cmpPosition && cmpPosition.IsInWorld() ? cmpPosition.GetPosition2D() : null;
};

Trigger.prototype.WoodJitter = function(a, b, c)
{
	const hash = ((a * 73856093) ^ (b * 19349663) ^ (c * 83492791)) >>> 0;
	return ((hash % 10007) / 10006 - 0.5) * 2 * WOOD_JITTER;
};

Trigger.prototype.WoodAlive = function(tree)
{
	const cmpSupply = Engine.QueryInterface(tree, IID_ResourceSupply);
	return !!cmpSupply && cmpSupply.GetCurrentAmount() > 0;
};

Trigger.prototype.WoodTree = function(unit)
{
	const cmpUnitAI = Engine.QueryInterface(unit, IID_UnitAI);
	if (!cmpUnitAI || !cmpUnitAI.order || !cmpUnitAI.order.data)
		return undefined;
	const state = cmpUnitAI.GetCurrentState() || "";
	return state.indexOf("RETURNINGRESOURCE") !== -1 ? cmpUnitAI.order.data.formerTarget : cmpUnitAI.order.data.target;
};

Trigger.prototype.WoodGathered = function(player)
{
	const cmpStatisticsTracker = QueryPlayerIDInterface(player, IID_StatisticsTracker);
	return cmpStatisticsTracker ? cmpStatisticsTracker.GetBasicStatistics().resourcesGathered.wood || 0 : 0;
};

Trigger.prototype.WoodSetUp = function(player, spec, centre)
{
	const [policy, count, gap, cap] = spec;
	const civ = QueryPlayerIDInterface(player, IID_Identity).GetCiv();
	const cmpTemplateManager = Engine.QueryInterface(SYSTEM_ENTITY, IID_TemplateManager);
	const home = TriggerHelper.GetPlayerEntitiesByClass(player, "CivCentre")[0];
	const at = this.WoodPosition(home);
	const outward = Vector2D.sub(at, centre).normalize();
	const across = new Vector2D(-outward.y, outward.x);
	const trees = [];
	let wood = 0;
	for (let row = 0; row < WOOD_ROWS; ++row)
		for (let column = 0; column < WOOD_COLUMNS; ++column)
		{
			const depth = WOOD_FOREST_OFFSET + row * WOOD_SPACING + (row ? this.WoodJitter(player, row, column) : 0);
			const side = (column - (WOOD_COLUMNS - 1) / 2) * WOOD_SPACING + this.WoodJitter(column, player, row);
			const point = Vector2D.add(Vector2D.add(at, Vector2D.mult(outward, depth)), Vector2D.mult(across, side));
			const tree = Engine.AddEntity(WOOD_TREE);
			const cmpPosition = Engine.QueryInterface(tree, IID_Position);
			cmpPosition.JumpTo(point.x, point.y);
			cmpPosition.SetYRotation((row * 7 + column * 3) % 6);
			Engine.QueryInterface(tree, IID_Ownership).SetOwner(0);
			wood += Engine.QueryInterface(tree, IID_ResourceSupply).GetCurrentAmount();
			trees.push(tree);
		}
	let storehouseTemplate = "structures/" + civ + "/storehouse";
	if (!cmpTemplateManager.TemplateExists(storehouseTemplate))
		storehouseTemplate = "structures/athen/storehouse";
	const storehouse = Engine.AddEntity(storehouseTemplate);
	const half = 6.5;
	const place = Vector2D.add(at, Vector2D.mult(outward, WOOD_FOREST_OFFSET - gap - half));
	const cmpPosition = Engine.QueryInterface(storehouse, IID_Position);
	cmpPosition.JumpTo(place.x, place.y);
	cmpPosition.SetYRotation(Math.atan2(outward.x, outward.y));
	Engine.QueryInterface(storehouse, IID_Ownership).SetOwner(player);
	const cmpObstructionManager = Engine.QueryInterface(SYSTEM_ENTITY, IID_ObstructionManager);
	const hauls = new Map();
	for (const tree of trees)
	{
		const p = this.WoodPosition(tree);
		hauls.set(tree, cmpObstructionManager.DistanceToPoint(storehouse, p.x, p.y));
	}
	let template = "units/" + civ + "/" + WOOD_GATHERER;
	if (!cmpTemplateManager.TemplateExists(template))
		template = "units/athen/" + WOOD_GATHERER;
	const units = TriggerHelper.SpawnUnits(storehouse, template, count, player);
	const measuredGap = Math.min(...hauls.values());
	print("[WOODLINE] start " + JSON.stringify({ "player": player, "policy": policy, "gatherers": units.length, "gap": gap, "cap": cap,
		"trees": trees.length, "wood": wood, "measuredGap": Math.round(measuredGap * 10) / 10 }) + "\n");
	return { player, policy, count, gap, cap, trees, hauls, storehouse, units, "held": new Map(), "redirected": new Set(), "orders": 0, "start": 0 };
};

Trigger.prototype.WoodInit = function()
{
	const match = /strategos_woodline_([a-z0-9]+)$/.exec(InitAttributes.map);
	if (!match || !WOOD_CASES[match[1]])
		throw new Error("strategos_woodline: no case list for the map " + InitAttributes.map);
	const list = WOOD_CASES[match[1]];
	const cmpPlayerManager = Engine.QueryInterface(SYSTEM_ENTITY, IID_PlayerManager);
	const size = Engine.QueryInterface(SYSTEM_ENTITY, IID_Terrain).GetMapSize();
	const centre = new Vector2D(size / 2, size / 2);
	this.wood = [];
	for (let player = 1; player < cmpPlayerManager.GetNumPlayers(); ++player)
		if (list[player - 1])
			this.wood.push(this.WoodSetUp(player, list[player - 1], centre));
	this.DoAfterDelay(WOOD_START_MS, "WoodStart", {});
};

Trigger.prototype.WoodOrder = function(woodcase, unit, tree)
{
	ProcessCommand(woodcase.player, { "type": "gather", "entities": [unit], "target": tree, "queued": false });
	woodcase.held.set(unit, tree);
	woodcase.orders += 1;
};

Trigger.prototype.WoodBest = function(woodcase, occupancy)
{
	let best = null;
	for (const tree of woodcase.trees)
	{
		if ((occupancy.get(tree) || 0) >= woodcase.cap || !this.WoodAlive(tree))
			continue;
		if (!best || woodcase.hauls.get(tree) < woodcase.hauls.get(best) || woodcase.hauls.get(tree) === woodcase.hauls.get(best) && tree < best)
			best = tree;
	}
	return best;
};

Trigger.prototype.WoodStart = function()
{
	for (const woodcase of this.wood)
	{
		woodcase.start = this.WoodGathered(woodcase.player);
		if (woodcase.policy === "engine")
		{
			const tree = this.WoodBest(woodcase, new Map());
			ProcessCommand(woodcase.player, { "type": "gather", "entities": woodcase.units, "target": tree, "queued": false });
			woodcase.orders += 1;
		}
	}
	this.woodStartTime = Engine.QueryInterface(SYSTEM_ENTITY, IID_Timer).GetTime();
	this.woodLastReport = this.woodStartTime;
	this.WoodTick();
	this.DoRepeatedly(WOOD_TICK_MS, "WoodTick", {});
	this.DoAfterDelay(WOOD_DURATION_MS, "WoodEnd", {});
};

Trigger.prototype.WoodTick = function()
{
	if (this.woodDone)
		return;
	const now = Engine.QueryInterface(SYSTEM_ENTITY, IID_Timer).GetTime();
	for (const woodcase of this.wood)
	{
		if (woodcase.policy !== "managed")
			continue;
		const actual = new Map();
		const occupancy = new Map();
		for (const unit of woodcase.units)
		{
			const tree = this.WoodTree(unit);
			if (tree !== undefined && woodcase.hauls.has(tree) && this.WoodAlive(tree))
			{
				actual.set(unit, tree);
				occupancy.set(tree, (occupancy.get(tree) || 0) + 1);
			}
		}
		for (const unit of woodcase.units)
		{
			const cmpUnitAI = Engine.QueryInterface(unit, IID_UnitAI);
			if (!cmpUnitAI)
				continue;
			const state = cmpUnitAI.GetCurrentState() || "";
			const current = actual.get(unit);
			const leave = () => {
				if (current !== undefined)
					occupancy.set(current, occupancy.get(current) - 1);
			};
			const stay = () => {
				if (current !== undefined)
					occupancy.set(current, occupancy.get(current) + 1);
			};
			const take = tree => {
				this.WoodOrder(woodcase, unit, tree);
				occupancy.set(tree, (occupancy.get(tree) || 0) + 1);
			};
			if (state.indexOf("IDLE") !== -1)
			{
				const best = this.WoodBest(woodcase, occupancy);
				if (best !== null)
					take(best);
				continue;
			}
			if (state.indexOf("RETURNINGRESOURCE") !== -1)
			{
				if (woodcase.redirected.has(unit))
					continue;
				woodcase.redirected.add(unit);
				leave();
				const best = this.WoodBest(woodcase, occupancy);
				if (best !== null && (current === undefined || woodcase.hauls.get(current) > woodcase.hauls.get(best) + WOOD_MARGIN))
					take(best);
				else
					stay();
				continue;
			}
			woodcase.redirected.delete(unit);
			if (state.indexOf("GATHER.APPROACHING") !== -1 && current !== undefined && current !== woodcase.held.get(unit))
			{
				leave();
				const best = this.WoodBest(woodcase, occupancy);
				if (best !== null && woodcase.hauls.get(current) > woodcase.hauls.get(best) + WOOD_MARGIN)
					take(best);
				else
				{
					stay();
					woodcase.held.set(unit, current);
				}
			}
		}
	}
	if (now - this.woodLastReport >= WOOD_REPORT_MS)
	{
		this.woodLastReport = now;
		for (const woodcase of this.wood)
		{
			let haul = 0;
			let counted = 0;
			for (const unit of woodcase.units)
			{
				const tree = this.WoodTree(unit);
				if (woodcase.hauls.has(tree))
				{
					haul += woodcase.hauls.get(tree);
					counted += 1;
				}
			}
			print("[WOODLINE] tick " + JSON.stringify({ "t": Math.round((now - this.woodStartTime) / 1000), "player": woodcase.player,
				"wood": this.WoodGathered(woodcase.player) - woodcase.start, "haul": counted ? Math.round(haul / counted * 10) / 10 : null }) + "\n");
		}
	}
};

Trigger.prototype.WoodEnd = function()
{
	this.woodDone = true;
	const now = Engine.QueryInterface(SYSTEM_ENTITY, IID_Timer).GetTime();
	for (const woodcase of this.wood)
	{
		const wood = this.WoodGathered(woodcase.player) - woodcase.start;
		print("[WOODLINE] result " + JSON.stringify({ "t": Math.round((now - this.woodStartTime) / 1000), "player": woodcase.player,
			"policy": woodcase.policy, "gatherers": woodcase.units.length, "gap": woodcase.gap, "cap": woodcase.cap, "wood": wood,
			"perGatherer": Math.round(wood / woodcase.units.length / (WOOD_DURATION_MS / 1000) * 1000) / 1000, "orders": woodcase.orders }) + "\n");
	}
};

{
	const cmpTrigger = Engine.QueryInterface(SYSTEM_ENTITY, IID_Trigger);
	cmpTrigger.DoAfterDelay(0, "WoodInit", {});
}
