import type { ReactNode } from "react";

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import { PieChart } from ".";

// Recharts needs real layout/canvas measurement to render its SVG, which
// happy-dom doesn't provide. We mock it so tests assert the props our
// abstraction maps onto it, keeping Recharts itself swappable.
vi.mock("recharts", () => ({
	ResponsiveContainer: ({ children }: { children: ReactNode }) => (
		<div data-testid="responsive-container">{children}</div>
	),
	PieChart: ({ children }: { children: ReactNode }) => (
		<div data-testid="recharts-pie-chart">{children}</div>
	),
	Pie: ({
		children,
		data,
		dataKey,
		nameKey,
	}: {
		children: ReactNode;
		data: unknown[];
		dataKey: string;
		nameKey: string;
	}) => (
		<div
			data-testid="pie"
			data-length={data.length}
			data-key={dataKey}
			data-name-key={nameKey}
		>
			{children}
		</div>
	),
	Cell: ({
		className,
		style,
	}: {
		className?: string;
		style?: { color?: string };
	}) => <div data-testid="cell" className={className} style={style} />,
	Tooltip: () => <div data-testid="tooltip" />,
	Legend: () => <div data-testid="legend" />,
}));

const DATA = [
	{
		key: "groceries",
		label: "Groceries",
		value: 400,
		className: "text-primary",
	},
	{ key: "rent", label: "Rent", value: 1200, className: "text-success" },
];

describe("PieChart", () => {
	afterEach(() => {
		cleanup();
	});

	test("renders one cell per data slice", () => {
		render(<PieChart data={DATA} />);

		expect(screen.getAllByTestId("cell")).toHaveLength(2);
	});

	test("applies each slice className for Tailwind color customization", () => {
		render(<PieChart data={DATA} />);

		const cells = screen.getAllByTestId("cell");

		expect(cells[0].className).toContain("text-primary");
		expect(cells[1].className).toContain("text-success");
	});

	test("applies a slice's hex color inline when no className is given", () => {
		render(
			<PieChart
				data={[{ key: "rent", label: "Rent", value: 1200, color: "#14b8a6" }]}
			/>,
		);

		expect(screen.getByTestId("cell").style.color).toBe("#14b8a6");
	});

	test("forwards data, value key, and label key to the pie", () => {
		render(<PieChart data={DATA} />);

		const pie = screen.getByTestId("pie");

		expect(pie.getAttribute("data-length")).toBe("2");
		expect(pie.getAttribute("data-key")).toBe("value");
		expect(pie.getAttribute("data-name-key")).toBe("label");
	});

	test("merges a custom className into the root", () => {
		render(<PieChart data={DATA} className="custom-root" />);

		expect(screen.getByTestId("pie-chart").className).toContain("custom-root");
	});
});
