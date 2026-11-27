import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";

import { LineChart, PieChart } from ".";

// The first dynamic import of Recharts can exceed findBy's 1s default
// when the whole suite runs in parallel.
const LAZY_LOAD_TIMEOUT = { timeout: 5000 };

describe("lazy charts", () => {
	afterEach(() => cleanup());

	test("PieChart renders a placeholder until the chart loads", async () => {
		render(<PieChart data={[{ key: "a", label: "A", value: 1 }]} />);

		expect(screen.getByTestId("chart-fallback").style.height).toBe("280px");
		expect(
			await screen.findByTestId("pie-chart", {}, LAZY_LOAD_TIMEOUT),
		).toBeTruthy();
		expect(screen.queryByTestId("chart-fallback")).toBeNull();
	});

	test("LineChart renders a placeholder with the requested height", async () => {
		render(
			<LineChart
				data={[{ month: "Jan", income: 1 }]}
				xKey="month"
				series={[{ key: "income", label: "Income" }]}
				height={120}
			/>,
		);

		expect(screen.getByTestId("chart-fallback").style.height).toBe("120px");
		expect(
			await screen.findByTestId("line-chart", {}, LAZY_LOAD_TIMEOUT),
		).toBeTruthy();
	});
});
