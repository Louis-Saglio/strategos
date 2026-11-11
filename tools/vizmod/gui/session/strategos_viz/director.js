/**
 * Strategos viz director: drives the camera of a visual replay from a plan and
 * tells tools/viz.py when a frame is ready to grab.
 *
 * GUI realm only. It reads the simulation through GuiInterface calls that
 * are read-only (GetNonGaiaEntities, GetMultipleEntityStates,
 * GetSimulationState) and never posts a command, so the replayed match is
 * exactly the recorded one. Outside a visual replay it does nothing.
 *
 * Protocol (stdout, one line each, `print` flushes):
 *   [VIZ] ready {"mapSize":768,"speed":20,"screen":[w,h],"players":[...]}
 *   [VIZ] shot  {"n":0,"t":30000,"target":"base:1","x":..,"z":..,...}
 *   [VIZ] skip  {"t":30000,"target":"fight","why":"..."}
 *   [VIZ] end   {"t":2700000,"frames":N}
 * A shot is printed once the camera is in place and the frame rendered; the
 * sim stays paused and the camera still for `holdMs` so the harness can grab
 * the screen. Shots are taken in groups, every `every` seconds of game time
 * (plus explicit `shots`), with the simulation paused for the whole group:
 * frames of one group show the same instant.
 *
 * The plan is gui/session/strategos_viz/plan.json (written by tools/viz.py into
 * its copy of this mod); every key is optional, see DEFAULTS.
 *
 * Camera math: the engine's camera is position + orientation(rotX, rotY) and
 * its pivot (the point looked at) is position + forward·zoom
 * (CCameraController::GetSmoothPivot). The forward vector is read back from
 * the engine (set the camera at the origin, read the pivot) instead of being
 * re-derived, then the position is corrected once against the terrain
 * actually under the screen centre. Camera constraints are disabled so any
 * pitch and distance can be used (an overview is a 90° top-down shot from
 * ~1 km).
 */
class StrategosViz
{
	constructor()
	{
		this.state = "init";
		this.plan = null;
		this.frames = 0;
		this.next = 0;
		this.explicit = [];
		this.queue = [];
		this.shot = null;
		this.phase = null;
		this.until = 0;
		this.framesWaited = 0;
		this.final = false;
		this.groupTime = 0;
		this.lastT = -1;
		this.lastAdvance = Date.now();
		this.mapSize = 0;
		this.screen = [0, 0];
	}

	tick()
	{
		if (this.state == "off" || this.state == "done")
			return;
		try
		{
			this.step();
		}
		catch (e)
		{
			this.emit("error", { "error": String(e), "stack": String(e && e.stack || "") });
			this.state = "off";
			Engine.SetPaused(false, false);
		}
	}

	emit(kind, data)
	{
		print("[VIZ] " + kind + " " + JSON.stringify(data) + "\n");
	}

	step()
	{
		if (this.state == "init")
		{
			if (!Engine.IsVisualReplay())
			{
				this.state = "off";
				return;
			}
			if (!g_Settings || !GetSimState())
				return;
			this.start();
			return;
		}

		if (this.state == "run")
		{
			if (Engine.GetSimRate() != this.plan.speed)
				Engine.SetSimRate(this.plan.speed);
			const sim = GetSimState();
			const t = sim.timeElapsed;
			const wall = Date.now();
			if (t != this.lastT)
			{
				this.lastT = t;
				this.lastAdvance = wall;
			}
			// A replay stops at its last recorded turn, which can come before the
			// players' end states (e.g. a harness time limit firing one turn later):
			// sim time that stops advancing also means the match is over.
			const stalled = wall - this.lastAdvance > StrategosViz.STALL_MS;
			const over = this.isOver(sim) || stalled ||
				this.plan.end !== null && t >= this.plan.end * 1000;
			const due = [];
			while (this.explicit.length && this.explicit[0].t * 1000 <= t)
				due.push(this.explicit.shift());
			if (over || t >= this.next || due.length)
				this.beginGroup(t, over, due, this.plan.every > 0 && (over || t >= this.next));
			return;
		}

		if (this.state == "shoot")
		{
			++this.framesWaited;
			const now = Date.now();
			if (this.phase == "settle" && this.framesWaited >= this.plan.settleFrames && now >= this.until)
			{
				this.emit("shot", this.shot);
				++this.frames;
				this.phase = "hold";
				this.until = now + this.plan.holdMs;
			}
			else if (this.phase == "hold" && now >= this.until)
				this.nextShot();
			return;
		}

		if (this.state == "end" && Date.now() >= this.until)
		{
			this.state = "done";
			if (this.plan.exit)
				Engine.Exit();
		}
	}

