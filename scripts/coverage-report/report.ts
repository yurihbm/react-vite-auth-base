export const METRICS = [
	"statements",
	"branches",
	"functions",
	"lines",
] as const;

export type Metric = (typeof METRICS)[number];
export type Coverage = Record<Metric, number>;

export interface Row {
	metric: Metric;
	base: number | null;
	current: number;
	delta: number | null;
}

export interface Result {
	rows: Row[];
	errors: string[];
}

// Vitest `thresholds.autoUpdate` truncates to two decimals; match it so a
// run that wrote its own thresholds compares equal.
export function floor2(value: number): number {
	return Math.floor(value * 100 + 1e-6) / 100;
}

export function parseThresholds(source: string): Coverage | null {
	const block = /thresholds:\s*\{([^}]*)\}/.exec(source)?.[1];

	if (!block) {
		return null;
	}

	const values: Partial<Coverage> = {};

	for (const metric of METRICS) {
		const match = new RegExp(`\\b${metric}:\\s*([\\d.]+)`).exec(block);

		if (!match) {
			return null;
		}

		values[metric] = Number(match[1]);
	}

	return values as Coverage;
}

interface EvaluateInput {
	/** Thresholds committed on the base branch; null if it has none yet. */
	base: Coverage | null;
	/** Thresholds committed on the PR branch; null if missing. */
	thresholds: Coverage | null;
	/** Raw coverage percentages measured on the PR. */
	current: Coverage;
}

export function evaluate({ base, thresholds, current }: EvaluateInput): Result {
	const errors: string[] = [];
	const rows: Row[] = [];

	if (!thresholds) {
		errors.push(
			"`vite.config.ts` has no `test.coverage.thresholds` with all four metrics.",
		);
	}

	for (const metric of METRICS) {
		const now = floor2(current[metric]);
		const before = base?.[metric] ?? null;

		rows.push({
			metric,
			base: before,
			current: now,
			delta: before === null ? null : round2(now - before),
		});

		if (before === null) {
			continue;
		}

		if (now < before) {
			errors.push(`${metric} dropped from ${before}% to ${now}%.`);
		}

		if (thresholds && thresholds[metric] < before) {
			errors.push(
				`${metric} threshold lowered from ${before} to ${thresholds[metric]}.`,
			);
		}

		if (thresholds && now > before && thresholds[metric] < now) {
			errors.push(
				`${metric} improved to ${now}% but its threshold is still ${thresholds[metric]}. Run \`pnpm test:coverage\` and commit the updated \`vite.config.ts\`.`,
			);
		}
	}

	return { rows, errors };
}

function round2(value: number): number {
	return Math.round(value * 100) / 100;
}

function formatDelta(delta: number | null): string {
	if (delta === null) {
		return "—";
	}

	if (delta > 0) {
		return `+${delta}`;
	}

	return String(delta);
}

function title(metric: Metric): string {
	return metric.charAt(0).toUpperCase() + metric.slice(1);
}

export function renderComment({ rows, errors }: Result, summary: string) {
	const lines = ["### Coverage", ""];

	lines.push("| | Base | PR | Δ |", "|---|---|---|---|");

	for (const { metric, base, current, delta } of rows) {
		lines.push(
			`| ${title(metric)} | ${base ?? "—"} | ${current} | ${formatDelta(delta)} |`,
		);
	}

	if (errors.length > 0) {
		lines.push("", "**Coverage check failed:**", "");

		for (const error of errors) {
			lines.push(`- ${error}`);
		}
	}

	if (summary) {
		lines.push(
			"",
			"<details><summary>Coverage summary</summary>",
			"",
			"```",
			summary.trim(),
			"```",
			"",
			"</details>",
		);
	}

	return `${lines.join("\n")}\n`;
}
