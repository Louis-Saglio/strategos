// Runs the bot's own forecast.js outside the engine, for tools/forecast.py.
//
//   node forecast_eval.mjs BOT_FORECAST_JS < request.json > predictions.json
//
// request:  {"samples": [{"ours": SIDE, "theirs": SIDE}, ...], "options": [{...}, ...]}
//           SIDE as the [FORECAST] telemetry line prints it:
//           {"groups": [[template, count, hitpoints, ranged, value, engaged, at], ...],
//            "rates": [[...], ...], "fire": [...]}
// response: one list per option set, holding per sample {"marks": [[t, oursLost, theirsLost], ...], "edge", "winner"}.
//
// forecast.js is a module of the bot: its imports are absolute VFS paths
// ("simulation/ai/strategos/X.js") that node cannot resolve. forecast.js and every module it
// imports, followed transitively from the files next to it, are copied to a temporary
// directory as X.mjs with those imports rewritten to "./X.mjs", and the copy is loaded.
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join } from "node:path";
import { pathToFileURL } from "node:url";

const BOT_IMPORT = /(from\s+["'])simulation\/ai\/strategos\/([\w-]+)\.js(["'])/g;
const source = process.argv[2];
const botDir = dirname(source);
const dir = mkdtempSync(join(tmpdir(), "forecast-"));
const pending = [basename(source, ".js")];
const copied = new Set();
while (pending.length)
{
	const name = pending.pop();
	if (copied.has(name))
		continue;
	copied.add(name);
	const text = readFileSync(join(botDir, name + ".js"), "utf8");
	for (const match of text.matchAll(BOT_IMPORT))
		pending.push(match[2]);
	writeFileSync(join(dir, name + ".mjs"), text.replace(BOT_IMPORT, "$1./$2.mjs$3"));
}
const { forecast } = await import(pathToFileURL(join(dir, basename(source, ".js") + ".mjs")).href);
rmSync(dir, { "recursive": true });

const side = logged => ({
	"groups": logged.groups.map(([template, count, hitpoints, ranged, value, engaged, at], index) => ({
		template, count, hitpoints, "ranged": !!ranged, value, engaged, at, "rates": logged.rates[index]
	})),
	"fire": logged.fire
});

const request = JSON.parse(readFileSync(0, "utf8"));
const samples = request.samples.map(sample => ({ "ours": side(sample.ours), "theirs": side(sample.theirs) }));
const response = request.options.map(options => samples.map(battle => {
	const outlook = forecast(battle, options);
	return { "marks": outlook.marks.map(mark => [mark.t, mark.ours, mark.theirs]), "edge": outlook.edge, "winner": outlook.winner };
}));
process.stdout.write(JSON.stringify(response));