	start()
	{
		const file = StrategosViz.PLAN;
		const custom = Engine.FileExists(file) ? Engine.ReadJSONFile(file) : null;
		this.plan = Object.assign({}, StrategosViz.DEFAULTS, custom || {});
		const plan = this.plan;

		const tiles = g_InitAttributes && g_InitAttributes.settings && g_InitAttributes.settings.Size;
		this.mapSize = tiles ? tiles * 4 : 1024; // TERRAIN_TILE_SIZE = 4 m
		const size = Engine.GetGUIObjectByName("session").getComputedSize();
		const scale = +Engine.ConfigDB_GetValue("user", "gui.scale") || 1;
		this.screen = [Math.round(size.right * scale), Math.round(size.bottom * scale)];

		this.explicit = (plan.shots || []).slice().sort((a, b) => a.t - b.t);
		this.next = plan.every > 0 ? plan.start * 1000 : Infinity;

		Engine.SetSimRate(plan.speed);
		Engine.GameView_SetConstrainCameraEnabled(false);
		if (!plan.hud)
		{
			g_ShowGUI = false;
			updateCinemaPath();
		}
		if (!plan.cursor)
		{
			// Nobody is at the controls: no cursor in the frames, and no hover
			// highlight or tooltip from wherever the pointer last was.
			updateCursorAndTooltip = function() {};
			Engine.SetCursor("");
		}

		const sim = GetSimState();
		this.emit("ready", {
			"mapSize": this.mapSize,
			"speed": plan.speed,
			"screen": this.screen,
			"plan": custom ? "custom" : "default",
			"players": sim.players.map((p, i) => ({ "id": i, "name": p.name, "civ": p.civ, "state": p.state }))
		});
		this.state = "run";
		this.lastAdvance = Date.now();
	}

	isOver(sim)
	{
		const players = sim.players.slice(1);
		return players.some(p => p.state == "won") || players.every(p => p.state != "active");
	}

	beginGroup(t, final, explicitShots, periodic)
	{
		Engine.SetPaused(true, false);
		this.final = final;
		this.groupTime = t;
		const snap = this.snapshot();
		const specs = (periodic ? this.plan.targets : []).concat(explicitShots);
		this.queue = [];
		for (const raw of specs)
		{
			const spec = typeof raw == "string" ? { "target": raw } : raw;
			const shot = this.resolve(spec, snap);
			if (shot.why)
			{
				this.emit("skip", { "t": t, "target": spec.target, "why": shot.why });
				continue;
			}
			shot.t = t;
			shot.target = spec.target;
			shot.label = spec.label || spec.target.replace(/[^A-Za-z0-9_.-]+/g, "_");
			this.queue.push(shot);
		}
		while (this.next <= t)
			this.next += this.plan.every * 1000;
		this.state = "shoot";
		this.nextShot();
	}

	nextShot()
	{
		const shot = this.queue.shift();
		if (!shot)
		{
			this.endGroup();
			return;
		}
		shot.n = this.frames;
		this.placeCamera(shot);
		this.shot = shot;
		this.phase = "settle";
		this.framesWaited = 0;
		this.until = Date.now() + this.plan.settleMs;
	}

	endGroup()
	{
		this.shot = null;
		if (this.final)
		{
			this.emit("end", { "t": this.groupTime, "frames": this.frames });
			this.state = "end";
			this.until = Date.now() + this.plan.holdMs;
			return;
		}
		Engine.SetPaused(false, false);
		this.state = "run";
		this.lastAdvance = Date.now();
	}

