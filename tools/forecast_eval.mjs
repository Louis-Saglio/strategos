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
// forecast.js is a module of the bot (absolute VFS imports, .js extension); it imports
// nothing, so a copy named .mjs loads as it is.
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const dir = mkdtempSync(join(tmpdir(), "forecast-"));
const copy = join(dir, "forecast.mjs");
writeFileSync(copy, readFileSync(process.argv[2], "utf8"));
const { forecast } = await import(pathToFileURL(copy).href);
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
