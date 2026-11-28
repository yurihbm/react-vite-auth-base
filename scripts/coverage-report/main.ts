// Usage: node scripts/coverage-report/main.ts \
//   --base-config <vite.config.ts on the base branch, optional> \
//   --config <vite.config.ts on the PR> --summary <coverage-summary.json> \
//   [--text <coverage text summary>] [--out <comment.md>]
import fs from "node:fs";
import { parseArgs } from "node:util";

import {
	evaluate,
	METRICS,
	parseThresholds,
	renderComment,
	type Coverage,
} from "./report.ts";

const { values } = parseArgs({
	options: {
		"base-config": { type: "string" },
		config: { type: "string" },
		summary: { type: "string" },
		text: { type: "string" },
		out: { type: "string" },
	},
});

if (!values.config || !values.summary) {
	console.error("--config and --summary are required");
	process.exit(2);
}

const read = (file: string | undefined) =>
	file && fs.existsSync(file) ? fs.readFileSync(file, "utf8") : null;

const total = JSON.parse(fs.readFileSync(values.summary, "utf8")).total;
const current = Object.fromEntries(
	METRICS.map((metric) => [metric, total[metric].pct]),
) as Coverage;

const baseSource = read(values["base-config"]);
const result = evaluate({
	base: baseSource ? parseThresholds(baseSource) : null,
	thresholds: parseThresholds(read(values.config) ?? ""),
	current,
});

const comment = renderComment(result, read(values.text) ?? "");

if (values.out) {
	fs.writeFileSync(values.out, comment);
}

for (const error of result.errors) {
	console.error(`::error::${error}`);
}

process.exit(result.errors.length > 0 ? 1 : 0);