	/**
	 * Every non-gaia entity in the world, reduced to what the targets need.
	 * Garrisoned / not-in-world entities have no position and are dropped.
	 */
	snapshot()
	{
		const ids = Engine.GuiInterfaceCall("GetNonGaiaEntities");
		const out = [];
		for (const { entId, state } of Engine.GuiInterfaceCall("GetMultipleEntityStates", ids))
		{
			if (!state || !state.position || !state.identity)
				continue;
			const cls = state.identity.classes;
			const order = state.unitAI && state.unitAI.orders.find(o => o.data && o.data.target);
			out.push({
				"id": entId,
				"p": state.player,
				"x": state.position.x,
				"y": state.position.y,
				"z": state.position.z,
				"structure": cls.indexOf("Structure") != -1,
				"cc": cls.indexOf("CivCentre") != -1 && !state.foundation,
				"military": cls.indexOf("Soldier") != -1 || cls.indexOf("Siege") != -1,
				"st": state.unitAI ? state.unitAI.state : "",
				"tgt": order ? order.data.target : null
			});
		}
		return out;
	}

	/**
	 * Target spec -> camera shot {x, y, z, zoom, pitch, yaw, info} or {why}.
	 *   overview      whole map, top-down
	 *   base:P        player P's civic centre (oldest), else its structures
	 *   army:P        densest cluster of P's soldiers/siege not at work
	 *   fight         densest cluster of units in a COMBAT state
	 *   ent:ID        an entity (e.g. an id from the [HARNESS] map telemetry)
	 *   xy:X,Z        a fixed point, in metres
	 *   area:X,Z,R    top-down view of the ground within R metres of X,Z
	 * Any target takes a camera suffix @R[/PITCH[/YAW]]: R frames about R metres
	 * around the target (camera distance R / tan 22.5°: the half-height of the
	 * view for a top-down shot), PITCH in degrees below the horizon (89 =
	 * top-down), YAW in degrees. E.g. fight@40, base:1@300/89, ent:4242@25/40.
	 * Plan spec keys radius / zoom (camera distance) / pitch / yaw do the same.
	 */
	resolve(spec, snap)
	{
		const plan = this.plan;
		const [target, mods] = spec.target.split("@");
		const [kind, arg] = target.split(":");
		const cam = { "radius": spec.radius, "zoom": spec.zoom, "pitch": spec.pitch, "yaw": spec.yaw };
		if (mods)
		{
			const [r, pitch, yaw] = mods.split("/").map(v => v === "" ? undefined : Number(v));
			if ([r, pitch, yaw].some(v => v !== undefined && !isFinite(v)))
				return { "why": "bad camera suffix @" + mods };
			if (r !== undefined)
				cam.radius = r;
			if (pitch !== undefined)
				cam.pitch = pitch;
			if (yaw !== undefined)
				cam.yaw = yaw;
		}
		let shot = null;

		if (kind == "overview")
		{
			const c = this.mapSize / 2;
			// The view is 2·radius high (the short side): the whole circular map
			// plus a 3% margin.
			shot = { "x": c, "y": 0, "z": c, "zoom": c * 1.03 / StrategosViz.TAN_HALF_FOV, "pitch": 89, "info": {} };
		}
		else if (kind == "base" || kind == "cc")
		{
			const p = +arg;
			const ccs = snap.filter(e => e.p == p && e.cc).sort((a, b) => a.id - b.id);
			if (ccs.length)
				shot = { "x": ccs[0].x, "y": ccs[0].y, "z": ccs[0].z, "zoom": plan.baseZoom,
					"info": { "entity": ccs[0].id, "civCentres": ccs.length } };
			else
			{
				const st = snap.filter(e => e.p == p && e.structure);
				if (!st.length)
					return { "why": "player " + p + " has no structure" };
				const c = StrategosViz.centroid(st);
				shot = { "x": c.x, "y": c.y, "z": c.z, "zoom": plan.baseZoom,
					"info": { "civCentres": 0, "structures": st.length } };
			}
		}
		else if (kind == "army")
		{
			const p = +arg;
			const units = snap.filter(e => e.p == p && e.military && !StrategosViz.WORK.test(e.st));
			const cl = StrategosViz.cluster(units, plan.clusterCell);
			if (!cl || cl.members.length < plan.minArmy)
				return { "why": "no army of " + plan.minArmy + "+ (" + (cl ? cl.members.length : 0) + ")" };
			shot = this.clusterShot(cl, { "units": cl.members.length, "total": units.length });
		}
		else if (kind == "fight")
		{
			// In combat against another player's entity: hunting (gaia targets,
			// absent from the non-gaia snapshot) is not a fight.
			const owner = new Map(snap.map(e => [e.id, e.p]));
			const units = snap.filter(e => !e.structure && /COMBAT/.test(e.st) &&
				owner.has(e.tgt) && owner.get(e.tgt) != e.p);
			const cl = StrategosViz.cluster(units, plan.clusterCell);
			if (!cl || cl.members.length < plan.minFight)
				return { "why": "no fight of " + plan.minFight + "+ (" + (cl ? cl.members.length : 0) + ")" };
			const byPlayer = {};
			for (const e of cl.members)
				byPlayer[e.p] = (byPlayer[e.p] || 0) + 1;
			shot = this.clusterShot(cl, { "units": cl.members.length, "byPlayer": byPlayer });
		}
		else if (kind == "ent")
		{
			const id = +arg;
			let e = snap.find(s => s.id == id);
			if (!e)
			{
				const st = Engine.GuiInterfaceCall("GetEntityState", id);
				if (st && st.position)
					e = st.position;
			}
			if (!e)
				return { "why": "entity " + id + " gone or not in world" };
			shot = { "x": e.x, "y": e.y, "z": e.z, "zoom": plan.zoom, "info": { "entity": id } };
		}
		else if (kind == "xy")
		{
			const [x, z] = arg.split(",").map(Number);
			if (!isFinite(x) || !isFinite(z))
				return { "why": "bad point " + arg };
			shot = { "x": x, "y": 0, "z": z, "zoom": plan.zoom, "info": {} };
		}
		else if (kind == "area")
		{
			const [x, z, r] = (arg || "").split(",").map(Number);
			if (![x, z, r].every(isFinite) || r <= 0)
				return { "why": "area expects X,Z,R, got " + arg };
			shot = { "x": x, "y": 0, "z": z, "zoom": r / StrategosViz.TAN_HALF_FOV, "pitch": 89, "info": {} };
		}
		else
			return { "why": "unknown target kind " + kind };

		shot.pitch = cam.pitch !== undefined ? cam.pitch : shot.pitch !== undefined ? shot.pitch : plan.pitch;
		shot.yaw = cam.yaw !== undefined ? cam.yaw : plan.yaw;
		if (cam.radius !== undefined)
			shot.zoom = cam.radius / StrategosViz.TAN_HALF_FOV;
		else if (cam.zoom !== undefined)
			shot.zoom = cam.zoom;
		if (!(shot.zoom > 0) || !(shot.pitch > 0 && shot.pitch <= 90))
			return { "why": "bad camera (distance " + shot.zoom + ", pitch " + shot.pitch + ")" };
		return shot;
	}

