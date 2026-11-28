import { describe, expect, test } from "vitest";

import {
	evaluate,
	floor2,
	parseThresholds,
	renderComment,
	type Coverage,
} from "./report.ts";

const cov = (overrides: Partial<Coverage> = {}): Coverage => ({
	statements: 90,
	branches: 80,
	functions: 95,
	lines: 92,
	...overrides,
});

describe("floor2", () => {
	test("truncates instead of rounding, like Vitest autoUpdate", () => {
		expect(floor2(98.198)).toBe(98.19);
		expect(floor2(91.8267)).toBe(91.82);
		expect(floor2(100)).toBe(100);
	});
});

describe("parseThresholds", () => {
	test("reads the four metrics from a vite config", () => {
		const source = `
			coverage: {
				thresholds: {
					autoUpdate: true,
					statements: 97.8,
					branches: 91.82,
					functions: 98.12,
					lines: 97.87,
				},
			},`;

		expect(parseThresholds(source)).toEqual({
			statements: 97.8,
			branches: 91.82,
			functions: 98.12,
			lines: 97.87,
		});
	});

	test("returns null when there is no thresholds block", () => {
		expect(parseThresholds("export default {};")).toBeNull();
	});

	test("returns null when a metric is missing", () => {
		expect(parseThresholds("thresholds: { lines: 90 }")).toBeNull();
	});
});

describe("evaluate", () => {
	test("passes when coverage and thresholds are unchanged", () => {
		const result = evaluate({
			base: cov(),
			thresholds: cov(),
			current: cov(),
		});

		expect(result.errors).toEqual([]);
	});

	test("fails when a metric dropped below main", () => {
		const result = evaluate({
			base: cov(),
			thresholds: cov({ branches: 70 }),
			current: cov({ branches: 79.5 }),
		});

		expect(result.errors).toContainEqual(expect.stringContaining("branches"));
		expect(result.errors.join("\n")).toContain("dropped");
	});

	test("fails when the PR lowers a threshold even if coverage holds", () => {
		const result = evaluate({
			base: cov(),
			thresholds: cov({ lines: 80 }),
			current: cov(),
		});

		expect(result.errors.join("\n")).toContain("lines threshold");
	});

	test("fails when coverage improved but the threshold was not updated", () => {
		const result = evaluate({
			base: cov(),
			thresholds: cov(),
			current: cov({ functions: 96.5 }),
		});

		expect(result.errors).toHaveLength(1);
		expect(result.errors[0]).toContain("functions");
		expect(result.errors[0]).toContain("96.5");
	});

	test("passes when the improvement is committed to the thresholds", () => {
		const result = evaluate({
			base: cov(),
			thresholds: cov({ functions: 96.5 }),
			current: cov({ functions: 96.5 }),
		});

		expect(result.errors).toEqual([]);
	});

	test("compares truncated values, so 98.198 matches a 98.19 threshold", () => {
		const result = evaluate({
			base: cov({ functions: 98 }),
			thresholds: cov({ functions: 98.19 }),
			current: cov({ functions: 98.198 }),
		});

		expect(result.errors).toEqual([]);
	});

	test("without a base only checks that thresholds exist", () => {
		const result = evaluate({
			base: null,
			thresholds: cov(),
			current: cov({ lines: 99 }),
		});

		expect(result.errors).toEqual([]);
	});

	test("fails when the PR config has no thresholds", () => {
		const result = evaluate({
			base: cov(),
			thresholds: null,
			current: cov(),
		});

		expect(result.errors.join("\n")).toContain("thresholds");
	});

	test("reports base, current and delta per metric", () => {
		const result = evaluate({
			base: cov({ branches: 80 }),
			thresholds: cov({ branches: 82.5 }),
			current: cov({ branches: 82.5 }),
		});

		expect(result.rows).toContainEqual({
			metric: "branches",
			base: 80,
			current: 82.5,
			delta: 2.5,
		});
	});
});

describe("renderComment", () => {
	test("shows a before/after table and the raw summary", () => {
		const comment = renderComment(
			evaluate({
				base: cov({ branches: 80 }),
				thresholds: cov({ branches: 82.5 }),
				current: cov({ branches: 82.5 }),
			}),
			"Branches : 82.5%",
		);

		expect(comment).toContain("| Branches | 80 | 82.5 | +2.5 |");
		expect(comment).toContain("Branches : 82.5%");
	});

	test("lists the errors when the gate fails", () => {
		const comment = renderComment(
			evaluate({
				base: cov(),
				thresholds: cov(),
				current: cov({ lines: 80 }),
			}),
			"",
		);

		expect(comment).toContain("lines dropped");
	});

	test("shows a dash for the base when there is none", () => {
		const comment = renderComment(
			evaluate({ base: null, thresholds: cov(), current: cov() }),
			"",
		);

		expect(comment).toContain("| Lines | — | 92 | — |");
	});
});
