import type { Meta, StoryObj } from "@storybook/react-vite";
import type { LineChartProps } from ".";

import { LineChart } from ".";

const DATA = [
	{ month: "Feb", income: 3200, expenses: 2100 },
	{ month: "Mar", income: 3400, expenses: 2600 },
	{ month: "Apr", income: 3100, expenses: 2900 },
	{ month: "May", income: 3600, expenses: 2400 },
	{ month: "Jun", income: 3300, expenses: 2800 },
	{ month: "Jul", income: 3800, expenses: 2500 },
	{ month: "Aug", income: 4000, expenses: 3000 },
];

const meta: Meta<LineChartProps> = {
	component: LineChart,
	args: {
		data: DATA,
		xKey: "month",
		series: [
			{ key: "income", label: "Income", className: "text-chart-1" },
			{ key: "expenses", label: "Expenses", className: "text-chart-2" },
		],
	},
};

export default meta;

type Story = StoryObj<LineChartProps>;

export const Default: Story = {};