	clusterShot(cl, info)
	{
		const c = StrategosViz.centroid(cl.members);
		let spread = 0;
		for (const e of cl.members)
			spread = Math.max(spread, Math.hypot(e.x - c.x, e.z - c.z));
		info.spread = Math.round(spread);
		return { "x": c.x, "y": c.y, "z": c.z, "info": info,
			"zoom": Math.min(this.plan.maxZoom, Math.max(this.plan.zoom, spread * 2.5)) };
	}

	placeCamera(shot)
	{
		const rx = shot.pitch * Math.PI / 180;
		const ry = shot.yaw * Math.PI / 180;
		const zoom = shot.zoom;
		// Forward vector for (rx, ry), as the engine computes it.
		Engine.SetCameraData(0, 0, 0, rx, ry, zoom);
		const f = Engine.GetCameraPivot();
		const fy = -Math.sqrt(Math.max(0, zoom * zoom - f.x * f.x - f.z * f.z));
		let x = shot.x - f.x;
		let z = shot.z - f.z;
		const y = (shot.y || 0) - fy;
		Engine.SetCameraData(x, y, z, rx, ry, zoom);
		// Correct against the ground really under the screen centre (relief).
		const g = Engine.GetTerrainAtScreenPoint(Math.floor(this.screen[0] / 2), Math.floor(this.screen[1] / 2));
		if (g && isFinite(g.x) && isFinite(g.z) && Math.hypot(g.x - shot.x, g.z - shot.z) < zoom)
		{
			x += shot.x - g.x;
			z += shot.z - g.z;
			Engine.SetCameraData(x, y, z, rx, ry, zoom);
		}
		shot.x = Math.round(shot.x);
		shot.z = Math.round(shot.z);
		shot.y = Math.round(shot.y || 0);
		shot.radius = Math.round(zoom * StrategosViz.TAN_HALF_FOV);
		shot.zoom = Math.round(zoom);
		// Screen -> ground samples (5x5), so the frame can be georeferenced
		// afterwards (tools/frames.py draws a world grid on top-down shots).
		// GetTerrainAtScreenPoint clamps to the map: samples on the edge are
		// not where that pixel looks, drop them.
		shot.ground = [];
		const edge = this.mapSize - 0.5;
		for (const fy of [0.1, 0.3, 0.5, 0.7, 0.9])
			for (const fx of [0.1, 0.3, 0.5, 0.7, 0.9])
			{
				const px = Math.floor(this.screen[0] * fx);
				const py = Math.floor(this.screen[1] * fy);
				const w = Engine.GetTerrainAtScreenPoint(px, py);
				if (w && w.x > 0.5 && w.z > 0.5 && w.x < edge && w.z < edge)
					shot.ground.push([px, py, Math.round(w.x * 10) / 10, Math.round(w.z * 10) / 10]);
			}
	}

