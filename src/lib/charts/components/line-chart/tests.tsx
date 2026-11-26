import type { ReactNode } from "react";

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import { LineChart } from ".";

// Recharts needs real layout/canvas measurement to render its SVG, which
// happy-dom doesn't provide. We mock it so tests assert the props our
// abstraction maps onto it, keeping Recharts itself swappable.
vi.mock("recharts", () => ({
	ResponsiveContainer: ({ children }: { children: ReactNode }) => (
		<div data-testid="responsive-container">{children}</div>
	),
	LineChart: ({ children, data }: { children: ReactNode; data: unknown[] }) => (
		<div data-testid="recharts-line-chart" data-length={data.length}>
			{children}
		</div>
	),
	CartesianGrid: () => <div data-testid="cartesian-grid" />,
	XAxis: ({ dataKey }: { dataKey: string }) => (
		<div data-testid="x-axis" data-key={dataKey} />
	),
	YAxis: () => <div data-testid="y-axis" />,
	Tooltip: () => <div data-testid="tooltip" />,
	Legend: () => <div data-testid="legend" />,
	Line: ({
		dataKey,
		name,
		className,
	}: {
		dataKey: string;
		name: string;
		className?: string;
	}) => (
		<div
			data-testid="line"
			data-key={dataKey}
			data-name={name}
			className={className}
		/>
	),
}));

const DATA = [
	{ month: "Feb", income: 1000, expenses: 400 },
	{ month: "Mar", income: 1200, expenses: 600 },
];

describe("LineChart", () => {
	afterEach(() => {
		cleanup();
	});

	test("renders a line per series with the correct data key and label", () => {
		render(
			<LineChart
				data={DATA}
				xKey="month"
				series={[
					{ key: "income", label: "Income", className: "text-success" },
					{ key: "expenses", label: "Expenses", className: "text-danger" },
				]}
			/>,
		);

		const lines = screen.getAllByTestId("line");

		expect(lines).toHaveLength(2);
		expect(lines[0].getAttribute("data-key")).toBe("income");
		expect(lines[0].getAttribute("data-name")).toBe("Income");
		expect(lines[1].getAttribute("data-key")).toBe("expenses");
		expect(lines[1].getAttribute("data-name")).toBe("Expenses");
	});

	test("applies each series className for Tailwind color customization", () => {
		render(
			<LineChart
				data={DATA}
				xKey="month"
				series={[
					{ key: "income", label: "Income", className: "text-success" },
					{ key: "expenses", label: "Expenses", className: "text-danger" },
				]}
			/>,
		);

		const lines = screen.getAllByTestId("line");

		expect(lines[0].className).toContain("text-success");
		expect(lines[1].className).toContain("text-danger");
	});

	test("passes xKey as the x-axis data key and forwards data to the chart", () => {
		render(
			<LineChart
				data={DATA}
				xKey="month"
				series={[{ key: "income", label: "Income" }]}
			/>,
		);

		expect(screen.getByTestId("x-axis").getAttribute("data-key")).toBe("month");
		expect(
			screen.getByTestId("recharts-line-chart").getAttribute("data-length"),
		).toBe("2");
	});

	test("merges a custom className into the root", () => {
		render(
			<LineChart
				data={DATA}
				xKey="month"
				series={[{ key: "income", label: "Income" }]}
				className="custom-root"
			/>,
		);

		expect(screen.getByTestId("line-chart").className).toContain("custom-root");
	});
});