	static centroid(list)
	{
		let x = 0, y = 0, z = 0;
		for (const e of list)
		{
			x += e.x;
			y += e.y || 0;
			z += e.z;
		}
		return { "x": x / list.length, "y": y / list.length, "z": z / list.length };
	}

	/**
	 * Densest 3x3 block of grid cells (cell metres wide): the block's members.
	 * O(n); ties go to the first cell met, i.e. a stable choice.
	 */
	static cluster(list, cell)
	{
		if (!list.length)
			return null;
		const grid = new Map();
		const key = (i, j) => i + "," + j;
		for (const e of list)
		{
			const k = key(Math.floor(e.x / cell), Math.floor(e.z / cell));
			if (!grid.has(k))
				grid.set(k, []);
			grid.get(k).push(e);
		}
		let best = null;
		for (const k of grid.keys())
		{
			const [i, j] = k.split(",").map(Number);
			const members = [];
			for (let di = -1; di <= 1; ++di)
				for (let dj = -1; dj <= 1; ++dj)
				{
					const c = grid.get(key(i + di, j + dj));
					if (c)
						members.push(...c);
				}
			if (!best || members.length > best.members.length)
				best = { "members": members };
		}
		return best;
	}
}

StrategosViz.PLAN = "gui/session/strategos_viz/plan.json";

// Vertical field of view 45° (view.fov): half-height seen at distance d is
// d·tan 22.5° = d·(√2 − 1). (Math.tan throws in 0 A.D.: "no synchronization
// safe implementation", even in the GUI realm.)
StrategosViz.TAN_HALF_FOV = Math.SQRT2 - 1;
StrategosViz.STALL_MS = 3000;

StrategosViz.DEFAULTS = {
	"speed": 20,          // sim rate (engine has no upper clamp; 20 = the UI's max)
	"every": 30,          // game seconds between shot groups (0 = explicit shots only)
	"start": 0,           // game seconds of the first group
	"end": null,          // game seconds of the last group (null = match end)
	"targets": ["overview", "base:1", "base:2", "army:1", "army:2", "fight"],
	"shots": [],          // explicit [{t, target, zoom?, pitch?, yaw?, label?}]
	"zoom": 160,          // camera distance (m) for army / fight / ent / xy (radius = 0.41 × distance)
	"baseZoom": 230,
	"maxZoom": 450,
	"pitch": 55,          // degrees below the horizon
	"yaw": 0,
	"clusterCell": 40,    // metres
	"minArmy": 5,
	"minFight": 4,
	"hud": false,
	"cursor": false,      // false: hide the pointer and disable hover tooltips
	"settleFrames": 3,
	"settleMs": 200,
	"holdMs": 300,
	"exit": true          // quit the engine after the final group
};

// Workers' unitAI states: a soldier doing one of these is not part of an army.
StrategosViz.WORK = /GATHER|RETURNRESOURCE|REPAIR|CONSTRUCT|TRADE|HEAL/;

var g_StrategosViz = new StrategosViz();
